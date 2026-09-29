# Korea place data (mosques, prayer rooms, halal restaurants, halal markets)

## Architecture

There is **one** place layer, shared by the map, the mosque/restaurant screens, the product scanner and the admin console:

* `server/migrations/002_sources_and_places.sql` — tables `places` (one row per place, with its own provenance columns) and
  `place_sources` (one row per source that contributed to a place).
* `server/places/repo.mjs` — queries, dedupe/merge (`upsertImportedPlace`), counts and attribution notices.
* `server/places/routes.mjs` — public API. `GET /api/places[?kind=mosque,restaurant&q=&lat=&lng=&limit=]` returns
  `places`, `total`, per-kind `counts` and the `attributions` the visible data requires (ODbL for OpenStreetMap);
  `GET /api/places/:id`; and the shapes the older screens use: `/api/restaurants[/:id[/menu]]`, `/api/mosques[/:id]`.
* `server/places/importers/` — `overpass.mjs` (OSM), `wikidata.mjs` (CC0), `file.mjs` (admin CSV/JSON).
* `server/places/seed.mjs` — loads the committed snapshots in `server/seed/places/*.json` on start (idempotent, skipped when the
  file's content hash was already imported) plus the fictional demo places.
* Admin: *Admin Console → 제품 스캐너 → 장소* — list with provenance, verify/needs-review/reject, hide/restore, **add a place by
  hand**, CSV/JSON import with mandatory provenance. API: `/api/admin/places` (GET, POST), `/api/admin/places/:id` (PATCH, DELETE = hide),
  `/api/admin/places/import`.
* UI: the map screen is a real OpenStreetMap map (Leaflet, loaded lazily) with a marker per place, kind filters with counts,
  and a detail sheet that shows the source, licence, retrieval date and a "community-reported, not certified" note.

Halal status values are `certified`, `muslim-owned`, `halal-friendly` or none. Tags from OpenStreetMap only ever produce
`halal-friendly` with the evidence text ("OpenStreetMap tag diet:halal=yes (community reported, not certified)");
`certified` needs an admin to set it after checking a certificate. Mosques and prayer rooms carry no halal status.

## Current data

| Source | Records | Notes |
|--------|---------|-------|
| OpenStreetMap (ODbL 1.0) | 33 — 11 mosques, 22 restaurants (0 prayer rooms, 0 markets) | Fetched by the Codex branch on 2026-09-28 (`data/imports/osm-korea-core.json`, report in `osm-korea-core.report.json`) and replayed through the current normaliser into `server/seed/places/osm-kr.json`. |
| Demo places | 10 (fictional) | Tagged `data_origin = demo`, hidden as soon as real places of the same group exist (so they are not visible at the moment). |

OpenStreetMap coverage is community-maintained and incomplete: many records lack addresses, phone numbers, websites,
translated names or facilities. Admin verification is required before presenting imported claims as verified facts.

Sources reviewed but not imported (KTO/VISITKOREA, KMF, public-data portals) and the reasons are in
[data-sources.md](data-sources.md).

## Updating the data

```
pnpm import:places -- --source osm --snapshot        # live Overpass query (needs internet) → writes server/seed/places/osm-kr.json and updates the database
pnpm import:places -- --source wikidata --snapshot   # Wikidata mosques (CC0)
pnpm import:places -- --source file --file places.csv --default-source "…" --default-license "…"
pnpm places:seed                                     # rebuild osm-kr.json from the saved Overpass response, no network
```

`--input <file> [--retrieved-at ISO]` replays a saved Overpass response instead of querying (that is what `places:seed`
does with the committed cache). `--no-db` writes only the snapshot. The *Import open data* GitHub Action runs the live
imports on a runner with internet access and can commit the refreshed snapshots.

Public Overpass instances are fair-use: run the import occasionally, never per user request. The importer stores the
result locally; the app never queries Overpass at runtime.

## Deduplication

Within one source a record is identified by `(source, source_id)`, so re-imports update instead of duplicating. A record
from a *different* source within 120 m with a similar name and the same kind is treated as the same place: the record is
merged and the extra source is added to `place_sources`. Records an admin verified are only filled in (blank fields),
never overwritten. Coordinates are never guessed: records without them are skipped by the importers.

## Databases created by the earlier places implementation

The Codex branch (`codex/server-snapshot-2026-09-26`) used a differently shaped `places` table. When the server opens a
database that has it, `server/places/legacy-codex.mjs` renames the old tables to `legacy_codex_places` /
`legacy_codex_place_sources` (they are kept, not dropped), runs the migrations and copies every row into the current schema once:
provenance is preserved, admin-created rows stay admin rows, deactivated rows stay deactivated, and a community tag that
merely *claimed* certification is imported as `halal-friendly` with the claim in the evidence text, never as `certified`.
