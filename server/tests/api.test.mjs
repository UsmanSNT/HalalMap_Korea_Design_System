import { test } from "node:test";
import assert from "node:assert/strict";
import { fakeFetch, fixture, startApp, TINY_PNG } from "./helpers.mjs";

const OFF = "8809999900016";
const offHandler = (url) => (url.includes("openfoodfacts") && url.includes(OFF) ? { body: fixture("off-product.json") } : { body: { status: 0 } });
const NEW_BARCODE = "8801043015202";

test("existing endpoints keep working: login, me, logout, prayer times, protected orders", async () => {
  const app = await startApp();
  try {
    assert.equal((await app.request("/api/orders")).status, 401);
    const token = await app.login("user@halalmap.test", "User123!");
    assert.ok(token);
    assert.equal((await app.request("/api/auth/me", { token })).body.user.role, "user");
    assert.equal((await app.request("/api/orders", { token })).body.orders.length, 4);
    assert.equal((await app.request("/api/prayer-times")).body.prayerTimes.prayers.length, 6);
    assert.equal((await app.request("/api/auth/login", { method: "POST", body: { email: "user@halalmap.test", password: "nope" } })).status, 401);
    assert.equal((await app.request("/api/auth/logout", { method: "POST", token })).status, 200);
    assert.equal((await app.request("/api/auth/me", { token })).status, 401);
    assert.equal((await app.request("/api/nope")).status, 404);
  } finally { await app.close(); }
});

test("restaurants and mosques are served from the database with the same paths and shapes", async () => {
  const app = await startApp();
  try {
    const restaurants = (await app.request("/api/restaurants")).body.restaurants;
    assert.equal(restaurants.length, 6);
    assert.ok(restaurants.every((r) => r.dataOrigin === "demo" && r.provenance.source === "demo_seed"));
    assert.equal((await app.request("/api/restaurants?category=turkish")).body.restaurants[0].id, "itaewon-kebab");
    assert.equal((await app.request("/api/restaurants?q=케밥")).body.restaurants.length, 1);
    assert.equal((await app.request("/api/restaurants/sindang-halal/menu")).body.menu.length, 9);
    assert.equal((await app.request("/api/restaurants/unknown")).status, 404);
    const prayerRooms = (await app.request("/api/mosques?type=prayer-room")).body.mosques;
    assert.deepEqual(prayerRooms.map((m) => m.type), ["prayer-room"]);
    assert.equal((await app.request("/api/mosques/seoul-central")).body.mosque.nameKo, "서울중앙성원");
    assert.equal((await app.request("/api/mosques/sindang-halal")).status, 404, "a restaurant id is not a mosque");
    assert.equal((await app.request("/api/places?kind=market")).body.total, 0);
    const near = (await app.request("/api/places?kind=mosque&lat=37.5&lng=127")).body.places;
    assert.ok(Array.isArray(near));
  } finally { await app.close(); }
});

test("scan flow: invalid barcode -> 400, unknown barcode -> found:false with next steps, known -> product + analysis", async () => {
  const app = await startApp({ fetchImpl: fakeFetch(offHandler) });
  try {
    assert.equal((await app.request("/api/products/lookup/123")).status, 400);
    const missing = (await app.request(`/api/products/lookup/${NEW_BARCODE}`)).body;
    assert.equal(missing.found, false);
    assert.deepEqual(missing.next, ["ingredient_photo", "contribute"]);
    assert.ok(missing.lookup.tried.some((t) => t.provider === "openfoodfacts"));

    const hit = (await app.request(`/api/products/lookup/${OFF}`)).body;
    assert.equal(hit.found, true);
    assert.equal(hit.product.nameKo, "테스트 초코 쿠키");
    assert.equal(hit.product.provenance.source, "openfoodfacts");
    assert.match(hit.product.provenance.license, /ODbL/);
    assert.equal(hit.product.verificationStatus, "unverified");
    assert.equal(hit.analysis.status, "CHECK_REQUIRED");
    assert.equal(hit.analysis.certification.state, "unverified_claim");
    assert.ok(hit.analysis.checkRequired.some((i) => i.name === "젤라틴"));
    assert.equal(hit.analysis.nodes, undefined, "internal parse tree is not exposed");
    assert.deepEqual(hit.next, []);

    const again = (await app.request(`/api/products/lookup/${OFF}`)).body;
    assert.equal(again.lookup.cacheHit, true);
  } finally { await app.close(); }
});

