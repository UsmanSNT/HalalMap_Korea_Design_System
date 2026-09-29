# Product Scanner — barcode → product → ingredients → screening result

The scanner is part of the same platform as the map, mosque, prayer-room and restaurant features: same
SQLite database (`server/data/halalmap.sqlite`), same API server (`server/app.mjs`), same admin console
(`src/admin`), same mobile-web UI (`src/screens`).

It is a **screening aid, not a fatwa and not a certification**. It never decides halal/haram from a product
name, never guesses with AI, and every result names the ingredient, rule or certificate that produced it.

## Flow

```
camera / typed barcode ─▶ GET /api/products/lookup/:barcode
                            1. validate (EAN-13 / EAN-8 / UPC-A / UPC-E checksum, GTIN normalisation)
                            2. local database (verified > user-submitted > imported)
                            3. Food Safety Korea (MFDS)      — only with FOODSAFETYKOREA_API_KEY + terms acknowledged
                            4. Open Food Facts               — no key, custom User-Agent, rate limited
                            5. found  → stored with provenance, analysed, returned
                               not found → { found:false, next:["ingredient_photo","contribute"] } (cached as a miss)
ingredient text ────────▶ parser → matcher → DB rules → per-ingredient status → product status
label photo (원재료명) ──▶ on-device OCR (Tesseract.js kor+eng) → user edits/confirms → same analysis
"Contribute" ───────────▶ POST /api/product-submissions → pending → admin review → verified / rejected / needs_review
```

External APIs are only called when the local database has no fresh answer. Misses and errors are cached
(`lookup_log`) so the same unknown barcode does not hit an API on every scan; records an admin verified are never
overwritten by a refresh.

## Result statuses

| Status | Meaning | Comes from |
|--------|---------|------------|
| `HALAL_CERTIFIED` | A halal certificate exists for this product | A certificate that is **verified** by an admin (certificate number or verification URL), **valid** and **not expired**. Package claims copied from Open Food Facts are stored as *unverified* and never produce this status. |
| `NO_FLAGGED_INGREDIENTS` | No flagged ingredient was found in the ingredient list | Every ingredient was recognised and none is flagged or needs checking. **This is not a halal certification** and the UI says so. |
| `CHECK_REQUIRED` | Cannot be decided from the label | 젤라틴/gelatin, 콜라겐, 유화제, 글리세린, 효소, 향료, 지방산, 주정, … (source or process unknown), or a certified product that also lists a flagged ingredient (conflict). |
| `FLAGGED_INGREDIENT` | Contains an ingredient the rules flag | Pork terms (돼지, 돈육, 삼겹, 베이컨, 라드, pork, lard …), blood-derived ingredients, alcoholic beverages (wine, beer, mirin …), gelatin/collagen that is stated to be pork-derived — each with the rule and reason. |
| `UNKNOWN` | Not enough data | No ingredient list, or ingredients that could not be recognised. Unconfirmed OCR/typed text can raise flags but can never clear a product. |

The UI keeps *HALAL CERTIFIED* and *NO FLAGGED INGREDIENTS FOUND* visually and textually distinct.

## Rules engine (`server/products/`)

* `ingredients/parser.mjs` — splits 원재료명 text (nested brackets, `(국내산)` origin, percentages, allergen tail) into items.
* `ingredients/matcher.mjs` — exact → alias → qualifier-stripped → parent+child ("젤라틴(돼지)") → *contains* (≥3 chars) → fuzzy.
  *Contains* and *fuzzy* matches may raise a flag but never clear one.
* `rules/engine.mjs` — rules live in the database (`ingredient_rules`), not in code. Types: `ingredient`, `category`, `term`;
  priority ingredient (300) > term (200) > category (100); ties resolve to the stricter status. Each rule has a
  `reason_code`, localized reason (ko/en/uz), evidence note and source.
* Tables: `ingredients` (canonical name, ko/en, category, MFDS raw-material code), `ingredient_aliases`, `ingredient_rules`,
  `product_ingredients` (parsed items with match type/confidence), `halal_certifications`, `products` + `product_sources`
  (full provenance), `product_submissions`, `lookup_log`, `data_sources`, `import_runs`.
* Seed (`server/seed/*.json`): 267 ingredients, 1,325 aliases, 55 rules, 13 data-source registry entries.
  Admins can add/edit all of it in the console; changes apply to the next analysis immediately.

Reasons come from the rules (`reason.ko/en/uz`), for example *"Pork ingredient detected in the ingredient list."*
(rule `term.pork`) or *"Ingredient source could not be determined from available product information."*
(rule `term.gelatin_collagen`). Gelatin stated as fish-derived is cleared by its own rule (`ing.fish_gelatin`); stated
as pork-derived it is flagged (`ing.pork_gelatin`). The status of every ingredient is shown next to it in the result.

## Ingredient-label photo (fallback)

