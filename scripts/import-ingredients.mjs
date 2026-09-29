// Loads the MFDS 식품원재료 / 식품원재료코드 dataset (CSV downloaded from data.go.kr) into the ingredient dictionary.
//
//   node scripts/import-ingredients.mjs --file mfds-rawmaterials.csv --accept-terms
//        [--code-col 원재료코드] [--name-col 원재료명] [--en-col 영문명] [--category-col 대분류]
//
// Imported names are RECOGNISED (they get an MFDS code) but NOT cleared: their category is 'unclassified',
// so without a rule they analyse as UNKNOWN -> CHECK_REQUIRED. Classification stays with ingredient_rules.
// Existing dictionary entries only receive the MFDS code; nothing is overwritten.

import { readFileSync } from "node:fs";
import { nowIso, openDatabase, transaction } from "../server/db.mjs";
import { decodeText, parseCsv } from "../server/lib/csv.mjs";
import { guessLang, normalizeKey } from "../server/products/ingredients/normalize.mjs";
import { refreshIngredientAnalysis, seedProductKnowledge } from "../server/products/seed.mjs";
import { recordImportRun } from "../server/places/repo.mjs";

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};
const file = option("file");
if (!file) {
  console.error("Usage: import-ingredients.mjs --file <csv> --accept-terms [--code-col X --name-col Y --en-col Z --category-col W]");
  process.exit(2);
}

const db = openDatabase();
seedProductKnowledge(db);
const source = db.prepare("SELECT * FROM data_sources WHERE key = 'mfds_rawmaterial_codes'").get();
if (source.license_status === "rejected") throw new Error("mfds_rawmaterial_codes is rejected in the registry");
if (source.license_status !== "confirmed" && !args.includes("--accept-terms")) {
  throw new Error("The licence of this dataset is unconfirmed. Check its KOGL type on data.go.kr, then re-run with --accept-terms.");
}

const { headers, records } = parseCsv(decodeText(readFileSync(file)));
const find = (explicit, synonyms) =>
  explicit ?? headers.find((h) => synonyms.some((s) => h.replace(/\s/g, "").toLowerCase() === s.toLowerCase())) ?? null;
const columns = {
  code: find(option("code-col"), ["원재료코드", "식품원재료코드", "원료코드", "코드", "code", "RAWMTRL_CD"]),
  name: find(option("name-col"), ["원재료명", "식품원재료명", "원료명", "한글명", "name", "RAWMTRL_NM"]),
  english: find(option("en-col"), ["영문명", "영문원재료명", "english", "영문"]),
  category: find(option("category-col"), ["대분류", "분류", "구분", "식품군", "중분류", "category"]),
};
if (!columns.name) throw new Error(`Could not find the name column in: ${headers.join(", ")} (use --name-col)`);
console.log("Columns:", JSON.stringify(columns));

const aliasOwner = db.prepare("SELECT ingredient_id FROM ingredient_aliases WHERE alias_norm = ?");
const byNorm = new Map();
for (const row of db.prepare("SELECT id, canonical_name, name_ko, name_en, key FROM ingredients").all()) {
  for (const n of [row.canonical_name, row.name_ko, row.name_en, row.key]) if (n) byNorm.set(normalizeKey(n), row);
}
const insertIngredient = db.prepare(`
  INSERT INTO ingredients (key, canonical_name, name_ko, name_en, category, mfds_code, mfds_name, source, source_url, license, note)
  VALUES (?, ?, ?, ?, 'unclassified', ?, ?, 'mfds_rawmaterial_codes', ?, ?, ?)
`);
const setCode = db.prepare("UPDATE ingredients SET mfds_code = COALESCE(mfds_code, ?), mfds_name = COALESCE(mfds_name, ?) WHERE id = ?");

const startedAt = nowIso();
const stats = { created: 0, linked: 0, skipped: 0 };
transaction(db, () => {
  for (const record of records) {
    const name = record[columns.name]?.trim();
    if (!name) {
      stats.skipped += 1;
      continue;
    }
    const code = columns.code ? record[columns.code]?.trim() || null : null;
    const norm = normalizeKey(name);
    const alias = aliasOwner.get(norm);
    const existing = byNorm.get(norm) ?? (alias ? { id: alias.ingredient_id } : null);
    if (existing) {
      if (code && existing.id > 0) setCode.run(code, name, existing.id);
      stats.linked += 1;
      continue;
    }
    const english = columns.english ? record[columns.english]?.trim() || null : null;
    const category = columns.category ? record[columns.category]?.trim() || null : null;
    const key = `mfds_${(code ?? norm).toString().toLowerCase().replace(/[^a-z0-9]+/g, "_")}`.slice(0, 60);
    if (db.prepare("SELECT 1 FROM ingredients WHERE key = ?").get(key)) {
      stats.skipped += 1;
      continue;
    }
    insertIngredient.run(key, english ?? name, guessLang(name) === "ko" ? name : null, english, code, name, source.license_url, source.license, category ? `MFDS classification: ${category}` : null);
    byNorm.set(norm, { id: -1 });
    stats.created += 1;
  }
});
refreshIngredientAnalysis(db);
recordImportRun(db, { source: "mfds_rawmaterial_codes", kind: "ingredients", startedAt, inserted: stats.created, updated: stats.linked, skipped: stats.skipped, detail: file });
console.log(`MFDS raw materials: ${stats.created} new ingredients, ${stats.linked} matched existing entries (MFDS code attached), ${stats.skipped} skipped.`);
console.log("New entries have no rule yet: add category rules in the admin console to classify them.");
