# Test fixtures

These JSON files are **synthetic**: they are shaped like the real responses of Open Food Facts (API v2),
Food Safety Korea (C005/C002), Overpass and Wikidata SPARQL so the adapters can be unit-tested offline.
The products/places in them are made up (names such as "테스트 과자" / "Test Halal Kitchen") and must never be
imported into a real database. Real data comes only from the live importers (`pnpm import:*`).
