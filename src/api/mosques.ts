import { apiClient } from "@/services/apiClient";
import type { PlaceMeta } from "./restaurants";

export type MosqueType = "mosque" | "prayer-room";

export type Mosque = PlaceMeta & {
  id: string;
  name: string;
  nameKo: string;
  subtitle: string | null;
  type: MosqueType;
  address: string;
  distance: string;
  walkTime: string | null;
  phone: string | null;
  facilities: string[];
  juma: string | null;
  photo: string | null;
  hours: string | null;
};

export type Prayer = {
  id: string;
  name: string;
  nameEn: string;
  time: string;
};

export type PrayerTimesData = {
  hijriDate: string;
  gregorianDate: string;
  prayers: Prayer[];
};

export const getMosques = async (options?: { type?: MosqueType; lat?: number; lng?: number }) => {
  const query = new URLSearchParams();
  if (options?.type) query.set("type", options.type);
  if (options?.lat != null && options?.lng != null) {
    query.set("lat", String(options.lat));
    query.set("lng", String(options.lng));
  }
  const qs = query.toString();
  const result = await apiClient<{ mosques: Mosque[] }>(`/api/mosques${qs ? `?${qs}` : ""}`);
  return result.mosques;
};

export const getMosque = async (id: string, origin?: { lat: number; lng: number }) => {
  const qs = origin ? `?lat=${origin.lat}&lng=${origin.lng}` : "";
  const result = await apiClient<{ mosque: Mosque }>(`/api/mosques/${encodeURIComponent(id)}${qs}`);
  return result.mosque;
};

export const getPrayerTimes = async () => {
  const result = await apiClient<{ prayerTimes: PrayerTimesData; location: string }>("/api/prayer-times");
  return result;
};
