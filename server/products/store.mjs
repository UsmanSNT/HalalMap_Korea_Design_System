// Persistence for products, their sources, certifications and public API views.

import { transaction, nowIso } from "../db.mjs";
import { parseJsonColumn } from "../lib/http.mjs";
import { rebuildProductIngredients, analyzeIngredientText, loadOverrides } from "./analysis.mjs";

// Higher wins when two sources disagree about a plain field (name, brand, image …).
const SOURCE_RANK = { admin: 100, user_submission: 90, mfds_foodsafetykorea: 80, openfoodfacts: 50 };
const TRUST_RANK = { admin_verified: 100, official: 80, user_submitted: 70, community: 50 };

export const rankOf = (source) => SOURCE_RANK[source] ?? 10;
export const trustRank = (trust) => TRUST_RANK[trust] ?? 0;

export const getProductByBarcode = (db, code) => db.prepare("SELECT * FROM products WHERE barcode = ?").get(code) ?? null;
export const getProductById = (db, id) => db.prepare("SELECT * FROM products WHERE id = ?").get(id) ?? null;

const blank = (value) => value === null || value === undefined || String(value).trim() === "";

/**
 * Inserts or merges a normalised provider/submission record.
 * A product an admin verified is only ever *filled in* (blank fields), never overwritten by an import.
 * @returns {{id: number, created: boolean}}
 */
