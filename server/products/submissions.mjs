// User contributions: a product that is missing (or lacks ingredients) can be submitted with photos/text.
// A submission is NEVER verified data on arrival: it starts as `pending` and an admin decides.

import { nowIso, transaction } from "../db.mjs";
import { HttpError } from "../lib/http.mjs";
import { normalizeBarcode } from "./barcode.mjs";
import { saveImage, uploadUrl } from "./uploads.mjs";
import { getProductByBarcode, upsertProduct } from "./store.mjs";
import { analyzeIngredientText, rebuildProductIngredients } from "./analysis.mjs";
import { guessLang } from "./ingredients/normalize.mjs";

export const SUBMISSION_STATUSES = ["pending", "verified", "rejected", "needs_review"];
const limit = (value, max, field) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new HttpError(400, `${field} must be text`, "invalid_field");
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length > max) throw new HttpError(400, `${field} is too long (max ${max})`, "invalid_field");
  return trimmed || null;
};
const multiline = (value, max, field) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new HttpError(400, `${field} must be text`, "invalid_field");
  const trimmed = value.replace(/\r\n/g, "\n").trim();
  if (trimmed.length > max) throw new HttpError(400, `${field} is too long (max ${max})`, "invalid_field");
  return trimmed || null;
};

export const createSubmission = (db, body, { userId = null, submitterHash = null, ruleset }) => {
  const barcode = normalizeBarcode(String(body.barcode ?? ""));
  if (!barcode.ok) throw new HttpError(400, barcode.message, barcode.error);

  const name = limit(body.name, 120, "name");
  const nameKo = limit(body.nameKo, 120, "nameKo");
  const brand = limit(body.brand, 80, "brand");
  const manufacturer = limit(body.manufacturer, 80, "manufacturer");
  const category = limit(body.category, 80, "category");
  const note = multiline(body.note, 500, "note");
  const ingredientsText = multiline(body.ingredientsText, 4000, "ingredientsText");
  const ingredientsInput = ["typed", "ocr", "ocr_edited"].includes(body.ingredientsInput) ? body.ingredientsInput : "typed";
  const ocrConfidence = Number.isFinite(body.ocrConfidence) ? Math.min(1, Math.max(0, body.ocrConfidence)) : null;

  const productImage = body.productImage ? saveImage(body.productImage, "product") : null;
  const ingredientsImage = body.ingredientsImage ? saveImage(body.ingredientsImage, "ingredients") : null;

  if (!name && !nameKo && !ingredientsText && !productImage && !ingredientsImage) {
    throw new HttpError(400, "Provide at least a product name, ingredient text or a photo", "empty_submission");
  }

  const id = Number(
    db.prepare(`
      INSERT INTO product_submissions (barcode, name, name_ko, brand, manufacturer, category, ingredients_text, ingredients_input,
        ocr_confidence, product_image, ingredients_image, note, submitter_user_id, submitter_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(barcode.code, name, nameKo, brand, manufacturer, category, ingredientsText, ingredientsInput, ocrConfidence,
      productImage, ingredientsImage, note, userId, submitterHash).lastInsertRowid,
  );

  // A provisional analysis is returned to the contributor only; it is capped because the text is unverified.
  const analysis = ingredientsText
    ? analyzeIngredientText({ ruleset, text: ingredientsText, fuzzy: true, inputTrust: ingredientsInput === "ocr" ? "ocr_unconfirmed" : "typed_unconfirmed" })
    : null;
  return { id, status: "pending", barcode: barcode.code, analysis };
};

const submissionView = (row) => ({
  id: row.id,
  barcode: row.barcode,
  name: row.name,
  nameKo: row.name_ko,
  brand: row.brand,
  manufacturer: row.manufacturer,
  category: row.category,
  ingredientsText: row.ingredients_text,
  ingredientsInput: row.ingredients_input,
  ocrConfidence: row.ocr_confidence,
  productImageUrl: uploadUrl(row.product_image),
  ingredientsImageUrl: uploadUrl(row.ingredients_image),
  note: row.note,
  status: row.status,
  reviewerId: row.reviewer_id,
  reviewedAt: row.reviewed_at,
  reviewNote: row.review_note,
  resultingProductId: row.resulting_product_id,
  createdAt: row.created_at,
});

export const listSubmissions = (db, { status, page = 1, perPage = 20 }) => {
  const where = status && SUBMISSION_STATUSES.includes(status) ? "WHERE status = ?" : "";
  const args = where ? [status] : [];
  const total = db.prepare(`SELECT COUNT(*) AS n FROM product_submissions ${where}`).get(...args).n;
  const rows = db.prepare(`SELECT * FROM product_submissions ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...args, perPage, (page - 1) * perPage);
  return { total, page, perPage, submissions: rows.map(submissionView) };
};

export const getSubmission = (db, id) => {
  const row = db.prepare("SELECT * FROM product_submissions WHERE id = ?").get(id);
  return row ? submissionView(row) : null;
};

/**
 * Admin decision. `edits` lets the reviewer correct any field before approving.
 * Approving creates (or updates) the product as VERIFIED with the submission recorded as its source.
 */
export const reviewSubmission = (db, id, { action, note = null, edits = {}, reviewerId = null }, { ruleset }) => {
  const row = db.prepare("SELECT * FROM product_submissions WHERE id = ?").get(id);
  if (!row) throw new HttpError(404, "Submission not found", "not_found");
  const statusByAction = { approve: "verified", reject: "rejected", needs_review: "needs_review", reopen: "pending" };
  const status = statusByAction[action];
  if (!status) throw new HttpError(400, "Unknown review action", "invalid_action");

  return transaction(db, () => {
    let productId = row.resulting_product_id;
    if (action === "approve") {
      const pick = (key, column) => (edits[key] !== undefined ? edits[key] : row[column]);
      const name = pick("name", "name") || pick("nameKo", "name_ko");
      const ingredientsText = pick("ingredientsText", "ingredients_text");
      if (!name && !ingredientsText) throw new HttpError(400, "A verified product needs a name or an ingredient list", "empty_submission");
      const now = nowIso();
      const existing = getProductByBarcode(db, row.barcode);
      const merged = upsertProduct(db, {
        source: "user_submission",
        sourceId: String(row.id),
        sourceUrl: null,
        license: "Contributor submission (reviewed by an admin)",
        attribution: "HalalMap contributors",
        retrievedAt: now,
        barcode: row.barcode,
        name,
        nameKo: pick("nameKo", "name_ko") ?? (name && guessLang(name) === "ko" ? name : null),
        brand: pick("brand", "brand"),
        manufacturer: pick("manufacturer", "manufacturer"),
        category: pick("category", "category"),
        countries: [],
        imageUrl: uploadUrl(row.product_image),
        ingredientsText,
        ingredientsLang: ingredientsText ? guessLang(ingredientsText) : null,
        ingredientsTrust: "admin_verified",
        dataOrigin: "submission",
        verificationStatus: "verified",
        lastVerifiedAt: now,
        payload: { submissionId: row.id, ingredientsInput: row.ingredients_input, ocrConfidence: row.ocr_confidence },
      }, { ruleset });
      productId = merged.id;

      // An admin decision outranks any imported value for the fields the reviewer provided.
      const fields = [];
      const values = [];
      const set = (column, value) => {
        if (value !== null && value !== undefined && String(value).trim() !== "") {
          fields.push(`${column} = ?`);
          values.push(value);
        }
      };
      set("name", name);
      set("name_ko", pick("nameKo", "name_ko"));
      set("brand", pick("brand", "brand"));
      set("manufacturer", pick("manufacturer", "manufacturer"));
      set("category", pick("category", "category"));
      if (ingredientsText) {
        set("ingredients_raw", ingredientsText);
        set("ingredients_lang", guessLang(ingredientsText));
        set("ingredients_source", "user_submission");
        set("ingredients_trust", "admin_verified");
      }
      if (row.product_image && (!existing || !existing.image_url)) set("image_url", uploadUrl(row.product_image));
      db.prepare(`UPDATE products SET ${[...fields, "verification_status = 'verified'", "last_verified_at = ?", "updated_at = ?"].join(", ")} WHERE id = ?`)
        .run(...values, now, now, productId);
      db.prepare("UPDATE product_submissions SET ingredients_text = COALESCE(?, ingredients_text) WHERE id = ?").run(ingredientsText, id);
      rebuildProductIngredients(db, productId, ruleset);
    }
    db.prepare(`
      UPDATE product_submissions SET status = ?, reviewer_id = ?, reviewed_at = ?, review_note = ?, resulting_product_id = ?, updated_at = ?
      WHERE id = ?
    `).run(status, reviewerId, nowIso(), note, productId, nowIso(), id);
    return getSubmission(db, id);
  });
};
