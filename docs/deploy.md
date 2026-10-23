# Deploy and operations

Two parts: a static web app (`dist/`) and a small API (`server/index.mjs`) for community submissions.

## Web app
`pnpm check && pnpm build`, then publish `dist/` (GitHub Pages workflow or `figma make deploy`).
Set `VITE_API_URL` at build time to the public API origin (GitHub: Settings → Variables → `VITE_API_URL`).
The app works without the API (prayer times, Qibla and bundled places are offline); only "Add a place" and
community places need it.

## API
Needs a host that runs Node >= 22.13 with a **persistent disk** for SQLite (static hosts cannot run it).

| Env | Purpose |
|---|---|
| `ADMIN_TOKEN` | >= 24 random chars (`openssl rand -hex 24`). Admin is disabled when unset. |
| `ALLOWED_ORIGINS` | Web origins allowed to call the API, comma separated. |
| `DATA_DIR` | Persistent directory for `halalmap.sqlite`. Back it up. |
| `HOST` / `PORT` | Bind address (`0.0.0.0` in containers) and port. |
| `TRUST_PROXY=1` | When behind a proxy that sets `X-Forwarded-For` (needed for per-IP rate limiting). |

Run: `node server/index.mjs`. Health: `GET /api/health`. Serve it over HTTPS.

## Moderation flow
1. A visitor submits a place with a private contact phone ("Add a place"). Limits: 5 per IP per hour.
2. Open `<web app>/#/admin`, sign in with `ADMIN_TOKEN`, call the contact, check the place on a map.
3. Paste the coordinates, adjust name/hours/halal status, press approve. It is published immediately.
   Contact details are never returned by the public API.

## Open data (OpenStreetMap)
`pnpm import:osm` queries Overpass for mosques and `diet:halal` restaurants in South Korea and writes
`src/data/osm.generated.json` (marked unverified; duplicates of curated places within 100 m are dropped).
Data © OpenStreetMap contributors (ODbL); the attribution link is shown in the app. Rerun periodically and commit.

## Before public release
- Verify the curated places in `src/data/*.ts` (coordinates are approximate) or remove them.
- `.figma/make/site.json` has `robots.index: false`; flip it when you want search engines to index the site.
