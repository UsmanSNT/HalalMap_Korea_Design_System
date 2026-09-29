# Data sources and licences

Every record stores where it came from (`source`, `source_url`, `license`, `attribution`, `retrieved_at`,
`last_verified_at`) and the registry table `data_sources` (seeded from `server/seed/data-sources.json`, editable in
*Admin Console → 데이터 출처*) decides whether an importer may run:

* `licence_status = rejected` → importers refuse to run.
* `licence_status = unconfirmed` → importers need an explicit acknowledgement (`--accept-terms` / `*_ACCEPT_TERMS=1`).
* `confirmed` → allowed; attribution is shown where the licence requires it.

Blogs, store/retailer pages and web search results are **not** used as data sources (unlicensed scraping, unstable
structure, unverifiable accuracy).

## Used

| Source | Data | Licence | Status | Notes |
|--------|------|---------|--------|-------|
| OpenStreetMap (Overpass API) | mosques, prayer rooms, halal restaurants/cafés/markets | ODbL 1.0, "© OpenStreetMap contributors" | **active** — 33 places imported (11 mosques, 22 restaurants) | Tags are community-reported, not certification: everything is `unverified`, never "certified". Share-alike applies to derived databases. Public Overpass is fair-use, so results are stored as a committed snapshot (`server/seed/places/osm-kr.json`) and refreshed on demand, not queried per user. |
| Wikidata (SPARQL) | mosques with coordinates | CC0 1.0 | active importer, **0 records imported** (endpoint unreachable from the build environment) | Run `pnpm import:places -- --source wikidata --snapshot` from a networked machine or via the *Import open data* workflow. |
| Open Food Facts | products by barcode: name, brand, ingredients text, image | ODbL 1.0 (database), DbCL 1.0 (contents), CC BY-SA 3.0 (images) | active provider, **0 products imported** (unreachable from the build environment) | No key. Per-product reads are rate limited (~100/min) and need a descriptive User-Agent (`OFF_USER_AGENT`); bulk work must use the dump (`--off-dump`). Package-label tags such as "halal" are stored as *unverified* claims. |
| Food Safety Korea / MFDS Open API (C005 barcode-linked products, C002 food manufacturing reports) | Korean product name, manufacturer, report number, raw materials | Korean government public data (공공누리/KOGL); exact type per service to be confirmed at key registration → **unconfirmed** | active when `FOODSAFETYKOREA_API_KEY` and `FOODSAFETYKOREA_ACCEPT_TERMS=1` are set; **0 records imported** (no key, host unreachable) | Free key. Field names follow the published guide and are unverified against the live service — run `pnpm mfds:probe`. |
| User submissions | products, ingredient photos | Contributor submission (terms to be published by the project owner) | active | Stored `pending`; never shown as verified until an admin approves. |
| HalalMap editorial rules | ingredient dictionary + screening rules | Project licence (owner to decide) | active | 267 ingredients, 1,325 aliases, 55 rules, each with reason/evidence; not fatwas. |
| Admin file import | places from CSV/JSON | set per import | active | `source` + `license` are mandatory per row (or as defaults); rows outside Korea or without provenance are rejected. |

## Planned / not usable yet

| Source | Why not (yet) |
|--------|---------------|
| MFDS raw-material code dataset (data.go.kr) | `unconfirmed` KOGL type and the portal was unreachable from the build environment. Download the CSV manually after checking the dataset's KOGL type, then `pnpm import:ingredients -- --file … --accept-terms`. Imported names are recognised but stay *unclassified* (→ CHECK_REQUIRED) until a rule classifies them. |
| Korea Tourism Organization (VISITKOREA) Muslim-friendly restaurants / prayer rooms | Would give officially classified places (Halal Certified / Self-certified / Muslim Friendly / Pork Free), but the OpenAPI needs an approved service key and the site's terms warn against caching or crawling guide content. The dataset id, response fields and KOGL type could not be verified, so no importer was written against guessed fields. |
| Korean public-data portals (data.go.kr) for mosques / halal restaurants | No nationwide dataset with both an immediately usable download/API and clear reuse terms was identified. |

## Rejected

| Source | Reason |
|--------|--------|
| KMF / other certifier web lists | Published as web pages without an open licence or API; scraping is out of scope. A certificate can still be entered by an admin with a verification URL, or bulk-loaded with written permission from the certifier. |
| Foreign halal directories | No open reuse licence and no barcode mapping for Korean retail products. |
| Retail / blog / store pages | Unlicensed scraping, unstable, unverifiable. |
| Demo places (`demo_seed`) | The 6 restaurants and 4 mosques that predate the pipeline are fictional. They are tagged `data_origin = demo`, labelled DEMO in the UI, and hidden automatically as soon as real places of the same group (mosques + prayer rooms count as one group) exist. |

## Hosts that must be reachable for the importers

`overpass-api.de` (or `overpass.kumi.systems`), `query.wikidata.org`, `world.openfoodfacts.org`,
`static.openfoodfacts.org` (dumps), `openapi.foodsafetykorea.go.kr`, `www.foodsafetykorea.go.kr`, `www.data.go.kr`.
The build environment blocked all of them, which is why the products/Wikidata numbers above are 0. The *Import open
data* GitHub Action (`.github/workflows/import-open-data.yml`, manual trigger) runs the place importers on a runner with
normal internet access.

## Attribution shown in the app

* Map and place cards: "© OpenStreetMap contributors" with the licence line (`ODbL 1.0`) and the retrieval date.
* Product screens: source name, licence and retrieval date of the product record.
* `GET /api/data-sources` exposes the registry (without secrets) for a public "data sources" page.
