import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = resolve(process.argv[2] || "server/data/halalmap.sqlite");
const outputPath = resolve(process.argv[3] || "data/imports/osm-korea-core.json");
const db = new DatabaseSync(dbPath, { readOnly: true });
const rows = db.prepare(`
  SELECT raw_payload_json
  FROM place_sources
  WHERE source_name = 'OpenStreetMap' AND raw_payload_json IS NOT NULL
  ORDER BY source_record_id
`).all();
const elements = rows.map((row) => JSON.parse(row.raw_payload_json));
if (elements.length === 0) throw new Error("No cached OpenStreetMap source payloads found");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  version: 0.6,
  generator: "HalalMap Korea cached Overpass snapshot",
  osm3s: {
    copyright: "Data from OpenStreetMap, available under ODbL 1.0",
  },
  elements,
}, null, 2)}\n`, "utf8");
console.log(`Exported ${elements.length} OpenStreetMap elements to ${outputPath}`);
