// Anonymous scan history, kept only on this device.

export type ScanHistoryItem = {
  barcode: string;
  name: string;
  brand: string | null;
  status: string;
  imageUrl: string | null;
  at: number;
};

const KEY = "halalmap_scan_history_v1";
const MAX = 50;

export const readScanHistory = (): ScanHistoryItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addScanHistory = (item: Omit<ScanHistoryItem, "at">): void => {
  try {
    const rest = readScanHistory().filter((entry) => entry.barcode !== item.barcode);
    localStorage.setItem(KEY, JSON.stringify([{ ...item, at: Date.now() }, ...rest].slice(0, MAX)));
  } catch {
    /* storage may be unavailable (private mode) */
  }
};

export const clearScanHistory = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

/** Hand-over between the label-photo, result and contribution screens (survives in-app navigation only). */
export type ContributionDraft = {
  barcode?: string;
  name?: string;
  brand?: string;
  ingredientsText?: string;
  ingredientsInput?: "typed" | "ocr" | "ocr_edited";
  ocrConfidence?: number | null;
  ingredientsImage?: string | null;
};
const DRAFT_KEY = "halalmap_contribution_draft";
export const saveDraft = (draft: ContributionDraft) => {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
};
export const readDraft = (): ContributionDraft => {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}"); } catch { return {}; }
};
export const clearDraft = () => {
  try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
};
