import { useEffect, useRef, useState, type FormEvent } from "react";
import type { CuisineId, HalalStatus } from "@/data/restaurants";
import { ApiError } from "@/lib/api";
import { submitPlace, uploadPhoto, type PlaceKind } from "@/lib/communityApi";
import { compressToJpeg } from "@/lib/image";
import { useLocation } from "@/lib/location";
import type { Coords } from "@/lib/geo";
import type { TranslationKey } from "@/locale/dictionaries";
import { useLanguage } from "@/locale/LanguageContext";
import Field, { INPUT_CLASS } from "@/ui/Field";
import { PinIcon } from "@/ui/icons";
import Segmented from "@/ui/Segmented";

const CUISINES: readonly CuisineId[] = ["korean", "turkish", "uzbek", "indian", "indonesian", "cafe", "other"];
const HALAL: readonly HalalStatus[] = ["certified", "muslim-owned", "halal-friendly", "unverified"];

type Status = "editing" | "sending" | "done";

function errorKey(error: unknown): TranslationKey {
  if (error instanceof ApiError) {
    if (error.code === "network") return "add.errorNetwork";
    if (error.code === "rate_limited") return "add.errorRate";
    if (error.code.endsWith("_phone_invalid")) return "add.errorPhone";
  }
  return "add.errorGeneric";
}

type Props = { open: boolean; onClose: () => void; defaultKind: PlaceKind };

/** Bottom-sheet form built on <dialog>, which supplies focus trapping, Esc to close and a backdrop. */
export default function AddPlaceSheet({ open, onClose, defaultKind }: Props) {
  const { t } = useLanguage();
  const { coords, isReal, refresh } = useLocation();
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("editing");
  const [error, setError] = useState<TranslationKey | null>(null);
  const [kind, setKind] = useState<PlaceKind>(defaultKind);
  const [picked, setPicked] = useState<Coords | null>(null);
  const [awaitingLocation, setAwaitingLocation] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      setKind(defaultKind);
      setStatus("editing");
      setError(null);
      setPicked(null);
      setPhoto(null);
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, defaultKind]);

  // The location button may have to wait for the GPS fix it triggered.
  useEffect(() => {
    if (awaitingLocation && isReal) {
      setPicked(coords);
      setAwaitingLocation(false);
    }
  }, [awaitingLocation, isReal, coords]);

  const useMyLocation = () => {
    if (isReal) setPicked(coords);
    else {
      setAwaitingLocation(true);
      refresh();
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) ?? "").trim();
    if (!get("name") || !get("address") || !get("contactPhone")) {
      setError("add.required");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      let photoId: string | undefined;
      if (photo) {
        try {
          photoId = await uploadPhoto(await compressToJpeg(photo));
        } catch (photoError) {
          if (photoError instanceof ApiError && photoError.code === "network") throw photoError;
          setError(photoError instanceof ApiError && photoError.code === "rate_limited" ? "add.errorRate" : "add.errorPhoto");
          setStatus("editing");
          return;
        }
      }
      await submitPlace({
        kind,
        name: get("name"),
        address: get("address"),
        ...(picked ? { lat: picked.lat, lng: picked.lng } : {}),
        ...(kind === "restaurant" ? { cuisine: (get("cuisine") || undefined) as CuisineId | undefined, halal: (get("halal") || undefined) as HalalStatus | undefined } : {}),
        placePhone: get("placePhone") || undefined,
        notes: get("notes") || undefined,
        contactName: get("contactName") || undefined,
        contactPhone: get("contactPhone"),
        photoId,
        website: get("website"),
      });
      setStatus("done");
    } catch (e) {
      setError(errorKey(e));
      setStatus("editing");
    }
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="add-title"
      className="m-0 mx-auto mt-auto max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[var(--cream)] p-0 text-[var(--charcoal)] backdrop:bg-black/50"
    >
      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="add-title" className="text-lg font-bold">
            {t("add.title")}
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-[var(--muted)]">
            {t("add.close")}
          </button>
        </div>

        {status === "done" ? (
          <div className="space-y-4 py-8 text-center">
            <p className="text-lg font-semibold text-[var(--green)]">{t("add.thanks")}</p>
            <button type="button" onClick={onClose} className="min-h-12 w-full rounded-xl bg-[var(--green)] font-semibold text-white">
              {t("add.close")}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <p className="text-sm text-[var(--muted)]">{t("add.intro")}</p>

            <div className="space-y-1.5">
              <span className="text-sm font-semibold">{t("add.kind")}</span>
              <Segmented
                label={t("add.kind")}
                value={kind}
                onChange={setKind}
                options={[
                  { value: "mosque", label: t("mosques.kindMosque") },
                  { value: "prayer-room", label: t("mosques.kindRoom") },
                  { value: "restaurant", label: t("add.kindRestaurant") },
                ]}
              />
            </div>

            <Field label={t("add.name")}>
              <input name="name" required maxLength={120} autoComplete="off" className={INPUT_CLASS} />
            </Field>
            <Field label={t("add.address")}>
              <input name="address" required maxLength={250} autoComplete="street-address" className={INPUT_CLASS} />
            </Field>

            {kind === "restaurant" && (
              <>
                <Field label={t("add.cuisine")}>
                  <select name="cuisine" defaultValue="other" className={INPUT_CLASS}>
                    {CUISINES.map((c) => (
                      <option key={c} value={c}>
                        {t(`cuisine.${c}` as const)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("add.halal")}>
                  <select name="halal" defaultValue="unverified" className={INPUT_CLASS}>
                    {HALAL.map((h) => (
                      <option key={h} value={h}>
                        {t(`food.${h}` as const)}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            <button
              type="button"
              onClick={useMyLocation}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white font-semibold"
            >
              <PinIcon className="h-5 w-5" />
              {picked ? t("add.locationSet") : t("add.useLocation")}
            </button>

            <Field label={t("add.placePhone")}>
              <input name="placePhone" type="tel" inputMode="tel" maxLength={20} autoComplete="off" className={INPUT_CLASS} />
            </Field>
            <div className="space-y-1.5">
              <span className="text-sm font-semibold">{t("add.photo")}</span>
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="" className="aspect-video w-full rounded-xl object-cover" />
                  <button type="button" onClick={() => setPhoto(null)} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-white font-semibold text-[var(--danger)]">
                    {t("add.photoRemove")}
                  </button>
                </div>
              ) : (
                <label className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-white font-semibold">
                  {t("add.photoPick")}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
                </label>
              )}
            </div>

            <Field label={t("add.notes")}>
              <textarea name="notes" maxLength={500} rows={2} className={`${INPUT_CLASS} py-2`} />
            </Field>

            <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-3">
              <Field label={t("add.contactName")}>
                <input name="contactName" maxLength={80} autoComplete="name" className={INPUT_CLASS} />
              </Field>
              <Field label={t("add.contactPhone")} hint={t("add.contactHelp")}>
                <input name="contactPhone" type="tel" inputMode="tel" required maxLength={20} autoComplete="tel" className={INPUT_CLASS} />
              </Field>
            </fieldset>

            {/* Honeypot: invisible to people and assistive tech; bots fill it and are silently dropped. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <input name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-[var(--danger)]">
                {t(error)}
              </p>
            )}

            <button type="submit" disabled={status === "sending"} className="min-h-12 w-full rounded-xl bg-[var(--green)] font-semibold text-white disabled:opacity-60">
              {status === "sending" ? t("add.sending") : t("add.submit")}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
