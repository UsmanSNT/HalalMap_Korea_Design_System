import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeIngredientText } from "../products/analysis.mjs";
import { refreshIngredientAnalysis } from "../products/seed.mjs";
import { makeKnowledgeDb } from "./helpers.mjs";

const { db, cache } = makeKnowledgeDb();
const analyze = (text, opts = {}) => analyzeIngredientText({ ruleset: cache.get(), text, ...opts });
const cert = (over = {}) => ({ id: 1, organization: "KMF", certificate_no: "KMF-TEST-1", status: "valid", valid_from: null, valid_until: null, verification_status: "verified", verification_url: "https://example.test/cert/1", verified_at: "2026-01-01", source: "admin_entry", source_url: null, license: null, ...over });
const find = (analysis, name) => {
  const walk = (items) => items.flatMap((i) => [i, ...walk(i.children)]);
  return walk(analysis.items).find((i) => i.name === name);
};

test("plain list of reviewed, unflagged ingredients -> NO_FLAGGED_INGREDIENTS (not 'halal')", () => {
  const a = analyze("원재료명: 밀가루(밀:미국산), 설탕, 팜유, 정제소금, 효모, 탄산수소나트륨");
  assert.equal(a.status, "NO_FLAGGED_INGREDIENTS");
  assert.equal(a.certification.state, "none");
  assert.ok(a.reasons[0].text.en.includes("not a halal certification"));
});

