// Optional server-side OCR providers for label photos. The default path needs no key: the browser reads the
// photo with Tesseract.js (Korean + English, bundled locally) and only sends TEXT to the server.
// Providers here exist for better accuracy when an operator provides credentials:
//   GOOGLE_VISION_API_KEY                    Google Cloud Vision (DOCUMENT_TEXT_DETECTION)
//   CLOVA_OCR_INVOKE_URL + CLOVA_OCR_SECRET  NAVER CLOVA OCR (General)
// OCR output is always treated as UNCONFIRMED text by the analysis engine.

import { randomUUID } from "node:crypto";

export const ocrConfig = (env = process.env) => {
  if (env.GOOGLE_VISION_API_KEY) return { serverProvider: "google-vision" };
  if (env.CLOVA_OCR_INVOKE_URL && env.CLOVA_OCR_SECRET) return { serverProvider: "clova" };
  return { serverProvider: null };
};

const mean = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

/** Google Cloud Vision REST: images:annotate. */
export const googleVisionOcr = async (imageBuffer, { env = process.env, fetchImpl = fetch, timeoutMs = 15000 } = {}) => {
  const response = await fetchImpl(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(env.GOOGLE_VISION_API_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{
        image: { content: imageBuffer.toString("base64") },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        imageContext: { languageHints: ["ko", "en"] },
      }],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`google_vision_http_${response.status}`);
  const body = await response.json();
  const first = body.responses?.[0];
  if (first?.error) throw new Error(`google_vision_${first.error.code ?? "error"}`);
  const blocks = (first?.fullTextAnnotation?.pages ?? []).flatMap((page) => page.blocks ?? []);
  return { provider: "google-vision", text: first?.fullTextAnnotation?.text ?? "", confidence: mean(blocks.map((b) => b.confidence).filter(Number.isFinite)) };
};

/** NAVER CLOVA OCR (General). Response: images[0].fields[] = { inferText, inferConfidence, lineBreak }. */
export const clovaOcr = async (imageBuffer, { mime = "image/jpeg", env = process.env, fetchImpl = fetch, timeoutMs = 20000 } = {}) => {
  const response = await fetchImpl(env.CLOVA_OCR_INVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-OCR-SECRET": env.CLOVA_OCR_SECRET },
    body: JSON.stringify({
      version: "V2",
      requestId: randomUUID(),
      timestamp: Date.now(),
      lang: "ko",
      images: [{ format: mime === "image/png" ? "png" : "jpg", name: "label", data: imageBuffer.toString("base64") }],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`clova_http_${response.status}`);
  const body = await response.json();
  const fields = body.images?.[0]?.fields ?? [];
  let text = "";
  for (const field of fields) text += field.inferText + (field.lineBreak ? "\n" : " ");
  return { provider: "clova", text: text.trim(), confidence: mean(fields.map((f) => f.inferConfidence).filter(Number.isFinite)) };
};

export const runServerOcr = async (imageBuffer, mime, { env = process.env, fetchImpl = fetch } = {}) => {
  const { serverProvider } = ocrConfig(env);
  if (serverProvider === "google-vision") return googleVisionOcr(imageBuffer, { env, fetchImpl });
  if (serverProvider === "clova") return clovaOcr(imageBuffer, { mime, env, fetchImpl });
  return null;
};
