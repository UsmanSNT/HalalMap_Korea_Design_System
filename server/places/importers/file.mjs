// Operator/admin file import (CSV or JSON). Every record must carry provenance: source + license
// (per row or via defaults). Rows outside South Korea or with an unknown kind are rejected, never guessed.

import { parseCsv, decodeText } from "../../lib/csv.mjs";
import { PLACE_KINDS } from "../repo.mjs";

const KOREA = { minLat: 32.5, maxLat: 39.5, minLng: 124, maxLng: 132.5 };
const HALAL_STATUSES = ["certified", "muslim-owned", "halal-friendly"];

const pickFirst = (row, ...keys) => {
  for (const key of keys) if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") return String(row[key]).trim();
  return null;
};

export const normalizeFileRecord = (row, defaults = {}) => {
  const kindRaw = (pickFirst(row, "kind", "type") ?? "").replace("-", "_");
  const kind = kindRaw === "prayerroom" ? "prayer_room" : kindRaw;
  if (!PLACE_KINDS.includes(kind)) return { error: `unknown kind "${kindRaw}"` };
  const name = pickFirst(row, "name", "name_ko", "nameKo", "name_en", "nameEn");
  if (!name) return { error: "missing name" };
  const latRaw = pickFirst(row, "lat", "latitude");
  const lngRaw = pickFirst(row, "lng", "lon", "longitude");
  const lat = latRaw === null ? NaN : Number(latRaw);
  const lng = lngRaw === null ? NaN : Number(lngRaw);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  if (hasCoords && (lat < KOREA.minLat || lat > KOREA.maxLat || lng < KOREA.minLng || lng > KOREA.maxLng)) return { error: "coordinates outside South Korea" };

  const source = pickFirst(row, "source") ?? defaults.source;
  const license = pickFirst(row, "license", "licence") ?? defaults.license;
  if (!source) return { error: "missing source (provenance is required)" };
  if (!license) return { error: "missing license (provenance is required)" };

  const halalStatus = pickFirst(row, "halal_status", "halalStatus");
  if (halalStatus && !HALAL_STATUSES.includes(halalStatus)) return { error: `invalid halal_status "${halalStatus}"` };

  return {
    record: {
      kind,
      name,
      nameKo: pickFirst(row, "name_ko", "nameKo"),
      nameEn: pickFirst(row, "name_en", "nameEn"),
      category: pickFirst(row, "category", "cuisine"),
      halalStatus,
      halalEvidence: pickFirst(row, "halal_evidence", "halalEvidence"),
      certBody: pickFirst(row, "cert_body", "certBody"),
      address: pickFirst(row, "address") ?? "",
      city: pickFirst(row, "city"),
      province: pickFirst(row, "province"),
      lat: hasCoords ? lat : null,
      lng: hasCoords ? lng : null,
      phone: pickFirst(row, "phone"),
      website: pickFirst(row, "website"),
      openingHours: pickFirst(row, "opening_hours", "hours", "openingHours"),
      description: pickFirst(row, "description"),
      juma: pickFirst(row, "juma"),
      facilities: (pickFirst(row, "facilities") ?? "").split(/[;|]/).map((f) => f.trim()).filter(Boolean),
      source,
      sourceId: pickFirst(row, "source_id", "sourceId", "id") ?? `${source}:${name}:${lat}:${lng}`,
      sourceUrl: pickFirst(row, "source_url", "sourceUrl"),
      license,
      attribution: pickFirst(row, "attribution") ?? defaults.attribution ?? null,
      retrievedAt: pickFirst(row, "retrieved_at", "retrievedAt") ?? new Date().toISOString(),
      dataOrigin: "imported",
    },
  };
};

/** @param {Buffer|string} content */
export const parsePlacesFile = (content, filename, defaults = {}) => {
  const text = Buffer.isBuffer(content) ? decodeText(content) : content;
  let rows;
  if (/\.json$/i.test(filename)) {
    const parsed = JSON.parse(text);
    rows = Array.isArray(parsed) ? parsed : parsed.places ?? [];
  } else rows = parseCsv(text).records;
  const records = [];
  const errors = [];
  rows.forEach((row, index) => {
    const result = normalizeFileRecord(row, defaults);
    if (result.error) errors.push({ row: index + 1, error: result.error });
    else records.push(result.record);
  });
  return { records, errors };
};
