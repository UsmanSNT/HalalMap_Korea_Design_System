import { LANGUAGES } from "@/locale/dictionaries";
import { useLanguage } from "@/locale/LanguageContext";
import { useLocation } from "@/lib/location";
import { PinIcon } from "./icons";

/** Title, language switcher and the shared location status line. */
export default function PageHeader({ title }: { title: string }) {
  const { lang, setLang, t } = useLanguage();
  const { status, refresh } = useLocation();
  const locationText = t(`loc.${status}` as const);
  const canRetry = status === "denied" || status === "unavailable";

  return (
    <header className="shrink-0 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-[0_1px_0_var(--border)]">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-lg font-bold leading-tight">{title}</h1>
        <div role="radiogroup" aria-label={t("lang.label")} className="flex shrink-0 rounded-lg bg-[var(--cream)] p-0.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="radio"
              aria-checked={l.code === lang}
              onClick={() => setLang(l.code)}
              className={`min-h-9 rounded-md px-2.5 text-xs font-bold ${l.code === lang ? "bg-[var(--green)] text-white" : "text-[var(--muted)]"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]" aria-live="polite">
        <PinIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{locationText}</span>
        {canRetry && (
          <button type="button" onClick={refresh} className="min-h-8 shrink-0 px-2 font-bold text-[var(--green)]">
            {t("loc.retry")}
          </button>
        )}
      </p>
    </header>
  );
}