test("pork ingredient -> FLAGGED_INGREDIENT with reason and evidence", () => {
  const a = analyze("돼지고기(국산), 설탕, 정제소금");
  assert.equal(a.status, "FLAGGED_INGREDIENT");
  const pork = find(a, "돼지고기");
  assert.equal(pork.status, "FLAGGED_INGREDIENT");
  assert.equal(pork.reason.en, "Pork ingredient detected in the ingredient list.");
  assert.match(pork.rule.evidence, /Qur'an 2:173/);
  assert.ok(["term.pork", "cat.flagged.meat_pork"].includes(pork.rule.key));
});

test("돈육 / 라드 / 베이컨 / 족발 and compounds are flagged by name, even if unknown to the dictionary", () => {
  for (const text of ["돈육", "라드", "베이컨", "돈골농축액", "족발", "pork extract", "Lard", "cho'chqa go'shti"]) {
    assert.equal(analyze(`${text}, 설탕`).status, "FLAGGED_INGREDIENT", text);
  }
});

test("origin-dependent ingredients are CHECK_REQUIRED, never auto-halal or auto-haram", () => {
  for (const text of ["젤라틴", "콜라겐", "유화제", "글리세린", "효소", "향료", "지방산", "주정", "쇠고기", "닭고기", "새우", "치즈", "카민"]) {
    const a = analyze(`${text}, 설탕`);
    assert.equal(a.status, "CHECK_REQUIRED", text);
    assert.equal(find(a, text).status, "CHECK_REQUIRED", `${text} item`);
  }
});

test("Gelatin example from the spec explains that the source could not be determined", () => {
  const a = analyze("젤라틴, 설탕");
  const gelatin = find(a, "젤라틴");
  assert.equal(gelatin.reason.en, "Ingredient source could not be determined from available product information.");
  assert.ok(gelatin.reason.ko.length > 10 && gelatin.reason.uz.length > 10, "reason is available in ko/en/uz");
});

test("source-qualified gelatin: pork is flagged, fish is not, beef still needs a check", () => {
  assert.equal(analyze("젤라틴(돈피), 설탕").status, "FLAGGED_INGREDIENT");
  assert.equal(analyze("젤라틴(돼지), 설탕").status, "FLAGGED_INGREDIENT");
  assert.equal(analyze("젤라틴(어류), 설탕").status, "NO_FLAGGED_INGREDIENTS");
  assert.equal(analyze("젤라틴(쇠고기), 설탕").status, "CHECK_REQUIRED");
});

test("umbrella terms take their status from bracketed sub-ingredients", () => {
  assert.equal(analyze("유화제(대두레시틴), 설탕").status, "NO_FLAGGED_INGREDIENTS");
  assert.equal(analyze("유화제(모노·디글리세리드), 설탕").status, "CHECK_REQUIRED");
  assert.equal(analyze("유화제(돼지지방유래), 설탕").status, "FLAGGED_INGREDIENT");
  const a = analyze("유화제(대두레시틴, 해바라기유)");
  assert.equal(find(a, "유화제").derivedFromChildren, true);
});

test("name-based pork rule has explicit exceptions: 돼지감자 and blood orange are plants", () => {
  assert.equal(analyze("돼지감자농축액, 설탕").status, "NO_FLAGGED_INGREDIENTS");
  assert.equal(analyze("Blood orange juice, sugar").status, "NO_FLAGGED_INGREDIENTS");
  assert.equal(analyze("blood, sugar").status, "FLAGGED_INGREDIENT");
});

test("flavour named after bacon is CHECK_REQUIRED, real bacon is flagged", () => {
  assert.equal(analyze("베이컨맛시즈닝").status, "CHECK_REQUIRED");
  assert.equal(analyze("베이컨").status, "FLAGGED_INGREDIENT");
});

test("alcoholic beverages as ingredient are flagged; beer yeast and vinegar are not", () => {
  assert.equal(analyze("맛술, 설탕").status, "FLAGGED_INGREDIENT");
  assert.equal(analyze("화이트와인").status, "FLAGGED_INGREDIENT");
  assert.equal(analyze("맥주효모, 설탕").status, "NO_FLAGGED_INGREDIENTS");
  assert.equal(analyze("양조식초, 설탕").status, "NO_FLAGGED_INGREDIENTS");
  assert.equal(analyze("와인식초").status, "CHECK_REQUIRED");
});

test("unknown ingredients never produce NO_FLAGGED_INGREDIENTS", () => {
  const a = analyze("XYZ쿠키반죽, 설탕");
  assert.equal(a.status, "CHECK_REQUIRED");
  assert.equal(find(a, "XYZ쿠키반죽").status, "UNKNOWN");
  assert.equal(a.counts.unknown, 1);
});

test("no ingredient text -> UNKNOWN", () => {
  assert.equal(analyze("").status, "UNKNOWN");
  assert.equal(analyze("   ").status, "UNKNOWN");
});

test("partial-name matches can never clear an ingredient", () => {
  const a = analyze("볶은밀가루반죽튀김");
  assert.equal(find(a, "볶은밀가루반죽튀김").matchType, "contains");
  assert.equal(a.status, "CHECK_REQUIRED");
});

test("OCR text: cleared products are capped at CHECK_REQUIRED, flags still surface, typos are matched fuzzily but never cleared", () => {
  const ocr = analyze("설탕, 소금, 밀가루", { inputTrust: "ocr_unconfirmed", fuzzy: true });
  assert.equal(ocr.status, "CHECK_REQUIRED");
  assert.ok(ocr.reasons.some((r) => r.code === "OCR_UNCONFIRMED"));
  assert.equal(analyze("설탕, 소금, 밀가루", { inputTrust: "user_confirmed" }).status, "NO_FLAGGED_INGREDIENTS");

  const typo = analyze("설탕, 젤라린", { inputTrust: "ocr_unconfirmed", fuzzy: true });
  assert.equal(find(typo, "젤라린").matchType, "fuzzy");
  assert.equal(find(typo, "젤라린").status, "CHECK_REQUIRED");

  const fuzzyClear = analyze("설탕, 소금, 밀가류", { inputTrust: "user_confirmed", fuzzy: true });
  assert.equal(find(fuzzyClear, "밀가류").matchType, "fuzzy");
  assert.equal(fuzzyClear.status, "CHECK_REQUIRED", "a fuzzy match to a cleared ingredient is only 'check'");

  assert.equal(analyze("돼지고가, 설탕", { inputTrust: "ocr_unconfirmed", fuzzy: true }).status, "FLAGGED_INGREDIENT");
});

test("HALAL_CERTIFIED needs a verified, valid, unexpired certification", () => {
  const text = "쇠고기, 설탕, 젤라틴";
  assert.equal(analyze(text, { certifications: [cert()] }).status, "HALAL_CERTIFIED");
  assert.equal(analyze(text, { certifications: [cert()] }).certification.valid[0].organization, "KMF");
  assert.equal(analyze(text, { certifications: [cert({ verification_status: "unverified" })] }).status, "CHECK_REQUIRED");
  assert.equal(analyze(text, { certifications: [cert({ verification_status: "needs_review" })] }).status, "CHECK_REQUIRED");
  assert.equal(analyze(text, { certifications: [cert({ valid_until: "2020-01-01" })] }).status, "CHECK_REQUIRED");
  assert.equal(analyze(text, { certifications: [cert({ status: "revoked" })] }).status, "CHECK_REQUIRED");
  assert.equal(analyze(text, { certifications: [cert({ verification_status: "rejected" })] }).certification.other.length, 0);
});

test("certified and merely 'no flagged ingredients' products are clearly different results", () => {
  const plain = analyze("설탕, 소금");
  const certified = analyze("설탕, 소금", { certifications: [cert()] });
  assert.equal(plain.status, "NO_FLAGGED_INGREDIENTS");
  assert.equal(certified.status, "HALAL_CERTIFIED");
  assert.notEqual(plain.status, certified.status);
});

test("certification that conflicts with a flagged ingredient is not shown as certified", () => {
  const a = analyze("돼지고기, 설탕", { certifications: [cert()] });
  assert.equal(a.status, "CHECK_REQUIRED");
  assert.equal(a.reasons[0].code, "CERT_CONFLICT");
  assert.equal(a.flagged.length, 1);
});

test("certified product without any ingredient list is still certified (with its evidence)", () => {
  assert.equal(analyze("", { certifications: [cert()] }).status, "HALAL_CERTIFIED");
});

test("unverified label claim is reported as a claim only", () => {
  const a = analyze("설탕", { certifications: [cert({ verification_status: "unverified", organization: "Halal label on packaging (unverified claim)" })] });
  assert.equal(a.status, "NO_FLAGGED_INGREDIENTS");
  assert.equal(a.certification.state, "unverified_claim");
});

test("rules are data: changing the database changes the outcome without code changes", () => {
  assert.equal(analyze("새우, 설탕").status, "CHECK_REQUIRED");
  db.prepare("UPDATE ingredient_rules SET status = 'NO_FLAGGED_INGREDIENTS', updated_by = 'test' WHERE rule_key = 'cat.check.shellfish'").run();
  cache.invalidate();
  assert.equal(analyze("새우, 설탕").status, "NO_FLAGGED_INGREDIENTS");
  db.prepare("UPDATE ingredient_rules SET is_active = 0 WHERE rule_key = 'term.pork'").run();
  db.prepare("UPDATE ingredient_rules SET is_active = 0 WHERE rule_key = 'cat.flagged.meat_pork'").run();
  cache.invalidate();
  assert.notEqual(analyze("돼지고기").status, "FLAGGED_INGREDIENT");
  db.prepare("UPDATE ingredient_rules SET is_active = 1 WHERE rule_key IN ('term.pork','cat.flagged.meat_pork')").run();
  db.prepare("UPDATE ingredient_rules SET status = 'CHECK_REQUIRED' WHERE rule_key = 'cat.check.shellfish'").run();
  cache.invalidate();
  assert.equal(analyze("돼지고기").status, "FLAGGED_INGREDIENT");
});

test("higher priority beats lower; ties go to the stricter status", () => {
  db.prepare(`INSERT INTO ingredient_rules (rule_key, title, match_type, match_value, status, priority, reason_code, reason_ko, reason_en, reason_uz)
    VALUES ('test.a', 'a', 'term', '테스트원료', 'NO_FLAGGED_INGREDIENTS', 250, 'T', 'k', 'e', 'u'), ('test.b', 'b', 'term', '테스트원료', 'CHECK_REQUIRED', 250, 'T', 'k', 'e', 'u')`).run();
  cache.invalidate();
  assert.equal(find(analyze("테스트원료"), "테스트원료").rule.key, "test.b");
  db.prepare("UPDATE ingredient_rules SET priority = 260 WHERE rule_key = 'test.a'").run();
  cache.invalidate();
  assert.equal(find(analyze("테스트원료"), "테스트원료").rule.key, "test.a");
});

test("ingredient cache column follows the rules", () => {
  refreshIngredientAnalysis(db);
  const row = db.prepare("SELECT analysis_status, analysis_rule_key FROM ingredients WHERE key = 'gelatin'").get();
  assert.equal(row.analysis_status, "CHECK_REQUIRED");
  assert.ok(row.analysis_rule_key);
  assert.equal(db.prepare("SELECT analysis_status s FROM ingredients WHERE key = 'pork'").get().s, "FLAGGED_INGREDIENT");
});

test("every ingredient in the seed resolves to itself and is never silently unclassified in the important categories", () => {
  const rows = db.prepare("SELECT key, canonical_name, category FROM ingredients WHERE category NOT IN ('sauce_composite','unclassified')").all();
  for (const row of rows) {
    const status = db.prepare("SELECT analysis_status s FROM ingredients WHERE key = ?").get(row.key).s;
    assert.notEqual(status, "UNKNOWN", `${row.key} (${row.category}) has no rule`);
  }
});
