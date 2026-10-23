import type { Coords } from "@/lib/geo";

export type HalalStatus = "certified" | "muslim-owned" | "halal-friendly" | "unverified";
export type CuisineId = "korean" | "turkish" | "uzbek" | "indian" | "indonesian" | "cafe" | "other";

export type Restaurant = {
  id: string;
  name: string;
  nameKo: string;
  cuisine: CuisineId;
  halal: HalalStatus;
  certBody?: string;
  /** Korean address: usable as-is in Korean map/taxi apps. */
  address: string;
  coords: Coords;
  phone?: string;
  /** Opening hours as "HH:MM"; `close` earlier than `open` means past midnight. Both absent when unknown. */
  open?: string;
  close?: string;
};

// Curated entries. Coordinates are approximate and halal statuses must be verified
// against the certifying body before public release.
export const RESTAURANTS: readonly Restaurant[] = [
  { id: "sindang-halal", name: "Sindang Halal Kitchen", nameKo: "신당 할랄 키친", cuisine: "korean", halal: "certified", certBody: "KMF", address: "서울특별시 중구 신당동 123-4", coords: { lat: 37.5657, lng: 127.0176 }, phone: "02-1234-5678", open: "09:00", close: "22:00" },
  { id: "itaewon-kebab", name: "Itaewon Kebab House", nameKo: "이태원 케밥 하우스", cuisine: "turkish", halal: "certified", certBody: "KMF", address: "서울특별시 용산구 이태원로 45-7", coords: { lat: 37.534, lng: 126.996 }, phone: "02-2345-6789", open: "10:00", close: "23:00" },
  { id: "uzbekistan-plov", name: "Uzbekistan Plov House", nameKo: "우즈베키스탄 플로프 하우스", cuisine: "uzbek", halal: "muslim-owned", address: "서울특별시 용산구 한남동 67-2", coords: { lat: 37.536, lng: 127.002 }, phone: "02-3456-7890", open: "11:00", close: "22:00" },
  { id: "delhi-spice", name: "Delhi Spice", nameKo: "델리 스파이스", cuisine: "indian", halal: "halal-friendly", address: "서울특별시 강남구 역삼동 88-3", coords: { lat: 37.5006, lng: 127.0364 }, phone: "02-4567-8901", open: "11:00", close: "21:30" },
  { id: "jakarta-nasigoreng", name: "Jakarta Nasi Goreng", nameKo: "자카르타 나시고렝", cuisine: "indonesian", halal: "certified", certBody: "MUI", address: "서울특별시 마포구 합정동 34-1", coords: { lat: 37.5495, lng: 126.9139 }, phone: "02-5678-9012", open: "10:30", close: "22:00" },
  { id: "masjid-seoul-cafe", name: "Masjid Seoul Cafe", nameKo: "마스지드 서울 카페", cuisine: "cafe", halal: "muslim-owned", address: "서울특별시 용산구 우사단로 12-5", coords: { lat: 37.5342, lng: 126.999 }, phone: "02-6789-0123", open: "08:00", close: "20:00" },
];

/** Whether `now` is inside the opening hours (handles past-midnight closing); null when hours are unknown. */
export function isOpenNow(r: Pick<Restaurant, "open" | "close">, now: Date): boolean | null {
  if (!r.open || !r.close) return null;
  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const cur = now.getHours() * 60 + now.getMinutes();
  const open = toMin(r.open);
  const close = toMin(r.close);
  return open <= close ? cur >= open && cur < close : cur >= open || cur < close;
}
