# Korea place data

## Architecture

The OSM snapshot (`data/imports/osm-korea-core.json`, raw Overpass response) is normalized by
`scripts/import-osm.mjs` into `src/data/osm.generated.json`, which is bundled into the web app, so mosques and
restaurants work offline. Community submissions approved at `#/admin` live in the API database (`server/index.mjs`)
and are merged on top at runtime (community entries win over OSM duplicates within 100 m).

`data/places/osm-korea.seed.json` is the normalized output of the earlier database-backed server; it is kept as a
provenance record only. Statuses map as: `halal_certified` to `certified`, `self_certified` to `self-certified`,
`muslim_friendly` to `halal-friendly`, `pork_free` to `pork-free`, `unknown` to `unverified`.

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

```
pnpm import:osm   # query Overpass, update the snapshot, rebuild src/data/osm.generated.json
pnpm build:osm    # rebuild src/data/osm.generated.json from the committed snapshot (offline)
```

Override the endpoint with `OVERPASS_URL` when the public service throttles. A refresh refuses incomplete, remarked or
empty responses and keeps the last good snapshot. Review the diff, commit, and redeploy.

## Current snapshot limitations

OpenStreetMap coverage is community-maintained and incomplete. The current snapshot has many missing addresses, phone numbers, websites, translated names, facility fields, and certification details. Zero prayer-room or halal-market records met the conservative standard-tag query at import time. Admin verification is required before presenting imported claims as verified facts.
