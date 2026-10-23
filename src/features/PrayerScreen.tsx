import { useMemo, useState } from "react";
import { formatGregorian, formatHijri } from "@/lib/dateLabels";
import { computePrayerTimes, formatClock, formatCountdown, PRAYER_ORDER, type AsrMethod, type PrayerId } from "@/lib/prayer";
import { useLocation } from "@/lib/location";
import { readStored, writeStored } from "@/lib/storage";
import { useNow } from "@/lib/useNow";
import { useLanguage } from "@/locale/LanguageContext";
import Notice from "@/ui/Notice";
import PageHeader from "@/ui/PageHeader";
import Segmented from "@/ui/Segmented";

const ASR_KEY = "halalmap-asr-method";

export default function PrayerScreen() {
  const { t, lang } = useLanguage();
  const { coords } = useLocation();
  const now = useNow(1000);
  const [asr, setAsr] = useState<AsrMethod>(() => (readStored(ASR_KEY) === "hanafi" ? "hanafi" : "standard"));

  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  // Recomputed per calendar day, position or method: never per second.
  /* eslint-disable react-hooks/exhaustive-deps */
  const times = useMemo(() => computePrayerTimes(now, coords, asr), [dayKey, coords, asr]);
  const tomorrowFajr = useMemo(
    () => computePrayerTimes(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), coords, asr).fajr,
    [dayKey, coords, asr],
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  const today = PRAYER_ORDER.find((id) => id !== "sunrise" && (times[id]?.getTime() ?? 0) > now.getTime());
  const upcoming: { id: PrayerId; at: Date; tomorrow: boolean } | null = today
    ? { id: today, at: times[today] as Date, tomorrow: false }
    : tomorrowFajr
      ? { id: "fajr", at: tomorrowFajr, tomorrow: true }
      : null;

  const changeAsr = (next: AsrMethod) => {
    setAsr(next);
    writeStored(ASR_KEY, next);
  };

  const gregorian = formatGregorian(now, lang);
  const hijri = formatHijri(now, lang);

  return (
    <>
      <PageHeader title={t("prayer.title")} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <section className="rounded-2xl bg-[var(--green)] p-5 text-white" aria-live="off">
          <p className="text-sm opacity-80">{t("prayer.next")}</p>
          {upcoming ? (
            <>
              <p className="mt-1 text-3xl font-bold">{t(`prayer.${upcoming.id}` as const)}</p>
              <p className="mt-1 text-lg">{formatClock(upcoming.at)}</p>
              <p className="mt-3 font-mono text-4xl font-bold tabular-nums" aria-label={`${t("prayer.in")} ${formatCountdown(upcoming.at.getTime() - now.getTime())}`}>
                {formatCountdown(upcoming.at.getTime() - now.getTime())}
              </p>
            </>
          ) : (
            <p className="mt-2">{t("prayer.unavailable")}</p>
          )}
          <p className="mt-4 text-xs opacity-80">
            {gregorian}
            {hijri ? ` · ${hijri}` : ""}
          </p>
        </section>

        <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
          {PRAYER_ORDER.map((id) => {
            const at = times[id];
            const isNext = upcoming?.id === id && !upcoming.tomorrow;
            const passed = !!at && at.getTime() <= now.getTime();
            return (
              <li
                key={id}
                aria-current={isNext ? "true" : undefined}
                className={`flex min-h-14 items-center justify-between px-4 ${isNext ? "bg-[var(--green-light)]" : ""} ${passed && !isNext ? "text-[var(--muted)]" : ""}`}
              >
                <span className={`text-base ${isNext ? "font-bold text-[var(--green)]" : "font-medium"}`}>{t(`prayer.${id}` as const)}</span>
                <span className={`font-mono text-lg tabular-nums ${isNext ? "font-bold text-[var(--green)]" : ""}`}>{formatClock(at)}</span>
              </li>
            );
          })}
        </ul>

        <div className="space-y-2">
          <p className="text-sm font-semibold">{t("prayer.asrMethod")}</p>
          <Segmented
            label={t("prayer.asrMethod")}
            value={asr}
            onChange={changeAsr}
            options={[
              { value: "standard", label: t("prayer.standard") },
              { value: "hanafi", label: t("prayer.hanafi") },
            ]}
          />
        </div>

        <Notice>{t("prayer.note")}</Notice>
      </div>
    </>
  );
}
