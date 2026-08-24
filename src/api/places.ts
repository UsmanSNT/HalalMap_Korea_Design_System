export type PlaceType = "restaurant" | "mosque" | "prayer_room";
export type PlaceSubmission = { id: number; action: "add" | "correction"; type: PlaceType; name: string; address: string; details: string; status: "pending" | "approved" | "rejected"; reporter_email: string; created_at: string };
const token = () => localStorage.getItem("halalmap_session_token");
const call = async <T>(path: string, init?: RequestInit): Promise<T> => { const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...init?.headers } }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Server xatosi"); return data; };
export const submitPlace = (body: { action: "add" | "correction"; type: PlaceType; name: string; address: string; details: string }) => call<{ success: true; id: number }>("/api/place-submissions", { method: "POST", body: JSON.stringify(body) });
export const getPlaceSubmissions = () => call<{ submissions: PlaceSubmission[] }>("/api/admin/place-submissions");
export const reviewPlaceSubmission = (id: number, status: "approved" | "rejected") => call<{ success: true }>(`/api/admin/place-submissions/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
