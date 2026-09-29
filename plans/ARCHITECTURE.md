# HalalMap Korea — Arxitektura hujjati

## Umumiy ko'rinish

Web-first, API-first, mobile-ready platforma.
Janubiy Koreyadagi musulmon jamiyatiga halol ovqat, masjidlar va namoz vaqtlarini topishda yordam beradi.

## Texnologiya steki

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | React 19 + TypeScript 5.9 + Vite 8 + Tailwind CSS 4 |
| Backend | Node.js HTTP server (`server/index.mjs` ishga tushiradi, `server/app.mjs` — so'rovlar mantig'i) |
| Ma'lumotlar bazasi (hozirgi) | SQLite (node:sqlite, versiyalangan migratsiyalar `server/migrations`) — auth, joylar, mahsulotlar, ingredientlar |
| Ma'lumotlar bazasi (maqsad) | Neon PostgreSQL (`DATABASE_URL` orqali) |
| Autentifikatsiya | Session token + scrypt password hashing |

## Loyiha tuzilishi

```
├── server/
│   ├── index.mjs              # API serverni ishga tushiradi (port 8787)
│   ├── app.mjs                # createApi(): marshrutlar, auth, seed
│   ├── db.mjs, migrations/    # SQLite + migratsiyalar
│   ├── places/                # joylar (masjid, restoran, market): repo, routes, importerlar, snapshot seed
│   ├── products/              # barcode, lookup (MFDS/OFF), ingredient parser+matcher, qoidalar mexanizmi, admin API
│   ├── seed/                  # ingredient lug'ati, qoidalar, ma'lumot manbalari, demo joylar, joylar snapshot
│   └── tests/                 # node:test (101 test)
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Asosiy navigator (sidebar + phone frame)
│   ├── index.css               # Global CSS + Tailwind v4
│   ├── api/
│   │   └── auth.ts             # Auth API moduli (login, logout, me)
│   ├── services/
│   │   └── apiClient.ts        # Umumiy HTTP client (token, xato boshqaruvi)
│   ├── components/
│   │   ├── Shared.tsx          # Umumiy UI atomlari (BottomNav, StatusBar, ...)
│   │   └── LanguageSwitcher.tsx
│   ├── screens/                # Customer ilovasi ekranlari (45+ ekran)
│   ├── admin/                  # Admin paneli
│   ├── dashboard/              # Restoran egasi paneli
│   └── courier/                # Kuryer ilovasi
├── plans/                      # Arxitektura va rejalar
├── .env.example                # Muhit o'zgaruvchilari namunasi
└── vite.config.ts              # Vite + Tailwind + proxy (/api → :8787)
```

## API arxitekturasi

### Qoidalar
- Frontend hech qachon to'g'ridan-to'g'ri database'ga ulanmaydi
- Barcha API chaqiruvlari `src/services/apiClient.ts` orqali amalga oshiriladi
- Har bir resurs uchun alohida modul: `src/api/auth.ts`, `src/api/restaurants.ts`, ...
- `.env` va `DATABASE_URL` faqat server tomonida, Git'ga chiqarilmaydi

### Mavjud endpointlar
| Method | Path | Tavsif |
|--------|------|--------|
| GET | `/api/health` | Server va DB holati |
| POST | `/api/auth/login` | Foydalanuvchi kirishi |
| GET | `/api/auth/me` | Joriy foydalanuvchi |
| POST | `/api/auth/logout` | Chiqish |
| GET | `/api/places` | Barcha joylar (`kind`, `q`, `lat/lng`) + `counts` + `attributions` |
| GET | `/api/places/:id` | Joy tafsilotlari + manbalari |
| GET | `/api/restaurants`, `/api/restaurants/:id`, `/api/restaurants/:id/menu` | Restoranlar (DB dan) |
| GET | `/api/mosques`, `/api/mosques/:id` | Masjid va namozxonalar (DB dan) |
| GET | `/api/products/lookup/:barcode` | Barcode → mahsulot → ingredient tahlili (lokal DB → MFDS → Open Food Facts) |
| POST | `/api/ingredients/analyze` | Ingredient matnini tahlil qilish |
| GET/POST | `/api/ocr/config`, `/api/ocr/ingredients` | Ingredient rasmi OCR (server provayder ixtiyoriy) |
| POST | `/api/product-submissions` | Foydalanuvchi mahsulot ma'lumoti yuboradi (pending) |
| GET | `/api/data-sources` | Ma'lumot manbalari va litsenziyalar |
| * | `/api/admin/*` | Admin: stats, products, ingredients, aliases, rules, certifications, submissions, sources, places |

Namoz vaqtlari (`/api/prayer-times`) va buyurtmalar (`/api/orders`) hozircha statik/namuna ma'lumot qaytaradi;
haqiqiy hisoblash (`adhan`) va buyurtma saqlash keyingi bosqich.

## Ma'lumotlar bazasi migratsiya rejasi

**Hozirgi holat:** SQLite'da `users`, `sessions`, `places`, `products`, `ingredients`, `ingredient_rules` va boshqa jadvallar mavjud (migratsiyalar: `server/migrations`).

**Migratsiya tartibi (xavfsiz, bosqichma-bosqich):**
1. PostgreSQL'da yangi jadvallar yaratish (SQLite'ni o'chirmasdan)
2. Yangi endpointlarni PostgreSQL'ga yozish
3. Auth'ni PostgreSQL'ga ko'chirish (dual-write davr)
4. SQLite'ni o'chirish (faqat barcha testlar o'tgandan keyin)

## Xavfsizlik qoidalari

- `DATABASE_URL` va boshqa sirlar `.env` da, `.gitignore` da himoyalangan
- Parollar `scrypt` bilan hash qilinadi
- Session tokenlar `crypto.randomBytes(32)` bilan generatsiya qilinadi
- API so'rovlari `Bearer` token bilan autentifikatsiya qilinadi
- Request body hajmi 16KB bilan cheklangan