test("analyze endpoint: typed text can be cleared, unconfirmed OCR text can not, input is validated", async () => {
  const app = await startApp();
  try {
    const typed = await app.request("/api/ingredients/analyze", { method: "POST", body: { text: "설탕, 소금, 밀가루", input: "typed" } });
    assert.equal(typed.body.analysis.status, "NO_FLAGGED_INGREDIENTS");
    const ocr = await app.request("/api/ingredients/analyze", { method: "POST", body: { text: "설탕, 소금, 밀가루", input: "ocr" } });
    assert.equal(ocr.body.analysis.status, "CHECK_REQUIRED");
    assert.ok(ocr.body.analysis.reasons.some((r) => r.code === "OCR_UNCONFIRMED"));
    const confirmed = await app.request("/api/ingredients/analyze", { method: "POST", body: { text: "설탕, 소금, 밀가루", input: "ocr_confirmed" } });
    assert.equal(confirmed.body.analysis.status, "NO_FLAGGED_INGREDIENTS");
    assert.equal((await app.request("/api/ingredients/analyze", { method: "POST", body: { text: "돼지고기", input: "ocr" } })).body.analysis.status, "FLAGGED_INGREDIENT");
    assert.equal((await app.request("/api/ingredients/analyze", { method: "POST", body: { text: "" } })).status, 400);
    assert.equal((await app.request("/api/ingredients/analyze", { method: "POST", body: { text: "x", input: "magic" } })).status, 400);
    assert.equal((await app.request("/api/ingredients/analyze", { method: "POST", body: { text: "a".repeat(4001) } })).status, 400);
  } finally { await app.close(); }
});

test("OCR: browser OCR is the default; the server endpoint needs a provider key", async () => {
  const app = await startApp();
  try {
    assert.deepEqual((await app.request("/api/ocr/config")).body, { serverProvider: null, clientOcr: true, languages: ["kor", "eng"] });
    assert.equal((await app.request("/api/ocr/ingredients", { method: "POST", body: { image: TINY_PNG } })).status, 501);
  } finally { await app.close(); }
  const vision = await startApp({
    env: { GOOGLE_VISION_API_KEY: "test-key" },
    fetchImpl: fakeFetch((url) => ({ body: { responses: [{ fullTextAnnotation: { text: "제품명 쿠키\n원재료명: 밀가루, 설탕, 젤라틴\n영양정보 100g", pages: [{ blocks: [{ confidence: 0.95 }] }] } }] } })),
  });
  try {
    const result = await vision.request("/api/ocr/ingredients", { method: "POST", body: { image: TINY_PNG } });
    assert.equal(result.status, 200);
    assert.equal(result.body.provider, "google-vision");
    assert.equal(result.body.ingredientsText, "밀가루, 설탕, 젤라틴");
    assert.equal(result.body.needsConfirmation, true);
    assert.equal(result.body.analysis.status, "CHECK_REQUIRED");
    assert.equal((await vision.request("/api/ocr/ingredients", { method: "POST", body: { image: "data:text/html;base64,PGI+" } })).status, 400);
  } finally { await vision.close(); }
});

