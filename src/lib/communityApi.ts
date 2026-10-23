import type { CuisineId, HalalStatus } from "@/data/restaurants";
import type { MosqueKind } from "@/data/mosques";
import { api } from "./api";

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
