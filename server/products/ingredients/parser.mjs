// Parses a Korean/English "원재료명 / ingredients" string into a tree of items.
//   "밀가루(밀:미국산), 유화제(대두레시틴, 해바라기유), 설탕 12%"
// The parser only splits text; it never decides anything about halal status.

import { normalizeKey } from "./normalize.mjs";

const COUNTRIES = [
  "국내", "국", "미국", "호주", "중국", "일본", "캐나다", "브라질", "베트남", "태국", "필리핀", "인도네시아",
  "말레이시아", "뉴질랜드", "프랑스", "독일", "이탈리아", "스페인", "네덜란드", "덴마크", "칠레", "아르헨티나",
  "러시아", "우크라이나", "폴란드", "튀르키예", "터키", "영국", "아일랜드", "스웨덴", "노르웨이", "페루", "콜롬비아",
  "에콰도르", "멕시코", "남아프리카공화국", "남아공", "우루과이", "파라과이", "스위스", "오스트리아", "벨기에",
  "헝가리", "루마니아", "불가리아", "인도", "파키스탄", "방글라데시", "미얀마", "캄보디아", "라오스", "대만",
  "외국", "수입", "EU", "유럽", "북미", "남미", "아시아", "아프리카",
];
const COUNTRY_ALT = COUNTRIES.join("|");
const ORIGIN_SEGMENT = new RegExp(`^(?:원산지[:\\s]*.*|(?:${COUNTRY_ALT})산|(?:${COUNTRY_ALT})\\s*외|(?:${COUNTRY_ALT})산\\s*\\d+(?:\\.\\d+)?%)$`, "i");
const ENGLISH_ORIGIN_SEGMENT = /^(?:origin|product of|made in)\s*[:\s].*$/i;

const isOriginSegment = (segment) => {
  const value = segment.trim().replace(/\s+/g, "");
  if (!value) return false;
  return ORIGIN_SEGMENT.test(value) || ENGLISH_ORIGIN_SEGMENT.test(segment.trim());
};

const LABEL_PREFIX = /^\s*[[【(]?\s*(?:원재료명|원재료|재료명|재료|성분명|성분|ingredients?|ingredientes|ингредиенты|tarkibi)\s*[\]】)]?\s*[:：]?\s*/i;
const TAIL_MARKERS = [
  /알레르기\s*(?:유발)?\s*(?:물질|성분)?/,
  /알러지/,
  /allergy\s*(?:advice|information)?/i,
  /allergens?\b/i,
  /contains\s*:/i,
  /may\s+contain/i,
  /traces?\s+of/i,
  /이\s*제품은/,
  /같은\s*(?:제조\s*)?시설/,
  /※/,
];

const splitOnce = (text, regex) => {
  const match = regex.exec(text);
  return match ? [text.slice(0, match.index), text.slice(match.index)] : [text, ""];
};

/** Separates the ingredient list from trailing allergen/facility notes. */
const splitTail = (text) => {
  let bestIndex = -1;
  for (const marker of TAIL_MARKERS) {
    const match = marker.exec(text);
    if (match && (bestIndex === -1 || match.index < bestIndex)) bestIndex = match.index;
  }
  return bestIndex === -1 ? [text, ""] : [text.slice(0, bestIndex), text.slice(bestIndex)];
};

const ALLERGEN_NOISE = /(?:알레르기|알러지|유발|물질|성분|함유|포함|contains?|allergens?|may|traces?|of|:|：)/gi;

const parseAllergenTail = (tail) =>
  tail
    .replace(ALLERGEN_NOISE, " ")
    .split(/[,;·/\s]+/)
    .map((part) => part.replace(/[.。]+$/u, "").trim())
    .filter((part) => part.length > 0 && part.length < 30);

/** Splits `text` on top-level commas/semicolons (depth 0), respecting (), [] and {}. */
const splitTopLevel = (text) => {
  const parts = [];
  let depth = 0;
  let current = "";
  let unbalanced = false;
  for (const char of text) {
    if ("([{".includes(char)) depth += 1;
    else if (")]}".includes(char)) {
      if (depth === 0) unbalanced = true;
      else depth -= 1;
    }
    if ((char === "," || char === ";") && depth === 0) {
      parts.push(current);
      current = "";
    } else current += char;
  }
  parts.push(current);
  if (depth !== 0) unbalanced = true;
  return { parts, unbalanced };
};

