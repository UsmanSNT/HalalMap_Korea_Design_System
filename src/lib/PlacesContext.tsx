import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import osm from "@/data/osm.generated.json";
import type { Mosque } from "@/data/mosques";
import type { Restaurant } from "@/data/restaurants";
import { apiUrl } from "./api";
import { fetchCommunityPlaces, fetchRatingSummary, type CommunityPlace, type RatingSummary } from "./communityApi";
import { distanceKm, type Coords } from "./geo";
import { readStored, writeStored } from "./storage";

const CACHE_KEY = "halalmap-community-places";
const DUPLICATE_RADIUS_KM = 0.1;

type PlacesValue = {
  mosques: readonly Mosque[];
  restaurants: readonly Restaurant[];
  /** Average rating and review count per place id. */
  ratings: RatingSummary;
  refreshRatings: () => void;
};
const PlacesContext = createContext<PlacesValue | null>(null);

const osmData = osm as unknown as { mosques: Mosque[]; restaurants: Restaurant[] };

function readCache(): CommunityPlace[] {
  try {
    const parsed: unknown = JSON.parse(readStored(CACHE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as CommunityPlace[]) : [];
  } catch {
    return [];
  }
}

/** Drops candidates that sit within 100 m of an already-known place (community-approved beats OSM). */
function withoutDuplicates<T extends { coords: Coords }>(known: readonly T[], candidates: readonly T[]): T[] {
  return candidates.filter((c) => !known.some((k) => distanceKm(k.coords, c.coords) < DUPLICATE_RADIUS_KM));
}

const toMosque = (p: CommunityPlace): Mosque => ({
  id: p.id,
  name: p.name,
  nameKo: p.nameKo,
  kind: p.kind === "prayer-room" ? "prayer-room" : "mosque",
  address: p.address,
  coords: { lat: p.lat, lng: p.lng },
  phone: p.phone ?? undefined,
  facilities: [],
  photoUrl: p.photoUrl ? apiUrl(p.photoUrl) : undefined,
});

const toRestaurant = (p: CommunityPlace): Restaurant => ({
  id: p.id,
  name: p.name,
  nameKo: p.nameKo,
  cuisine: p.cuisine ?? "other",
  halal: p.halal ?? "unverified",
  address: p.address,
  coords: { lat: p.lat, lng: p.lng },
  phone: p.phone ?? undefined,
  open: p.open ?? undefined,
  close: p.close ?? undefined,
  photoUrl: p.photoUrl ? apiUrl(p.photoUrl) : undefined,
});

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [community, setCommunity] = useState<CommunityPlace[]>(readCache);
  const [ratings, setRatings] = useState<RatingSummary>({});

  const refreshRatings = useCallback(() => {
    fetchRatingSummary()
      .then(setRatings)
      .catch(() => {
        // Ratings are optional: lists still work without them.
      });
  }, []);

  useEffect(refreshRatings, [refreshRatings]);

  useEffect(() => {
    let cancelled = false;
    fetchCommunityPlaces()
      .then((places) => {
        if (cancelled) return;
        setCommunity(places);
        writeStored(CACHE_KEY, JSON.stringify(places));
      })
      .catch(() => {
        // Offline or API not configured: bundled and cached places still work.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const placeLists = useMemo(() => {
    const communityMosques = community.filter((p) => p.kind !== "restaurant").map(toMosque);
    const communityRestaurants = community.filter((p) => p.kind === "restaurant").map(toRestaurant);
    return {
      mosques: [...communityMosques, ...withoutDuplicates(communityMosques, osmData.mosques)],
      restaurants: [...communityRestaurants, ...withoutDuplicates(communityRestaurants, osmData.restaurants)],
    };
  }, [community]);

  const value = useMemo<PlacesValue>(() => ({ ...placeLists, ratings, refreshRatings }), [placeLists, ratings, refreshRatings]);

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces(): PlacesValue {
  const ctx = useContext(PlacesContext);
  if (!ctx) throw new Error("usePlaces must be used within PlacesProvider");
  return ctx;
}
