// Places (restaurants, mosques, prayer rooms, halal markets) — one table with per-record provenance.

import { createHash } from "node:crypto";
import { transaction, nowIso } from "../db.mjs";
import { parseJsonColumn } from "../lib/http.mjs";
import { normalizeKey } from "../products/ingredients/normalize.mjs";

export const PLACE_KINDS = ["restaurant", "mosque", "prayer_room", "market"];

const EARTH_KM = 6371;
export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(a));
};

const distanceText = (km) => (km < 1 ? `${Math.max(10, Math.round(km * 100) * 10)}m` : `${km < 10 ? km.toFixed(1) : Math.round(km)}km`);
const walkText = (km) => (km <= 3 ? `도보 ${Math.max(1, Math.round((km / 4.8) * 60))}분` : null);

const provenance = (row) => ({
  source: row.source,
  sourceId: row.source_id,
  sourceUrl: row.source_url,
  license: row.license,
  attribution: row.attribution,
  retrievedAt: row.retrieved_at,
  lastVerifiedAt: row.last_verified_at,
});

const base = (row, origin) => {
  const km = origin && row.lat != null && row.lng != null ? haversineKm(origin.lat, origin.lng, row.lat, row.lng) : null;
  const extra = parseJsonColumn(row.extra, {});
  return {
    id: row.id,
    kind: row.kind,
    name: row.name_en || row.name,
    nameKo: row.name_ko || row.name,
    lat: row.lat,
    lng: row.lng,
    address: row.address ?? "",
    phone: row.phone,
    website: row.website,
    photo: row.photo,
    distance: km == null ? extra.distance ?? "" : distanceText(km),
    distanceKm: km == null ? null : Math.round(km * 1000) / 1000,
    walkTime: km == null ? extra.walkTime ?? null : walkText(km),
    dataOrigin: row.data_origin,
    verificationStatus: row.verification_status,
    provenance: provenance(row),
  };
};

/** Shape the existing Restaurant UI expects (+ nullable delivery fields, which real places do not have). */
export const restaurantView = (row, origin) => ({
  ...base(row, origin),
  category: row.category ?? "other",
  halalStatus: row.halal_status,
  halalEvidence: row.halal_evidence,
  certBody: row.cert_body,
  // Rating and delivery data only exist for the demo restaurants; real places have none (null, not invented).
  rating: parseJsonColumn(row.extra, {}).rating ?? null,
  reviewCount: parseJsonColumn(row.extra, {}).reviewCount ?? 0,
  deliveryTime: parseJsonColumn(row.extra, {}).deliveryTime ?? null,
  deliveryFee: parseJsonColumn(row.extra, {}).deliveryFee ?? null,
  minOrder: parseJsonColumn(row.extra, {}).minOrder ?? null,
  hours: row.opening_hours ?? "",
  description: row.description ?? "",
});

/** Shape the existing Mosque UI expects (`type` uses a hyphen: "prayer-room"). */
export const mosqueView = (row, origin) => ({
  ...base(row, origin),
  subtitle: row.subtitle,
  type: row.kind === "prayer_room" ? "prayer-room" : "mosque",
  facilities: parseJsonColumn(row.facilities),
  juma: row.juma,
  hours: row.opening_hours ?? null,
});

export const placeView = (row, origin) => (row.kind === "mosque" || row.kind === "prayer_room" ? mosqueView(row, origin) : restaurantView(row, origin));

const escapeLike = (text) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * @param {object} opts
 * @param {string[]} opts.kinds
 * @param {{lat:number,lng:number}|null} [opts.origin]  sorts by distance when given
 */
