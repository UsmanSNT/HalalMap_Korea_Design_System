import type { HalalStatus } from "@/api/restaurants";

/** Card badge for a place's halal status; `null` when nothing is known (no badge is better than a guess). */
export const halalBadgeMap = (status: HalalStatus | string | null | undefined) =>
  status === "certified" ? ("certified" as const)
    : status === "muslim-owned" ? ("owned" as const)
    : status === "halal-friendly" ? ("friendly" as const)
    : undefined;

export const formatFee = (fee: number | null | undefined, freeLabel: string) =>
  fee == null ? null : fee === 0 ? freeLabel : `₩${fee.toLocaleString()}`;

/** Maps deep link: coordinates when known, otherwise an address search. */
export const mapsUrl = (place: { lat: number | null; lng: number | null; address?: string | null; name?: string }) =>
  place.lat != null && place.lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place.name, place.address].filter(Boolean).join(" "))}`;

export const formatDate = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "—");

const CUISINE_LABELS: Record<string, string> = {
  korean: "한식", turkish: "터키", uzbek: "우즈베크", indian: "인도", indonesian: "인도네시아", cafe: "카페", arabic: "아랍",
};

/** Short cuisine label for a card. Raw source tags ("steak_house") are made readable; "other"/empty show nothing. */
export const cuisineLabel = (category: string | null | undefined): string | undefined => {
  const value = (category ?? "").trim();
  if (!value || value.toLowerCase() === "other") return undefined;
  const known = CUISINE_LABELS[value.toLowerCase()];
  if (known) return known;
  const readable = value.replace(/[_;]+/g, " ").trim();
  return /[가-힣]/.test(readable) ? readable : readable.charAt(0).toUpperCase() + readable.slice(1);
};

/** Small pill on a place card: DEMO for fictional rows, COMMUNITY for imported rows nobody has verified yet. */
export const placeTag = (place: { dataOrigin: string; verificationStatus: string }, t: (key: string) => string): string | null =>
  place.dataOrigin === "demo" ? t("place.demo_tag")
    : place.dataOrigin === "imported" && place.verificationStatus === "unverified" ? t("place.community_tag")
    : null;