test("contribution flow: pending -> admin review -> verified product; nothing is verified on arrival", async () => {
  const app = await startApp({ fetchImpl: fakeFetch(() => ({ body: { status: 0 } })) });
  try {
    const submit = await app.request("/api/product-submissions", {
      method: "POST",
      body: { barcode: NEW_BARCODE, name: "테스트 크래커", brand: "테스트", ingredientsText: "밀가루, 설탕, 소금, 젤라틴", ingredientsInput: "ocr_edited", productImage: TINY_PNG, ingredientsImage: TINY_PNG },
    });
    assert.equal(submit.status, 201);
    assert.equal(submit.body.submission.status, "pending");
    assert.equal(submit.body.analysis.status, "CHECK_REQUIRED");
    const id = submit.body.submission.id;

    const scan = (await app.request(`/api/products/lookup/${NEW_BARCODE}`)).body;
    assert.equal(scan.found, false, "a pending submission is not product data");
    assert.equal(scan.pendingSubmission, true);

    assert.equal((await app.request("/api/admin/submissions")).status, 401);
    const userToken = await app.login("user@halalmap.test", "User123!");
    assert.equal((await app.request("/api/admin/submissions", { token: userToken })).status, 403);

    const admin = await app.login();
    const list = (await app.request("/api/admin/submissions?status=pending", { token: admin })).body;
    assert.equal(list.total, 1);
    const detail = (await app.request(`/api/admin/submissions/${id}`, { token: admin })).body;
    assert.equal(detail.analysis.status, "CHECK_REQUIRED");
    assert.ok(detail.submission.ingredientsImageUrl.startsWith("/api/uploads/"));

    // the ingredient photo of a pending submission is private
    const photoPath = detail.submission.ingredientsImageUrl;
    assert.equal((await app.request(photoPath)).status, 401);
    assert.equal((await app.request(photoPath, { token: admin })).status, 200);

    const review = await app.request(`/api/admin/submissions/${id}/review`, { method: "POST", token: admin, body: { action: "approve", note: "checked against photo", edits: { ingredientsText: "밀가루, 설탕, 소금, 젤라틴(어류)" } } });
    assert.equal(review.body.submission.status, "verified");

    const after = (await app.request(`/api/products/lookup/${NEW_BARCODE}`)).body;
    assert.equal(after.found, true);
    assert.equal(after.product.verificationStatus, "verified");
    assert.equal(after.product.ingredientsTrust, "admin_verified");
    assert.equal(after.product.dataOrigin, "submission");
    assert.equal(after.analysis.status, "NO_FLAGGED_INGREDIENTS", "reviewer's correction (fish gelatin) is analysed");
    assert.equal(after.product.provenance.source, "user_submission");
    assert.ok(after.product.provenance.lastVerifiedAt);
    // an approved product image is public
    assert.equal((await app.request(after.product.imageUrl)).status, 200);
    assert.equal((await app.request(photoPath)).status, 401, "the ingredient photo stays private");
  } finally { await app.close(); }
});

test("submission validation: bad barcode, empty, spoofed image type, honeypot, oversize text", async () => {
  const app = await startApp();
  const post = (body) => app.request("/api/product-submissions", { method: "POST", body });
  try {
    assert.equal((await post({ barcode: "123", name: "x" })).status, 400);
    assert.equal((await post({ barcode: NEW_BARCODE })).body.code, "empty_submission");
    assert.equal((await post({ barcode: NEW_BARCODE, name: "x", productImage: "data:image/png;base64,PGh0bWw+" })).status, 400, "png header required");
    assert.equal((await post({ barcode: NEW_BARCODE, name: "x", productImage: "javascript:alert(1)" })).status, 400);
    assert.equal((await post({ barcode: NEW_BARCODE, name: "x", website: "http://spam.example" })).status, 400);
    assert.equal((await post({ barcode: NEW_BARCODE, name: "x".repeat(200) })).status, 400);
    assert.equal((await post({ barcode: NEW_BARCODE, name: "ok" })).status, 201);
  } finally { await app.close(); }
});