export const queryPlaces = (db, { kinds = PLACE_KINDS, q, category, halalStatus, origin = null, radiusKm = null, limit = 100, offset = 0, includeRejected = false }) => {
  const validKinds = kinds.filter((kind) => PLACE_KINDS.includes(kind));
  if (validKinds.length === 0) return { total: 0, rows: [] };
  const where = [`p.kind IN (${validKinds.map(() => "?").join(",")})`, "p.is_active = 1"];
  const args = [...validKinds];
  if (!includeRejected) where.push("p.verification_status != 'rejected'");
  // Demo rows disappear as soon as real places of the same kind exist.
  where.push("(p.data_origin != 'demo' OR NOT EXISTS (SELECT 1 FROM places r WHERE r.kind = p.kind AND r.data_origin != 'demo' AND r.is_active = 1 AND r.verification_status != 'rejected'))");
  if (q) {
    const like = `%${escapeLike(q.toLowerCase())}%`;
    where.push("(lower(p.name) LIKE ? ESCAPE '\\' OR lower(COALESCE(p.name_ko,'')) LIKE ? ESCAPE '\\' OR lower(COALESCE(p.name_en,'')) LIKE ? ESCAPE '\\' OR lower(COALESCE(p.category,'')) LIKE ? ESCAPE '\\' OR lower(COALESCE(p.address,'')) LIKE ? ESCAPE '\\')");
    args.push(like, like, like, like, like);
  }
  if (category) {
    where.push("p.category = ?");
    args.push(category);
  }
  if (halalStatus) {
    where.push("p.halal_status = ?");
    args.push(halalStatus);
  }
  if (origin && radiusKm) {
    const dLat = radiusKm / 111;
    const dLng = radiusKm / (111 * Math.max(0.2, Math.cos((origin.lat * Math.PI) / 180)));
    where.push("p.lat BETWEEN ? AND ? AND p.lng BETWEEN ? AND ?");
    args.push(origin.lat - dLat, origin.lat + dLat, origin.lng - dLng, origin.lng + dLng);
  }
  let rows = db.prepare(`SELECT p.* FROM places p WHERE ${where.join(" AND ")} LIMIT 5000`).all(...args);
  if (origin) {
    rows = rows
      .map((row) => ({ row, km: row.lat != null && row.lng != null ? haversineKm(origin.lat, origin.lng, row.lat, row.lng) : Infinity }))
      .filter(({ km }) => !radiusKm || km <= radiusKm)
      .sort((a, b) => a.km - b.km)
      .map(({ row }) => row);
  } else {
    rows.sort((a, b) => (a.data_origin === "demo") - (b.data_origin === "demo") || a.name.localeCompare(b.name));
  }
  return { total: rows.length, rows: rows.slice(offset, offset + limit) };
};

export const getPlace = (db, id) => db.prepare("SELECT * FROM places WHERE id = ? AND is_active = 1").get(id) ?? null;

const nameKeyOf = (row) => [row.name, row.name_ko, row.name_en].filter(Boolean).map(normalizeKey).filter((k) => k.length >= 2);

const similarNames = (a, b) => {
  const left = nameKeyOf(a);
  const right = nameKeyOf(b);
  return left.some((x) => right.some((y) => x === y || (Math.min(x.length, y.length) >= 4 && (x.includes(y) || y.includes(x)))));
};

const blank = (v) => v === null || v === undefined || String(v).trim() === "";

/**
 * Inserts/merges an imported place.
 *  1. same (source, sourceId)          -> refresh
 *  2. same kind, <= 120 m, similar name -> the record is the same place seen by another source: merge, add provenance
 *  3. otherwise                          -> new place
 * Records an admin verified are only filled in (blank fields), never overwritten.
 * @returns {{id: string, action: 'inserted'|'updated'|'merged'}}
 */
