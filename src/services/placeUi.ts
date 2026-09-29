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
