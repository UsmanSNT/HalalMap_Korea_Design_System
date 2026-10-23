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

// Curated entries. Coordinates are approximate and must be verified before public release.
export const MOSQUES: readonly Mosque[] = [
  {
    id: "seoul-central",
    name: "Seoul Central Mosque",
    nameKo: "서울중앙성원",
    kind: "mosque",
    address: "서울특별시 용산구 우사단로10길 39",
    coords: { lat: 37.5346, lng: 126.9999 },
    phone: "02-793-6908",
    facilities: ["wudu", "women", "parking", "english"],
    juma: "12:30",
  },
  {
    id: "itaewon-masjid",
    name: "Itaewon Masjid",
    nameKo: "이태원 마스지드",
    kind: "mosque",
    address: "서울특별시 용산구 이태원로 27",
    coords: { lat: 37.5343, lng: 126.9945 },
    phone: "02-795-1234",
    facilities: ["wudu", "parking"],
    juma: "13:00",
  },
  {
    id: "coex-prayer",
    name: "COEX Prayer Room",
    nameKo: "코엑스 기도실",
    kind: "prayer-room",
    address: "서울특별시 강남구 삼성동 코엑스몰 B1",
    coords: { lat: 37.5116, lng: 127.059 },
    facilities: ["wudu"],
  },
  {
    id: "suwon-mosque",
    name: "Suwon Islamic Center",
    nameKo: "수원 이슬람 성원",
    kind: "mosque",
    address: "경기도 수원시 팔달구 매산로 88",
    coords: { lat: 37.2655, lng: 127.017 },
    phone: "031-242-5678",
    facilities: ["wudu", "women", "parking", "korean"],
    juma: "12:30",
  },
];
