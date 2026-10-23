import type { Coords } from "@/lib/geo";

export type MosqueKind = "mosque" | "prayer-room";
export type FacilityId = "wudu" | "women" | "parking" | "english" | "korean";

export type Mosque = {
  id: string;
  name: string;
  nameKo: string;
  kind: MosqueKind;
  /** Korean address: usable as-is in Korean map/taxi apps. */
  address: string;
  coords: Coords;
  phone?: string;
  facilities: FacilityId[];
  /** Friday (Jumu'ah) prayer start, "HH:MM". */
  juma?: string;
};
