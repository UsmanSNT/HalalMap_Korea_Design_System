@AGENTS.md

# HalalMap Korea — Claude working context

Read `plans/ARCHITECTURE.md` completely before changing code.

## Communication

- Always explain progress and results to the user in Uzbek.
- Code, commands, file names, and technical terms may remain in English.
- Prefer direct implementation over long theoretical answers.

## Product goal

HalalMap Korea is a real responsive halal places platform for customers, couriers, restaurant owners, and admins. It started as a Figma Make demo but is being converted into a production application.

```text
Responsive Web / Admin / Android / iOS
                    ↓
             One Backend API
                    ↓
          One Neon PostgreSQL database
```

Develop it as a **web-first, API-first, mobile-ready platform**. The first mobile release may use a hybrid wrapper, but API contracts, validation, and business logic must remain reusable by a future React Native client.

## Current technology

- React 19 + TypeScript + Vite 8 + Tailwind CSS 4
- Node HTTP backend in `server/index.mjs`
- Neon connection through server-only `DATABASE_URL`
- Temporary SQLite app storage currently exists in the backend
- Frontend: `http://127.0.0.1:8443`
- Backend: `http://127.0.0.1:8787`
- `npm run dev` starts frontend and backend together

Never expose `DATABASE_URL` to React or commit `.env`.

## Current behavior

- Customer login and test accounts exist.
- Customer, courier, restaurant-owner, and admin interfaces remain in one web project.
- Courier and owner access adds a work panel while preserving customer features.
- Temporary direct-test buttons open courier and owner panels without partner login. Keep them clearly marked temporary.
- User place submissions can be reviewed by admin.
- Prayer times use a real backend endpoint.
- Korean, English, Uzbek, and Russian localization has started, but some screens still contain hardcoded Korean.
- Restaurant and mosque proper names must never be translated; only UI and place-type labels are translated.

## Architecture rules

- React components never connect directly to PostgreSQL.
- Components should not contain scattered `fetch` calls.
- Put generic HTTP behavior in `src/services/apiClient.ts` and domain endpoints in `src/api/`.
- Put location, camera, sharing, uploads, and notifications behind adapters in `src/services/`.
- Keep API URLs configurable through `VITE_API_BASE_URL`.
- Keep desktop and mobile business logic shared.
- Preserve the current design and behavior unless the user explicitly requests a redesign.
- Do not add Next.js or force a Next.js folder structure onto this Vite project.
- Frontend role checks are not security; backend authorization is required.
- Production uses one PostgreSQL database. SQLite is temporary and needs a safe migration; never silently delete existing data.
- Production images should later use object storage with URLs/keys stored in PostgreSQL.

## Current foundation

- `src/services/apiClient.ts` — shared API requests and errors
- `src/services/storage.ts` — session token adapter
- `src/services/locationService.ts` — browser/native location adapter
- `src/services/prayerService.ts` — prayer API service
- `src/api/auth.ts` — auth API
- `src/api/places.ts` — place submission API
- `src/api/partners.ts` — courier/owner API
- `plans/ARCHITECTURE.md` — accepted architecture and migration order

## Next recommended work

1. Inspect and preserve the current working tree.
2. Define shared API entity types and validation contracts.
3. Design versioned Neon PostgreSQL migrations.
4. Safely migrate SQLite-backed users, sessions, partner accounts, place submissions, and places to Neon.
5. Move hardcoded restaurant/mosque data behind API endpoints one feature at a time.
6. Add server-side authorization and validation.
7. Complete localization and responsive behavior without translating proper place names.

Before finishing a change, run `npx tsc --noEmit` and `npm run build`. For backend changes also verify `GET /api/health`. Report what changed, what was tested, and any temporary/demo behavior that remains.
