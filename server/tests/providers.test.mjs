import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchOffProduct, normalizeOffProduct } from "../products/providers/openfoodfacts.mjs";
import { fetchMfdsProduct, normalizeMfdsProduct, parseMfdsEnvelope, isMfdsConfigured, isMfdsTermsAccepted } from "../products/providers/mfds.mjs";
import { normalizeOsmResponse } from "../places/importers/overpass.mjs";
import { normalizeWikidataBindings, parseWktPoint } from "../places/importers/wikidata.mjs";
import { normalizeFileRecord, parsePlacesFile } from "../places/importers/file.mjs";
import { extractIngredientSection } from "../products/ocr/extract.mjs";
import { clovaOcr, googleVisionOcr, ocrConfig } from "../products/ocr/providers.mjs";
import { fakeFetch, fixture } from "./helpers.mjs";

test("Open Food Facts product is normalised with provenance, Korean name/ingredients and an UNVERIFIED halal claim", () => {
  const n = normalizeOffProduct(fixture("off-product.json").product, { retrievedAt: "2099-01-01T00:00:00Z" });
  assert.equal(n.barcode, "8809999900016");
  assert.equal(n.nameKo, "테스트 초코 쿠키");
  assert.equal(n.nameEn, "Test Choco Cookie");
  assert.equal(n.brand, "테스트푸드");
  assert.equal(n.category, "biscuits-and-cakes");
  assert.equal(n.ingredientsLang, "ko");
  assert.match(n.ingredientsText, /^밀가루/);
  assert.deepEqual(n.allergens, ["gluten", "soybeans"]);
  assert.equal(n.source, "openfoodfacts");
  assert.match(n.license, /ODbL/);
  assert.equal(n.sourceUrl, "https://world.openfoodfacts.org/product/8809999900016");
  assert.equal(n.certificationClaims.length, 1);
  assert.match(n.certificationClaims[0].organization, /unverified claim/);
});

test("Open Food Facts fetch: found / not found / rate limit / timeout, with a User-Agent and no key", async () => {
  let seen;
  const found = await fetchOffProduct("8809999900016", { fetchImpl: fakeFetch((url, init) => { seen = { url, init }; return { body: fixture("off-product.json") }; }) });
  assert.equal(found.outcome, "found");
  assert.match(seen.url, /\/api\/v2\/product\/8809999900016\?fields=/);
  assert.match(seen.init.headers["User-Agent"], /HalalMapKorea/);
  assert.equal((await fetchOffProduct("1", { fetchImpl: fakeFetch(() => ({ body: { status: 0, status_verbose: "product not found" } })) })).outcome, "not_found");
  assert.equal((await fetchOffProduct("1", { fetchImpl: fakeFetch(() => ({ status: 404 })) })).outcome, "not_found");
  assert.deepEqual(await fetchOffProduct("1", { fetchImpl: fakeFetch(() => ({ status: 429 })) }), { outcome: "error", detail: "rate_limited" });
  const timeout = await fetchOffProduct("1", { fetchImpl: async () => { throw Object.assign(new Error("x"), { name: "TimeoutError" }); } });
  assert.deepEqual(timeout, { outcome: "error", detail: "timeout" });
});

test("MFDS envelope handling", () => {
  assert.equal(parseMfdsEnvelope(fixture("mfds-c005.json"), "C005").outcome, "found");
  assert.equal(parseMfdsEnvelope({ C005: { RESULT: { CODE: "INFO-200", MSG: "no data" } } }, "C005").outcome, "not_found");
  assert.deepEqual(parseMfdsEnvelope({ RESULT: { CODE: "INFO-100", MSG: "invalid key" } }, "C005"), { outcome: "error", detail: "auth_INFO-100", rows: [] });
  assert.equal(parseMfdsEnvelope({ nonsense: true }, "C005").outcome, "error");
});

