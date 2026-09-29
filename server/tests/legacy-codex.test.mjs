import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openDatabase } from "../db.mjs";
import { createApi } from "../app.mjs";
import { legacyRowToRecord } from "../places/legacy-codex.mjs";

// The table shape written by the earlier places implementation (branch codex/server-snapshot-2026-09-26).
const LEGACY_SCHEMA = `
  CREATE TABLE places (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, name_ko TEXT, name_en TEXT,
    type TEXT NOT NULL CHECK (type IN ('mosque', 'prayer_room', 'restaurant', 'halal_market')),
    category TEXT, address TEXT, latitude REAL NOT NULL, longitude REAL NOT NULL, phone TEXT, website TEXT,
    halal_status TEXT NOT NULL DEFAULT 'unknown', certification TEXT,
    has_prayer_room INTEGER, has_wudu INTEGER, has_women_prayer_area INTEGER,
    source_name TEXT NOT NULL, source_url TEXT NOT NULL, source_license TEXT NOT NULL, source_record_id TEXT NOT NULL,
    last_verified_at TEXT, source_updated_at TEXT, verification_status TEXT NOT NULL DEFAULT 'imported',
    is_active INTEGER NOT NULL DEFAULT 1, raw_tags_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source_name, source_record_id)
  );
  CREATE TABLE place_sources (
    place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE, source_name TEXT NOT NULL, source_record_id TEXT NOT NULL,
    source_url TEXT NOT NULL, source_license TEXT NOT NULL, imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, raw_payload_json TEXT,
    PRIMARY KEY (place_id, source_name, source_record_id)
  );
  CREATE INDEX idx_places_type_active ON places(type, is_active);
  CREATE INDEX idx_places_halal_active ON places(halal_status, is_active);
  CREATE INDEX idx_places_coordinates ON places(latitude, longitude);
  CREATE INDEX idx_places_verification ON places(verification_status, is_active);
`;

const insertLegacy = (db, row) => {
  const r = {
    name_ko: null, name_en: null, category: null, address: null, phone: null, website: null, halal_status: "unknown", certification: null,
    has_prayer_room: null, has_wudu: null, has_women_prayer_area: null, source_name: "OpenStreetMap", source_license: "ODbL-1.0",
    verification_status: "imported", is_active: 1, ...row,
  };
  const columns = Object.keys(r);
  db.prepare(`INSERT INTO places (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`).run(...Object.values(r));
};

const legacyDatabase = () => {
  const dir = mkdtempSync(resolve(tmpdir(), "halalmap-legacy-"));
  const path = resolve(dir, "halalmap.sqlite");
  const old = new DatabaseSync(path);
  old.exec(LEGACY_SCHEMA);
  insertLegacy(old, { id: "osm-node-11380804001", name: "Om Restaurant", name_ko: "옴레스토랑", name_en: "Om Restaurant", type: "restaurant", category: "indian", address: "서울특별시 종로구 새문안로 103", latitude: 37.5705318, longitude: 126.9760937, halal_status: "muslim_friendly", source_url: "https://www.openstreetmap.org/node/11380804001", source_record_id: "node/11380804001" });
  insertLegacy(old, { id: "osm-way-1", name: "Some Mosque", name_en: "Some Mosque", type: "mosque", latitude: 37.53, longitude: 126.99, has_wudu: 1, has_women_prayer_area: 1, source_url: "https://www.openstreetmap.org/way/1", source_record_id: "way/1" });
  insertLegacy(old, { id: "osm-node-2", name: "Claims Cert", type: "restaurant", latitude: 37.5, longitude: 127, halal_status: "halal_certified", certification: "KMF", source_url: "https://www.openstreetmap.org/node/2", source_record_id: "node/2" });
  insertLegacy(old, { id: "manual-1", name: "Admin Added Halal Grill", type: "restaurant", latitude: 35.1, longitude: 129, halal_status: "halal_certified", certification: "KMF", source_name: "HalalMap Admin", source_url: "https://halalmap.kr/admin", source_license: "Proprietary first-party record", source_record_id: "manual-1", verification_status: "verified", last_verified_at: "2026-09-01T00:00:00Z" });
  insertLegacy(old, { id: "osm-node-3", name: "Retired Place", type: "restaurant", latitude: 37.4, longitude: 127.1, halal_status: "pork_free", source_url: "https://www.openstreetmap.org/node/3", source_record_id: "node/3", is_active: 0 });
  old.prepare("INSERT INTO place_sources (place_id, source_name, source_record_id, source_url, source_license) VALUES (?,?,?,?,?)").run("osm-way-1", "OpenStreetMap", "way/1", "https://www.openstreetmap.org/way/1", "ODbL-1.0");
  old.close();
  return { dir, path };
};

