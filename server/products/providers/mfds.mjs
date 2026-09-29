// Food Safety Korea (식품안전나라) Open API adapter — Ministry of Food and Drug Safety (MFDS).
//   C005  바코드연계제품정보        barcode (BAR_CD) -> product name, manufacturer, report no., food type
//   C002  식품(첨가물)품목제조보고   report no. (PRDLST_REPORT_NO) -> RAWMTRL_NM (원재료)
// Requires a free key (FOODSAFETYKOREA_API_KEY). Field names follow the published API guide; they could not be
// verified against the live service from the sandbox this was written in, so every field is read defensively and
// `pnpm mfds:probe` prints the real response shape.

export const MFDS_SOURCE = "mfds_foodsafetykorea";
export const MFDS_LICENSE = "Korean government public data (공공누리/KOGL) — see 식품안전나라 Open API terms";
export const MFDS_ATTRIBUTION = "식품의약품안전처 (MFDS) / 식품안전나라";

export const isMfdsConfigured = (env = process.env) => Boolean(env.FOODSAFETYKOREA_API_KEY);

/** The licence is unconfirmed, so the operator must acknowledge the terms explicitly (see docs/data-sources.md). */
export const isMfdsTermsAccepted = (env = process.env) => env.FOODSAFETYKOREA_ACCEPT_TERMS === "1";

const baseUrl = (env) => (env.FOODSAFETYKOREA_BASE_URL || "https://openapi.foodsafetykorea.go.kr/api").replace(/\/$/, "");

const text = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);

/** Unwraps `{ C005: { total_count, row: [...], RESULT: { CODE, MSG } } }`; also handles a bare `{ RESULT }` error envelope. */
export const parseMfdsEnvelope = (body, service) => {
  const wrapper = body?.[service] ?? body;
  const result = wrapper?.RESULT ?? body?.RESULT ?? null;
  const code = result?.CODE ?? null;
  if (code === "INFO-000") return { outcome: "found", rows: Array.isArray(wrapper.row) ? wrapper.row : [] };
  if (code === "INFO-200") return { outcome: "not_found", rows: [] };
  if (code === "INFO-100" || code === "INFO-300" || code === "ERROR-300") return { outcome: "error", detail: `auth_${code}`, rows: [] };
  if (code) return { outcome: "error", detail: String(code), rows: [] };
  if (Array.isArray(wrapper?.row)) return { outcome: wrapper.row.length ? "found" : "not_found", rows: wrapper.row };
  return { outcome: "error", detail: "unexpected_response", rows: [] };
};

/** Maps a C005 row (+ optional C002 raw materials) to the normalised product shape. Pure — unit tested. */
export const normalizeMfdsProduct = (row, { barcode, rawMaterials = null, retrievedAt = new Date().toISOString() }) => {
  const name = text(row.PRDLST_NM);
  return {
    source: MFDS_SOURCE,
    sourceId: text(row.PRDLST_REPORT_NO) ?? barcode,
    sourceUrl: "https://www.foodsafetykorea.go.kr/portal/healthyfoodlife/searchHomeHF.do",
    license: MFDS_LICENSE,
    attribution: MFDS_ATTRIBUTION,
    retrievedAt,
    barcode,
    name,
    nameKo: name,
    nameEn: null,
    brand: null,
    manufacturer: text(row.CMPNY_NM) ?? text(row.BSSH_NM),
    category: text(row.PRDLST_DCNM),
    quantity: null,
    countries: ["south-korea"],
    imageUrl: null,
    ingredientsText: text(rawMaterials),
    ingredientsLang: rawMaterials ? "ko" : null,
    allergens: [],
    certificationClaims: [],
    payload: {
      reportNo: text(row.PRDLST_REPORT_NO),
      approvedOn: text(row.PRMS_DT),
      shelfLife: text(row.POG_DAYCNT),
      foodType: text(row.PRDLST_DCNM),
      lastUpdated: text(row.LAST_UPDT_DTM),
    },
  };
};

const callService = async (service, params, { fetchImpl, env, timeoutMs }) => {
  const key = env.FOODSAFETYKOREA_API_KEY;
  const query = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  // The key travels in the URL path (that is how the portal defines the API); never log this URL.
  const url = `${baseUrl(env)}/${encodeURIComponent(key)}/${service}/json/1/5/${query}`;
  try {
    const response = await fetchImpl(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return { outcome: "error", detail: `http_${response.status}`, rows: [] };
    const body = await response.json();
    return parseMfdsEnvelope(body, service);
  } catch (error) {
    return { outcome: "error", detail: error?.name === "TimeoutError" ? "timeout" : "network_error", rows: [] };
  }
};

/**
 * Barcode -> product (C005), then raw materials by report number (C002).
 * @returns {Promise<{outcome: 'found'|'not_found'|'error', product?: object, detail?: string}>}
 */
export const fetchMfdsProduct = async (barcode, { fetchImpl = fetch, env = process.env, timeoutMs = 6000 } = {}) => {
  const barcodeResult = await callService("C005", { BAR_CD: barcode }, { fetchImpl, env, timeoutMs });
  if (barcodeResult.outcome !== "found") return { outcome: barcodeResult.outcome, detail: barcodeResult.detail };
  const row = barcodeResult.rows[0];
  if (!row) return { outcome: "not_found" };

  let rawMaterials = null;
  const reportNo = text(row.PRDLST_REPORT_NO);
  if (reportNo) {
    const materials = await callService("C002", { PRDLST_REPORT_NO: reportNo }, { fetchImpl, env, timeoutMs });
    if (materials.outcome === "found") rawMaterials = text(materials.rows[0]?.RAWMTRL_NM);
  }
  return { outcome: "found", product: normalizeMfdsProduct(row, { barcode, rawMaterials }) };
};
