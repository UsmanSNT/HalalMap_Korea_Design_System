import { apiClient, getToken } from "@/services/apiClient";
import type { Analysis, ProductStatus } from "./products";

// Thin typed wrappers over /api/admin/* (Bearer token, role=admin). Types only cover the fields the console uses.

const get = <T>(path: string) => apiClient<T>(path);
const send = <T>(method: "POST" | "PATCH" | "DELETE", path: string, body?: unknown) =>
  apiClient<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

export type Verification = "unverified" | "verified" | "needs_review" | "rejected";
export type Paged<K extends string, T> = { total: number; page: number; perPage: number } & { [key in K]: T[] };

export type AdminProduct = {
  id: number; barcode: string; name: string; nameKo: string | null; nameEn: string | null; brand: string | null; manufacturer: string | null;
  category: string | null; quantity: string | null; imageUrl: string | null; ingredientsRaw: string | null; ingredientsSource: string | null;
  ingredientsTrust: string | null; dataOrigin: string; verificationStatus: Verification;
  provenance: { source: string; sourceUrl: string | null; license: string | null; retrievedAt: string | null; lastVerifiedAt: string | null; lastCheckedAt: string | null; sources: { source: string; source_url: string | null; license: string | null; retrieved_at: string }[] };
  analysisStatus?: ProductStatus; certificationState?: string;
};
export type AdminProductDetail = {
  product: AdminProduct; analysis: Analysis; adminNote: string | null;
  ingredients: { id: number; position: number; parent_position: number | null; raw_text: string; normalized_text: string; match_type: string; confidence: number | null; ingredient_key: string | null; canonical_name: string | null; analysis_status: string | null }[];
  overrides: { normalized_text: string; ingredient_key: string | null; canonical_name: string | null }[];
  certifications: AdminCertification[];
};
export type AdminCertification = {
  id: number; productId?: number; product_id?: number; barcode?: string; productName?: string; organization: string; certificateNo?: string | null; certificate_no?: string | null;
  status: string; validFrom?: string | null; validUntil?: string | null; valid_until?: string | null; verificationStatus?: Verification; verification_status?: Verification;
  verificationUrl?: string | null; verification_url?: string | null; verifiedAt?: string | null; verifiedBy?: string | null; source?: string; note?: string | null;
};
export type AdminIngredient = {
  id: number; key: string; canonicalName: string; nameKo: string | null; nameEn: string | null; category: string; isClass: boolean; mfdsCode: string | null;
  source: string; analysisStatus: string; analysisRuleKey: string | null; note: string | null; aliasCount?: number; updatedBy: string | null;
};
export type AdminRule = {
  id: number; key: string; title: string; matchType: "ingredient" | "category" | "term"; matchValue: string; status: "FLAGGED_INGREDIENT" | "CHECK_REQUIRED" | "NO_FLAGGED_INGREDIENTS";
  priority: number; reasonCode: string; reason: { ko: string; en: string; uz: string }; evidence: string | null; evidenceUrl: string | null; source: string; isActive: boolean; updatedBy: string | null;
};
export type AdminSubmission = {
  id: number; barcode: string; name: string | null; nameKo: string | null; brand: string | null; manufacturer: string | null; category: string | null;
  ingredientsText: string | null; ingredientsInput: string; ocrConfidence: number | null; productImageUrl: string | null; ingredientsImageUrl: string | null;
  note: string | null; status: "pending" | "verified" | "rejected" | "needs_review"; reviewNote: string | null; reviewedAt: string | null; createdAt: string;
};
export type AdminSource = {
  key: string; name: string; kind: string; homepageUrl: string | null; license: string | null; licenseUrl: string | null; attribution: string | null;
  licenseStatus: "confirmed" | "unconfirmed" | "rejected"; usageStatus: "active" | "planned" | "rejected"; requiresApiKey: boolean; apiKeyEnv: string | null;
  apiKeyConfigured: boolean | null; termsNote: string | null; reason: string | null; lastImportAt: string | null; recordCount: number; usable: boolean;
};
export type AdminPlace = {
  id: string; kind: string; name: string; nameKo: string | null; nameEn: string | null; category: string | null; halalStatus: string | null; certBody: string | null;
  address: string | null; lat: number | null; lng: number | null; dataOrigin: string; verificationStatus: Verification; isActive: boolean; adminNote: string | null;
  provenance: { source: string | null; sourceUrl: string | null; license: string | null; retrievedAt: string | null }; sources: { source: string }[];
};
export type AdminStats = {
  products: { total: number; byStatus: Record<string, number>; byOrigin: Record<string, number> };
  ingredients: { total: number; aliases: number; byStatus: Record<string, number> };
  rules: { total: number; byStatus: Record<string, number> };
  certifications: { byStatus: Record<string, number> };
  submissions: { byStatus: Record<string, number> };
  places: { byKind: Record<string, number>; byOrigin: Record<string, number>; byStatus: Record<string, number> };
};

const qs = (params: Record<string, string | number | undefined | null>) => {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
  const text = query.toString();
  return text ? `?${text}` : "";
};

