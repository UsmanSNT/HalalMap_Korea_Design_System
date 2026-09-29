// Product data import / lookup CLI.
//
//   node scripts/import-products.mjs --barcode 8801043015202          look one barcode up through the real pipeline
//   node scripts/import-products.mjs --off-dump openfoodfacts-products.jsonl.gz [--limit 50000]
//        Open Food Facts bulk dump (https://static.openfoodfacts.org/data/openfoodfacts-products.jsonl.gz), Korean products only
//   node scripts/import-products.mjs --mfds-c005 1-5000              Food Safety Korea C005 barcode-linked products (needs key + terms ack)
//
// Bulk work uses dumps/pages, never one API call per product (Open Food Facts asks for this).

import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { nowIso, openDatabase } from "../server/db.mjs";
import { normalizeBarcode } from "../server/products/barcode.mjs";
import { normalizeOffProduct } from "../server/products/providers/openfoodfacts.mjs";
import { isMfdsConfigured, isMfdsTermsAccepted, normalizeMfdsProduct, parseMfdsEnvelope, MFDS_SOURCE } from "../server/products/providers/mfds.mjs";
import { createLookupService, sourceUsable } from "../server/products/lookup.mjs";
import { RulesetCache } from "../server/products/rules/ruleset.mjs";
import { seedProductKnowledge } from "../server/products/seed.mjs";
import { upsertProduct, analyzeStoredProduct, getProductByBarcode, publicAnalysis } from "../server/products/store.mjs";
import { recordImportRun } from "../server/places/repo.mjs";

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};

const db = openDatabase();
seedProductKnowledge(db);
const rulesetCache = new RulesetCache(db);

const barcodeArg = option("barcode");
const dump = option("off-dump");
const mfdsRange = option("mfds-c005");

if (barcodeArg) {
  const service = createLookupService({ db, rulesetCache });
  const result = await service.lookup(barcodeArg, { refresh: args.includes("--refresh") });
  if (!result.ok) {
    console.error(result.message);
    process.exit(1);
  }
  console.log("providers:", JSON.stringify(result.tried));
  if (!result.row) console.log("Not found in any enabled source.");
  else {
    const row = getProductByBarcode(db, result.barcode);
    console.log(JSON.stringify({ name: row.name, brand: row.brand, source: row.source, ingredients: row.ingredients_raw }, null, 1));
    const analysis = publicAnalysis(analyzeStoredProduct(db, rulesetCache.get(), row));
    console.log("status:", analysis.status, "|", analysis.reasons.map((r) => r.text.en).join(" / "));
  }
} else if (dump) {
  if (!sourceUsable(db, "openfoodfacts")) throw new Error("openfoodfacts is marked as rejected in the data-source registry");
  const limit = Number(option("limit") || Infinity);
  const startedAt = nowIso();
  const lines = createInterface({ input: createReadStream(dump).pipe(createGunzip()), crlfDelay: Infinity });
  let seen = 0;
  let imported = 0;
  let skipped = 0;
  for await (const line of lines) {
    seen += 1;
    if (seen % 100000 === 0) console.log(`  read ${seen.toLocaleString()} lines, imported ${imported}`);
    if (!line.includes("south-korea") && !/"code":"?880/.test(line)) continue; // cheap pre-filter before JSON.parse
    let product;
    try {
      product = JSON.parse(line);
    } catch {
      continue;
    }
    const korean = (product.countries_tags ?? []).includes("en:south-korea") || String(product.code ?? "").startsWith("880");
    const barcode = normalizeBarcode(String(product.code ?? ""));
    if (!korean || !barcode.ok) {
      skipped += 1;
      continue;
    }
    const normalized = normalizeOffProduct(product, { barcode: barcode.code, retrievedAt: startedAt });
    if (!normalized.name) {
      skipped += 1;
      continue;
    }
    upsertProduct(db, { ...normalized, barcode: barcode.code, barcodeFormat: barcode.format }, { ruleset: rulesetCache.get() });
    imported += 1;
    if (imported >= limit) break;
  }
  recordImportRun(db, { source: "openfoodfacts", kind: "products", startedAt, inserted: imported, skipped, detail: dump });
  console.log(`Open Food Facts dump: read ${seen.toLocaleString()} lines, imported ${imported}, skipped ${skipped}.`);
} else if (mfdsRange) {
  if (!sourceUsable(db, MFDS_SOURCE)) throw new Error("mfds_foodsafetykorea is marked as rejected in the data-source registry");
  if (!isMfdsConfigured()) throw new Error("Set FOODSAFETYKOREA_API_KEY first (free key from https://www.foodsafetykorea.go.kr/api/)");
  if (!isMfdsTermsAccepted()) {
    throw new Error("Licence for this source is unconfirmed: read the terms at https://www.foodsafetykorea.go.kr/api/openApiInfo.do, then set FOODSAFETYKOREA_ACCEPT_TERMS=1");
  }
  const [from, to] = mfdsRange.split("-").map(Number);
  const base = (process.env.FOODSAFETYKOREA_BASE_URL || "https://openapi.foodsafetykorea.go.kr/api").replace(/\/$/, "");
  const startedAt = nowIso();
  let imported = 0;
  for (let start = from; start <= to; start += 1000) {
    const end = Math.min(start + 999, to);
    const response = await fetch(`${base}/${encodeURIComponent(process.env.FOODSAFETYKOREA_API_KEY)}/C005/json/${start}/${end}`, { signal: AbortSignal.timeout(60000) });
    const { outcome, rows, detail } = parseMfdsEnvelope(await response.json(), "C005");
    if (outcome === "error") throw new Error(`MFDS C005 error: ${detail}`);
    for (const row of rows) {
      for (const code of String(row.BAR_CD ?? "").split(/[,\s]+/).filter(Boolean)) {
        const barcode = normalizeBarcode(code);
        if (!barcode.ok) continue;
        const normalized = normalizeMfdsProduct(row, { barcode: barcode.code, retrievedAt: startedAt });
        if (!normalized.name) continue;
        upsertProduct(db, { ...normalized, barcodeFormat: barcode.format }, { ruleset: rulesetCache.get() });
        imported += 1;
      }
    }
    console.log(`  C005 ${start}-${end}: ${rows.length} rows`);
    if (outcome === "not_found") break;
  }
  recordImportRun(db, { source: MFDS_SOURCE, kind: "products", startedAt, inserted: imported, detail: `C005 ${mfdsRange}` });
  console.log(`MFDS C005: imported ${imported} barcode-linked products (ingredients are fetched per product via C002 on first scan).`);
} else {
  console.error("Usage: import-products.mjs --barcode <code> | --off-dump <file.jsonl.gz> [--limit N] | --mfds-c005 <from-to>");
  process.exit(2);
}
