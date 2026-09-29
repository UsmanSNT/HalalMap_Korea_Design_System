// Public product-scanner API.
//   GET  /api/products/lookup/:barcode   barcode -> product -> ingredients -> analysis
//   POST /api/ingredients/analyze        ingredient text -> analysis (no persistence)
//   GET  /api/ocr/config                 which OCR paths are available
//   POST /api/ocr/ingredients            (optional, needs a provider key) label photo -> text
//   POST /api/product-submissions        contribute a missing product (stored as pending)
//   GET  /api/uploads/:file              approved product images (others: admin only)
//   GET  /api/data-sources               licences and attribution of every source

import { authenticate, requireAdmin } from "../lib/auth.mjs";
import { HttpError, clientIp, createRateLimiter, hashIdentifier, json, readJson } from "../lib/http.mjs";
import { createRouter } from "../lib/router.mjs";
import { analyzeIngredientText } from "./analysis.mjs";
import { analyzeStoredProduct, productView, publicAnalysis } from "./store.mjs";
import { decodeImageDataUrl, readUpload, UPLOAD_NAME, uploadUrl } from "./uploads.mjs";
import { createSubmission } from "./submissions.mjs";
import { extractIngredientSection } from "./ocr/extract.mjs";
import { ocrConfig, runServerOcr } from "./ocr/providers.mjs";

const TRUST_BY_INPUT = { typed: "user_confirmed", ocr_confirmed: "user_confirmed", confirmed: "user_confirmed", ocr: "ocr_unconfirmed" };

