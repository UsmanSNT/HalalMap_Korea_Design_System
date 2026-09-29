// Open Food Facts adapter (https://world.openfoodfacts.org). ODbL database / DbCL contents / CC BY-SA images.
// Read API terms: identify the app with a custom User-Agent, stay well under the rate limit, and use the
// data dumps (scripts/import-products.mjs --off-dump) for bulk work instead of hammering the API.

import { guessLang } from "../ingredients/normalize.mjs";

export const OFF_SOURCE = "openfoodfacts";
export const OFF_LICENSE = "ODbL 1.0 (database), DbCL 1.0 (contents), CC BY-SA 3.0 (images)";
export const OFF_ATTRIBUTION = "Open Food Facts contributors (openfoodfacts.org)";

const FIELDS = [
  "code", "product_name", "product_name_ko", "product_name_en", "generic_name", "brands", "manufacturing_places",
  "categories", "quantity", "countries_tags", "image_front_url", "image_url", "ingredients_text", "ingredients_text_ko",
  "ingredients_text_en", "lang", "allergens_tags", "labels_tags", "last_modified_t",
].join(",");

export const defaultUserAgent = () =>
  process.env.OFF_USER_AGENT || "HalalMapKorea/1.0 (https://github.com/UsmanSNT/HalalMap_Korea_Design_System)";

const stripLangPrefix = (tag) => String(tag).replace(/^[a-z]{2,3}:/, "");
const firstNonBlank = (...values) => values.map((v) => (typeof v === "string" ? v.trim() : "")).find(Boolean) ?? null;

/** Halal-related label tags -> an UNVERIFIED claim (never a verified certification). */
const halalClaims = (labelsTags = []) => {
  const claims = [];
  for (const tag of labelsTags) {
    const name = stripLangPrefix(tag).toLowerCase();
    if (name === "halal") claims.push({ organization: "Halal label on packaging (unverified claim)", note: "Open Food Facts label tag en:halal" });
    else if (name.includes("halal") && name !== "halal") claims.push({ organization: `Halal label: ${name} (unverified claim)`, note: `Open Food Facts label tag ${tag}` });
  }
  return claims;
};

/** Normalises an OFF v2 `product` object. Pure function — unit tested with fixtures. */
export const normalizeOffProduct = (product, { barcode, retrievedAt = new Date().toISOString() } = {}) => {
  const code = String(product.code ?? barcode ?? "");
  const ko = firstNonBlank(product.ingredients_text_ko);
  const en = firstNonBlank(product.ingredients_text_en);
  const primary = firstNonBlank(product.ingredients_text);
  let ingredientsText = ko ?? primary ?? en;
  let ingredientsLang = null;
  if (ingredientsText) {
    if (ingredientsText === ko) ingredientsLang = "ko";
    else if (ingredientsText === en && !primary) ingredientsLang = "en";
    else ingredientsLang = product.lang && /^[a-z]{2}$/.test(product.lang) ? product.lang : guessLang(ingredientsText);
  }
  const name = firstNonBlank(product.product_name_ko, product.product_name, product.product_name_en, product.generic_name);
  const brand = firstNonBlank(String(product.brands ?? "").split(",")[0]);
  const category = firstNonBlank(String(product.categories ?? "").split(",").map((c) => stripLangPrefix(c.trim())).filter(Boolean).slice(-1)[0]);

  return {
    source: OFF_SOURCE,
    sourceId: code,
    sourceUrl: `https://world.openfoodfacts.org/product/${code}`,
    license: OFF_LICENSE,
    attribution: OFF_ATTRIBUTION,
    retrievedAt,
    barcode: code,
    name,
    nameKo: firstNonBlank(product.product_name_ko) ?? (name && guessLang(name) === "ko" ? name : null),
    nameEn: firstNonBlank(product.product_name_en) ?? (name && guessLang(name) === "en" ? name : null),
    brand,
    manufacturer: firstNonBlank(product.manufacturing_places),
    category,
    quantity: firstNonBlank(product.quantity),
    countries: (product.countries_tags ?? []).map(stripLangPrefix),
    imageUrl: firstNonBlank(product.image_front_url, product.image_url),
    ingredientsText,
    ingredientsLang,
    allergens: (product.allergens_tags ?? []).map(stripLangPrefix),
    certificationClaims: halalClaims(product.labels_tags),
    payload: { lastModified: product.last_modified_t ?? null, labels: product.labels_tags ?? [] },
  };
};

/**
 * @returns {Promise<{outcome: 'found'|'not_found'|'error', product?: object, detail?: string}>}
 */
export const fetchOffProduct = async (barcode, { fetchImpl = fetch, baseUrl = process.env.OFF_BASE_URL || "https://world.openfoodfacts.org", timeoutMs = 6000 } = {}) => {
  const url = `${baseUrl}/api/v2/product/${encodeURIComponent(barcode)}?fields=${FIELDS}`;
  try {
    const response = await fetchImpl(url, {
      headers: { "User-Agent": defaultUserAgent(), Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.status === 404) return { outcome: "not_found" };
    if (response.status === 429) return { outcome: "error", detail: "rate_limited" };
    if (!response.ok) return { outcome: "error", detail: `http_${response.status}` };
    const body = await response.json();
    if (body.status === 0 || !body.product) return { outcome: "not_found" };
    return { outcome: "found", product: normalizeOffProduct(body.product, { barcode }) };
  } catch (error) {
    return { outcome: "error", detail: error?.name === "TimeoutError" ? "timeout" : String(error?.message ?? error).slice(0, 120) };
  }
};
