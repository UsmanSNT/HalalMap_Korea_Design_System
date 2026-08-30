import { apiUrl } from "./config";

const TOKEN_KEY = "halalmap_session_token";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type RestaurantSubmission = {
  id: number;
  name: string;
  badge: "certified" | "owned" | "friendly";
  cuisine: string;
  certifyingBody: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  description: string;
  photoUrl: string;
  status: SubmissionStatus;
  rejectReason: string | null;
  submittedBy: number | null;
  createdAt: string;
};

export type MosqueSubmission = {
  id: number;
  name: string;
  hasPrayerRoom: boolean;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  contact: string;
  capacity: number | null;
  description: string;
  photoUrl: string;
  status: SubmissionStatus;
  rejectReason: string | null;
  submittedBy: number | null;
  createdAt: string;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "So‘rov bajarilmadi");
  return data;
};

export type NewRestaurant = {
  name: string;
  address: string;
  city?: string;
  cuisine?: string;
  badge?: "certified" | "owned" | "friendly";
  certifyingBody?: string;
  phone?: string;
  description?: string;
  photoUrl?: string;
  lat?: number;
  lng?: number;
};

export const submitRestaurant = (data: NewRestaurant) =>
  request<{ submission: RestaurantSubmission }>("/api/restaurants", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const listRestaurants = (status: SubmissionStatus = "approved") =>
  request<{ restaurants: RestaurantSubmission[] }>(`/api/restaurants?status=${status}`);

export const listMyRestaurants = () =>
  request<{ restaurants: RestaurantSubmission[] }>("/api/restaurants/mine");

export type NewMosque = {
  name: string;
  address: string;
  city?: string;
  hasPrayerRoom?: boolean;
  contact?: string;
  capacity?: number;
  description?: string;
  photoUrl?: string;
  lat?: number;
  lng?: number;
};

export const submitMosque = (data: NewMosque) =>
  request<{ submission: MosqueSubmission }>("/api/mosques", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const listMosques = (status: SubmissionStatus = "approved") =>
  request<{ mosques: MosqueSubmission[] }>(`/api/mosques?status=${status}`);

export const listMyMosques = () =>
  request<{ mosques: MosqueSubmission[] }>("/api/mosques/mine");

export const listPendingSubmissions = (status: SubmissionStatus = "pending") =>
  request<{ restaurants: RestaurantSubmission[]; mosques: MosqueSubmission[] }>(`/api/admin/submissions?status=${status}`);

export const moderateRestaurant = (id: number, action: "approve" | "reject", reason?: string) =>
  request<{ submission: RestaurantSubmission }>(`/api/admin/restaurants/${id}/${action}`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const moderateMosque = (id: number, action: "approve" | "reject", reason?: string) =>
  request<{ submission: MosqueSubmission }>(`/api/admin/mosques/${id}/${action}`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
