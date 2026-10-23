# Deploy and operations

Two parts: a static web app (`dist/`) and a small API (`server/index.mjs`) for community submissions.

## Self-hosted (single process): avrangzeb.uz on Windows + Cloudflare Tunnel
`server/index.mjs` serves the built web app (`dist/`) and the API from one Node process, same origin
(no CORS, no `VITE_API_URL`). Needs Node >= 22.13 and pnpm. Public HTTPS comes from the Cloudflare Tunnel, which
forwards the domain to `http://127.0.0.1:<PORT>` (currently 8443); keep that port and the tunnel needs no change.

Files in `deploy/windows/`: `supervise.ps1` (restart loop), `install-task.ps1` (boot task, runs as SYSTEM),
`update.cmd` (pull, install, check, build, restart, health check), `env.example`.

Setup (Administrator shell), in a new folder next to the old one:
```
git clone --branch main https://github.com/UsmanSNT/HalalMap_Korea_Design_System.git C:\server\halalmap
cd /d C:\server\halalmap
copy deploy\windows\env.example .env
node -e "require('fs').appendFileSync('.env','ADMIN_TOKEN='+require('crypto').randomBytes(24).toString('hex')+'\n')"
pnpm install --frozen-lockfile && pnpm check && pnpm build
powershell -ExecutionPolicy Bypass -File deploy\windows\install-task.ps1
```
`.env` holds the admin token (read it in Notepad, never share it). Updates: `deploy\windows\update.cmd`.
Back up `DATA_DIR` (it contains `halalmap.sqlite`). Logs: `logs\server.out.log`, `logs\server.err.log`, `logs\supervisor.log`.
Cut-over and rollback: stop and disable the old task, run the new one on the same port; reverse to roll back.

Linux alternative: `deploy/halalmap.service`, `deploy/nginx.conf.example`, `deploy/deploy.sh`.

Other hosts work too: the API alone needs a persistent disk, so static-only hosting (Pages, Figma Make)
can serve the web app but not "Add a place" unless `VITE_API_URL` points at a separate API.

| Env | Purpose |
|---|---|
| `ADMIN_TOKEN` | >= 24 random chars (`openssl rand -hex 24`). Admin is disabled when unset. |
| `DATA_DIR` | Persistent directory for `halalmap.sqlite`. |
| `STATIC_DIR` | Built web app, default `../dist`. |
| `HOST` / `PORT` | Bind address and port (default 127.0.0.1:8787). |
| `TRUST_PROXY` | `cloudflare` (CF-Connecting-IP) behind Cloudflare/cloudflared; `1` behind one reverse proxy (last `X-Forwarded-For` hop). Used for per-IP rate limiting. |
| `ALLOWED_ORIGINS` | Only when the web app is on a different origin than the API. |

## Photos and reviews
- Photos: the web app re-encodes every photo to a JPEG (max 1280 px, EXIF/location stripped) and uploads it to
  `POST /api/uploads` (JPEG only, 3 MB, 10 per IP per hour). Files live in `DATA_DIR/uploads/` and are served at
  `/uploads/<id>.jpg`. **Back up `DATA_DIR` including `uploads/`.** Photos of rejected or abandoned submissions stay
  on disk (small; delete manually if needed).
- Reviews: restaurants can be rated 1-5 with an optional comment and name. No accounts: one review per place per
  browser, 10 per IP per hour. Reviews are published immediately; delete abusive ones at `#/admin` ("Recent reviews").

## Moderation flow
1. A visitor submits a place with a private contact phone ("Add a place"). Limits: 5 per IP per hour.
2. Open `<web app>/#/admin`, sign in with `ADMIN_TOKEN`, call the contact, check the place on a map.
3. Paste the coordinates, adjust name/hours/halal status, press approve. It is published immediately.
   Contact details are never returned by the public API.

## Open data (OpenStreetMap)
See `docs/place-data.md`. `pnpm import:osm` refreshes the snapshot; `pnpm build:osm` rebuilds from it.
Data © OpenStreetMap contributors (ODbL); the attribution link is shown in the app.

## Before public release
- Imported places are community-maintained (many lack address/phone). Verify and enrich them via submissions.
- `.figma/make/site.json` has `robots.index: false`; flip it when you want search engines to index the site.
