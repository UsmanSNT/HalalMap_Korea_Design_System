// Barcode -> product lookup:  local database first, then MFDS (Food Safety Korea), then Open Food Facts.
// External APIs are only called when the local record is missing/stale, results (including "not found" and errors)
// are remembered in lookup_log, and every provider is rate limited and gated by the data-source licence registry.

import { nowIso } from "../db.mjs";
import { normalizeBarcode } from "./barcode.mjs";
import { getProductByBarcode, upsertProduct } from "./store.mjs";
import { fetchOffProduct, OFF_SOURCE } from "./providers/openfoodfacts.mjs";
import { fetchMfdsProduct, isMfdsConfigured, isMfdsTermsAccepted, MFDS_SOURCE } from "./providers/mfds.mjs";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const TTL = {
  fresh: 30 * DAY,            // a local record younger than this is served without touching external APIs
  missingIngredients: DAY,    // records without ingredients are re-checked at most once a day
  notFound: 7 * DAY,          // "provider has no such barcode" is remembered for a week
  error: 10 * MINUTE,         // transient provider errors are retried after 10 minutes
};

const parseTime = (value) => (value ? Date.parse(value) : 0);
const blank = (value) => value === null || value === undefined || String(value).trim() === "";

/** A source may be used unless the registry marks its licence or usage as rejected. */
export const sourceUsable = (db, key) => {
  const row = db.prepare("SELECT license_status, usage_status FROM data_sources WHERE key = ?").get(key);
  return Boolean(row) && row.license_status !== "rejected" && row.usage_status !== "rejected";
};

const createLimiter = ({ perMinute, perDay }) => {
  const minuteHits = [];
  let day = { start: 0, count: 0 };
  return (now) => {
    while (minuteHits.length && minuteHits[0] <= now - MINUTE) minuteHits.shift();
    if (now - day.start >= DAY) day = { start: now, count: 0 };
    if (minuteHits.length >= perMinute || (perDay && day.count >= perDay)) return false;
    minuteHits.push(now);
    day.count += 1;
    return true;
  };
};

export const createLookupService = ({ db, rulesetCache, providers, now = () => Date.now(), env = process.env, fetchImpl = fetch }) => {
  const inflight = new Map();
  const list = providers ?? [
    {
      key: MFDS_SOURCE,
      notReady: () => (!isMfdsConfigured(env) ? "api_key_missing" : !isMfdsTermsAccepted(env) ? "terms_not_accepted" : null),
      limiter: createLimiter({ perMinute: Number(env.MFDS_MAX_PER_MINUTE || 30), perDay: Number(env.MFDS_MAX_PER_DAY || 1000) }),
      fetch: (code) => fetchMfdsProduct(code, { fetchImpl, env }),
      // MFDS is the official record: always consulted first when usable.
      needed: () => true,
    },
    {
      key: OFF_SOURCE,
      notReady: () => (env.OFF_DISABLED === "1" ? "disabled" : null),
      limiter: createLimiter({ perMinute: Number(env.OFF_MAX_PER_MINUTE || 60), perDay: null }),
      fetch: (code) => fetchOffProduct(code, { fetchImpl }),
      // Open Food Facts is only asked when the record is new, stale, or still lacks ingredients or an image.
      needed: (row, { stale }) => !row || stale || blank(row.ingredients_raw) || blank(row.image_url),
    },
  ];

  const readLog = db.prepare("SELECT outcome, checked_at FROM lookup_log WHERE barcode = ? AND provider = ?");
  const writeLog = db.prepare(`
    INSERT INTO lookup_log (barcode, provider, outcome, checked_at, detail) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (barcode, provider) DO UPDATE SET outcome = excluded.outcome, checked_at = excluded.checked_at, detail = excluded.detail
  `);

  const needsExternal = (row, refresh, t) =>
    refresh ||
    !row ||
    t - parseTime(row.last_checked_at) > TTL.fresh ||
    (blank(row.ingredients_raw) && t - parseTime(row.last_checked_at) > TTL.missingIngredients);

  const run = async (code, refresh) => {
    const tried = [];
    const t = now();
    let row = getProductByBarcode(db, code);
    let fetched = false;

    // A record an admin verified (with ingredients) is never refreshed from outside.
    const locked = row && row.verification_status === "verified" && !blank(row.ingredients_raw);

    if (!locked && needsExternal(row, refresh, t)) {
      const stale = Boolean(row) && (refresh || t - parseTime(row.last_checked_at) > TTL.fresh);
      for (const provider of list) {
        if (!sourceUsable(db, provider.key)) {
          tried.push({ provider: provider.key, outcome: "skipped", detail: "source_rejected" });
          continue;
        }
        const notReady = provider.notReady();
        if (notReady) {
          tried.push({ provider: provider.key, outcome: "skipped", detail: notReady });
          continue;
        }
        if (!provider.needed(row, { stale })) {
          tried.push({ provider: provider.key, outcome: "skipped", detail: "not_needed" });
          continue;
        }
        const previous = readLog.get(code, provider.key);
        if (previous && !refresh) {
          const age = t - previous.checked_at;
          if (previous.outcome === "not_found" && age < TTL.notFound) {
            tried.push({ provider: provider.key, outcome: "skipped", detail: "recent_not_found" });
            continue;
          }
          if (previous.outcome === "error" && age < TTL.error) {
            tried.push({ provider: provider.key, outcome: "skipped", detail: "recent_error" });
            continue;
          }
        }
        if (!provider.limiter(t)) {
          tried.push({ provider: provider.key, outcome: "skipped", detail: "rate_limited" });
          continue;
        }

        const result = await provider.fetch(code);
        writeLog.run(code, provider.key, result.outcome, now(), result.detail ?? null);
        tried.push({ provider: provider.key, outcome: result.outcome, ...(result.detail ? { detail: result.detail } : {}) });
        if (result.outcome === "found") {
          const ruleset = rulesetCache.get();
          upsertProduct(db, { ...result.product, barcode: code, retrievedAt: new Date(now()).toISOString() }, { ruleset });
          fetched = true;
          row = getProductByBarcode(db, code);
        }
      }
    }
    return { row, tried, fetched, cacheHit: Boolean(row) && !fetched };
  };

  return {
    /** @returns {Promise<{ok: false, error: string, message: string}|{ok: true, barcode: string, format: string, row: object|null, tried: object[], fetched: boolean, cacheHit: boolean}>} */
    async lookup(input, { refresh = false } = {}) {
      const normalized = normalizeBarcode(input);
      if (!normalized.ok) return normalized;
      const key = `${normalized.code}:${refresh ? 1 : 0}`;
      let promise = inflight.get(key);
      if (!promise) {
        promise = run(normalized.code, refresh).finally(() => inflight.delete(key));
        inflight.set(key, promise);
      }
      const result = await promise;
      return { ok: true, barcode: normalized.code, format: normalized.format, ...result };
    },
    providers: list,
    nowIso,
  };
};
