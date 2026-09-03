# HalalMap Korea — Arxitektura hujjati

## Umumiy ko'rinish

Web-first, API-first, mobile-ready platforma.
Janubiy Koreyadagi musulmon jamiyatiga halol ovqat, masjidlar va namoz vaqtlarini topishda yordam beradi.

## Texnologiya steki

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | React 19 + TypeScript 5.9 + Vite 8 + Tailwind CSS 4 |
| Backend | Node.js HTTP server (`server/index.mjs`) |
| Ma'lumotlar bazasi (hozirgi) | SQLite (node:sqlite) — auth uchun |
| Ma'lumotlar bazasi (maqsad) | Neon PostgreSQL (`DATABASE_URL` orqali) |
| Autentifikatsiya | Session token + scrypt password hashing |

## Loyiha tuzilishi

```
├── server/
│   └── index.mjs              # Backend API server (port 8787)
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

### Rejalashtirilgan endpointlar
| Method | Path | Tavsif |
|--------|------|--------|
| GET | `/api/restaurants` | Restoranlar ro'yxati (filter, search) |
| GET | `/api/restaurants/:id` | Restoran tafsilotlari |
| GET | `/api/restaurants/:id/menu` | Restoran menyusi |
| GET | `/api/mosques` | Masjidlar ro'yxati |
| GET | `/api/mosques/:id` | Masjid tafsilotlari |
| GET | `/api/prayer-times` | Namoz vaqtlari |
| POST | `/api/orders` | Yangi buyurtma |
| GET | `/api/orders` | Buyurtma tarixi |
| GET | `/api/orders/:id` | Buyurtma tafsilotlari |
| GET | `/api/scanner/:barcode` | Halol tekshiruv |

## Ma'lumotlar bazasi migratsiya rejasi

**Hozirgi holat:** SQLite'da `users` va `sessions` jadvallari mavjud.

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
