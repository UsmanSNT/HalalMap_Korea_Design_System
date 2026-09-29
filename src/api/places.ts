import { apiClient } from "@/services/apiClient";

export type PlaceType = "mosque" | "prayer_room" | "restaurant" | "halal_market";
export type PlaceHalalStatus = "halal_certified" | "self_certified" | "muslim_friendly" | "pork_free" | "unknown";
export type VerificationStatus = "imported" | "verified" | "needs_review";

export type Place = {
  id: string;
  name: string;
  nameKo: string | null;
  nameEn: string | null;
  type: PlaceType;
  category: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  halalStatus: PlaceHalalStatus;
  certification: string | null;
  hasPrayerRoom: boolean | null;
  hasWudu: boolean | null;
  hasWomenPrayerArea: boolean | null;
  source: string;
  sourceUrl: string;
  sourceLicense: string;
  sourceRecordId: string;
  lastVerifiedAt: string | null;
  sourceUpdatedAt: string | null;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PlacesResponse = {
  places: Place[];
  counts?: Partial<Record<PlaceType, number>>;
  attribution?: { text: string; url: string; license: string };
};

const queryString = (params?: { types?: PlaceType[]; halalStatuses?: PlaceHalalStatus[]; q?: string }) => {
  const query = new URLSearchParams();
  params?.types?.forEach((type) => query.append("type", type));
  params?.halalStatuses?.forEach((status) => query.append("halalStatus", status));
  if (params?.q) query.set("q", params.q);
  const value = query.toString();
  return value ? `?${value}` : "";
};

export const getPlaces = (params?: { types?: PlaceType[]; halalStatuses?: PlaceHalalStatus[]; q?: string }) =>
  apiClient<PlacesResponse>(`/api/places${queryString(params)}`);

export const getPlace = async (id: string) => {
  const result = await apiClient<{ place: Place }>(`/api/places/${encodeURIComponent(id)}`);
  return result.place;
};

export const getAdminPlaces = async () => {
  const result = await apiClient<{ places: Place[] }>("/api/admin/places");
  return result.places;
};

export const createAdminPlace = async (place: Partial<Place> & Pick<Place, "name" | "type" | "latitude" | "longitude">) => {
  const result = await apiClient<{ place: Place }>("/api/admin/places", {
    method: "POST",
    body: JSON.stringify({
      source: "HalalMap Admin",
      sourceUrl: "https://halalmap.kr/admin",
      sourceLicense: "Proprietary first-party record",
      ...place,
    }),
  });
  return result.place;
};

export const updateAdminPlace = async (id: string, changes: Partial<Place>) => {
  const result = await apiClient<{ place: Place }>(`/api/admin/places/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
  return result.place;
};

export const deactivateAdminPlace = (id: string) => apiClient<{ success: boolean }>(
  `/api/admin/places/${encodeURIComponent(id)}`,
  { method: "DELETE" },
);
