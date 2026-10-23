import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Coords } from "./geo";
import { readStored, writeStored } from "./storage";

/** Seoul City Hall: used until a real position is known. */
export const DEFAULT_COORDS: Coords = { lat: 37.5665, lng: 126.978 };
const STORAGE_KEY = "halalmap-last-position";

export type LocationStatus = "locating" | "gps" | "saved" | "denied" | "unavailable";

type LocationValue = {
  coords: Coords;
  status: LocationStatus;
  /** True only when `coords` came from the device (now or on a previous visit). */
  isReal: boolean;
  refresh: () => void;
};

const LocationContext = createContext<LocationValue | null>(null);

function readSaved(): Coords | null {
  const raw = readStored(STORAGE_KEY);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Coords>;
    return typeof v.lat === "number" && typeof v.lng === "number" ? { lat: v.lat, lng: v.lng } : null;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const saved = useRef(readSaved());
  const [coords, setCoords] = useState<Coords>(saved.current ?? DEFAULT_COORDS);
  const [status, setStatus] = useState<LocationStatus>(saved.current ? "saved" : "locating");

  const refresh = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    setStatus((s) => (s === "gps" || s === "saved" ? s : "locating"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(next);
        setStatus("gps");
        writeStored(STORAGE_KEY, JSON.stringify(next));
      },
      (err) => setStatus((s) => (s === "saved" ? s : err.code === err.PERMISSION_DENIED ? "denied" : "unavailable")),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }, []);

  useEffect(refresh, [refresh]);

  const value = useMemo<LocationValue>(
    () => ({ coords, status, isReal: status === "gps" || status === "saved", refresh }),
    [coords, status, refresh],
  );
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