export const upsertImportedPlace = (db, rec) => {
  const retrievedAt = rec.retrievedAt ?? nowIso();
  return transaction(db, () => {
    let action = "updated";
    let existing = rec.source && rec.sourceId
      ? db.prepare("SELECT * FROM places WHERE source = ? AND source_id = ?").get(rec.source, rec.sourceId)
      : null;

    if (!existing && rec.lat != null && rec.lng != null) {
      const dLat = 0.12 / 111;
      const dLng = 0.12 / (111 * Math.max(0.2, Math.cos((rec.lat * Math.PI) / 180)));
      const nearby = db.prepare("SELECT * FROM places WHERE kind = ? AND data_origin != 'demo' AND lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?")
        .all(rec.kind, rec.lat - dLat, rec.lat + dLat, rec.lng - dLng, rec.lng + dLng);
      const candidate = { name: rec.name, name_ko: rec.nameKo, name_en: rec.nameEn };
      const hasSource = db.prepare("SELECT 1 FROM place_sources WHERE place_id = ? AND source = ?");
      // Only merge with a place that another source contributed; two records of the same source stay separate.
      existing = nearby
        .filter((row) => row.source !== rec.source && !hasSource.get(row.id, rec.source))
        .map((row) => ({ row, km: haversineKm(rec.lat, rec.lng, row.lat, row.lng) }))
        .filter(({ km, row }) => km <= 0.12 && similarNames(row, candidate))
        .sort((a, b) => a.km - b.km)[0]?.row ?? null;
      if (existing) action = "merged";
    }

    let id;
    if (!existing) {
      id = rec.id ?? `${rec.source}-${rec.sourceId}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      db.prepare(`
        INSERT INTO places (id, kind, name, name_ko, name_en, subtitle, category, halal_status, halal_evidence, cert_body, address, city, province,
          lat, lng, phone, website, opening_hours, description, facilities, juma, photo, data_origin, verification_status,
          source, source_id, source_url, license, attribution, retrieved_at, extra)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, rec.kind, rec.name, rec.nameKo ?? null, rec.nameEn ?? null, rec.subtitle ?? null, rec.category ?? null,
        rec.halalStatus ?? null, rec.halalEvidence ?? null, rec.certBody ?? null, rec.address ?? null, rec.city ?? null, rec.province ?? null,
        rec.lat ?? null, rec.lng ?? null, rec.phone ?? null, rec.website ?? null, rec.openingHours ?? null, rec.description ?? null,
        JSON.stringify(rec.facilities ?? []), rec.juma ?? null, rec.photo ?? null, rec.dataOrigin ?? "imported", rec.verificationStatus ?? "unverified",
        rec.source ?? null, rec.sourceId ?? null, rec.sourceUrl ?? null, rec.license ?? null, rec.attribution ?? null, retrievedAt,
        JSON.stringify(rec.extra ?? {}),
      );
      action = "inserted";
    } else {
      id = existing.id;
      const locked = existing.verification_status === "verified" || existing.data_origin === "admin";
      const fill = (current, next) => (blank(next) ? current : blank(current) || (!locked && action === "updated") ? next : current);
      db.prepare(`
        UPDATE places SET name = ?, name_ko = ?, name_en = ?, subtitle = ?, category = ?, halal_status = ?, halal_evidence = ?, cert_body = ?,
          address = ?, city = ?, province = ?, lat = ?, lng = ?, phone = ?, website = ?, opening_hours = ?, description = ?, juma = ?, photo = ?,
          retrieved_at = ?, updated_at = ?
        WHERE id = ?
      `).run(
        fill(existing.name, rec.name), fill(existing.name_ko, rec.nameKo), fill(existing.name_en, rec.nameEn), fill(existing.subtitle, rec.subtitle),
        fill(existing.category, rec.category), fill(existing.halal_status, rec.halalStatus), fill(existing.halal_evidence, rec.halalEvidence),
        fill(existing.cert_body, rec.certBody), fill(existing.address, rec.address), fill(existing.city, rec.city), fill(existing.province, rec.province),
        fill(existing.lat, rec.lat), fill(existing.lng, rec.lng), fill(existing.phone, rec.phone), fill(existing.website, rec.website),
        fill(existing.opening_hours, rec.openingHours), fill(existing.description, rec.description), fill(existing.juma, rec.juma),
        fill(existing.photo, rec.photo), action === "updated" ? retrievedAt : existing.retrieved_at, nowIso(), id,
      );
    }

    if (rec.source) {
      db.prepare(`
        INSERT INTO place_sources (place_id, source, source_id, source_url, license, attribution, retrieved_at, raw)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (place_id, source) DO UPDATE SET source_id = excluded.source_id, source_url = excluded.source_url,
          license = excluded.license, attribution = excluded.attribution, retrieved_at = excluded.retrieved_at, raw = excluded.raw
      `).run(id, rec.source, rec.sourceId ?? null, rec.sourceUrl ?? null, rec.license ?? null, rec.attribution ?? null, retrievedAt, rec.raw ? JSON.stringify(rec.raw) : null);
    }
    return { id, action };
  });
};

export const placeSources = (db, id) =>
  db.prepare("SELECT source, source_id, source_url, license, attribution, retrieved_at FROM place_sources WHERE place_id = ?").all(id);

export const recordImportRun = (db, { source, kind, startedAt, status = "ok", inserted = 0, updated = 0, skipped = 0, detail = null }) => {
  db.prepare(`
    INSERT INTO import_runs (source, kind, started_at, finished_at, status, inserted, updated, skipped, detail)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(source, kind, startedAt, nowIso(), status, inserted, updated, skipped, detail);
  if (status === "ok") {
    const count = kind === "places"
      ? db.prepare("SELECT COUNT(*) AS n FROM places WHERE source = ? OR id IN (SELECT place_id FROM place_sources WHERE source = ?)").get(source, source).n
      : kind === "products"
        ? db.prepare("SELECT COUNT(*) AS n FROM product_sources WHERE source = ?").get(source).n
        : db.prepare("SELECT COUNT(*) AS n FROM ingredients WHERE source = ?").get(source).n;
    db.prepare("UPDATE data_sources SET last_import_at = ?, record_count = ? WHERE key = ?").run(nowIso(), count, source);
  }
};

export const contentHash = (text) => createHash("sha256").update(text).digest("hex").slice(0, 32);
