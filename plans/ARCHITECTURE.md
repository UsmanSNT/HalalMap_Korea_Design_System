# HalalMap Korea architecture

The project is developed as a **web-first, API-first, mobile-ready platform**.

## Decisions

- Keep the existing React + Vite application; do not force a Next.js folder structure.
- UI clients never connect directly to PostgreSQL.
- Web, admin, and future mobile clients use one versioned backend API and one PostgreSQL database.
- The first mobile release may use a hybrid wrapper, but API contracts and shared logic must remain usable by a future React Native client.
- Components call domain API modules and platform services instead of scattered `fetch`, browser storage, or browser-only APIs.
- Real place names are stored as proper names and are not translated. Only UI labels and place-type labels are localized.
- Production images live in object storage; the database stores URLs or storage keys.

## Current transition structure

```text
src/
  api/          domain API modules
  services/     API client and platform adapters
  components/   reusable presentation components
  screens/      customer screens
  admin/        admin presentation
  courier/      courier presentation
  dashboard/    restaurant-owner presentation
server/         temporary Node API server
```

## Migration order

1. Centralize API calls, authentication storage, location, maps, uploads, sharing, and native bridge access.
2. Define shared API entities and validation contracts without changing the existing UI.
3. Move all production data from hardcoded arrays and temporary SQLite storage to backend endpoints backed by Neon PostgreSQL.
4. Add server-side validation, authorization, rate limiting, and database migrations.
5. Add stable routes/deep links and complete responsive/mobile-safe UI behavior.
6. Add storage uploads, real maps/search, favorites, reviews, and notifications.
7. Package the responsive web app in Android/iOS wrappers and add native bridges only where needed.

SQLite is temporary development storage. It must be migrated safely to PostgreSQL; it must not become a second production database.
