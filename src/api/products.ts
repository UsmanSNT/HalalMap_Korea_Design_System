import { apiClient } from "@/services/apiClient";

export type ProductStatus = "HALAL_CERTIFIED" | "NO_FLAGGED_INGREDIENTS" | "CHECK_REQUIRED" | "FLAGGED_INGREDIENT" | "UNKNOWN";
export type IngredientStatus = "NO_FLAGGED_INGREDIENTS" | "CHECK_REQUIRED" | "FLAGGED_INGREDIENT" | "UNKNOWN";
export type Localized = { ko: string; en: string; uz: string };

export type AnalysisReason = { code: string; text: Localized };
export type IngredientReason = { code: string } & Localized;

export type IngredientResult = {
  raw: string;
  name: string;
  percent: number | null;
  origin: string | null;
  ingredient: { key: string; canonicalName: string; nameKo: string | null; nameEn: string | null; category: string; isClass: boolean } | null;
  matchType: "exact" | "alias" | "normalized" | "qualified" | "contains" | "fuzzy" | "unmatched" | "admin";
  confidence: number;
  status: IngredientStatus;
  reason: IngredientReason | null;
  rule: { key: string; title: string; priority: number; evidence: string | null; evidenceUrl: string | null; source: string } | null;
  derivedFromChildren: boolean;
  notes: string[];
  children: IngredientResult[];
};

export type CertificationView = {
  id: number;
  organization: string;
  certificateNo: string | null;
  status: string;
  validFrom: string | null;
  validUntil: string | null;
  verificationStatus: string;
  verificationUrl: string | null;
  verifiedAt: string | null;
  source: string;
  sourceUrl: string | null;
  state: string;
};

export type Analysis = {
  status: ProductStatus;
  reasons: AnalysisReason[];
  certification: { state: "none" | "valid" | "unverified_claim" | "expired"; valid: CertificationView[]; other: CertificationView[] };
  counts: { total: number; flagged: number; checkRequired: number; unknown: number; cleared: number };
  items: IngredientResult[];
  flagged: IngredientResult[];
  checkRequired: IngredientResult[];
  unknown: IngredientResult[];
  cleared: IngredientResult[];
  inputTrust: string;
  dataWarnings: string[];
  parse: { cleaned: string; allergens: string[]; warnings: string[] };
  rulesetVersion: string | null;
  disclaimer: Localized;
};

export type Provenance = {
  source: string;
  sourceId: string | null;
  sourceUrl: string | null;
  license: string | null;
  attribution: string | null;
  retrievedAt: string | null;
  lastVerifiedAt: string | null;
  lastCheckedAt: string | null;
  sources: { source: string; source_url: string | null; license: string | null; attribution: string | null; retrieved_at: string }[];
};

export type Product = {
  id: number;
  barcode: string;
  name: string;
  nameKo: string | null;
  nameEn: string | null;
  brand: string | null;
  manufacturer: string | null;
  category: string | null;
  quantity: string | null;
  imageUrl: string | null;
  ingredientsRaw: string | null;
  ingredientsLang: string | null;
  ingredientsSource: string | null;
  ingredientsTrust: string | null;
  allergens: string[];
  dataOrigin: string;
  verificationStatus: "unverified" | "verified" | "needs_review" | "rejected";
  provenance: Provenance;
};

export type LookupResult =
  | { found: true; barcode: string; barcodeFormat: string; product: Product; analysis: Analysis; lookup: LookupMeta; pendingSubmission: boolean; next: string[] }
  | { found: false; barcode: string; barcodeFormat: string; lookup: LookupMeta; pendingSubmission: boolean; next: string[] };

export type LookupMeta = { cacheHit: boolean; tried: { provider: string; outcome: string; detail?: string }[] };

export const lookupProduct = (barcode: string) => apiClient<LookupResult>(`/api/products/lookup/${encodeURIComponent(barcode)}`);

export type AnalyzeInput = "typed" | "ocr" | "ocr_confirmed";
export const analyzeIngredients = async (text: string, input: AnalyzeInput) =>
  (await apiClient<{ analysis: Analysis }>("/api/ingredients/analyze", { method: "POST", body: JSON.stringify({ text, input }) })).analysis;

export type OcrConfig = { serverProvider: "google-vision" | "clova" | null; clientOcr: boolean; languages: string[] };
export const getOcrConfig = () => apiClient<OcrConfig>("/api/ocr/config");

export type ServerOcrResult = { provider: string; confidence: number | null; rawText: string; ingredientsText: string; markerFound: boolean };
export const runServerOcr = (image: string) => apiClient<ServerOcrResult>("/api/ocr/ingredients", { method: "POST", body: JSON.stringify({ image }) });

export type SubmissionPayload = {
  barcode: string;
  name?: string;
  brand?: string;
  manufacturer?: string;
  category?: string;
  ingredientsText?: string;
  ingredientsInput?: "typed" | "ocr" | "ocr_edited";
  ocrConfidence?: number | null;
  productImage?: string | null;
  ingredientsImage?: string | null;
  note?: string;
  website?: string;
};
export const submitProduct = (payload: SubmissionPayload) =>
  apiClient<{ submission: { id: number; status: string; barcode: string }; analysis: Analysis | null; message: string }>("/api/product-submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export type DataSourceInfo = {
  key: string; name: string; kind: string; homepageUrl: string | null; license: string | null; licenseUrl: string | null;
  attribution: string | null; licenseStatus: string; usageStatus: string; reason: string | null; lastImportAt: string | null; recordCount: number;
};
export const getDataSources = async () => (await apiClient<{ sources: DataSourceInfo[] }>("/api/data-sources")).sources;
