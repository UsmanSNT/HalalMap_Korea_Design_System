// The user's position for "nearby" lists. Falls back to Itaewon (the app's default area) when the browser
// cannot or may not share a position, so lists are always sorted by a real distance from a known point.

export type LatLng = { lat: number; lng: number };
export type Origin = LatLng & { source: "device" | "default" };

export const DEFAULT_ORIGIN: Origin = { lat: 37.5345, lng: 126.9946, source: "default" };

let cached: Promise<Origin> | null = null;

export const getOrigin = (): Promise<Origin> => {
  cached ??= new Promise<Origin>((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(DEFAULT_ORIGIN);
    const timer = window.setTimeout(() => resolve(DEFAULT_ORIGIN), 4000);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timer);
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude, source: "device" });
      },
      () => {
        window.clearTimeout(timer);
        resolve(DEFAULT_ORIGIN);
      },
      { maximumAge: 5 * 60_000, timeout: 3500 },
    );
  });
  return cached;
};