export const upsertProduct = (db, incoming, { ruleset }) => {
  const retrievedAt = incoming.retrievedAt ?? nowIso();
  return transaction(db, () => {
    const existing = getProductByBarcode(db, incoming.barcode);
    let id;
    let created = false;

    const ingredientsTrust = incoming.ingredientsTrust ?? (incoming.source === "openfoodfacts" ? "community" : incoming.source === "mfds_foodsafetykorea" ? "official" : null);

    if (!existing) {
      created = true;
      id = Number(
        db.prepare(`
          INSERT INTO products (barcode, barcode_format, name, name_ko, name_en, brand, manufacturer, category, quantity, countries,
            image_url, ingredients_raw, ingredients_lang, ingredients_source, ingredients_trust, allergens, data_origin, verification_status,
            source, source_id, source_url, license, attribution, retrieved_at, last_verified_at, last_checked_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          incoming.barcode, incoming.barcodeFormat ?? null, incoming.name || incoming.nameKo || incoming.nameEn || incoming.barcode,
          incoming.nameKo ?? null, incoming.nameEn ?? null, incoming.brand ?? null, incoming.manufacturer ?? null, incoming.category ?? null,
          incoming.quantity ?? null, JSON.stringify(incoming.countries ?? []), incoming.imageUrl ?? null,
          incoming.ingredientsText ?? null, incoming.ingredientsLang ?? null, incoming.ingredientsText ? incoming.source : null,
          incoming.ingredientsText ? ingredientsTrust : null, JSON.stringify(incoming.allergens ?? []),
          incoming.dataOrigin ?? "imported", incoming.verificationStatus ?? "unverified",
          incoming.source, incoming.sourceId ?? null, incoming.sourceUrl ?? null, incoming.license ?? null, incoming.attribution ?? null,
          retrievedAt, incoming.lastVerifiedAt ?? null, retrievedAt,
        ).lastInsertRowid,
      );
    } else {
      id = existing.id;
      const protectedRecord = existing.verification_status === "verified";
      const incomingWins = !protectedRecord && rankOf(incoming.source) >= rankOf(existing.source);
      const pick = (current, next) => (blank(next) ? current : blank(current) || incomingWins ? next : current);

      const ingredientsWin =
        !blank(incoming.ingredientsText) &&
        (blank(existing.ingredients_raw) || (!protectedRecord && trustRank(ingredientsTrust) > trustRank(existing.ingredients_trust)));

      db.prepare(`
        UPDATE products SET name = ?, name_ko = ?, name_en = ?, brand = ?, manufacturer = ?, category = ?, quantity = ?, countries = ?,
          image_url = ?, ingredients_raw = ?, ingredients_lang = ?, ingredients_source = ?, ingredients_trust = ?, allergens = ?,
          last_checked_at = ?, updated_at = ?
        WHERE id = ?
      `).run(
        pick(existing.name, incoming.name), pick(existing.name_ko, incoming.nameKo), pick(existing.name_en, incoming.nameEn),
        pick(existing.brand, incoming.brand), pick(existing.manufacturer, incoming.manufacturer), pick(existing.category, incoming.category),
        pick(existing.quantity, incoming.quantity),
        incoming.countries?.length && parseJsonColumn(existing.countries).length === 0 ? JSON.stringify(incoming.countries) : existing.countries,
        pick(existing.image_url, incoming.imageUrl),
        ingredientsWin ? incoming.ingredientsText : existing.ingredients_raw,
        ingredientsWin ? incoming.ingredientsLang ?? null : existing.ingredients_lang,
        ingredientsWin ? incoming.source : existing.ingredients_source,
        ingredientsWin ? ingredientsTrust : existing.ingredients_trust,
        incoming.allergens?.length && (blank(existing.allergens) || existing.allergens === "[]" || incomingWins) ? JSON.stringify(incoming.allergens) : existing.allergens,
        retrievedAt, nowIso(), id,
      );
    }

    db.prepare(`
      INSERT INTO product_sources (product_id, source, source_id, source_url, license, attribution, retrieved_at, payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (product_id, source) DO UPDATE SET source_id = excluded.source_id, source_url = excluded.source_url,
        license = excluded.license, attribution = excluded.attribution, retrieved_at = excluded.retrieved_at, payload = excluded.payload
    `).run(id, incoming.source, incoming.sourceId ?? null, incoming.sourceUrl ?? null, incoming.license ?? null, incoming.attribution ?? null,
      retrievedAt, JSON.stringify(incoming.payload ?? {}));

    for (const claim of incoming.certificationClaims ?? []) upsertCertificationClaim(db, id, claim, incoming, retrievedAt);

    rebuildProductIngredients(db, id, ruleset);
    return { id, created };
  });
};

/** A label claim (e.g. Open Food Facts "en:halal") is stored as an UNVERIFIED certification — it never yields HALAL_CERTIFIED. */
const upsertCertificationClaim = (db, productId, claim, incoming, retrievedAt) => {
  const existing = db.prepare("SELECT id FROM halal_certifications WHERE product_id = ? AND source = ? AND organization = ?")
    .get(productId, incoming.source, claim.organization);
  if (existing) return;
  db.prepare(`
    INSERT INTO halal_certifications (product_id, organization, certificate_no, status, verification_status, source, source_url, license, retrieved_at, note)
    VALUES (?, ?, NULL, 'valid', 'unverified', ?, ?, ?, ?, ?)
  `).run(productId, claim.organization, incoming.source, incoming.sourceUrl ?? null, incoming.license ?? null, retrievedAt, claim.note ?? null);
};

export const listCertifications = (db, productId) =>
  db.prepare("SELECT * FROM halal_certifications WHERE product_id = ? ORDER BY id").all(productId);

export const listSources = (db, productId) =>
  db.prepare("SELECT source, source_id, source_url, license, attribution, retrieved_at FROM product_sources WHERE product_id = ? ORDER BY retrieved_at DESC").all(productId);

/** Public JSON view of a product row. */
export const productView = (db, row) => ({
  id: row.id,
  barcode: row.barcode,
  barcodeFormat: row.barcode_format,
  name: row.name,
  nameKo: row.name_ko,
  nameEn: row.name_en,
  brand: row.brand,
  manufacturer: row.manufacturer,
  category: row.category,
  quantity: row.quantity,
  countries: parseJsonColumn(row.countries),
  imageUrl: row.image_url,
  ingredientsRaw: row.ingredients_raw,
  ingredientsLang: row.ingredients_lang,
  ingredientsSource: row.ingredients_source,
  ingredientsTrust: row.ingredients_trust,
  allergens: parseJsonColumn(row.allergens),
  dataOrigin: row.data_origin,
  verificationStatus: row.verification_status,
  provenance: {
    source: row.source,
    sourceId: row.source_id,
    sourceUrl: row.source_url,
    license: row.license,
    attribution: row.attribution,
    retrievedAt: row.retrieved_at,
    lastVerifiedAt: row.last_verified_at,
    lastCheckedAt: row.last_checked_at,
    sources: listSources(db, row.id),
  },
});

/** Deterministic analysis for a stored product (uses its certifications, admin overrides and data trust). */
export const analyzeStoredProduct = (db, ruleset, row) => {
  const warnings = [];
  if (row.ingredients_trust === "community") warnings.push("COMMUNITY_DATA");
  if (row.verification_status !== "verified") warnings.push("UNVERIFIED_PRODUCT_DATA");
  if (row.ingredients_trust === "user_submitted") warnings.push("USER_SUBMITTED");
  return analyzeIngredientText({
    ruleset,
    text: row.ingredients_raw ?? "",
    inputTrust: "verified_source",
    certifications: listCertifications(db, row.id),
    dataWarnings: warnings,
    overrides: loadOverrides(db, row.id),
  });
};

/** Strips the internal parse tree before sending an analysis to clients. */
export const publicAnalysis = ({ nodes, ...analysis }) => analysis;