test("a database written by the earlier places implementation is upgraded without losing rows or provenance", () => {
  const { dir, path } = legacyDatabase();
  try {
    const db = openDatabase(path);
    const legacyTables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'legacy_codex_%' ORDER BY name").all().map((r) => r.name);
    assert.deepEqual(legacyTables, ["legacy_codex_place_sources", "legacy_codex_places"], "old tables are kept, not dropped");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM legacy_codex_places").get().n, 5);
    assert.ok(db.prepare("PRAGMA table_info(places)").all().some((c) => c.name === "kind"), "current schema in place");

    const places = Object.fromEntries(db.prepare("SELECT * FROM places").all().map((row) => [row.id, row]));
    assert.equal(Object.keys(places).length, 5);

    const om = places["osm-node-11380804001"];
    assert.equal(om.kind, "restaurant");
    assert.equal(om.halal_status, "halal-friendly");
    assert.equal(om.source, "osm");
    assert.equal(om.source_id, "node/11380804001");
    assert.equal(om.source_url, "https://www.openstreetmap.org/node/11380804001");
    assert.equal(om.license, "ODbL-1.0");
    assert.match(om.attribution, /OpenStreetMap contributors/);
    assert.equal(om.data_origin, "imported");
    assert.equal(om.verification_status, "unverified");
    assert.equal(om.lat, 37.5705318);

    assert.deepEqual(JSON.parse(places["osm-way-1"].facilities), ["우두 시설", "여성 기도실"]);
    assert.equal(places["osm-way-1"].halal_status, null, "mosques carry no halal status");

    // A community tag that only *claims* certification is never turned into "certified".
    assert.equal(places["osm-node-2"].halal_status, "halal-friendly");
    assert.match(places["osm-node-2"].halal_evidence, /not verified/);
    assert.equal(places["osm-node-2"].cert_body, "KMF");

    // An admin-created, admin-verified record keeps its certified status and origin.
    assert.equal(places["manual-1"].halal_status, "certified");
    assert.equal(places["manual-1"].data_origin, "admin");
    assert.equal(places["manual-1"].verification_status, "verified");
    assert.equal(places["manual-1"].last_verified_at, "2026-09-01T00:00:00Z");

    // Pork-free is not a halal claim; deactivated rows stay deactivated.
    assert.equal(places["osm-node-3"].halal_status, null);
    assert.equal(places["osm-node-3"].is_active, 0);

    // Idempotent: reopening neither duplicates nor re-imports.
    db.close();
    const again = openDatabase(path);
    assert.equal(again.prepare("SELECT COUNT(*) AS n FROM places").get().n, 5);
    again.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("carried-over OSM rows and the committed OSM snapshot describe the same place once", () => {
  const { dir, path } = legacyDatabase();
  try {
    const db = openDatabase(path);
    const server = createApi({ db, fetchImpl: async () => new Response("{}", { status: 404 }), env: {} });
    assert.ok(server);
    const rows = db.prepare("SELECT id FROM places WHERE source = 'osm' AND source_id = 'node/11380804001'").all();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, "osm-node-11380804001");
    server.close();
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a fresh database is unaffected and legacy mapping handles rows without optional data", () => {
  const db = openDatabase(":memory:");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name LIKE 'legacy_codex_%'").get().n, 0);
  const record = legacyRowToRecord({ id: "x", name: "X", type: "halal_market", latitude: 37, longitude: 127, halal_status: "unknown", source_name: "Other Source", source_url: "u", source_license: "l", source_record_id: "r", verification_status: "needs_review", is_active: 1, created_at: "2026-01-01 00:00:00" });
  assert.equal(record.kind, "market");
  assert.equal(record.verificationStatus, "needs_review");
  assert.equal(record.source, "Other Source");
  assert.equal(record.retrievedAt, "2026-01-01T00:00:00.000Z");
});