export const adminApi = {
  stats: () => get<AdminStats>("/api/admin/stats"),

  products: (params: { q?: string; status?: string; origin?: string; page?: number }) => get<Paged<"products", AdminProduct>>(`/api/admin/products${qs(params)}`),
  product: (id: number) => get<AdminProductDetail>(`/api/admin/products/${id}`),
  createProduct: (body: Record<string, unknown>) => send<AdminProductDetail>("POST", "/api/admin/products", body),
  updateProduct: (id: number, body: Record<string, unknown>) => send<AdminProductDetail>("PATCH", `/api/admin/products/${id}`, body),
  overrideIngredient: (id: number, body: { text: string; ingredientKey?: string; ignore?: boolean }) => send<AdminProductDetail>("POST", `/api/admin/products/${id}/overrides`, body),
  removeOverride: (id: number, key: string) => send<AdminProductDetail>("DELETE", `/api/admin/products/${id}/overrides/${encodeURIComponent(key)}`),

  ingredients: (params: { q?: string; category?: string; status?: string; page?: number }) => get<Paged<"ingredients", AdminIngredient>>(`/api/admin/ingredients${qs(params)}`),
  ingredient: (id: number) => get<{ ingredient: AdminIngredient; aliases: { id: number; alias: string; lang: string; source: string }[]; productCount: number }>(`/api/admin/ingredients/${id}`),
  categories: () => get<{ categories: { category: string; n: number }[] }>("/api/admin/ingredient-categories"),
  createIngredient: (body: Record<string, unknown>) => send<{ ingredient: AdminIngredient }>("POST", "/api/admin/ingredients", body),
  updateIngredient: (id: number, body: Record<string, unknown>) => send<{ ingredient: AdminIngredient }>("PATCH", `/api/admin/ingredients/${id}`, body),
  addAlias: (id: number, alias: string, lang?: string) => send<unknown>("POST", `/api/admin/ingredients/${id}/aliases`, { alias, lang }),
  removeAlias: (aliasId: number) => send<unknown>("DELETE", `/api/admin/aliases/${aliasId}`),

  rules: (params: { q?: string; status?: string; type?: string; active?: string }) => get<{ rules: AdminRule[]; total: number }>(`/api/admin/rules${qs(params)}`),
  createRule: (body: Record<string, unknown>) => send<{ rule: AdminRule }>("POST", "/api/admin/rules", body),
  updateRule: (id: number, body: Record<string, unknown>) => send<{ rule: AdminRule }>("PATCH", `/api/admin/rules/${id}`, body),
  deactivateRule: (id: number) => send<{ rule: AdminRule }>("DELETE", `/api/admin/rules/${id}`),
  testRules: (text: string, fuzzy = false) => send<{ analysis: Analysis }>("POST", "/api/admin/rules/test", { text, fuzzy }),

  certifications: (params: { q?: string; status?: string; page?: number }) => get<Paged<"certifications", AdminCertification>>(`/api/admin/certifications${qs(params)}`),
  createCertification: (body: Record<string, unknown>) => send<{ certification: AdminCertification }>("POST", "/api/admin/certifications", body),
  updateCertification: (id: number, body: Record<string, unknown>) => send<{ certification: AdminCertification }>("PATCH", `/api/admin/certifications/${id}`, body),
  deleteCertification: (id: number) => send<unknown>("DELETE", `/api/admin/certifications/${id}`),

  submissions: (params: { status?: string; page?: number }) => get<Paged<"submissions", AdminSubmission>>(`/api/admin/submissions${qs(params)}`),
  submission: (id: number) => get<{ submission: AdminSubmission; existingProduct: AdminProduct | null; analysis: Analysis | null }>(`/api/admin/submissions/${id}`),
  reviewSubmission: (id: number, body: { action: "approve" | "reject" | "needs_review" | "reopen"; note?: string; edits?: Record<string, string | null> }) =>
    send<{ submission: AdminSubmission }>("POST", `/api/admin/submissions/${id}/review`, body),

  sources: () => get<{ sources: AdminSource[]; runs: { id: number; source: string; kind: string; started_at: string; status: string; inserted: number; updated: number; skipped: number; detail: string | null }[] }>("/api/admin/sources"),
  updateSource: (key: string, body: Record<string, unknown>) => send<unknown>("PATCH", `/api/admin/sources/${key}`, body),

  places: (params: { q?: string; kind?: string; status?: string; origin?: string; page?: number }) => get<Paged<"places", AdminPlace>>(`/api/admin/places${qs(params)}`),
  createPlace: (body: Record<string, unknown>) => send<{ place: AdminPlace; action: string }>("POST", "/api/admin/places", body),
  deactivatePlace: (id: string) => send<{ success: boolean }>("DELETE", `/api/admin/places/${encodeURIComponent(id)}`),
  updatePlace: (id: string, body: Record<string, unknown>) => send<{ place: AdminPlace }>("PATCH", `/api/admin/places/${encodeURIComponent(id)}`, body),
  importPlaces: (body: { filename: string; content: string; defaults?: { source?: string; license?: string; attribution?: string } }) =>
    send<{ imported: number; inserted: number; updated: number; merged: number; rejected: number; errors: { row: number; error: string }[] }>("POST", "/api/admin/places/import", body),
};

/** Fetches a private upload (needs the admin token, so a plain <img src> cannot be used) as an object URL. */
export const fetchProtectedImage = async (path: string): Promise<string | null> => {
  const token = getToken();
  const response = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return response.ok ? URL.createObjectURL(await response.blob()) : null;
};
