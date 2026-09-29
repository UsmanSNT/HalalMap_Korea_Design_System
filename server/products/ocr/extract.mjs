// Turns raw OCR output of a food label into the ingredient section only.
// OCR text is untrusted: this file only *isolates* the 원재료명 part; it never decides anything about halal status.

const START_MARKERS = /(원\s*재\s*료\s*명|원\s*재\s*료|재\s*료\s*명|ingredients?|composition|ингредиенты|tarkibi)\s*[:：]?/i;
const END_MARKERS = /(영\s*양\s*(?:정\s*보|성\s*분)|nutrition\s*facts?|nutritional|알\s*레\s*르\s*기|알\s*러\s*지|allergen|보\s*관\s*방\s*법|보관\s*시|주\s*의\s*사\s*항|제\s*조\s*원|판\s*매\s*원|유\s*통\s*기\s*한|소\s*비\s*기\s*한|품\s*목\s*보\s*고|내\s*용\s*량|식\s*품\s*유\s*형|반\s*품|고\s*객\s*상\s*담|이\s*제품은|contains\s*:|storage|best\s*before)/i;

/**
 * @returns {{text: string, markerFound: boolean, lines: number}}
 */
export const extractIngredientSection = (rawText) => {
  const normalized = String(rawText ?? "")
    .normalize("NFKC")
    .replace(/[​-‍﻿]/g, "")
    .replace(/\r\n?/g, "\n");

  const start = START_MARKERS.exec(normalized);
  let section = normalized;
  let markerFound = false;
  if (start) {
    markerFound = true;
    section = normalized.slice(start.index + start[0].length);
    // Labels often repeat "원재료명" for each variant; keep the first block.
    const end = END_MARKERS.exec(section);
    if (end) section = section.slice(0, end.index);
  }

  // Hard-wrapped label lines: join lines, but keep a break when a line ends with a comma-less full stop.
  const joined = section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+\)/g, ")")
    .replace(/\(\s+/g, "(")
    .trim();

  return { text: joined, markerFound, lines: section.split("\n").filter((line) => line.trim()).length };
};
