import { test } from "node:test";
import assert from "node:assert/strict";
import { openDatabase } from "../db.mjs";
import { createLookupService, TTL } from "../products/lookup.mjs";
import { seedProductKnowledge } from "../products/seed.mjs";
import { RulesetCache } from "../products/rules/ruleset.mjs";
import { analyzeStoredProduct, listCertifications, upsertProduct } from "../products/store.mjs";
import { fakeFetch, fixture } from "./helpers.mjs";

const OFF_BARCODE = "8809999900016";
const MFDS_BARCODE = "8809999900023";
const MFDS_ENV = { FOODSAFETYKOREA_API_KEY: "k", FOODSAFETYKOREA_ACCEPT_TERMS: "1", FOODSAFETYKOREA_BASE_URL: "https://mfds.test/api" };

const setup = ({ env = {}, handler } = {}) => {
  const db = openDatabase(":memory:");
  seedProductKnowledge(db);
  const cache = new RulesetCache(db);
  const fetchImpl = fakeFetch(handler ?? ((url) => {
    if (url.includes("openfoodfacts")) return url.includes(OFF_BARCODE) ? { body: fixture("off-product.json") } : { body: { status: 0 } };
    if (url.includes("/C005/")) return url.includes(MFDS_BARCODE) ? { body: fixture("mfds-c005.json") } : { body: { C005: { RESULT: { CODE: "INFO-200" } } } };
    if (url.includes("/C002/")) return { body: fixture("mfds-c002.json") };
    return { status: 404 };
  }));
  let clock = Date.parse("2099-06-01T00:00:00Z");
  const service = createLookupService({ db, rulesetCache: cache, env, fetchImpl, now: () => clock });
  return { db, cache, fetchImpl, service, advance: (ms) => { clock += ms; } };
};

test("local miss -> Open Food Facts -> cached in the local database, second scan makes no external call", async () => {
  const { service, fetchImpl, db, cache } = setup();
  const first = await service.lookup(OFF_BARCODE);
  assert.equal(first.ok, true);
  assert.equal(first.cacheHit, false);
  assert.deepEqual(first.tried.map((t) => [t.provider, t.outcome]), [["mfds_foodsafetykorea", "skipped"], ["openfoodfacts", "found"]]);
  assert.equal(first.tried[0].detail, "api_key_missing");
  assert.equal(first.row.name_ko, "테스트 초코 쿠키");
  assert.equal(first.row.verification_status, "unverified", "imported data is never auto-verified");
  assert.equal(first.row.source, "openfoodfacts");
  assert.match(first.row.license, /ODbL/);
  assert.ok(first.row.retrieved_at && first.row.last_checked_at);

  const calls = fetchImpl.calls.length;
  const second = await service.lookup(OFF_BARCODE);
  assert.equal(second.cacheHit, true);
  assert.equal(fetchImpl.calls.length, calls, "no external request for a fresh local record");

  const analysis = analyzeStoredProduct(db, cache.get(), second.row);
  assert.equal(analysis.status, "CHECK_REQUIRED", "gelatin is origin-dependent");
  assert.equal(analysis.certification.state, "unverified_claim", "OFF 'halal' label is only an unverified claim");
  assert.ok(analysis.dataWarnings.includes("COMMUNITY_DATA"));
  assert.equal(listCertifications(db, first.row.id)[0].verification_status, "unverified");
  const sources = db.prepare("SELECT source FROM product_sources WHERE product_id = ?").all(first.row.id);
  assert.deepEqual(sources.map((s) => s.source), ["openfoodfacts"]);
});

test("MFDS (when key + terms acknowledged) is consulted first and supplies official raw materials; OFF only fills gaps", async () => {
  const { service, fetchImpl } = setup({ env: MFDS_ENV });
  const result = await service.lookup(MFDS_BARCODE);
  assert.equal(result.row.source, "mfds_foodsafetykorea");
  assert.equal(result.row.ingredients_trust, "official");
  assert.equal(result.row.manufacturer, "테스트식품(주)");
  assert.match(result.row.ingredients_raw, /새우/);
  // MFDS found the product, but there is no image yet -> OFF is asked, finds nothing for this barcode.
  assert.deepEqual(result.tried.map((t) => [t.provider, t.outcome]), [["mfds_foodsafetykorea", "found"], ["openfoodfacts", "not_found"]]);
  assert.ok(fetchImpl.calls.some((u) => u.includes("/C002/")));
});

test("MFDS is skipped until the operator acknowledges the unconfirmed licence", async () => {
  const { service } = setup({ env: { FOODSAFETYKOREA_API_KEY: "k" } });
  const result = await service.lookup(MFDS_BARCODE);
  assert.equal(result.tried[0].detail, "terms_not_accepted");
});

