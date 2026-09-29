import { apiClient } from "@/services/apiClient";

export type HalalStatus = "certified" | "muslim-owned" | "halal-friendly";

/** Where a record came from. Real imported places carry their licence; `demo` rows are fictional. */
export type PlaceProvenance = {
  source: string | null;
  sourceId: string | null;
  sourceUrl: string | null;
  license: string | null;
  attribution: string | null;
  retrievedAt: string | null;
  lastVerifiedAt: string | null;
};

export type PlaceMeta = {
  kind: "restaurant" | "market" | "mosque" | "prayer_room";
  lat: number | null;
  lng: number | null;
  website: string | null;
  distanceKm: number | null;
  dataOrigin: "imported" | "demo" | "admin" | "submission";
  verificationStatus: "unverified" | "verified" | "needs_review" | "rejected";
  provenance: PlaceProvenance;
};

/**
 * Rating and delivery fields exist only for the demo restaurants; real places have none (null), so screens
 * must not invent them.
 */
export type Restaurant = PlaceMeta & {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  halalStatus: HalalStatus | null;
  halalEvidence: string | null;
  certBody: string | null;
  rating: number | null;
  reviewCount: number;
  distance: string;
  deliveryTime: string | null;
  deliveryFee: number | null;
  minOrder: number | null;
  address: string;
  phone: string | null;
  hours: string;
  description: string;
  photo: string | null;
};

export type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  photo: string | null;
};

export const getRestaurants = async (params?: { category?: string; q?: string; lat?: number; lng?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.q) query.set("q", params.q);
  if (params?.lat != null && params?.lng != null) {
    query.set("lat", String(params.lat));
    query.set("lng", String(params.lng));
  }
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  const result = await apiClient<{ restaurants: Restaurant[] }>(`/api/restaurants${qs ? `?${qs}` : ""}`);
  return result.restaurants;
};

export const getRestaurant = async (id: string) => {
  const result = await apiClient<{ restaurant: Restaurant }>(`/api/restaurants/${encodeURIComponent(id)}`);
  return result.restaurant;
};

/** Halal markets and other non-restaurant places share the restaurant shape. */
export const getMarkets = async (params?: { lat?: number; lng?: number }) => {
  const query = new URLSearchParams({ kind: "market" });
  if (params?.lat != null && params?.lng != null) {
    query.set("lat", String(params.lat));
    query.set("lng", String(params.lng));
  }
  const result = await apiClient<{ places: Restaurant[] }>(`/api/places?${query}`);
  return result.places;
};

export const getRestaurantMenu = async (id: string) => {
  const result = await apiClient<{ restaurant: { id: string; name: string }; menu: MenuItem[] }>(
    `/api/restaurants/${encodeURIComponent(id)}/menu`,
  );
  return result;
};