test("MFDS: barcode -> product (C005) then raw materials (C002); key stays out of results", async () => {
  const env = { FOODSAFETYKOREA_API_KEY: "SECRETKEY123", FOODSAFETYKOREA_BASE_URL: "https://mfds.test/api" };
  const fetchImpl = fakeFetch((url) => (url.includes("/C005/") ? { body: fixture("mfds-c005.json") } : { body: fixture("mfds-c002.json") }));
  const result = await fetchMfdsProduct("8809999900023", { fetchImpl, env });
  assert.equal(result.outcome, "found");
  assert.deepEqual(fetchImpl.calls.map((u) => u.split("/")[5]), ["C005", "C002"]);
  assert.match(fetchImpl.calls[0], /BAR_CD=8809999900023$/);
  assert.match(fetchImpl.calls[1], /PRDLST_REPORT_NO=2099999900001$/);
  const p = result.product;
  assert.equal(p.nameKo, "테스트 새우 과자");
  assert.equal(p.manufacturer, "테스트식품(주)");
  assert.equal(p.category, "과자");
  assert.match(p.ingredientsText, /^밀가루\(미국산\), 새우/);
  assert.equal(p.source, "mfds_foodsafetykorea");
  assert.ok(!JSON.stringify(p).includes("SECRETKEY123"));
});

test("MFDS: no barcode match, auth error and network error", async () => {
  const env = { FOODSAFETYKOREA_API_KEY: "k", FOODSAFETYKOREA_BASE_URL: "https://mfds.test/api" };
  assert.equal((await fetchMfdsProduct("1", { env, fetchImpl: fakeFetch(() => ({ body: { C005: { RESULT: { CODE: "INFO-200" } } } })) })).outcome, "not_found");
  assert.equal((await fetchMfdsProduct("1", { env, fetchImpl: fakeFetch(() => ({ body: { RESULT: { CODE: "INFO-100" } } })) })).outcome, "error");
  assert.deepEqual(await fetchMfdsProduct("1", { env, fetchImpl: async () => { throw new Error("boom"); } }), { outcome: "error", detail: "network_error" });
  assert.equal(isMfdsConfigured({}), false);
  assert.equal(isMfdsTermsAccepted({ FOODSAFETYKOREA_ACCEPT_TERMS: "1" }), true);
  assert.equal(normalizeMfdsProduct({ PRDLST_NM: " X " }, { barcode: "1" }).name, "X");
});

test("Overpass: mosques, prayer rooms, halal restaurants and markets are classified; unhalal/unnamed elements are skipped", () => {
  const { records, skipped } = normalizeOsmResponse(fixture("overpass.json"), { retrievedAt: "2099-01-01T00:00:00Z" });
  const byId = Object.fromEntries(records.map((r) => [r.sourceId, r]));
  assert.equal(byId["node/900000001"].kind, "mosque");
  assert.equal(byId["node/900000001"].nameKo, "테스트 성원");
  assert.equal(byId["node/900000001"].nameEn, "Test Mosque");
  assert.equal(byId["node/900000001"].address, "서울특별시 테스트로 1");
  assert.equal(byId["node/900000002"].kind, "prayer_room");
  assert.equal(byId["way/900000003"].kind, "restaurant");
  assert.equal(byId["way/900000003"].category, "turkish");
  assert.equal(byId["way/900000003"].lat, 37.52, "ways use their center");
  assert.match(byId["way/900000003"].halalEvidence, /diet:halal=only .*not certified/);
  assert.equal(byId["way/900000003"].halalStatus, "halal-friendly", "OSM tags never produce 'certified'");
  assert.equal(byId["node/900000004"].kind, "market");
  assert.deepEqual(skipped, { no_halal_tag: 1, unnamed: 1 });
  for (const r of records) {
    assert.equal(r.source, "osm");
    assert.equal(r.license, "ODbL 1.0");
    assert.equal(r.attribution, "© OpenStreetMap contributors");
    assert.match(r.sourceUrl, /^https:\/\/www\.openstreetmap\.org\/(node|way)\/\d+$/);
  }
});

test("Wikidata bindings -> mosques with CC0 provenance; entries without coordinates are skipped", () => {
  assert.deepEqual(parseWktPoint("Point(126.99 37.53)"), { lng: 126.99, lat: 37.53 });
  const { records, skipped } = normalizeWikidataBindings(fixture("wikidata.json"));
  assert.equal(records.length, 1);
  assert.equal(records[0].sourceId, "Q99999901");
  assert.equal(records[0].license, "CC0 1.0");
  assert.equal(records[0].website, "https://example.test/wd-mosque");
  assert.deepEqual(skipped, { no_coordinates: 1 });
});

