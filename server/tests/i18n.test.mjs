import { test } from "node:test";
import assert from "node:assert/strict";

// The dictionaries are plain object literals, so Node can load them directly (type stripping) without a bundler.
const load = async (name) => Object.values(await import(`../../src/i18n/dictionaries/${name}.ts`))[0];

for (const name of ["scanner", "place"]) {
  test(`${name}: ko, en and uz have exactly the same keys and no empty text`, async () => {
    const dict = await load(name);
    const keys = (lang) => Object.keys(dict[lang]).sort();
    assert.deepEqual(keys("en"), keys("ko"), "en keys differ from ko");
    assert.deepEqual(keys("uz"), keys("ko"), "uz keys differ from ko");
    for (const lang of ["ko", "en", "uz"]) {
      for (const [key, value] of Object.entries(dict[lang])) assert.ok(String(value).trim().length > 0, `${name}.${lang}.${key} is empty`);
    }
  });
}

test("scanner dictionary covers every status the engine can return", async () => {
  const dict = await load("scanner");
  for (const status of ["HALAL_CERTIFIED", "NO_FLAGGED_INGREDIENTS", "CHECK_REQUIRED", "FLAGGED_INGREDIENT", "UNKNOWN"]) {
    for (const lang of ["ko", "en", "uz"]) {
      assert.ok(dict[lang][`status_${status}`], `status_${status} (${lang})`);
      assert.ok(dict[lang][`substatus_${status}`], `substatus_${status} (${lang})`);
    }
  }
  for (const warning of ["COMMUNITY_DATA", "UNVERIFIED_PRODUCT_DATA", "USER_SUBMITTED"]) assert.ok(dict.en[`warn_${warning}`]);
});

test("placeholders such as {count} and {percent} are kept in every language", async () => {
  const dict = await load("scanner");
  for (const key of ["ingredients_count", "ip_reading", "ip_confidence", "ip_barcode"]) {
    const tokens = (text) => (text.match(/\{\w+\}/g) ?? []).sort().join(",");
    assert.equal(tokens(dict.en[key]), tokens(dict.ko[key]), key);
    assert.equal(tokens(dict.uz[key]), tokens(dict.ko[key]), key);
  }
});
