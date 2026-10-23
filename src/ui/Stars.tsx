import { useLanguage } from "@/locale/LanguageContext";

const STAR_PATH = "m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z";

function Star({ filled, className }: { filled: boolean; className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={filled ? "var(--gold)" : "none"} stroke="var(--gold)" strokeWidth="1.6" strokeLinejoin="round">
      <path d={STAR_PATH} />
    </svg>
  );
}

/** Read-only stars for a rating from 0 to 5 (rounded to the nearest whole star). */
export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  const { t } = useLanguage();
  return (
    <span role="img" aria-label={`${value} ${t("reviews.stars")}`} className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= Math.round(value)} className={size} />
      ))}
    </span>
  );
}

/** Radio-group star input; every star is a 44px touch target. */
export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const { t } = useLanguage();
  return (
    <div role="radiogroup" aria-label={t("reviews.rating")} className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${t("reviews.stars")}`}
          onClick={() => onChange(n)}
          className="flex h-11 w-11 items-center justify-center"
        >
          <Star filled={n <= value} className="h-8 w-8" />
        </button>
      ))}
    </div>
  );
}