test("rules, ingredients and aliases are editable in the admin API and change analysis immediately", async () => {
  const app = await startApp();
  try {
    const admin = await app.login();
    const analyze = async (text) => (await app.request("/api/ingredients/analyze", { method: "POST", body: { text, input: "typed" } })).body.analysis;

    // new ingredient + alias + rule
    assert.equal((await analyze("코지원료, 설탕")).status, "CHECK_REQUIRED");
    const created = await app.request("/api/admin/ingredients", { method: "POST", token: admin, body: { nameKo: "코지원료", nameEn: "Cozy ingredient", category: "grain", aliases: ["cozy stuff"] } });
    assert.equal(created.status, 201);
    assert.equal((await analyze("코지원료, 설탕")).status, "NO_FLAGGED_INGREDIENTS", "category rule for grain applies");
    assert.equal((await analyze("cozy stuff")).status, "NO_FLAGGED_INGREDIENTS");
    const id = created.body.ingredient.id;
    assert.equal((await app.request(`/api/admin/ingredients/${id}/aliases`, { method: "POST", token: admin, body: { alias: "설탕" } })).status, 409, "alias already belongs to sugar");
    assert.equal((await app.request(`/api/admin/ingredients/${id}/aliases`, { method: "POST", token: admin, body: { alias: "코지 원료 가루", lang: "ko" } })).status, 201);
    assert.equal((await analyze("코지원료가루")).status, "NO_FLAGGED_INGREDIENTS");

    const ruleBody = { title: "Cozy is a check", matchType: "ingredient", matchValue: created.body.ingredient.key, status: "CHECK_REQUIRED", priority: 300, reason: { ko: "테스트 사유", en: "Test reason", uz: "Sinov sababi" }, evidence: "unit test" };
    const rule = await app.request("/api/admin/rules", { method: "POST", token: admin, body: ruleBody });
    assert.equal(rule.status, 201);
    const cozy = (await analyze("코지원료")).items[0];
    assert.equal(cozy.status, "CHECK_REQUIRED");
    assert.equal(cozy.reason.en, "Test reason");
    assert.equal(cozy.rule.evidence, "unit test");

    // validation
    assert.equal((await app.request("/api/admin/rules", { method: "POST", token: admin, body: { ...ruleBody, matchType: "regex" } })).status, 400);
    assert.equal((await app.request("/api/admin/rules", { method: "POST", token: admin, body: { ...ruleBody, matchValue: "no_such_ingredient" } })).status, 400);
    assert.equal((await app.request("/api/admin/rules", { method: "POST", token: admin, body: { ...ruleBody, status: "HALAL" } })).status, 400);
    assert.equal((await app.request("/api/admin/rules", { method: "POST", token: admin, body: { ...ruleBody, reason: { ko: "x", en: "y" } } })).status, 400);
    assert.equal((await app.request("/api/admin/rules", { method: "POST", token: admin, body: { ...ruleBody, matchType: "term", matchValue: "a" } })).status, 400);

    // deactivate = "delete"
    const del = await app.request(`/api/admin/rules/${rule.body.rule.id}`, { method: "DELETE", token: admin });
    assert.equal(del.body.rule.isActive, false);
    assert.equal((await analyze("코지원료")).items[0].status, "NO_FLAGGED_INGREDIENTS");

    // rule tester
    const test = await app.request("/api/admin/rules/test", { method: "POST", token: admin, body: { text: "돼지고기, 젤라틴" } });
    assert.equal(test.body.analysis.status, "FLAGGED_INGREDIENT");
    // listing
    const rules = (await app.request("/api/admin/rules?status=FLAGGED_INGREDIENT", { token: admin })).body;
    assert.ok(rules.total >= 5 && rules.rules.every((r) => r.status === "FLAGGED_INGREDIENT"));
    const ingredients = (await app.request("/api/admin/ingredients?q=젤라틴&status=CHECK_REQUIRED", { token: admin })).body;
    assert.ok(ingredients.ingredients.some((i) => i.key === "gelatin"));
  } finally { await app.close(); }
});