export const createProductRoutes = ({ db, rulesetCache, lookupService, env = process.env, fetchImpl = fetch }) => {
  const router = createRouter();
  const lookupLimit = createRateLimiter({ windowMs: 60_000, max: 40 });
  const analyzeLimit = createRateLimiter({ windowMs: 60_000, max: 60 });
  const ocrLimit = createRateLimiter({ windowMs: 60_000, max: 10 });
  const submitLimit = createRateLimiter({ windowMs: 60 * 60_000, max: 8 });
  const limited = (limiter, request) => {
    if (!limiter.check(clientIp(request))) throw new HttpError(429, "Too many requests, please try again shortly", "rate_limited");
  };

  router.get("/api/products/lookup/:barcode", async ({ request, response, url, params }) => {
    limited(lookupLimit, request);
    // Only admins can force a refresh from the external APIs.
    const wantsRefresh = url.searchParams.get("refresh") === "1";
    const refresh = wantsRefresh && Boolean(authenticate(db, request)?.user.role === "admin");
    const result = await lookupService.lookup(params.barcode, { refresh });
    if (!result.ok) throw new HttpError(400, result.message, result.error);

    const lookup = { cacheHit: result.cacheHit, tried: result.tried };
    const pendingSubmission = Boolean(db.prepare("SELECT 1 FROM product_submissions WHERE barcode = ? AND status IN ('pending','needs_review') LIMIT 1").get(result.barcode));
    const row = result.row && result.row.verification_status !== "rejected" ? result.row : null;
    if (!row) {
      return json(response, 200, {
        found: false, barcode: result.barcode, barcodeFormat: result.format, lookup, pendingSubmission,
        next: ["ingredient_photo", "contribute"],
      });
    }
    const analysis = analyzeStoredProduct(db, rulesetCache.get(), row);
    const hasIngredients = Boolean(row.ingredients_raw && row.ingredients_raw.trim());
    return json(response, 200, {
      found: true, barcode: result.barcode, barcodeFormat: result.format,
      product: productView(db, row), analysis: publicAnalysis(analysis), lookup, pendingSubmission,
      next: hasIngredients ? [] : ["ingredient_photo", "contribute"],
    });
  });

  router.post("/api/ingredients/analyze", async ({ request, response }) => {
    limited(analyzeLimit, request);
    const body = await readJson(request);
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) throw new HttpError(400, "Ingredient text is required", "empty_text");
    if (text.length > 4000) throw new HttpError(400, "Ingredient text is too long (max 4000 characters)", "text_too_long");
    const input = typeof body.input === "string" ? body.input : "typed";
    const inputTrust = TRUST_BY_INPUT[input];
    if (!inputTrust) throw new HttpError(400, "Unknown input type", "invalid_input");
    const analysis = analyzeIngredientText({ ruleset: rulesetCache.get(), text, fuzzy: true, inputTrust });
    json(response, 200, { analysis: publicAnalysis(analysis) });
  });

  router.get("/api/ocr/config", ({ response }) => {
    json(response, 200, { ...ocrConfig(env), clientOcr: true, languages: ["kor", "eng"] });
  });

  router.post("/api/ocr/ingredients", async ({ request, response }) => {
    limited(ocrLimit, request);
    if (!ocrConfig(env).serverProvider) {
      throw new HttpError(501, "No server OCR provider is configured; the app reads the photo on the device instead", "ocr_not_configured");
    }
    const body = await readJson(request, 6 * 1024 * 1024);
    const { buffer, mime } = decodeImageDataUrl(body.image);
    let ocr;
    try {
      ocr = await runServerOcr(buffer, mime, { env, fetchImpl });
    } catch (error) {
      console.error("OCR provider failed:", error.message);
      throw new HttpError(502, "The OCR provider failed", "ocr_failed");
    }
    const extracted = extractIngredientSection(ocr.text);
    const analysis = extracted.text
      ? analyzeIngredientText({ ruleset: rulesetCache.get(), text: extracted.text, fuzzy: true, inputTrust: "ocr_unconfirmed" })
      : null;
    json(response, 200, {
      provider: ocr.provider,
      confidence: ocr.confidence,
      rawText: ocr.text,
      ingredientsText: extracted.text,
      markerFound: extracted.markerFound,
      needsConfirmation: true,
      analysis: analysis ? publicAnalysis(analysis) : null,
    });
  });

  router.post("/api/product-submissions", async ({ request, response }) => {
    limited(submitLimit, request);
    const body = await readJson(request, 12 * 1024 * 1024);
    if (typeof body.website === "string" && body.website.trim()) throw new HttpError(400, "Rejected", "rejected"); // honeypot
    const auth = authenticate(db, request);
    const result = createSubmission(db, body, {
      userId: auth?.user.id ?? null,
      submitterHash: hashIdentifier(clientIp(request)),
      ruleset: rulesetCache.get(),
    });
    json(response, 201, {
      submission: { id: result.id, status: result.status, barcode: result.barcode },
      analysis: result.analysis ? publicAnalysis(result.analysis) : null,
      message: "Your contribution is pending review. It is not shown as verified data until an admin approves it.",
    });
  });

  router.get("/api/uploads/:file", ({ request, response, params }) => {
    if (!UPLOAD_NAME.test(params.file)) throw new HttpError(404, "Not found", "not_found");
    const publicImage = db.prepare("SELECT 1 FROM products WHERE image_url = ? AND verification_status != 'rejected' LIMIT 1").get(uploadUrl(params.file));
    if (!publicImage) requireAdmin(db, request);
    const file = readUpload(params.file);
    if (!file) throw new HttpError(404, "Not found", "not_found");
    response.writeHead(200, {
      "Content-Type": file.mime,
      "Content-Length": file.buffer.length,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": publicImage ? "public, max-age=86400" : "private, no-store",
    });
    response.end(file.buffer);
  });

  router.get("/api/data-sources", ({ response }) => {
    const sources = db.prepare(`
      SELECT key, name, kind, homepage_url, license, license_url, attribution, license_status, usage_status, reason, last_import_at, record_count
      FROM data_sources ORDER BY usage_status, kind, name
    `).all().map((row) => ({
      key: row.key, name: row.name, kind: row.kind, homepageUrl: row.homepage_url, license: row.license, licenseUrl: row.license_url,
      attribution: row.attribution, licenseStatus: row.license_status, usageStatus: row.usage_status, reason: row.reason,
      lastImportAt: row.last_import_at, recordCount: row.record_count,
    }));
    json(response, 200, { sources });
  });

  return (request, response, url) => router.handle(request, response, url);
};