When the barcode is unknown or the product has no ingredient list, the user photographs the 원재료명 block. OCR runs
**on the device** by default (Tesseract.js with Korean + English data served locally from `/ocr-assets/`, no CDN, nothing leaves
the phone). Optional server OCR (`GOOGLE_VISION_API_KEY` or `CLOVA_OCR_INVOKE_URL` + `CLOVA_OCR_SECRET`) can be enabled
for accuracy. OCR text is **never auto-confirmed**: the user must review/edit it, and until confirmed it can only add flags.

## User contributions

`POST /api/product-submissions` (barcode, name, brand, ingredients text, product/ingredient photos) stores a `pending`
submission. Photos are saved privately (`server/data/uploads`, served only to admins). Statuses: `pending`, `verified`,
`rejected`, `needs_review`. Approving creates/updates the product as *verified* with the reviewer's edits.

## Admin console (`Admin Console → 제품 스캐너`)

Overview counts · Products (search, edit, override an ingredient match, see parsed ingredients and analysis) ·
User submissions (review with photos, approve/reject/needs review) · Ingredient dictionary + aliases · Rules (+ live tester) ·
Halal certifications (verified only with certificate number or URL) · Data sources (licence registry) · Places
(verify/hide, add by hand, CSV/JSON import with mandatory provenance).

## API

Public: `GET /api/products/lookup/:barcode`, `POST /api/ingredients/analyze`, `GET /api/ocr/config`, `POST /api/ocr/ingredients`,
`POST /api/product-submissions`, `GET /api/data-sources`, `GET /api/uploads/:file` (approved product images; submission photos are admin only).
Admin (Bearer token, `role=admin`): `/api/admin/{stats,products,ingredients,ingredient-categories,aliases,rules,rules/test,certifications,submissions,sources,places,places/import}`.
Places (public): `GET /api/places`, `/api/places/:id`, `/api/restaurants[/:id[/menu]]`, `/api/mosques[/:id]`.

## Configuration

Copy `.env.example` to `.env` (git-ignored). **The only key needed for Korean product data is the Food Safety Korea key:**

| Variable | Needed for |
|----------|-----------|
| `FOODSAFETYKOREA_API_KEY` + `FOODSAFETYKOREA_ACCEPT_TERMS=1` | MFDS barcode/raw-material lookup (free key, https://www.foodsafetykorea.go.kr/api/). Without it the lookup uses Open Food Facts only. |
| `OFF_USER_AGENT` | Recommended: identifies your deployment to Open Food Facts (their policy). |
| `GOOGLE_VISION_API_KEY` or `CLOVA_OCR_INVOKE_URL`/`CLOVA_OCR_SECRET` | Optional server-side OCR. |
| `HALALMAP_DATA_DIR` / `HALALMAP_DB_PATH` | Where the SQLite file and uploads live. |
| `HALALMAP_SEED_TEST_USERS` | Test accounts (`admin@halalmap.test`) are seeded unless `NODE_ENV=production`; leave unset in production and create a real admin. |

`pnpm mfds:probe -- <barcode>` checks the key and prints the raw MFDS response fields (the field mapping follows the
published API guide but could not be verified against the live service from the build environment).

## Importing data

```
pnpm import:products -- --barcode 8801043015202                       # look one barcode up through the real pipeline
pnpm import:products -- --off-dump openfoodfacts-products.jsonl.gz    # Open Food Facts bulk dump (Korean products only)
pnpm import:products -- --mfds-c005 1-5000                            # Food Safety Korea C005 pages (needs key + terms)
pnpm import:ingredients -- --file mfds-rawmaterials.csv --accept-terms # MFDS 원재료 코드 (KOGL) → dictionary, unclassified until a rule exists
```

Importers refuse a source whose licence status is `rejected` in the registry, and require `--accept-terms` while it is
`unconfirmed`. See [data-sources.md](data-sources.md).

## Tests

```
pnpm test           # 101 backend tests: barcode checksums, parser, matcher/rules engine, lookup order/caching, providers,
                    #   API + auth + admin, places, legacy-database upgrade, i18n key parity
pnpm typecheck && pnpm build
pnpm dev            # then, in another terminal:
node scripts/e2e-scanner.mjs   # mobile viewport, fake camera → real ZXing decode → lookup → result; real Tesseract OCR of Korean text
node scripts/e2e-admin.mjs     # admin console flows, incl. "admin decisions change what the scanner shows"
node scripts/e2e-places.mjs    # map markers, filters, provenance for the real OSM places
```

The E2E scripts use Chromium via `playwright-core` (`E2E_CHROMIUM` selects the binary) and need the test accounts.

## Known limitations

* No products ship in the database: the build environment could not reach Open Food Facts or Food Safety Korea, so the
  first scans fetch and cache them. The importers/providers are covered by fixture tests only, and MFDS field names
  are unverified against the live service (`mfds:probe`).
* Ingredient knowledge is a curated starting set (267 ingredients); MFDS raw-material codes need a manual CSV import.
* No halal-certification dataset with an open licence exists for Korea; certificates are entered by admins with evidence.
* On-device OCR quality depends on the photo; that is why OCR text always needs user confirmation.
