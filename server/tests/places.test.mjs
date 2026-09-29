import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { openDatabase } from "../db.mjs";
import { seedDataSources } from "../products/seed.mjs";
import { haversineKm, queryPlaces, restaurantView, mosqueView, upsertImportedPlace } from "../places/repo.mjs";
import { seedDemoPlaces } from "../places/seed.mjs";
import { normalizeOsmResponse } from "../places/importers/overpass.mjs";
import { normalizeWikidataBindings } from "../places/importers/wikidata.mjs";
import { fixture } from "./helpers.mjs";

const fresh = () => {
  const db = openDatabase(":memory:");
  seedDataSources(db);
  seedDemoPlaces(db);
  return db;
};
const importOsm = (db) => {
  const { records } = normalizeOsmResponse(fixture("overpass.json"), { retrievedAt: "2099-01-01T00:00:00Z" });
  return records.map((record) => upsertImportedPlace(db, record));
};

test("demo places are seeded once, tagged as demo and visible while no real data exists", () => {
  const db = fresh();
  assert.equal(seedDemoPlaces(db), 0, "idempotent");
  const restaurants = queryPlaces(db, { kinds: ["restaurant"] });
  assert.equal(restaurants.total, 6);
  assert.ok(restaurants.rows.every((r) => r.data_origin === "demo"));
  assert.equal(restaurantView(restaurants.rows[0]).dataOrigin, "demo");
  assert.match(restaurantView(restaurants.rows[0]).provenance.license, /fictional/);
});

test("real imported places hide the demo places of the same kind only", () => {
  const db = fresh();
  importOsm(db);
  const mosques = queryPlaces(db, { kinds: ["mosque", "prayer_room"] });
  assert.ok(mosques.rows.length >= 2);
  assert.ok(mosques.rows.every((r) => r.data_origin === "imported"));
  assert.equal(queryPlaces(db, { kinds: ["restaurant"] }).rows.length, 1, "OSM restaurant present -> demo restaurants hidden");
  assert.equal(queryPlaces(db, { kinds: ["market"] }).rows.length, 1);
});

test("import is idempotent and keeps provenance per record", () => {
  const db = fresh();
  const first = importOsm(db);
  assert.ok(first.every((r) => r.action === "inserted" || r.action === "merged"));
  const again = importOsm(db);
  assert.ok(again.every((r) => r.action === "updated"));
  const row = db.prepare("SELECT * FROM places WHERE source_id = 'node/900000001'").get();
  assert.equal(row.source, "osm");
  assert.equal(row.license, "ODbL 1.0");
  assert.equal(row.attribution, "© OpenStreetMap contributors");
  assert.equal(row.verification_status, "unverified");
  assert.equal(row.halal_status, null, "a mosque has no halal status");
  const src = db.prepare("SELECT * FROM place_sources WHERE place_id = ?").all(row.id);
  assert.equal(src.length, 1);
  assert.equal(JSON.parse(src[0].raw)["name:en"], "Test Mosque");
});

test("the same mosque from OSM and Wikidata (close by, same name) becomes ONE place with two provenance rows", () => {
  const db = fresh();
  importOsm(db);
  const before = db.prepare("SELECT COUNT(*) n FROM places WHERE kind = 'mosque' AND data_origin != 'demo'").get().n;
  const { records } = normalizeWikidataBindings(fixture("wikidata.json"), { retrievedAt: "2099-01-02T00:00:00Z" });
  const result = upsertImportedPlace(db, records[0]);
  assert.equal(result.action, "merged");
  assert.equal(db.prepare("SELECT COUNT(*) n FROM places WHERE kind = 'mosque' AND data_origin != 'demo'").get().n, before);
  const sources = db.prepare("SELECT source FROM place_sources WHERE place_id = ? ORDER BY source").all(result.id).map((s) => s.source);
  assert.deepEqual(sources, ["osm", "wikidata"]);
  assert.equal(db.prepare("SELECT website FROM places WHERE id = ?").get(result.id).website, "https://example.test/mosque", "first source's value is kept, blanks are filled");
});

