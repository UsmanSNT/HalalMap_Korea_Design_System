# Korea place data

## Architecture

Place records are not embedded in the frontend. `server/places-db.mjs` creates the `places` and `place_sources` SQLite tables. On a fresh database, `server/index.mjs` seeds `places` from `data/places/osm-korea.seed.json`. The frontend reads the data through `/api/places`; the legacy `/api/restaurants` and `/api/mosques` routes remain available for existing screens.

Each place retains its source name, source record ID, source URL, license, import/verification timestamps, raw source tags, active state, and verification state. The admin API supports creating, editing, verifying, and deactivating records.

## Imported source

### OpenStreetMap / Overpass API

- Source: OpenStreetMap contributors
- License: Open Data Commons Open Database License 1.0 (ODbL-1.0)
- License and attribution: https://www.openstreetmap.org/copyright
- Attribution displayed by the map UI: `© OpenStreetMap contributors`
- Snapshot: `data/imports/osm-korea-core.json`
- Normalized seed: `data/places/osm-korea.seed.json`
- Import report: `data/imports/osm-korea-core.report.json`

The normalized seed is derived from OpenStreetMap and must continue to be distributed under the ODbL requirements. Applications publicly using the data must retain visible OpenStreetMap attribution and provide access to the license information.

## Sources reviewed but not imported

### Korea Tourism Organization / VISITKOREA

VISITKOREA publishes the useful four-level restaurant classification used by this product: Halal Certified, Self-certified, Muslim Friendly, and Pork Free. The public site also provides Muslim-friendly restaurant and prayer-room guides. However, the official Korea Tourism Content Lab states that OpenAPI access requires an application/service key and warns against unauthorized caching or crawling of guide content. No KTO list or PDF was scraped or imported.

- Muslim-friendly categories: https://english.visitkorea.or.kr/svc/thingsToDo/subMuslimFriendly.do
- Official content/OpenAPI portal: https://api.visitkorea.or.kr/

A future KTO adapter should use an approved API key and preserve the provider's required attribution and usage terms.

### Korean public-data portals

Public-data portal results were reviewed, but no specific nationwide mosque/prayer-room/halal-restaurant dataset with both an immediately usable download/API and sufficiently clear reuse terms was identified during this implementation. Nothing from search result pages or third-party copies was imported.

## Normalization and deduplication

The importer maps OSM tags to `mosque`, `prayer_room`, `restaurant`, or `halal_market`. Restaurant status is one of `halal_certified`, `self_certified`, `muslim_friendly`, `pork_free`, or `unknown`. Certification is never inferred from a business name. Missing coordinates cause a record to be rejected; coordinates are never guessed.

Duplicates are detected within the same place type when records are within 75 meters and have a normalized matching name or address. Source element identity is also unique by `source_name + source_record_id`. The import is idempotent and updates existing source records instead of inserting copies.

## Updating the dataset

Run a live Overpass refresh when the public service is available:

```powershell
pnpm places:import
```

The public Overpass service may throttle or time out. The importer refuses incomplete, remarked, or empty responses and will not replace the last known-good snapshot in those cases. An alternate endpoint can be provided:

```powershell
node scripts/import-places.mjs --fetch --deactivate-missing --endpoint https://overpass.kumi.systems/api/interpreter
```

To rebuild the local database from the committed snapshot without network access:

```powershell
pnpm places:seed
```

For a targeted refresh, use `--query-index 0`, `1`, or `2` and a distinct `--input`/`--report` path. Review the generated report before replacing the committed snapshot.

## Current snapshot limitations

OpenStreetMap coverage is community-maintained and incomplete. The current snapshot has many missing addresses, phone numbers, websites, translated names, facility fields, and certification details. Zero prayer-room or halal-market records met the conservative standard-tag query at import time. Admin verification is required before presenting imported claims as verified facts.
