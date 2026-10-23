import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { CuisineId, HalalStatus } from "@/data/restaurants";
import { ApiError } from "@/lib/api";
import {
  approveSubmission,
  fetchPendingSubmissions,
  rejectSubmission,
  type AdminSubmission,
} from "@/lib/communityApi";
import { mapsSearchUrl } from "@/lib/geo";
import type { TranslationKey } from "@/locale/dictionaries";
import { useLanguage } from "@/locale/LanguageContext";
import { navigateTo } from "@/services/navigation";
import Field, { INPUT_CLASS } from "@/ui/Field";
import { LANGUAGES } from "@/locale/dictionaries";

const TOKEN_KEY = "halalmap-admin-token"; // sessionStorage: cleared when the tab closes
const HALAL: readonly HalalStatus[] = ["certified", "muslim-owned", "halal-friendly", "unverified"];

const readToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
};
const writeToken = (value: string) => {
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // token simply is not remembered
  }
};

/** Parses "37.534, 126.995" (as copied from a maps app) into coordinates. */
function parseCoords(value: string): { lat: number; lng: number } | null {
  const m = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)$/);
  return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null;
}

function authErrorKey(e: unknown): TranslationKey {
  if (e instanceof ApiError) {
    if (e.status === 401) return "admin.errorAuth";
    if (e.status === 503) return "admin.errorDisabled";
    if (e.code === "network") return "add.errorNetwork";
  }
  return "admin.errorGeneric";
}

