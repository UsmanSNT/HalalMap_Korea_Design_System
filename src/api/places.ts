import { apiClient } from "@/services/apiClient";
import type { Mosque } from "./mosques";
import type { Restaurant } from "./restaurants";

/** Unified place list (restaurants, mosques, prayer rooms, halal markets) as used by the map. */
export type PlaceKind = "restaurant" | "mosque" | "prayer_room" | "market";
export type MapPlace = (Restaurant | Mosque) & { kind: PlaceKind };

export type PlaceAttribution = { source: string; text: string; license: string | null; url: string | null };

export type PlacesResponse = {
  places: MapPlace[];
  total: number;
  counts: Record<PlaceKind, number>;
  attributions: PlaceAttribution[];
};

export const getPlaces = (params?: { kinds?: PlaceKind[]; q?: string; lat?: number; lng?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.kinds?.length) query.set("kind", params.kinds.join(","));
  if (params?.q) query.set("q", params.q);
  if (params?.lat != null && params?.lng != null) {
    query.set("lat", String(params.lat));
    query.set("lng", String(params.lng));
  }
  query.set("limit", String(params?.limit ?? 500));
  return apiClient<PlacesResponse>(`/api/places?${query.toString()}`);
};
