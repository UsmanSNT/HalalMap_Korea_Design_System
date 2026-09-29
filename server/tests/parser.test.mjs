import { test } from "node:test";
import assert from "node:assert/strict";
import { flattenItems, parseIngredientText } from "../products/ingredients/parser.mjs";
import { boundedLevenshtein, keyVariants, normalizeKey } from "../products/ingredients/normalize.mjs";

const names = (items) => items.map((i) => i.text);

test("splits a Korean label, separating origin, percent and allergen tail", () => {
  const r = parseIngredientText("원재료명: 밀가루(밀:미국산), 설탕, 팜유(말레이시아산), 정제소금 0.5%, 모노·디글리세리드. 알레르기 유발물질: 밀, 대두 함유");
  assert.deepEqual(names(r.items), ["밀가루", "설탕", "팜유", "정제소금", "모노·디글리세리드"]);
  assert.equal(r.items[0].origin, "밀:미국산");
  assert.equal(r.items[3].percent, 0.5);
  assert.deepEqual(r.allergens, ["밀", "대두"]);
  assert.equal(r.items[0].children.length, 0, "an origin bracket is not an ingredient");
});

test("brackets hold sub-ingredients, not origins", () => {
  const r = parseIngredientText("유화제(대두레시틴, 해바라기유), 산도조절제(구연산, 젖산)");
  assert.deepEqual(names(r.items), ["유화제", "산도조절제"]);
  assert.deepEqual(names(r.items[0].children), ["대두레시틴", "해바라기유"]);
  assert.deepEqual(names(r.items[1].children), ["구연산", "젖산"]);
});

test("names ending in 산 are not mistaken for an origin (구연산, 젖산)", () => {
  const r = parseIngredientText("산도조절제(구연산)");
  assert.deepEqual(names(r.items[0].children), ["구연산"]);
  assert.equal(r.items[0].origin, null);
});

test("English labels: percent, underscore emphasis, contains/may-contain tails", () => {
  const r = parseIngredientText("Ingredients: Sugar, Wheat flour (30%), _Milk_ powder, Emulsifier (soy lecithin, E471). Contains: milk, soy. May contain traces of nuts.");
  assert.deepEqual(names(r.items), ["Sugar", "Wheat flour", "Milk powder", "Emulsifier"]);
  assert.equal(r.items[1].percent, 30);
  assert.deepEqual(names(r.items[3].children), ["soy lecithin", "E471"]);
  assert.ok(r.allergens.includes("milk") && r.allergens.includes("nuts"));
});

test("one ingredient per line (no commas) is split by line; wrapped label text is joined", () => {
  assert.deepEqual(names(parseIngredientText("설탕\n소금\n돼지고기(국산)").items), ["설탕", "소금", "돼지고기"]);
  assert.deepEqual(names(parseIngredientText("밀가루, 설탕, 모노·디글리세\n리드, 소금").items), ["밀가루", "설탕", "모노·디글리세 리드", "소금"]);
});

test("unbalanced brackets are reported and empty input is handled", () => {
  assert.ok(parseIngredientText("밀가루(밀, 설탕").warnings.includes("unbalanced_parentheses"));
  assert.deepEqual(parseIngredientText("   ").warnings, ["empty"]);
  assert.equal(parseIngredientText("").items.length, 0);
});

test("flattenItems keeps depth-first order with parent positions", () => {
  const rows = flattenItems(parseIngredientText("젤라틴(돈피), 설탕").items);
  assert.deepEqual(rows.map((r) => [r.item.text, r.parentPosition]), [["젤라틴", null], ["돈피", 0], ["설탕", null]]);
});

test("normalizeKey removes spacing/punctuation and unifies apostrophes", () => {
  assert.equal(normalizeKey("모노·디글리세리드"), "모노디글리세리드");
  assert.equal(normalizeKey("L-글루탐산 나트륨"), "l글루탐산나트륨");
  assert.equal(normalizeKey("cho'chqa"), normalizeKey("cho‘chqa"));
  assert.equal(normalizeKey("Ｇｅｌａｔｉｎｅ"), "gelatine");
});

test("qualifier variants and bounded edit distance", () => {
  assert.ok(keyVariants(normalizeKey("국산볶은참깨")).includes("참깨"));
  assert.equal(boundedLevenshtein("젤라틴", "젤라린", 1), 1);
  assert.equal(boundedLevenshtein("설탕", "소금물", 1), 2);
});