test("certification: needs evidence to be verified; only then does the product become HALAL_CERTIFIED", async () => {
  const app = await startApp({ fetchImpl: fakeFetch(offHandler) });
  try {
    const admin = await app.login();
    await app.request(`/api/products/lookup/${OFF}`);
    const product = (await app.request("/api/admin/products?q=" + OFF, { token: admin })).body.products[0];
    const post = (body) => app.request("/api/admin/certifications", { method: "POST", token: admin, body: { productId: product.id, organization: "KMF", ...body } });

    assert.equal((await post({ verificationStatus: "verified" })).body.code, "evidence_required");
    const claim = await post({ verificationStatus: "unverified", certificateNo: "KMF-1" });
    assert.equal(claim.status, 201);
    assert.notEqual((await app.request(`/api/products/lookup/${OFF}`)).body.analysis.status, "HALAL_CERTIFIED");

    const verify = await app.request(`/api/admin/certifications/${claim.body.certification.id}`, { method: "PATCH", token: admin, body: { verificationStatus: "verified", verificationUrl: "https://example.test/verify/KMF-1", validUntil: "2099-12-31" } });
    assert.equal(verify.body.certification.verifiedBy, "admin@halalmap.test");
    const certified = (await app.request(`/api/products/lookup/${OFF}`)).body;
    assert.equal(certified.analysis.status, "HALAL_CERTIFIED");
    assert.equal(certified.analysis.certification.valid[0].verificationUrl, "https://example.test/verify/KMF-1");
    assert.ok(certified.analysis.checkRequired.length > 0, "ingredient analysis is still shown next to the certificate");

    await app.request(`/api/admin/certifications/${claim.body.certification.id}`, { method: "PATCH", token: admin, body: { validUntil: "2020-01-01" } });
    assert.equal((await app.request(`/api/products/lookup/${OFF}`)).body.analysis.status, "CHECK_REQUIRED", "expired certificate no longer certifies");
    assert.equal((await post({ status: "bogus" })).status, 400);
  } finally { await app.close(); }
});

test("admin can correct a product's ingredients and re-map a single ingredient; changes are reflected in the scan result", async () => {
  const app = await startApp({ fetchImpl: fakeFetch(offHandler) });
  try {
    const admin = await app.login();
    await app.request(`/api/products/lookup/${OFF}`);
    const id = (await app.request("/api/admin/products?q=" + OFF, { token: admin })).body.products[0].id;
    let detail = (await app.request(`/api/admin/products/${id}`, { token: admin })).body;
    assert.ok(detail.ingredients.some((row) => row.raw_text === "젤라틴"));

    // map the unclear 젤라틴 to fish gelatin for this product only
    const override = await app.request(`/api/admin/products/${id}/overrides`, { method: "POST", token: admin, body: { text: "젤라틴", ingredientKey: "fish_gelatin" } });
    assert.equal(override.status, 200);
    const scan = (await app.request(`/api/products/lookup/${OFF}`)).body;
    assert.equal(scan.analysis.checkRequired.some((i) => i.name === "젤라틴"), false);
    assert.equal(scan.analysis.status, "NO_FLAGGED_INGREDIENTS");
    assert.equal((await app.request(`/api/admin/products/${id}/overrides/${encodeURIComponent("젤라틴")}`, { method: "DELETE", token: admin })).status, 200);
    assert.equal((await app.request(`/api/products/lookup/${OFF}`)).body.analysis.status, "CHECK_REQUIRED");

    // edit fields + verify
    const patch = await app.request(`/api/admin/products/${id}`, { method: "PATCH", token: admin, body: { name: "수정된 이름", verificationStatus: "verified", ingredientsRaw: "설탕, 돼지고기" } });
    assert.equal(patch.body.product.verificationStatus, "verified");
    assert.equal(patch.body.analysis.status, "FLAGGED_INGREDIENT");
    assert.equal(patch.body.product.ingredientsTrust, "admin_verified");
    assert.equal((await app.request(`/api/admin/products/${id}`, { method: "PATCH", token: admin, body: { verificationStatus: "sure" } })).status, 400);
    assert.equal((await app.request(`/api/admin/products/${id}`, { method: "PATCH", token: admin, body: {} })).status, 400);

    // rejected products disappear from the scanner
    await app.request(`/api/admin/products/${id}`, { method: "PATCH", token: admin, body: { verificationStatus: "rejected" } });
    assert.equal((await app.request(`/api/products/lookup/${OFF}`)).body.found, false);

    // create manually
    const created = await app.request("/api/admin/products", { method: "POST", token: admin, body: { barcode: NEW_BARCODE, name: "수동 제품", ingredientsRaw: "설탕, 소금" } });
    assert.equal(created.status, 201);
    assert.equal(created.body.analysis.status, "NO_FLAGGED_INGREDIENTS");
    assert.equal((await app.request("/api/admin/products", { method: "POST", token: admin, body: { barcode: NEW_BARCODE, name: "dup" } })).status, 409);
  } finally { await app.close(); }
});

