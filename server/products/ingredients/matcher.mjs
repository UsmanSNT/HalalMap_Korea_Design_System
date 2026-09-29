// Resolves ingredient text to a dictionary entry (ingredients + aliases).
// Order: exact -> alias -> qualifier-stripped -> parent+child ("젤라틴"+"돈피") -> contains -> fuzzy.
// The matcher only identifies WHAT an ingredient is; the rules engine decides what that means.

import { boundedLevenshtein, keyVariants, normalizeKey } from "./normalize.mjs";

const MIN_CONTAINS_LENGTH = 3; // shorter aliases (설탕, 우유, 와인, 맥주 …) may only match exactly

const CONFIDENCE = { exact: 1, alias: 0.98, normalized: 0.9, qualified: 0.92, contains: 0.7, fuzzy: 0.6, admin: 1, unmatched: 0 };

const isLatin = (value) => /^[a-z0-9]+$/.test(value);

// Hangul names are short (젤라틴 = 3 syllables), so one edit is tolerated from 3 syllables; Latin from 5 letters.
// Fuzzy matches are never allowed to clear an ingredient (see the engine), so being generous here is safe.
const fuzzyBound = (key) => {
  const length = [...key].length;
  if (isLatin(key)) return length >= 9 ? 2 : length >= 5 ? 1 : 0;
  return length >= 7 ? 2 : length >= 3 ? 1 : 0;
};

/**
 * @param {ReturnType<import("../rules/ruleset.mjs").loadRuleset>} ruleset
 * @returns {{ingredient: object, matchType: string, confidence: number, alias: string}|null}
 */
export const resolveText = (text, ruleset, { fuzzy = false } = {}) => {
  const key = normalizeKey(text);
  if (!key) return null;
  const { aliasMap, ingredientsById } = ruleset;

  const hit = aliasMap.get(key);
  if (hit) {
    const ingredient = ingredientsById.get(hit.ingredientId);
    return { ingredient, matchType: hit.canonical ? "exact" : "alias", confidence: hit.canonical ? CONFIDENCE.exact : CONFIDENCE.alias, alias: hit.alias };
  }

  for (const variant of keyVariants(key).slice(1)) {
    const variantHit = aliasMap.get(variant);
    if (variantHit) {
      return { ingredient: ingredientsById.get(variantHit.ingredientId), matchType: "normalized", confidence: CONFIDENCE.normalized, alias: variantHit.alias };
    }
  }

  // Longest alias contained in the text (only for aliases long enough to be unambiguous).
  let best = null;
  for (const entry of ruleset.aliasesByLength) {
    if (entry.norm.length < MIN_CONTAINS_LENGTH) break;
    if (entry.norm.length < MIN_CONTAINS_LENGTH + 2 && isLatin(entry.norm)) continue;
    if (key.includes(entry.norm)) {
      best = entry;
      break;
    }
  }
  if (best) {
    return { ingredient: ingredientsById.get(best.ingredientId), matchType: "contains", confidence: CONFIDENCE.contains, alias: best.alias };
  }

  if (fuzzy) {
    const bound = fuzzyBound(key);
    if (bound > 0) {
      let winner = null;
      let winnerDistance = bound + 1;
      let tie = false;
      for (const entry of ruleset.aliasesByLength) {
        if (Math.abs(entry.norm.length - key.length) > bound) continue;
        const distance = boundedLevenshtein(key, entry.norm, bound);
        if (distance < winnerDistance) {
          winner = entry;
          winnerDistance = distance;
          tie = false;
        } else if (distance === winnerDistance && winner && entry.ingredientId !== winner.ingredientId) tie = true;
      }
      if (winner && !tie) {
        return {
          ingredient: ingredientsById.get(winner.ingredientId),
          matchType: "fuzzy",
          confidence: Math.max(0.4, CONFIDENCE.fuzzy - 0.05 * (winnerDistance - 1)),
          alias: winner.alias,
        };
      }
    }
  }
  return null;
};

/**
 * Turns parsed items into resolved nodes. Parent+child qualifiers ("젤라틴(돈피)" -> "돈피젤라틴")
 * are tried against the dictionary first so source-qualified entries win over the generic parent.
 */
export const resolveTree = (items, ruleset, options = {}, overrides = new Map()) =>
  items.map((item) => resolveItem(item, ruleset, options, overrides));

const resolveItem = (item, ruleset, options, overrides) => {
  const key = normalizeKey(item.text);
  const override = overrides.get(key);
  let children = item.children;
  let resolved = null;
  let qualifiedBy = null;

  if (override) {
    resolved = override.ignored
      ? { ingredient: null, matchType: "admin", confidence: 1, alias: null, ignored: true }
      : { ingredient: ruleset.ingredientsById.get(override.ingredientId) ?? null, matchType: "admin", confidence: 1, alias: null };
  } else {
    for (const child of item.children) {
      if (child.children.length) continue;
      for (const combined of [normalizeKey(item.text + child.text), normalizeKey(child.text + item.text)]) {
        const hit = ruleset.aliasMap.get(combined);
        if (hit) {
          resolved = {
            ingredient: ruleset.ingredientsById.get(hit.ingredientId),
            matchType: "qualified",
            confidence: CONFIDENCE.qualified,
            alias: hit.alias,
          };
          qualifiedBy = child;
          break;
        }
      }
      if (resolved) break;
    }
    if (resolved && qualifiedBy) children = item.children.filter((child) => child !== qualifiedBy);
    if (!resolved) resolved = resolveText(item.text, ruleset, options);
  }

  return {
    raw: item.raw,
    text: item.text,
    key,
    percent: item.percent,
    origin: item.origin,
    ingredient: resolved?.ingredient ?? null,
    matchType: resolved?.matchType ?? "unmatched",
    confidence: resolved?.confidence ?? 0,
    matchedAlias: resolved?.alias ?? null,
    ignored: Boolean(resolved?.ignored),
    qualifiedBy: qualifiedBy?.text ?? null,
    children: children.map((child) => resolveItem(child, ruleset, options, overrides)),
  };
};
