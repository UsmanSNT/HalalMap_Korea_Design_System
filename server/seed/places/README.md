# Place snapshots

`*.json` files in this folder are loaded into the database on server start (idempotent, by content hash).
They are produced by the importers, never hand-edited:

```
pnpm import:places -- --source osm --snapshot     # OpenStreetMap (ODbL) -> server/seed/places/osm-kr.json
pnpm import:places -- --source wikidata --snapshot # Wikidata (CC0)       -> server/seed/places/wikidata-kr.json
```

Format: `{ "meta": { source, license, attribution, generatedAt, count, ... }, "places": [ normalised records with provenance ] }`.
Committing a snapshot lets every deployment start with real data without needing network access to the publishers.
The GitHub Actions workflow `.github/workflows/import-open-data.yml` regenerates them and opens a pull request.

No snapshot is committed yet: the environment this feature was built in could not reach any of the publisher hosts.
