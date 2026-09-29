// Ingredient-label OCR in the browser (Tesseract.js, Korean + English). Worker, WASM core and language data are
// served from this app (`ocr-assets/`, see vite.config.ts) so nothing is fetched from a third-party CDN.
// OCR output is ALWAYS treated as unconfirmed text: the analysis engine refuses to clear a product from it.

import { imageForOcr } from "./imageUtils";

export type OcrResult = { text: string; confidence: number | null; provider: "tesseract" };

const assetBase = () => `${window.location.origin}${import.meta.env.BASE_URL}ocr-assets`;

let workerPromise: Promise<import("tesseract.js").Worker> | null = null;
let progressListener: ((progress: number, status: string) => void) | null = null;

const getWorker = () => {
  workerPromise ??= (async () => {
    const { createWorker, OEM } = await import("tesseract.js");
    const base = assetBase();
    return createWorker(["kor", "eng"], OEM.LSTM_ONLY, {
      workerPath: `${base}/worker.min.js`,
      corePath: `${base}/core`,
      langPath: `${base}/lang`,
      workerBlobURL: false,
      logger: (message) => progressListener?.(message.progress ?? 0, message.status ?? ""),
    });
  })().catch((error) => {
    workerPromise = null;
    throw error;
  });
  return workerPromise;
};

export const recognizeLabel = async (file: Blob, onProgress?: (progress: number, status: string) => void): Promise<OcrResult> => {
  progressListener = onProgress ?? null;
  try {
    const worker = await getWorker();
    const canvas = await imageForOcr(file);
    const { data } = await worker.recognize(canvas);
    return { text: data.text.trim(), confidence: Number.isFinite(data.confidence) ? data.confidence / 100 : null, provider: "tesseract" };
  } finally {
    progressListener = null;
  }
};

export const disposeOcr = async () => {
  const pending = workerPromise;
  workerPromise = null;
  if (pending) await (await pending).terminate().catch(() => undefined);
};

/** Mirrors server/products/ocr/extract.mjs so the on-device path yields the same 원재료명 block. */
const START = /(원\s*재\s*료\s*명|원\s*재\s*료|재\s*료\s*명|ingredients?|composition)\s*[:：]?/i;
const END = /(영\s*양\s*(?:정\s*보|성\s*분)|nutrition\s*facts?|알\s*레\s*르\s*기|알\s*러\s*지|allergen|보\s*관\s*방\s*법|주\s*의\s*사\s*항|제\s*조\s*원|판\s*매\s*원|유\s*통\s*기\s*한|소\s*비\s*기\s*한|품\s*목\s*보\s*고|내\s*용\s*량|식\s*품\s*유\s*형|이\s*제품은|contains\s*:|storage|best\s*before)/i;

export const extractIngredientSection = (raw: string): { text: string; markerFound: boolean } => {
  const normalized = raw.normalize("NFKC").replace(/[​-‍﻿]/g, "").replace(/\r\n?/g, "\n");
  const start = START.exec(normalized);
  let section = normalized;
  if (start) {
    section = normalized.slice(start.index + start[0].length);
    const end = END.exec(section);
    if (end) section = section.slice(0, end.index);
  }
  // Tesseract inserts spaces between Hangul syllables of small print ("젤 라 틴"): collapse single-syllable runs.
  const text = section
    .split("\n").map((line) => line.trim()).filter(Boolean).join(" ")
    .replace(/(?<=[가-힣]) (?=[가-힣](?:\s|,|\)|$))/g, "")
    .replace(/\s{2,}/g, " ").replace(/\s*,\s*/g, ", ").replace(/\s+\)/g, ")").replace(/\(\s+/g, "(").trim();
  return { text, markerFound: Boolean(start) };
};
