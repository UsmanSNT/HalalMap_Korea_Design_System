import { apiClient } from "../services/apiClient";

export type PlaceType = "restaurant" | "mosque" | "prayer_room";
export type PlaceSubmission = { id: number; action: "add" | "correction"; type: PlaceType; name: string; address: string; details: string; status: "pending" | "approved" | "rejected"; reporter_email: string; created_at: string };
export const submitPlace = (body: { action: "add" | "correction"; type: PlaceType; name: string; address: string; details: string }) => apiClient<{ success: true; id: number }>("/api/place-submissions", { method: "POST", body: JSON.stringify(body) });
export const getPlaceSubmissions = () => apiClient<{ submissions: PlaceSubmission[] }>("/api/admin/place-submissions");
export const reviewPlaceSubmission = (id: number, status: "approved" | "rejected") => apiClient<{ success: true }>(`/api/admin/place-submissions/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
