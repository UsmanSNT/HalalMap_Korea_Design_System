import { bearingDeg, type Coords } from "./geo";

/** Coordinates of the Kaaba, Masjid al-Haram, Makkah. */
export const KAABA: Coords = { lat: 21.4225, lng: 39.8262 };

/** Qibla direction as a bearing from true north (degrees, clockwise). */
export const qiblaBearing = (from: Coords) => bearingDeg(from, KAABA);

/**
 * Phone compasses report magnetic north; the Qibla bearing is relative to true north. Declination
 * is approximated only for South Korea (about 8° west across the peninsula); elsewhere it is 0 and
 * the heading is accurate only to the local declination.
 */
export function magneticDeclination(at: Coords): number {
  const inKorea = at.lat >= 33 && at.lat <= 39 && at.lng >= 124 && at.lng <= 132;
  return inKorea ? -8 : 0;
}
