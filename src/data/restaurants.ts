import type { Coords } from "@/lib/geo";

/** Mirrors the tourism-board style levels plus community statuses; "unverified" means nothing is known. */
export type HalalStatus = "certified" | "self-certified" | "muslim-owned" | "halal-friendly" | "pork-free" | "unverified";
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
  close?: string;  /** Absolute URL of a user-submitted photo. */
  photoUrl?: string;
};

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