test("admin places: list with provenance, moderate, import CSV with mandatory provenance", async () => {
  const app = await startApp();
  try {
    const admin = await app.login();
    const csv = ["kind,name,name_ko,lat,lng,halal_status,source,source_url,license", "restaurant,Csv Kitchen,씨에스브이,37.5,127.0,halal-friendly,Operator sheet,https://example.test/x,CC BY 4.0", "restaurant,No license,,37.5,127.0,,Operator sheet,,"].join("\n");
    const imported = await app.request("/api/admin/places/import", { method: "POST", token: admin, body: { filename: "places.csv", content: csv } });
    assert.equal(imported.body.imported, 1);
    assert.equal(imported.body.rejected, 1);
    const listed = (await app.request("/api/admin/places?origin=imported", { token: admin })).body;
    assert.equal(listed.total, 1);
    assert.equal(listed.places[0].provenance.license, "CC BY 4.0");
    assert.equal((await app.request("/api/restaurants")).body.restaurants.length, 1, "demo restaurants hidden by real data");
    await app.request(`/api/admin/places/${listed.places[0].id}`, { method: "PATCH", token: admin, body: { verificationStatus: "verified", halalStatus: "certified", certBody: "KMF" } });
    const verified = (await app.request(`/api/restaurants/${listed.places[0].id}`)).body.restaurant;
    assert.equal(verified.verificationStatus, "verified");
    assert.equal(verified.halalStatus, "certified");
    assert.equal(verified.sources[0].source, "Operator sheet");
    await app.request(`/api/admin/places/${listed.places[0].id}`, { method: "PATCH", token: admin, body: { isActive: false } });
    assert.equal((await app.request(`/api/restaurants/${listed.places[0].id}`)).status, 404);
    assert.equal((await app.request(`/api/admin/places/${listed.places[0].id}`, { method: "PATCH", token: admin, body: { halalStatus: "super" } })).status, 400);
  } finally { await app.close(); }
});

test("admin sources registry: licence state is visible and editable; public list exposes attribution", async () => {
  const app = await startApp();
  try {
    const admin = await app.login();
    const { sources, runs } = (await app.request("/api/admin/sources", { token: admin })).body;
    const osm = sources.find((s) => s.key === "osm");
    assert.equal(osm.license, "ODbL 1.0");
    assert.equal(osm.licenseStatus, "confirmed");
    assert.equal(sources.find((s) => s.key === "mfds_foodsafetykorea").licenseStatus, "unconfirmed");
    assert.equal(sources.find((s) => s.key === "mfds_foodsafetykorea").apiKeyConfigured, false);
    assert.equal(sources.find((s) => s.key === "kmf_halal_list").usable, false);
    assert.ok(Array.isArray(runs));
    await app.request("/api/admin/sources/openfoodfacts", { method: "PATCH", token: admin, body: { licenseStatus: "rejected", reason: "legal review" } });
    assert.equal((await app.request(`/api/products/lookup/${OFF}`)).body.lookup.tried.at(-1).detail, "source_rejected");
    const publicList = (await app.request("/api/data-sources")).body.sources;
    assert.equal(publicList.find((s) => s.key === "osm").attribution, "© OpenStreetMap contributors");
    const stats = (await app.request("/api/admin/stats", { token: admin })).body;
    assert.ok(stats.ingredients.total > 200 && stats.rules.total > 40);
  } finally { await app.close(); }
});

test("uploads: unknown/invalid names are 404, path traversal is impossible", async () => {
  const app = await startApp();
  try {
    assert.equal((await app.request("/api/uploads/..%2F..%2Fetc%2Fpasswd")).status, 404);
    assert.equal((await app.request("/api/uploads/notahash.png")).status, 404);
    assert.equal((await app.request(`/api/uploads/${"a".repeat(32)}.png`)).status, 401, "unknown private file -> admin only");
  } finally { await app.close(); }
});

test("lookups are rate limited per client", async () => {
  const app = await startApp();
  try {
    let limited = 0;
    for (let i = 0; i < 60; i += 1) if ((await app.request("/api/products/lookup/123")).status === 429) limited += 1;
    assert.ok(limited > 0);
  } finally { await app.close(); }
});
