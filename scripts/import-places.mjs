// Imports restaurants / mosques / prayer rooms / halal markets from open sources into the HalalMap database.
//
//   node scripts/import-places.mjs --source osm [--snapshot] [--no-db]
//   node scripts/import-places.mjs --source osm --input data/imports/osm-korea-core.json [--retrieved-at ISO]   (replay a saved Overpass response, no network)
//   node scripts/import-places.mjs --source wikidata [--snapshot]
//   node scripts/import-places.mjs --source file --file places.csv --default-source "KTO" --default-license "KOGL Type 1"
//
// --snapshot  also writes server/seed/places/<source>-kr.json (committed snapshot, loaded on server start)
// --no-db     only write the snapshot, do not touch the database
// Every record keeps its provenance (source, source URL, licence, attribution, retrieved-at).

import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { nowIso, openDatabase } from "../server/db.mjs";
import { fetchOverpass, normalizeOsmResponse, OSM_ATTRIBUTION, OSM_LICENSE, OSM_SOURCE, OVERPASS_QUERY } from "../server/places/importers/overpass.mjs";
import { fetchWikidata, normalizeWikidataBindings, SPARQL_QUERY, WIKIDATA_ATTRIBUTION, WIKIDATA_LICENSE, WIKIDATA_SOURCE } from "../server/places/importers/wikidata.mjs";
import { parsePlacesFile } from "../server/places/importers/file.mjs";
import { recordImportRun, upsertImportedPlace } from "../server/places/repo.mjs";
import { seedDataSources } from "../server/products/seed.mjs";
import { sourceUsable } from "../server/products/lookup.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};

const source = option("source");
if (!["osm", "wikidata", "file"].includes(source)) {
  console.error("Usage: import-places.mjs --source osm|wikidata|file [--file path] [--snapshot] [--no-db]");
  process.exit(2);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const db = openDatabase();
seedDataSources(db);

const registryKey = source === "file" ? "admin_import" : source;
if (!sourceUsable(db, registryKey)) {
  console.error(`Source "${registryKey}" is marked as rejected in the data-source registry; refusing to import.`);
  process.exit(1);
}

const startedAt = nowIso();
let records = [];
let meta;

if (source === "osm") {
  const input = option("input");
  let body;
  let endpoint;
  let retrievedAt = startedAt;
  if (input) {
    // Offline replay of a previously saved Overpass response; the retrieval time is the time the data was fetched, not now.
    console.log(`Reading saved Overpass response ${input} …`);
    body = JSON.parse(readFileSync(input, "utf8"));
    endpoint = `file:${input}`;
    retrievedAt = option("retrieved-at") ?? body.osm3s?.timestamp_osm_base ?? statSync(input).mtime.toISOString();
  } else {
    console.log("Querying Overpass (OpenStreetMap, ODbL) …");
    ({ body, endpoint } = await fetchOverpass());
  }
  const result = normalizeOsmResponse(body, { retrievedAt });
  records = result.records;
  meta = { source: OSM_SOURCE, license: OSM_LICENSE, attribution: OSM_ATTRIBUTION, endpoint, osmBase: result.osmBase, retrievedAt, query: input ? null : OVERPASS_QUERY, ...(input ? { note: "Replay of a saved Overpass response; the queries that produced it are listed in data/imports/osm-korea-core.report.json." } : {}), skipped: result.skipped };
} else if (source === "wikidata") {
  console.log("Querying Wikidata (CC0) …");
  const result = normalizeWikidataBindings(await fetchWikidata(), { retrievedAt: startedAt });
  records = result.records;
  meta = { source: WIKIDATA_SOURCE, license: WIKIDATA_LICENSE, attribution: WIKIDATA_ATTRIBUTION, query: SPARQL_QUERY, skipped: result.skipped };
} else {
  const file = option("file");
  if (!file) {
    console.error("--file is required for --source file");
    process.exit(2);
  }
  const defaults = { source: option("default-source"), license: option("default-license"), attribution: option("default-attribution") };
  const result = parsePlacesFile(readFileSync(file), file, defaults);
  records = result.records;
  meta = { source: "admin_import", file, rejected: result.errors.length };
  for (const error of result.errors.slice(0, 20)) console.warn(`  row ${error.row}: ${error.error}`);
}

const startedAtForRun = meta.retrievedAt ?? startedAt;
console.log(`Normalised ${records.length} places.`, meta.skipped ? `Skipped: ${JSON.stringify(meta.skipped)}` : "");

if (flag("snapshot")) {
  const out = resolve(root, "server/seed/places", `${source === "file" ? "admin" : source}-kr.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify({ meta: { ...meta, generatedAt: startedAtForRun, count: records.length }, places: records }, null, 1) + "\n");
  console.log(`Snapshot written: ${out}`);
}

if (!flag("no-db")) {
  const stats = { inserted: 0, updated: 0, merged: 0 };
  for (const record of records) stats[upsertImportedPlace(db, record).action] += 1;
  recordImportRun(db, { source: registryKey, kind: "places", startedAt, inserted: stats.inserted, updated: stats.updated + stats.merged, skipped: Object.values(meta.skipped ?? {}).reduce((a, b) => a + b, 0) });
  console.log(`Database: inserted ${stats.inserted}, updated ${stats.updated}, merged ${stats.merged}.`);
}
