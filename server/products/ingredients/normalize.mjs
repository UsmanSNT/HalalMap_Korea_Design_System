// Text normalisation shared by the dictionary, the parser, the matcher and the rules engine.

// Apostrophe-like marks (incl. Uzbek oʻ/gʻ variants) are dropped so "cho'chqa" == "cho‘chqa" == "choʻchqa".
const APOSTROPHES = /['`´’‘ʻʼ′‵]/g;

/**
 * Canonical comparison key: NFKC, lower-case, everything except letters/digits removed.
 * "모노·디글리세리드" -> "모노디글리세리드", "L-글루탐산 나트륨" -> "l글루탐산나트륨".
 */
export const normalizeKey = (text) =>
  String(text ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(APOSTROPHES, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");

/** Script-based language guess for an alias: 'ko' (Hangul), 'en' (Latin), 'ru'/'other' otherwise. */
export const guessLang = (text) => {
  const value = String(text ?? "");
  if (/[가-힣ㄱ-ㆎ]/.test(value)) return "ko";
  if (/[一-鿿]/.test(value)) return "zh";
  if (/[Ѐ-ӿ]/.test(value)) return "ru";
  if (/[A-Za-z]/.test(value)) return "en";
  return "other";
};

// Words that describe processing/origin but do not change what an ingredient *is*.
// They are only stripped to find a dictionary entry; the entry's rules still decide the status.
export const QUALIFIERS = [
  "정제", "국산", "국내산", "수입산", "외국산", "농축", "분말", "액상", "건조", "유기농", "무염",
  "탈지", "천연", "합성", "식용", "정백", "혼합", "가공", "냉동", "볶은", "볶음", "가루",
];

const QUALIFIER_KEYS = QUALIFIERS.map(normalizeKey).sort((a, b) => b.length - a.length);

/** The key plus variants with leading/trailing qualifiers stripped (up to two passes). */
export const keyVariants = (key) => {
  const variants = new Set([key]);
  let frontier = [key];
  for (let pass = 0; pass < 2; pass += 1) {
    const next = [];
    for (const current of frontier) {
      for (const qualifier of QUALIFIER_KEYS) {
        if (current.startsWith(qualifier) && current.length - qualifier.length >= 2) next.push(current.slice(qualifier.length));
        if (current.endsWith(qualifier) && current.length - qualifier.length >= 2) next.push(current.slice(0, -qualifier.length));
      }
    }
    for (const variant of next) variants.add(variant);
    frontier = next;
  }
  variants.delete(key);
  return [key, ...variants];
};

/** Levenshtein distance with an early-exit bound (returns bound+1 when exceeded). */
export const boundedLevenshtein = (a, b, bound) => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > bound) return bound + 1;
  const left = [...a];
  const right = [...b];
  let previous = Array.from({ length: right.length + 1 }, (_, i) => i);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > bound) return bound + 1;
    previous = current;
  }
  return previous[right.length];
};