test("file import demands provenance and rejects out-of-Korea coordinates and unknown kinds", () => {
  const csv = [
    "kind,name,name_ko,lat,lng,halal_status,source,source_url,license",
    "restaurant,Test Kitchen,테스트 키친,37.5,127.0,certified,KTO,https://example.test/1,KOGL Type 1",
    "restaurant,No License,,37.5,127.0,,KTO,,",
    "mosque,Far Away,,51.5,-0.12,,KTO,,KOGL",
    "castle,Wrong Kind,,37.5,127.0,,KTO,,KOGL",
    "restaurant,Bad Status,,37.5,127.0,superhalal,KTO,,KOGL",
  ].join("\n");
  const { records, errors } = parsePlacesFile(csv, "places.csv");
  assert.equal(records.length, 1);
  assert.equal(records[0].license, "KOGL Type 1");
  assert.deepEqual(errors.map((e) => e.error), ["missing license (provenance is required)", "coordinates outside South Korea", 'unknown kind "castle"', 'invalid halal_status "superhalal"']);
  assert.equal(normalizeFileRecord({ kind: "mosque", name: "X" }, { source: "S", license: "L" }).record.source, "S");
  assert.ok(normalizeFileRecord({ kind: "mosque", name: "X" }).error.includes("source"));
});

test("OCR post-processing isolates the 원재료명 block from a noisy label read", () => {
  const raw = [
    "제품명: 테스트 초코쿠키", "식품유형: 과자", "",
    "원재료명: 밀가루(밀:미국산), 설탕, 팜유,", "코코아분말, 젤라틴, 정제소금", "알레르기 유발물질: 밀, 대두 함유",
    "영양정보 총 내용량 120g", "보관방법: 서늘한 곳",
  ].join("\n");
  const { text, markerFound } = extractIngredientSection(raw);
  assert.equal(markerFound, true);
  assert.equal(text, "밀가루(밀:미국산), 설탕, 팜유, 코코아분말, 젤라틴, 정제소금");
  assert.equal(extractIngredientSection("그냥 텍스트 설탕, 소금").markerFound, false);
});

test("server OCR providers parse Google Vision and CLOVA responses; config reflects env", async () => {
  assert.deepEqual(ocrConfig({}), { serverProvider: null });
  assert.equal(ocrConfig({ GOOGLE_VISION_API_KEY: "k" }).serverProvider, "google-vision");
  assert.equal(ocrConfig({ CLOVA_OCR_INVOKE_URL: "https://x", CLOVA_OCR_SECRET: "s" }).serverProvider, "clova");
  const gv = await googleVisionOcr(Buffer.from("x"), { env: { GOOGLE_VISION_API_KEY: "k" }, fetchImpl: fakeFetch(() => ({ body: { responses: [{ fullTextAnnotation: { text: "원재료명: 설탕", pages: [{ blocks: [{ confidence: 0.9 }, { confidence: 0.7 }] }] } }] } })) });
  assert.equal(gv.text, "원재료명: 설탕");
  assert.ok(Math.abs(gv.confidence - 0.8) < 1e-9);
  const cl = await clovaOcr(Buffer.from("x"), { env: { CLOVA_OCR_INVOKE_URL: "https://clova.test", CLOVA_OCR_SECRET: "s" }, fetchImpl: fakeFetch(() => ({ body: { images: [{ fields: [{ inferText: "원재료명:", inferConfidence: 0.99 }, { inferText: "설탕", inferConfidence: 0.9, lineBreak: true }] }] } })) });
  assert.equal(cl.text, "원재료명: 설탕");
  await assert.rejects(googleVisionOcr(Buffer.from("x"), { env: { GOOGLE_VISION_API_KEY: "k" }, fetchImpl: fakeFetch(() => ({ status: 403 })) }), /google_vision_http_403/);
});
