# Deploy and operations

Two parts: a static web app (`dist/`) and a small API (`server/index.mjs`) for community submissions.

## Self-hosted (single process): avrangzeb.uz
`server/index.mjs` serves the built web app (`dist/`) and the API from one Node process, same origin
(no CORS, no `VITE_API_URL`). Needs Node >= 22.13, pnpm, and nginx (or any reverse proxy) with HTTPS:
geolocation and the compass only work on HTTPS.

One-time setup on the server:
```
sudo useradd -r -s /usr/sbin/nologin halalmap
sudo git clone <repo> /opt/halalmap && sudo chown -R $USER /opt/halalmap
sudo mkdir -p /var/lib/halalmap && sudo chown halalmap /var/lib/halalmap
sudo cp deploy/halalmap.env.example /etc/halalmap.env   # set ADMIN_TOKEN, then chmod 600
sudo cp deploy/halalmap.service /etc/systemd/system/ && sudo systemctl enable halalmap
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/avrangzeb.uz   # enable + certbot
```
Every release: `./deploy/deploy.sh` (fetch, fast-forward, install, `pnpm check`, build, restart, health check).
The API listens on 127.0.0.1 only; nginx is the single public entry. Back up `/var/lib/halalmap`.

Other hosts work too: the API alone needs a persistent disk, so static-only hosting (Pages, Figma Make)
can serve the web app but not "Add a place" unless `VITE_API_URL` points at a separate API.

| Env | Purpose |
|---|---|
| `ADMIN_TOKEN` | >= 24 random chars (`openssl rand -hex 24`). Admin is disabled when unset. |
| `DATA_DIR` | Persistent directory for `halalmap.sqlite`. |
| `STATIC_DIR` | Built web app, default `../dist`. |
| `HOST` / `PORT` | Bind address and port (default 127.0.0.1:8787). |
| `TRUST_PROXY=1` | Behind nginx: use `X-Forwarded-For` for per-IP rate limiting (nginx must overwrite it). |
| `ALLOWED_ORIGINS` | Only when the web app is on a different origin than the API. |

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
