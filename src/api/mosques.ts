import { apiClient } from "@/services/apiClient";

export type MosqueType = "mosque" | "prayer-room";

export type Mosque = {
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

export const getMosques = async (type?: MosqueType) => {
  const qs = type ? `?type=${type}` : "";
  const result = await apiClient<{ mosques: Mosque[] }>(`/api/mosques${qs}`);
  return result.mosques;
};

export const getMosque = async (id: string) => {
  const result = await apiClient<{ mosque: Mosque }>(`/api/mosques/${encodeURIComponent(id)}`);
  return result.mosque;
};

export const getPrayerTimes = async () => {
  const result = await apiClient<{ prayerTimes: PrayerTimesData; location: string }>("/api/prayer-times");
  return result;
};
