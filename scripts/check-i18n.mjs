// Verifies translation dictionaries are complete and script-consistent. Exits 1 on any error.
//   node --experimental-strip-types scripts/check-i18n.mjs   (Node 22.6+)

import { dictionaries } from "../src/locale/dictionaries.ts";

const HANGUL = /[ㄱ-ㆎ가-힣]/;
const CYRILLIC = /[Ѐ-ӿ]/;
const UZ_WRONG_APOSTROPHE = /[‘’ʻʼ`´]/;
const SAME_AS_ENGLISH_OK = new Set(["data.osm"]);

const langs = Object.keys(dictionaries);
const reference = Object.keys(dictionaries.en);
const placeholders = (v) => [...String(v).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
const errors = [];
const warnings = [];

for (const lang of langs) {
  const dict = dictionaries[lang];
  for (const key of reference) if (!(key in dict)) errors.push(`${lang}: missing key "${key}"`);
  for (const key of Object.keys(dict)) if (!reference.includes(key)) errors.push(`${lang}: extra key "${key}"`);

  for (const [key, value] of Object.entries(dict)) {
    if (typeof value !== "string" || !value.trim()) errors.push(`${lang}.${key}: empty`);
    if (placeholders(value) !== placeholders(dictionaries.en[key])) errors.push(`${lang}.${key}: placeholders differ from English ("${value}")`);
    if (value !== value.trim() || /\s{2,}/.test(value)) errors.push(`${lang}.${key}: stray whitespace`);
    if (lang !== "ko" && HANGUL.test(value) && !key.startsWith("data.")) errors.push(`${lang}.${key}: contains Hangul ("${value}")`);
    if (lang !== "ru" && CYRILLIC.test(value)) errors.push(`${lang}.${key}: contains Cyrillic ("${value}")`);
    if (lang === "ko" && !HANGUL.test(value) && !/^[\d\s©A-Za-z.]+$/.test(value) && !key.startsWith("data.")) warnings.push(`ko.${key}: no Hangul ("${value}")`);
    if (lang === "uz" && UZ_WRONG_APOSTROPHE.test(value)) errors.push(`uz.${key}: use the straight apostrophe ' ("${value}")`);
    if (lang !== "en" && value === dictionaries.en[key] && !SAME_AS_ENGLISH_OK.has(key) && value.length > 3) warnings.push(`${lang}.${key}: identical to English ("${value}")`);
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`${reference.length} keys x ${langs.length} languages: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
