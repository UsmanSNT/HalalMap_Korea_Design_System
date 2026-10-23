import { useEffect, useState } from "react";
import { useCompass } from "@/lib/compass";
import { distanceKm, formatDistance, normalizeDeg } from "@/lib/geo";
import { useLocation } from "@/lib/location";
import { KAABA, magneticDeclination, qiblaBearing } from "@/lib/qibla";
import { useLanguage } from "@/locale/LanguageContext";
import Notice from "@/ui/Notice";
import PageHeader from "@/ui/PageHeader";

const ALIGNED_TOLERANCE_DEG = 3;
const NO_SENSOR_TIMEOUT_MS = 2500;
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

export default function QiblaScreen() {
  const { t } = useLanguage();
  const { coords } = useLocation();
  const { heading: magneticHeading, status, start } = useCompass();
  const [noSensor, setNoSensor] = useState(false);
  const heading = magneticHeading === null ? null : normalizeDeg(magneticHeading + magneticDeclination(coords));

  // "active" without a single reading means the device has no usable sensor (e.g. a desktop browser).
  useEffect(() => {
    if (status !== "active" || heading !== null) {
      setNoSensor(false);
      return;
    }
    const id = window.setTimeout(() => setNoSensor(true), NO_SENSOR_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [status, heading]);

  const bearing = qiblaBearing(coords);
  const distance = distanceKm(coords, KAABA);
  const live = status === "active" && heading !== null;
  // The dial counter-rotates by the device heading so its "N" always points at real north.
  const dialRotation = live ? -heading : 0;
  const offset = live ? Math.abs(((bearing - heading + 540) % 360) - 180) : null;
  const aligned = offset !== null && offset <= ALIGNED_TOLERANCE_DEG;

  const statusMessage = !live
    ? status === "denied"
      ? t("qibla.denied")
      : status === "unsupported" || noSensor
        ? t("qibla.unsupported")
        : null
    : null;

  return (
    <>
      <PageHeader title={t("qibla.title")} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <section className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-white px-4 py-6">
          <div className="relative aspect-square w-full max-w-80">
            {/* Fixed pointer: the direction the phone's top edge faces */}
            <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[9px] border-t-[16px] border-x-transparent border-t-[var(--charcoal)]" aria-hidden="true" />
            <svg
              viewBox="-110 -110 220 220"
              className="h-full w-full transition-transform duration-150 ease-linear"
              style={{ transform: `rotate(${dialRotation}deg)` }}
              role="img"
              aria-label={`${t("qibla.bearing")}: ${Math.round(bearing)}° ${t("qibla.fromNorth")}`}
            >
              <circle r="100" fill={aligned ? "var(--green-light)" : "#FAF8F2"} stroke={aligned ? "var(--green)" : "var(--border)"} strokeWidth="3" />
              {TICKS.map((deg) => (
                <line key={deg} y1="-100" y2={deg % 90 === 0 ? -86 : deg % 15 === 0 ? -91 : -95} stroke="var(--muted)" strokeWidth={deg % 90 === 0 ? 2 : 1} transform={`rotate(${deg})`} />
              ))}
              <text y="-66" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--danger)">{t("qibla.north")}</text>
              {/* Qibla marker lives on the dial, at the Qibla bearing */}
              <g transform={`rotate(${bearing})`}>
                <line y1="-12" y2="-52" stroke="var(--green)" strokeWidth="4" strokeLinecap="round" />
                <polygon points="0,-62 -9,-48 9,-48" fill="var(--green)" />
                <rect x="-9" y="-86" width="18" height="18" rx="2" fill="var(--charcoal)" />
                <rect x="-9" y="-81" width="18" height="4" fill="var(--gold)" />
              </g>
              <circle r="6" fill="var(--charcoal)" />
            </svg>
          </div>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">{t("qibla.bearing")}</p>
          <p className="font-mono text-4xl font-bold tabular-nums text-[var(--green)]">
            {Math.round(bearing)}°
            <span className="ml-2 text-base font-medium text-[var(--muted)]">{t("qibla.fromNorth")}</span>
          </p>
          <p className="mt-2 min-h-6 text-center text-sm font-semibold" aria-live="polite">
            {live ? (aligned ? <span className="text-[var(--green)]">{t("qibla.aligned")}</span> : <span>{t("qibla.turn")}</span>) : null}
          </p>

          {status !== "active" && status !== "unsupported" && (
            <button type="button" onClick={start} className="mt-3 min-h-12 w-full rounded-xl bg-[var(--green)] px-4 font-semibold text-white">
              {t("qibla.enable")}
            </button>
          )}
        </section>

        <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-3.5">
          <span className="text-sm text-[var(--muted)]">{t("qibla.distance")}</span>
          <span className="font-mono text-lg font-bold tabular-nums">{formatDistance(distance)}</span>
        </div>

        {statusMessage ? <Notice>{statusMessage}</Notice> : <Notice>{t("qibla.calibrate")}</Notice>}
      </div>
    </>
  );
}
