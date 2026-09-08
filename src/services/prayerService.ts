import { apiClient } from "./apiClient";

export type PrayerTimesResponse = {
  source: string;
  calculationMethod: string;
  timings: Record<string, string>;
  date: {
    readable: string;
    gregorian: { date: string };
    hijri: { day: string; month: { en: string }; year: string };
  };
};

export const prayerService = {
  getTimes: (latitude: number, longitude: number) => apiClient<PrayerTimesResponse>(
    `/api/prayer-times?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`,
  ),
};
