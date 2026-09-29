// Upgrade path for databases created by the earlier "places" implementation (Codex branch
// codex/server-snapshot-2026-09-26: table `places` with type/latitude/longitude/source_name … columns).
//
// That table has the same name as the current one but a different shape. Before the migrations run, the old tables are
// renamed out of the way (never dropped); after they ran, every row is copied into the current schema exactly once.
// Provenance (source, URL, licence, record id) is kept, admin-created rows stay admin rows, and nothing the old
// implementation labelled from community tags is promoted to "certified".

import { nowIso, transaction } from "../db.mjs";
import { upsertImportedPlace } from "./repo.mjs";

const LEGACY_PLACES = "legacy_codex_places";
const LEGACY_SOURCES = "legacy_codex_place_sources";
const DONE_MARKER = "legacy_codex_places_imported";

const columnsOf = (db, table) => db.prepare(`PRAGMA table_info(${table})`).all().map((column) => column.name);
const tableExists = (db, table) => Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table));

/** Renames a legacy-shaped `places` table so migration 002 can create the current one. Returns true when it did. */
export const stashLegacyPlaces = (db) => {
  if (!tableExists(db, "places")) return false;
  const columns = columnsOf(db, "places");
  if (columns.includes("kind") || !columns.includes("latitude") || !columns.includes("source_name")) return false;
  if (tableExists(db, LEGACY_PLACES)) return false;
  db.exec("BEGIN");
  try {
    for (const index of ["idx_places_type_active", "idx_places_halal_active", "idx_places_coordinates", "idx_places_verification"]) db.exec(`DROP INDEX IF EXISTS ${index}`);
    db.exec(`ALTER TABLE places RENAME TO ${LEGACY_PLACES}`);
    if (tableExists(db, "place_sources") && columnsOf(db, "place_sources").includes("source_name")) db.exec(`ALTER TABLE place_sources RENAME TO ${LEGACY_SOURCES}`);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return true;
};

const SOURCE_KEYS = { openstreetmap: "osm", "osm": "osm", wikidata: "wikidata" };

const KIND = { mosque: "mosque", prayer_room: "prayer_room", restaurant: "restaurant", halal_market: "market" };
const VERIFICATION = { imported: "unverified", verified: "verified", needs_review: "needs_review" };

const hasContent = (value) => value !== null && value !== undefined && String(value).trim() !== "";

/** Maps a legacy row to the current record shape. Exported for tests. */
export const legacyRowToRecord = (row) => {
  const sourceKey = SOURCE_KEYS[String(row.source_name ?? "").toLowerCase()] ?? null;
  const isAdmin = /^manual-/.test(row.id) || row.source_name === "HalalMap Admin";
  const community = sourceKey === "osm" || sourceKey === "wikidata";
  const kind = KIND[row.type] ?? "restaurant";

  let halalStatus = null;
  let halalEvidence = null;
  if (kind === "restaurant" || kind === "market") {
    if (row.halal_status === "halal_certified") {
      if (row.verification_status === "verified" || !community) halalStatus = "certified";
      else {
        halalStatus = "halal-friendly";
        halalEvidence = `${row.source_name} tag claims certification${row.certification ? ` (${row.certification})` : ""} — not verified`;
      }
    } else if (row.halal_status === "self_certified") {
      halalStatus = "halal-friendly";
      halalEvidence = `${row.source_name}: self-declared halal, not certified`;
    } else if (row.halal_status === "muslim_friendly") {
      halalStatus = "halal-friendly";
      halalEvidence = community ? `${row.source_name} tag (community reported, not certified)` : null;
    } else if (row.halal_status === "pork_free") {
      halalEvidence = `${row.source_name}: reported pork-free — this is not a halal claim`;
    }
  }

  const facilities = [];
  if (row.has_wudu === 1) facilities.push("우두 시설");
  if (row.has_women_prayer_area === 1) facilities.push("여성 기도실");
  if ((kind === "restaurant" || kind === "market") && row.has_prayer_room === 1) facilities.push("기도 공간");

  return {
    id: row.id,
    kind,
    name: row.name,
    nameKo: row.name_ko,
    nameEn: row.name_en,
    category: row.category,
    halalStatus,
    halalEvidence,
    certBody: hasContent(row.certification) ? row.certification : null,
    address: row.address ?? "",
    lat: row.latitude,
    lng: row.longitude,
    phone: row.phone,
    website: row.website,
    facilities,
    source: sourceKey ?? row.source_name,
    sourceId: row.source_record_id,
    sourceUrl: row.source_url,
    license: row.source_license,
    attribution: sourceKey === "osm" ? "© OpenStreetMap contributors" : null,
    retrievedAt: row.created_at ? new Date(`${row.created_at.replace(" ", "T")}Z`).toISOString() : nowIso(),
    dataOrigin: isAdmin ? "admin" : "imported",
    verificationStatus: VERIFICATION[row.verification_status] ?? "unverified",
  };
};

/** Copies the stashed legacy rows into the current `places` table (once). Returns how many rows were carried over. */
export const importLegacyPlaces = (db) => {
  if (!tableExists(db, LEGACY_PLACES)) return 0;
  if (db.prepare("SELECT 1 FROM schema_migrations WHERE version = ?").get(DONE_MARKER)) return 0;
  const rows = db.prepare(`SELECT * FROM ${LEGACY_PLACES}`).all();
  return transaction(db, () => {
    let carried = 0;
    for (const row of rows) {
      const { id } = upsertImportedPlace(db, legacyRowToRecord(row));
      if (row.is_active === 0) db.prepare("UPDATE places SET is_active = 0 WHERE id = ?").run(id);
      if (row.last_verified_at && row.verification_status === "verified") db.prepare("UPDATE places SET last_verified_at = ? WHERE id = ?").run(row.last_verified_at, id);
      carried += 1;
    }
    db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(DONE_MARKER);
    return carried;
  });
};