test("two different mosques 40 m apart with different names stay separate", () => {
  const db = fresh();
  upsertImportedPlace(db, { kind: "mosque", name: "Alpha Masjid", lat: 37.5, lng: 127, source: "osm", sourceId: "node/1", license: "ODbL 1.0" });
  const r = upsertImportedPlace(db, { kind: "mosque", name: "Beta Center", lat: 37.50036, lng: 127, source: "wikidata", sourceId: "Q1", license: "CC0 1.0" });
  assert.equal(r.action, "inserted");
});

test("admin-verified places are only filled in, never overwritten by a re-import", () => {
  const db = fresh();
  const { records } = normalizeOsmResponse(fixture("overpass.json"));
  const mosque = records.find((r) => r.sourceId === "node/900000001");
  const { id } = upsertImportedPlace(db, mosque);
  db.prepare("UPDATE places SET verification_status = 'verified', name = 'Verified name', phone = NULL WHERE id = ?").run(id);
  upsertImportedPlace(db, { ...mosque, name: "Changed upstream", phone: "+82-2-111-1111" });
  const row = db.prepare("SELECT name, phone FROM places WHERE id = ?").get(id);
  assert.equal(row.name, "Verified name");
  assert.equal(row.phone, "+82-2-111-1111", "blank fields may still be filled");
});

test("distance sorting, radius filter and view shapes", () => {
  const db = fresh();
  importOsm(db);
  const origin = { lat: 37.5, lng: 127 };
  const near = queryPlaces(db, { kinds: ["mosque", "prayer_room"], origin });
  assert.equal(near.rows[0].source_id, "node/900000001");
  const view = mosqueView(near.rows[0], origin);
  assert.equal(view.type, "mosque");
  assert.equal(view.distance, "10m");
  assert.equal(queryPlaces(db, { kinds: ["mosque", "prayer_room"], origin, radiusKm: 0.5 }).rows.length, 2);
  assert.equal(queryPlaces(db, { kinds: ["mosque", "prayer_room"], origin, radiusKm: 0.0001 }).rows.length, 1, "only the mosque at the origin is inside a 10 cm radius");
  const restaurant = restaurantView(queryPlaces(db, { kinds: ["restaurant"], origin }).rows[0], origin);
  assert.equal(restaurant.rating, null, "no invented ratings");
  assert.equal(restaurant.deliveryFee, null);
  assert.equal(restaurant.halalStatus, "halal-friendly");
  assert.ok(restaurant.distanceKm > 1);
  assert.ok(Math.abs(haversineKm(37.5665, 126.978, 35.1796, 129.0756) - 325) < 5, "Seoul-Busan is about 325 km");
});

test("search, halal filter and inactive/rejected places", () => {
  const db = fresh();
  importOsm(db);
  assert.equal(queryPlaces(db, { kinds: ["restaurant"], q: "키친" }).rows.length, 1);
  assert.equal(queryPlaces(db, { kinds: ["restaurant"], q: "50%_" }).rows.length, 0, "LIKE wildcards are escaped");
  db.prepare("UPDATE places SET verification_status = 'rejected' WHERE source_id = 'way/900000003'").run();
  assert.equal(queryPlaces(db, { kinds: ["restaurant"] }).rows.length > 0, true, "rejected real place hidden -> demo shows again");
  assert.ok(queryPlaces(db, { kinds: ["restaurant"] }).rows.every((r) => r.data_origin === "demo"));
});

test("snapshot files are loaded on start and skipped when unchanged", async () => {
  const { seedPlaceSnapshots } = await import("../places/seed.mjs");
  const { records } = normalizeOsmResponse(fixture("overpass.json"), { retrievedAt: "2099-01-01T00:00:00Z" });
  // exercise the loader against the real folder path by temporarily writing a snapshot there
  const dir = new URL("../seed/places/", import.meta.url).pathname;
  const file = `${dir}zz-test-snapshot.json`;
  writeFileSync(file, JSON.stringify({ meta: { source: "osm", generatedAt: "2099-01-01T00:00:00Z" }, places: records }));
  try {
    const db = fresh();
    const first = seedPlaceSnapshots(db).find((r) => r.file === "zz-test-snapshot.json");
    assert.ok(first.inserted >= 4);
    assert.equal(seedPlaceSnapshots(db).find((r) => r.file === "zz-test-snapshot.json").skipped, true);
    assert.equal(db.prepare("SELECT record_count n FROM data_sources WHERE key = 'osm'").get().n >= 4, true);
  } finally {
    rmSync(file);
  }
});
