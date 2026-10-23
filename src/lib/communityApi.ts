import type { CuisineId, HalalStatus } from "@/data/restaurants";
import type { MosqueKind } from "@/data/mosques";
import { api } from "./api";
import { readStored, writeStored } from "./storage";

export type PlaceKind = MosqueKind | "restaurant";

export type CommunityPlace = {
  id: string;
  kind: PlaceKind;
  name: string;
  nameKo: string;
  address: string;
  lat: number;
  lng: number;
  cuisine: CuisineId | null;
  halal: HalalStatus | null;
  phone: string | null;
  open: string | null;
  close: string | null;
  photoUrl: string | null;
};

export type SubmissionInput = {
  kind: PlaceKind;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  cuisine?: CuisineId;
  halal?: HalalStatus;
  placePhone?: string;
  notes?: string;
  contactName?: string;
  contactPhone: string;
  photoId?: string;
  /** Honeypot: must stay empty for real users. */
  website?: string;
};

export type AdminSubmission = {
  id: string;
  kind: PlaceKind;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  cuisine: CuisineId | null;
  halal: HalalStatus | null;
  placePhone: string | null;
  notes: string | null;
  contactName: string | null;
  contactPhone: string;
  photoUrl: string | null;
  createdAt: number;
};

export type ApprovalInput = {
  name?: string;
  nameKo?: string;
  lat: number;
  lng: number;
  halal?: HalalStatus;
  cuisine?: CuisineId;
  open?: string;
  close?: string;
  adminNote?: string;
};

export const fetchCommunityPlaces = async () => (await api<{ places: CommunityPlace[] }>("/api/places")).places;

export const submitPlace = (input: SubmissionInput) => api<{ ok: true }>("/api/submissions", { method: "POST", body: JSON.stringify(input) });

export const fetchPendingSubmissions = async (token: string) =>
  (await api<{ submissions: AdminSubmission[] }>("/api/admin/submissions?status=pending", { token })).submissions;

export const approveSubmission = (token: string, id: string, input: ApprovalInput) =>
  api<{ ok: true }>(`/api/admin/submissions/${id}/approve`, { method: "POST", token, body: JSON.stringify(input) });

export const rejectSubmission = (token: string, id: string, adminNote?: string) =>
  api<{ ok: true }>(`/api/admin/submissions/${id}/reject`, { method: "POST", token, body: JSON.stringify({ adminNote }) });

export const uploadPhoto = async (jpeg: Blob) =>
  (await api<{ photoId: string }>("/api/uploads", { method: "POST", body: jpeg, headers: { "Content-Type": "image/jpeg" } })).photoId;

// ── reviews ──────────────────────────────────────────────────────

export type Review = { id: string; rating: number; comment: string | null; name: string | null; createdAt: number };
export type RatingSummary = Record<string, { avg: number; count: number }>;
export type ReviewList = { avg: number | null; count: number; reviews: Review[] };

const CLIENT_KEY = "halalmap-client-id";

/** Random per-browser id: lets the server allow one review per place per device without accounts. */
export function clientId(): string {
  const existing = readStored(CLIENT_KEY);
  if (existing && /^[A-Za-z0-9-]{16,64}$/.test(existing)) return existing;
  const created = crypto.randomUUID();
  writeStored(CLIENT_KEY, created);
  return created;
}

export const fetchRatingSummary = async () => (await api<{ summary: RatingSummary }>("/api/reviews/summary")).summary;

export const fetchReviews = (placeId: string) => api<ReviewList>(`/api/reviews?placeId=${encodeURIComponent(placeId)}`);

export const postReview = (input: { placeId: string; rating: number; comment?: string; name?: string; website?: string }) =>
  api<{ ok: true }>("/api/reviews", { method: "POST", body: JSON.stringify({ ...input, clientId: clientId() }) });

export type AdminReview = Review & { placeId: string };

export const fetchAdminReviews = async (token: string) => (await api<{ reviews: AdminReview[] }>("/api/admin/reviews", { token })).reviews;

export const deleteReview = (token: string, id: string) => api<{ ok: true }>(`/api/admin/reviews/${id}/delete`, { method: "POST", token, body: "{}" });
