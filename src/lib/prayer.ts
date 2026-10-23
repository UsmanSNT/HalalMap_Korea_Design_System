import type { Coords } from "./geo";

// Solar-position based prayer time calculation (same model as PrayTimes.org),
// Muslim World League angles: Fajr 18°, Isha 17°. Pure and offline.

export type PrayerId = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
export type AsrMethod = "standard" | "hanafi";
export type PrayerTimes = Record<PrayerId, Date | null>;

export const PRAYER_ORDER: readonly PrayerId[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

const FAJR_ANGLE = 18;
const ISHA_ANGLE = 17;
const SUNRISE_SUNSET_ANGLE = 0.833; // atmospheric refraction + solar radius

const DEG = Math.PI / 180;
const sin = (d: number) => Math.sin(d * DEG);
const cos = (d: number) => Math.cos(d * DEG);
const tan = (d: number) => Math.tan(d * DEG);
const asin = (x: number) => Math.asin(x) / DEG;
const acos = (x: number) => Math.acos(x) / DEG;
const atan2 = (y: number, x: number) => Math.atan2(y, x) / DEG;
const arccot = (x: number) => Math.atan(1 / x) / DEG;
const fixAngle = (a: number) => ((a % 360) + 360) % 360;
const fixHour = (h: number) => ((h % 24) + 24) % 24;

function julianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

function sunPosition(jd: number): { declination: number; equation: number } {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  const e = 23.439 - 0.00000036 * d;
  const ra = atan2(cos(e) * sin(l), cos(l)) / 15;
  return { declination: asin(sin(e) * sin(l)), equation: q / 15 - fixHour(ra) };
}

/**
 * Prayer times for the civil date of `date` at `coords`, in the device's
 * local time zone. A prayer that never occurs (polar latitudes) is `null`.
 */
export function computePrayerTimes(date: Date, coords: Coords, asr: AsrMethod = "standard"): PrayerTimes {
  const { lat, lng } = coords;
  const tzHours = -date.getTimezoneOffset() / 60;
  const jd = julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / (15 * 24);

  const midDay = (t: number) => fixHour(12 - sunPosition(jd + t).equation);
  const angleTime = (angle: number, t: number, ccw: boolean) => {
    const decl = sunPosition(jd + t).declination;
    const ratio = (-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat));
    if (ratio < -1 || ratio > 1) return NaN;
    const offset = acos(ratio) / 15;
    return midDay(t) + (ccw ? -offset : offset);
  };
  const asrTime = (t: number) => {
    const decl = sunPosition(jd + t).declination;
    const factor = asr === "hanafi" ? 2 : 1;
    return angleTime(-arccot(factor + tan(Math.abs(lat - decl))), t, false);
  };

  let h = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18, isha: 19 };
  for (let i = 0; i < 2; i += 1) {
    const p = { fajr: h.fajr / 24, sunrise: h.sunrise / 24, dhuhr: h.dhuhr / 24, asr: h.asr / 24, maghrib: h.maghrib / 24, isha: h.isha / 24 };
    h = {
      fajr: angleTime(FAJR_ANGLE, p.fajr, true),
      sunrise: angleTime(SUNRISE_SUNSET_ANGLE, p.sunrise, true),
      dhuhr: midDay(p.dhuhr),
      asr: asrTime(p.asr),
      maghrib: angleTime(SUNRISE_SUNSET_ANGLE, p.maghrib, false),
      isha: angleTime(ISHA_ANGLE, p.isha, false),
    };
    if (Object.values(h).some(Number.isNaN)) break;
  }

  const toDate = (hours: number): Date | null => {
    if (Number.isNaN(hours)) return null;
    const local = fixHour(hours + tzHours - lng / 15);
    const minutes = Math.round(local * 60);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, minutes, 0, 0);
  };

  return {
    fajr: toDate(h.fajr),
    sunrise: toDate(h.sunrise),
    dhuhr: toDate(h.dhuhr),
    asr: toDate(h.asr),
    maghrib: toDate(h.maghrib),
    isha: toDate(h.isha),
  };
}

export const formatClock = (d: Date | null) =>
  d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "--:--";

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
