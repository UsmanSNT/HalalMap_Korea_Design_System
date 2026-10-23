import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { fetchReviews, postReview, type ReviewList } from "@/lib/communityApi";
import { usePlaces } from "@/lib/PlacesContext";
import { readStored, writeStored } from "@/lib/storage";
import type { TranslationKey } from "@/locale/dictionaries";
import { useLanguage } from "@/locale/LanguageContext";
import Field, { INPUT_CLASS } from "@/ui/Field";
import { Stars, StarPicker } from "@/ui/Stars";

const reviewedKey = (placeId: string) => `halalmap-reviewed-${placeId}`;

function errorKey(error: unknown): TranslationKey {
  if (error instanceof ApiError) {
    if (error.code === "network") return "add.errorNetwork";
    if (error.code === "rate_limited") return "add.errorRate";
    if (error.code === "already_reviewed") return "reviews.already";
  }
  return "add.errorGeneric";
}

/** Ratings, comments and the review form for one place. Mount it only while the card is expanded. */
export default function ReviewsPanel({ placeId }: { placeId: string }) {
  const { t, lang } = useLanguage();
  const { refreshRatings } = usePlaces();
  const [data, setData] = useState<ReviewList | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<"editing" | "sending" | "done">(() => (readStored(reviewedKey(placeId)) ? "done" : "editing"));
  const [message, setMessage] = useState<TranslationKey | null>(null);

  const load = useCallback(() => {
    fetchReviews(placeId)
      .then((result) => {
        setData(result);
        setLoadFailed(false);
      })
      .catch(() => setLoadFailed(true));
  }, [placeId]);

  useEffect(load, [load]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (rating === 0) {
      setMessage("reviews.pickRating");
      return;
    }
    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) ?? "").trim();
    setMessage(null);
    setStatus("sending");
    try {
      await postReview({ placeId, rating, comment: get("comment") || undefined, name: get("name") || undefined, website: get("website") });
      writeStored(reviewedKey(placeId), "1");
      setStatus("done");
      setMessage("reviews.thanks");
      load();
      refreshRatings();
    } catch (error) {
      if (error instanceof ApiError && error.code === "already_reviewed") writeStored(reviewedKey(placeId), "1");
      setMessage(errorKey(error));
      setStatus(error instanceof ApiError && error.code === "already_reviewed" ? "done" : "editing");
    }
  };

  const dateFormat = new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section aria-label={t("reviews.title")} className="space-y-3 border-t border-[var(--border)] pt-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold">{t("reviews.title")}</h3>
        {data && data.avg !== null && (
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Stars value={data.avg} />
            {data.avg.toFixed(1)} <span className="font-normal text-[var(--muted)]">({data.count})</span>
          </span>
        )}
      </div>

      {loadFailed && <p className="text-sm text-[var(--muted)]">{t("add.errorNetwork")}</p>}
      {data && data.count === 0 && <p className="text-sm text-[var(--muted)]">{t("reviews.none")}</p>}

      {data && data.reviews.length > 0 && (
        <ul className="space-y-3">
          {data.reviews.map((review) => (
            <li key={review.id} className="rounded-xl bg-[var(--cream)] p-3">
              <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-2">
                  <Stars value={review.rating} size="h-3.5 w-3.5" />
                  <span className="font-semibold text-[var(--charcoal)]">{review.name ?? t("reviews.anonymous")}</span>
                </span>
                <time dateTime={new Date(review.createdAt).toISOString()}>{dateFormat.format(review.createdAt)}</time>
              </div>
              {review.comment && <p className="mt-1.5 whitespace-pre-line break-words text-sm">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}

      {status === "done" ? (
        message && <p role="status" className="text-sm font-semibold text-[var(--green)]">{t(message)}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-3" noValidate>
          <p className="text-sm font-semibold">{t("reviews.write")}</p>
          <StarPicker value={rating} onChange={setRating} />
          <Field label={t("reviews.comment")}>
            <textarea name="comment" maxLength={500} rows={3} className={`${INPUT_CLASS} py-2`} />
          </Field>
          <Field label={t("reviews.name")}>
            <input name="name" maxLength={40} autoComplete="nickname" className={INPUT_CLASS} />
          </Field>
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <input name="website" tabIndex={-1} autoComplete="off" />
          </div>
          {message && (
            <p role="alert" className="text-sm font-medium text-[var(--danger)]">
              {t(message)}
            </p>
          )}
          <button type="submit" disabled={status === "sending"} className="min-h-12 w-full rounded-xl bg-[var(--green)] font-semibold text-white disabled:opacity-60">
            {status === "sending" ? t("add.sending") : t("reviews.submit")}
          </button>
        </form>
      )}
    </section>
  );
}