test("both sources merge into one product with per-source provenance rows", async () => {
  const both = "8809999900016";
  const { service, db } = setup({
    env: MFDS_ENV,
    handler: (url) => {
      if (url.includes("openfoodfacts")) return { body: fixture("off-product.json") };
      if (url.includes("/C005/")) return { body: { C005: { row: [{ PRDLST_NM: "테스트 초코 쿠키(MFDS)", PRDLST_REPORT_NO: "R1", CMPNY_NM: "테스트식품(주)", PRDLST_DCNM: "과자" }], RESULT: { CODE: "INFO-000" } } } };
      return { body: { C002: { row: [{ RAWMTRL_NM: "밀가루, 설탕, 정제소금" }], RESULT: { CODE: "INFO-000" } } } };
    },
  });
  const result = await service.lookup(both);
  assert.equal(result.row.name, "테스트 초코 쿠키(MFDS)", "official name wins");
  assert.equal(result.row.ingredients_raw, "밀가루, 설탕, 정제소금", "official ingredients win over community ones");
  assert.match(result.row.image_url ?? "", /openfoodfacts/, "image comes from OFF");
  const sources = db.prepare("SELECT source FROM product_sources WHERE product_id = ? ORDER BY source").all(result.row.id).map((s) => s.source);
  assert.deepEqual(sources, ["mfds_foodsafetykorea", "openfoodfacts"]);
});

test("'not found' is remembered: no repeated external calls until the TTL passes", async () => {
  const { service, fetchImpl, advance } = setup();
  const code = "8801043015202";
  const first = await service.lookup(code);
  assert.equal(first.row, null);
  assert.equal(first.tried.find((t) => t.provider === "openfoodfacts").outcome, "not_found");
  const calls = fetchImpl.calls.length;
  const second = await service.lookup(code);
  assert.equal(second.tried.find((t) => t.provider === "openfoodfacts").detail, "recent_not_found");
  assert.equal(fetchImpl.calls.length, calls);
  advance(TTL.notFound + 1000);
  await service.lookup(code);
  assert.equal(fetchImpl.calls.length, calls + 1);
});

test("transient errors back off briefly, then retry", async () => {
  let fail = true;
  const { service, fetchImpl, advance } = setup({ handler: (url) => (fail ? { status: 503 } : { body: fixture("off-product.json") }) });
  assert.deepEqual((await service.lookup(OFF_BARCODE)).tried.at(-1), { provider: "openfoodfacts", outcome: "error", detail: "http_503" });
  assert.equal((await service.lookup(OFF_BARCODE)).tried.at(-1).detail, "recent_error");
  assert.equal(fetchImpl.calls.length, 1);
  fail = false;
  advance(TTL.error + 1000);
  assert.equal((await service.lookup(OFF_BARCODE)).row.name_ko, "테스트 초코 쿠키");
});

test("rejected sources are never called (licence gate)", async () => {
  const { service, db, fetchImpl } = setup();
  db.prepare("UPDATE data_sources SET license_status = 'rejected' WHERE key = 'openfoodfacts'").run();
  const result = await service.lookup(OFF_BARCODE);
  assert.equal(result.row, null);
  assert.equal(result.tried.find((t) => t.provider === "openfoodfacts").detail, "source_rejected");
  assert.equal(fetchImpl.calls.length, 0);
});

test("a stale record is refreshed after the TTL; an admin-verified record is never overwritten by imports", async () => {
  const { service, fetchImpl, advance, db, cache } = setup();
  await service.lookup(OFF_BARCODE);
  const calls = fetchImpl.calls.length;
  advance(TTL.fresh + 1000);
  await service.lookup(OFF_BARCODE);
  assert.ok(fetchImpl.calls.length > calls, "refreshed after 30 days");

  db.prepare("UPDATE products SET verification_status = 'verified', name = 'Admin corrected name', ingredients_raw = '설탕', ingredients_trust = 'admin_verified' WHERE barcode = ?").run(OFF_BARCODE);
  advance(TTL.fresh + 1000);
  const after = fetchImpl.calls.length;
  const result = await service.lookup(OFF_BARCODE, { refresh: true });
  assert.equal(fetchImpl.calls.length, after, "verified records are locked");
  assert.equal(result.row.name, "Admin corrected name");
  assert.equal(result.row.ingredients_raw, "설탕");

  upsertProduct(db, { source: "openfoodfacts", barcode: OFF_BARCODE, name: "Import tries to rename", ingredientsText: "돼지고기", retrievedAt: "2099-01-01T00:00:00Z" }, { ruleset: cache.get() });
  const row = db.prepare("SELECT name, ingredients_raw FROM products WHERE barcode = ?").get(OFF_BARCODE);
  assert.equal(row.name, "Admin corrected name");
  assert.equal(row.ingredients_raw, "설탕");
});

test("concurrent scans of the same barcode share one external request", async () => {
  const { service, fetchImpl } = setup();
  await Promise.all([service.lookup(OFF_BARCODE), service.lookup(OFF_BARCODE), service.lookup(OFF_BARCODE)]);
  assert.equal(fetchImpl.calls.filter((u) => u.includes("openfoodfacts")).length, 1);
});

test("invalid barcodes never reach the network", async () => {
  const { service, fetchImpl } = setup();
  assert.equal((await service.lookup("12345")).ok, false);
  assert.equal((await service.lookup("8801043015203")).error, "bad_checksum");
  assert.equal(fetchImpl.calls.length, 0);
});
