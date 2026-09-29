import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { nowIso } from "../db.mjs";
import { contentHash, recordImportRun, upsertImportedPlace } from "./repo.mjs";

const seedDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "seed");
const snapshotsDir = resolve(seedDir, "places");

export const loadDemoSeed = () => JSON.parse(readFileSync(resolve(seedDir, "demo-places.json"), "utf8"));

/** Inserts the fictional demo places (tagged data_origin=demo) once. */
export const seedDemoPlaces = (db) => {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO places (id, kind, name, name_ko, subtitle, category, halal_status, cert_body, address, phone, opening_hours,
      description, facilities, juma, photo, data_origin, verification_status, source, source_id, license, extra)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo', 'unverified', 'demo_seed', ?, 'n/a — fictional demonstration data', ?)
  `);
  let count = 0;
  for (const p of loadDemoSeed().places) {
    const result = insert.run(p.id, p.kind, p.name, p.nameKo ?? null, p.subtitle ?? null, p.category ?? null, p.halalStatus ?? null, p.certBody ?? null,
      p.address ?? null, p.phone ?? null, p.openingHours ?? null, p.description ?? null, JSON.stringify(p.facilities ?? []), p.juma ?? null,
      p.photo ?? null, p.id, JSON.stringify(p.extra ?? {}));
    count += Number(result.changes);
  }
  return count;
};

/** Loads committed snapshot files (output of the importers). Skips files whose content hash was already imported. */
export const seedPlaceSnapshots = (db) => {
  if (!existsSync(snapshotsDir)) return [];
  const results = [];
  for (const file of readdirSync(snapshotsDir).filter((name) => name.endsWith(".json")).sort()) {
    const text = readFileSync(resolve(snapshotsDir, file), "utf8");
    const hash = contentHash(text);
    const already = db.prepare("SELECT id FROM import_runs WHERE source = ? AND detail = ? AND status = 'ok'").get(`snapshot:${file}`, hash);
    if (already) {
      results.push({ file, skipped: true });
      continue;
    }
    const startedAt = nowIso();
    const doc = JSON.parse(text);
    const stats = { inserted: 0, updated: 0, merged: 0 };
    for (const record of doc.places ?? []) {
      const { action } = upsertImportedPlace(db, record);
      stats[action] += 1;
    }
    recordImportRun(db, { source: `snapshot:${file}`, kind: "places", startedAt, inserted: stats.inserted, updated: stats.updated + stats.merged, detail: hash });
    if (doc.meta?.source) {
      const n = db.prepare("SELECT COUNT(*) AS n FROM places WHERE source = ?").get(doc.meta.source).n;
      db.prepare("UPDATE data_sources SET last_import_at = ?, record_count = ? WHERE key = ?").run(doc.meta.generatedAt ?? nowIso(), n, doc.meta.source);
    }
    results.push({ file, ...stats });
  }
  return results;
};