/** Splits "name(group)(group)" into its top-level name text and the inner text of each group. */
const splitGroups = (token) => {
  let depth = 0;
  let name = "";
  let inner = "";
  const groups = [];
  for (const char of token) {
    if ("([{".includes(char)) {
      if (depth > 0) inner += char;
      depth += 1;
    } else if (")]}".includes(char) && depth > 0) {
      depth -= 1;
      if (depth === 0) {
        groups.push(inner);
        inner = "";
      } else inner += char;
    } else if (depth > 0) inner += char;
    else name += char;
  }
  if (depth > 0 && inner) groups.push(inner); // unterminated group: keep its text
  return { name, groups };
};

const PERCENT = /(\d+(?:\.\d+)?)\s*%/;

const cleanName = (name) =>
  name
    .replace(/[_*]/g, " ")
    .replace(PERCENT, " ")
    .replace(/^\s*(?:[·•\-–—]|\d+[.)])\s*/u, "")
    .replace(/[.。]+\s*$/u, "")
    .replace(/\s+/g, " ")
    .trim();

const parseToken = (token, depth) => {
  const raw = token.trim();
  if (!raw) return null;
  const { name: rawName, groups } = splitGroups(raw);
  let percent = null;
  const percentMatch = PERCENT.exec(rawName);
  if (percentMatch) percent = Number(percentMatch[1]);
  const text = cleanName(rawName);

  const origins = [];
  const children = [];
  for (const group of groups) {
    const pure = group.trim();
    const pct = /^(?:함량\s*)?(\d+(?:\.\d+)?)\s*%$/.exec(pure);
    if (pct) {
      percent ??= Number(pct[1]);
      continue;
    }
    if (depth >= 4) continue;
    const { parts } = splitTopLevel(group);
    for (const part of parts) {
      const segment = part.trim();
      if (!segment) continue;
      if (isOriginSegment(segment)) {
        origins.push(segment);
        continue;
      }
      // "밀:미국산" — a labelled origin: keep as origin note, not as an ingredient.
      const labelled = /^([^:：]+)[:：]\s*(.+)$/.exec(segment);
      if (labelled && labelled[2].split(/[,·/]/).every((piece) => isOriginSegment(piece))) {
        origins.push(segment);
        continue;
      }
      const child = parseToken(segment, depth + 1);
      if (child) children.push(child);
    }
  }
  if (!text && children.length === 0) return null;
  return { raw, text, percent, origin: origins.join("; ") || null, children };
};

/**
 * @typedef {{raw: string, text: string, percent: number|null, origin: string|null, children: ParsedItem[]}} ParsedItem
 * @returns {{items: ParsedItem[], allergens: string[], warnings: string[], cleaned: string}}
 */
export const parseIngredientText = (input) => {
  const warnings = [];
  let text = String(input ?? "").normalize("NFKC").replace(/[​-‍﻿]/g, "").replace(/、/g, ",").trim();
  if (!text) return { items: [], allergens: [], warnings: ["empty"], cleaned: "" };

  // One ingredient per line (no commas at all) vs. label text hard-wrapped across lines.
  if (/\n/.test(text)) {
    const hasTopLevelCommas = splitTopLevel(text).parts.length > 1;
    text = hasTopLevelCommas ? text.replace(/\s*\n\s*/g, " ") : text.split(/\n+/).map((line) => line.trim()).filter(Boolean).join(", ");
  }

  text = text.replace(LABEL_PREFIX, "");
  const [body, tail] = splitTail(text);
  const allergens = parseAllergenTail(tail);

  const { parts, unbalanced } = splitTopLevel(body);
  if (unbalanced) warnings.push("unbalanced_parentheses");

  const items = [];
  for (const part of parts) {
    const item = parseToken(part, 0);
    if (item) items.push(item);
  }
  if (items.length > 150) warnings.push("very_long_list");
  if (items.length === 0) warnings.push("no_ingredients_found");
  return { items, allergens, warnings, cleaned: body.trim() };
};

/** Flattens a parse tree depth-first with positions, matching the product_ingredients table layout. */
export const flattenItems = (items) => {
  const rows = [];
  const walk = (list, parentPosition) => {
    for (const item of list) {
      const position = rows.length;
      rows.push({ position, parentPosition, item });
      walk(item.children, position);
    }
  };
  walk(items, null);
  return rows;
};

export { normalizeKey };