function SubmissionCard({ item, token, onDone }: { item: AdminSubmission; token: string; onDone: () => void }) {
  const { t } = useLanguage();
  const [error, setError] = useState<TranslationKey | null>(null);
  const [busy, setBusy] = useState(false);
  const isRestaurant = item.kind === "restaurant";
  const initialCoords = item.lat !== null && item.lng !== null ? `${item.lat}, ${item.lng}` : "";

  const approve = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (n: string) => String(form.get(n) ?? "").trim();
    const coords = parseCoords(get("coords"));
    if (!coords) return setError("admin.errorGeneric");
    setBusy(true);
    setError(null);
    try {
      await approveSubmission(token, item.id, {
        name: get("name") || undefined,
        nameKo: get("nameKo") || undefined,
        ...coords,
        ...(isRestaurant ? { halal: (get("halal") || undefined) as HalalStatus | undefined, cuisine: (item.cuisine ?? undefined) as CuisineId | undefined } : {}),
        ...(get("open") && get("close") ? { open: get("open"), close: get("close") } : {}),
        adminNote: get("adminNote") || undefined,
      });
      onDone();
    } catch (e) {
      setError(authErrorKey(e));
      setBusy(false);
    }
  };

  const reject = async (form: HTMLFormElement | null) => {
    setBusy(true);
    setError(null);
    try {
      await rejectSubmission(token, item.id, String(new FormData(form ?? undefined).get("adminNote") ?? "").trim() || undefined);
      onDone();
    } catch (e) {
      setError(authErrorKey(e));
      setBusy(false);
    }
  };

  return (
    <li className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <form onSubmit={approve} className="space-y-3">
        <p className="text-xs font-bold uppercase text-[var(--green)]">
          {item.kind === "restaurant" ? t("add.kindRestaurant") : item.kind === "mosque" ? t("mosques.kindMosque") : t("mosques.kindRoom")}
        </p>
        <Field label={t("add.name")}>
          <input name="name" defaultValue={item.name} className={INPUT_CLASS} />
        </Field>
        <Field label={t("admin.nameKo")}>
          <input name="nameKo" className={INPUT_CLASS} />
        </Field>
        <p className="text-sm">
          {item.address}{" "}
          <a href={mapsSearchUrl(item.address)} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--green)] underline">
            {t("act.map")}
          </a>
        </p>
        <Field label={t("admin.coords")} hint={t("admin.coordsHelp")}>
          <input name="coords" defaultValue={initialCoords} inputMode="decimal" placeholder="37.5346, 126.9999" className={INPUT_CLASS} />
        </Field>
        {isRestaurant && (
          <Field label={t("add.halal")}>
            <select name="halal" defaultValue={item.halal ?? "unverified"} className={INPUT_CLASS}>
              {HALAL.map((h) => (
                <option key={h} value={h}>
                  {t(`food.${h}` as const)}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("admin.opens")}>
            <input name="open" type="time" className={INPUT_CLASS} />
          </Field>
          <Field label={t("admin.closes")}>
            <input name="close" type="time" className={INPUT_CLASS} />
          </Field>
        </div>
        {item.notes && <p className="rounded-xl bg-[var(--cream)] p-3 text-sm">{item.notes}</p>}
        <div className="rounded-xl bg-[var(--gold-light)] p-3 text-sm">
          <p className="font-semibold">{t("admin.contact")}</p>
          <a href={`tel:${item.contactPhone}`} className="block min-h-11 py-2 text-base font-bold text-[var(--green)]">
            {item.contactName ? `${item.contactName} · ` : ""}
            {item.contactPhone}
          </a>
          {item.placePhone && (
            <a href={`tel:${item.placePhone}`} className="block min-h-11 py-2 text-[var(--muted)]">
              {item.placePhone}
            </a>
          )}
        </div>
        <Field label={t("admin.note")}>
          <input name="adminNote" maxLength={500} className={INPUT_CLASS} />
        </Field>
        {error && (
          <p role="alert" className="text-sm font-medium text-[var(--danger)]">
            {t(error)}
          </p>
        )}
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="min-h-12 flex-1 rounded-xl bg-[var(--green)] font-semibold text-white disabled:opacity-60">
            {t("admin.approve")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={(e) => reject(e.currentTarget.form)}
            className="min-h-12 rounded-xl border border-[var(--border)] px-4 font-semibold text-[var(--danger)] disabled:opacity-60"
          >
            {t("admin.reject")}
          </button>
        </div>
      </form>
    </li>
  );
}

/** Internal moderation screen at #/admin. Not linked from the app UI. Access is enforced by the API token. */
export default function AdminScreen() {
  const { t, lang, setLang } = useLanguage();
  const [token, setToken] = useState(readToken);
  const [items, setItems] = useState<AdminSubmission[] | null>(null);
  const [error, setError] = useState<TranslationKey | null>(null);

  const load = useCallback(async (value: string) => {
    try {
      setItems(await fetchPendingSubmissions(value));
      setError(null);
      writeToken(value);
    } catch (e) {
      setItems(null);
      setError(authErrorKey(e));
      if (e instanceof ApiError && e.status === 401) writeToken("");
    }
  }, []);

  useEffect(() => {
    if (token) void load(token);
    // initial load only; later loads are explicit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("token") ?? "").trim();
    setToken(value);
    void load(value);
  };

  const signOut = () => {
    writeToken("");
    setToken("");
    setItems(null);
  };

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-3 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-[0_1px_0_var(--border)]">
        <h1 className="text-lg font-bold">{t("admin.title")}</h1>
        <div className="flex items-center gap-2">
          <select aria-label={t("lang.label")} value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} className="min-h-10 rounded-lg bg-[var(--cream)] px-2 text-sm font-semibold">
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          {items && (
            <button type="button" onClick={signOut} className="min-h-10 rounded-lg px-2 text-sm font-semibold text-[var(--muted)]">
              {t("admin.signOut")}
            </button>
          )}
          <button type="button" onClick={() => navigateTo("prayer", true)} aria-label={t("add.close")} className="min-h-10 rounded-lg px-2 text-sm font-semibold text-[var(--muted)]">
            ✕
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {items === null ? (
          <form onSubmit={signIn} className="space-y-3">
            <Field label={t("admin.token")}>
              <input name="token" type="password" autoComplete="off" required className={INPUT_CLASS} />
            </Field>
            {error && (
              <p role="alert" className="text-sm font-medium text-[var(--danger)]">
                {t(error)}
              </p>
            )}
            <button type="submit" className="min-h-12 w-full rounded-xl bg-[var(--green)] font-semibold text-white">
              {t("admin.signIn")}
            </button>
          </form>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--muted)]">{t("admin.empty")}</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <SubmissionCard key={item.id} item={item} token={token} onDone={() => void load(token)} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
