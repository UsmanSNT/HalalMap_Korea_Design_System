import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";
import pg from "pg";
import { openDatabase } from "./db.mjs";
import { authenticate, publicUser, seedTestUsers, verifyPassword } from "./lib/auth.mjs";
import { HttpError, json, readJson } from "./lib/http.mjs";
import { createPlaceRoutes } from "./places/routes.mjs";
import { seedDemoPlaces, seedPlaceSnapshots } from "./places/seed.mjs";
import { createAdminRoutes } from "./products/admin-routes.mjs";
import { createLookupService } from "./products/lookup.mjs";
import { createProductRoutes } from "./products/routes.mjs";
import { seedProductKnowledge } from "./products/seed.mjs";
import { RulesetCache } from "./products/rules/ruleset.mjs";

const { Pool } = pg;
const postgres = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
    })
  : null;

/**
 * Builds the HTTP server. The database is injectable so tests can run against `:memory:`.
 * Existing endpoints (health, auth, profile, orders, saved places, prayer times) are unchanged; restaurants and
 * mosques are now read from the database, and the product scanner + admin APIs are new.
 */
export const createApi = ({ db = openDatabase(), fetchImpl = fetch, env = process.env } = {}) => {
  seedTestUsers(db);
  seedProductKnowledge(db);
  seedDemoPlaces(db);
  seedPlaceSnapshots(db);

  const rulesetCache = new RulesetCache(db);
  const lookupService = createLookupService({ db, rulesetCache, env, fetchImpl });
  const routeHandlers = [
    createPlaceRoutes({ db }),
    createProductRoutes({ db, rulesetCache, lookupService, env, fetchImpl }),
    createAdminRoutes({ db, rulesetCache, env }),
  ];

  const api = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");

      if (request.method === "GET" && url.pathname === "/api/health") {
        if (!postgres) {
          return json(response, 503, {
            status: "error",
            database: "not_configured",
            error: "DATABASE_URL .env faylida topilmadi",
          });
        }

        const startedAt = Date.now();
        const result = await postgres.query("SELECT 1 AS connected, current_database() AS database");
        return json(response, 200, {
          status: "ok",
          database: "connected",
          databaseName: result.rows[0].database,
          latencyMs: Date.now() - startedAt,
        });
      }

      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        const body = await readJson(request);
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
        if (!user || !verifyPassword(password, user.password_hash)) {
          return json(response, 401, { error: "Email yoki parol noto‘g‘ri" });
        }

        db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
        const token = randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
          .run(token, user.id, expiresAt);
        return json(response, 200, { token, user: publicUser(user) });
      }

      if (request.method === "GET" && url.pathname === "/api/auth/me") {
        const auth = authenticate(db, request);
        return auth
          ? json(response, 200, { user: publicUser(auth.user) })
          : json(response, 401, { error: "Session yaroqsiz yoki muddati tugagan" });
      }

      if (request.method === "POST" && url.pathname === "/api/auth/logout") {
        const auth = authenticate(db, request);
        if (auth) db.prepare("DELETE FROM sessions WHERE token = ?").run(auth.token);
        return json(response, 200, { success: true });
      }

      // ── Places, product scanner, admin ───────────────────────────
      for (const handle of routeHandlers) {
        if (await handle(request, response, url)) return;
      }

      // ── Prayer Times ─────────────────────────────────────────────

      if (request.method === "GET" && url.pathname === "/api/prayer-times") {
        return json(response, 200, { prayerTimes: PRAYER_TIMES, location: "이태원동, 서울" });
      }

      // ── Profile ──────────────────────────────────────────────────

      if (request.method === "GET" && url.pathname === "/api/profile") {
        const auth = authenticate(db, request);
        if (!auth) return json(response, 401, { error: "Avtorizatsiya talab qilinadi" });
        const profile = {
          ...publicUser(auth.user),
          initials: auth.user.name.charAt(0),
          membership: "일반 회원",
          points: 3200,
          stats: { orders: 12, reviews: 8, saved: 5 },
        };
        return json(response, 200, { profile });
      }

      // ── Orders ──────────────────────────────────────────────────

      if (request.method === "GET" && url.pathname === "/api/orders") {
        const auth = authenticate(db, request);
        if (!auth) return json(response, 401, { error: "Avtorizatsiya talab qilinadi" });
        return json(response, 200, { orders: ORDERS });
      }

      if (request.method === "GET" && url.pathname.startsWith("/api/orders/")) {
        const auth = authenticate(db, request);
        if (!auth) return json(response, 401, { error: "Avtorizatsiya talab qilinadi" });
        const id = url.pathname.split("/")[3];
        const order = ORDERS.find((o) => o.id === id);
        return order
          ? json(response, 200, { order })
          : json(response, 404, { error: "Buyurtma topilmadi" });
      }

      // ── Saved Places ────────────────────────────────────────────

      if (request.method === "GET" && url.pathname === "/api/saved-places") {
        const auth = authenticate(db, request);
        if (!auth) return json(response, 401, { error: "Avtorizatsiya talab qilinadi" });
        return json(response, 200, { savedPlaces: SAVED_PLACES });
      }

      return json(response, 404, { error: "Endpoint topilmadi" });
    } catch (error) {
      if (error instanceof HttpError) return json(response, error.status, { error: error.message, code: error.code });
      console.error(error);
      return json(response, 500, { error: "Server xatosi" });
    }
  });

  return api;
};

// ── Seed Data ──────────────────────────────────────────────────

const PRAYER_TIMES = {
  hijriDate: "1448년 사파르 10일",
  gregorianDate: "2026-09-03",
  prayers: [
    { id: "fajr", name: "파즈르", nameEn: "Fajr", time: "04:47" },
    { id: "sunrise", name: "일출", nameEn: "Sunrise", time: "06:15" },
    { id: "dhuhr", name: "두흐르", nameEn: "Dhuhr", time: "12:15" },
    { id: "asr", name: "아스르", nameEn: "Asr", time: "14:32" },
    { id: "maghrib", name: "마그립", nameEn: "Maghrib", time: "17:48" },
    { id: "isha", name: "이샤", nameEn: "Isha", time: "19:21" },
  ],
};

const ORDERS = [
  {
    id: "order-1",
    restaurant: "신당 할랄 키친",
    restaurantId: "sindang-halal",
    date: "2024.11.20",
    total: 34500,
    items: "할랄 갈비탕 외 2개",
    status: "delivered",
    rated: false,
    orderNumber: "#HMK-20241120-7731",
    orderDate: "2024년 11월 20일 오후 2:15",
    deliveredDate: "2024년 11월 20일 오후 3:02",
    orderItems: [
      { name: "할랄 갈비탕", option: "보통", price: 13500, qty: 1 },
      { name: "비빔밥 (할랄)", option: "기본", price: 11000, qty: 2 },
      { name: "오이무침", option: "사이드", price: 3000, qty: 1 },
    ],
    subtotal: 38500,
    deliveryFee: 2000,
    couponDiscount: 6000,
    tip: 0,
    paymentMethod: "신한카드 ····4521",
    deliveryAddress: "서울특별시 용산구 이태원로 123, 501호",
    courier: { name: "김민준", rating: 4.9, deliveries: 8241 },
  },
  {
    id: "order-2",
    restaurant: "이스탄불 케밥 & 피데",
    restaurantId: "itaewon-kebab",
    date: "2024.11.15",
    total: 21000,
    items: "케밥 세트 외 1개",
    status: "delivered",
    rated: true,
  },
  {
    id: "order-3",
    restaurant: "우즈베키스탄 플로프 하우스",
    restaurantId: "uzbekistan-plov",
    date: "2024.11.10",
    total: 18500,
    items: "플로프 + 라그만",
    status: "delivered",
    rated: true,
  },
  {
    id: "order-4",
    restaurant: "델리 스파이스 하우스",
    restaurantId: "delhi-spice",
    date: "2024.11.05",
    total: 27000,
    items: "버터 치킨 커리 외 2개",
    status: "cancelled",
    rated: false,
  },
];

const SAVED_PLACES = {
  restaurants: [
    { id: "sindang-halal", name: "신당 할랄 키친", halalStatus: "certified", rating: 4.8, reviewCount: 3241, imageId: "1498654896293-37c98e7f5fe4" },
    { id: "itaewon-kebab", name: "이스탄불 케밥 & 피데", halalStatus: "certified", rating: 4.5, reviewCount: 2110, imageId: "1529042410759-befb1204b468" },
    { id: "masjid-seoul-cafe", name: "마스지드 서울 카페", halalStatus: "muslim-owned", rating: 4.9, reviewCount: 940, imageId: "1414235077428-338989a2e8c0" },
  ],
  mosques: [
    { id: "seoul-central", name: "서울중앙성원", nameEn: "Seoul Central Mosque", distance: "1.2km" },
    { id: "itaewon-masjid", name: "이태원 마스지드", nameEn: "Itaewon Masjid", distance: "0.3km" },
  ],
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.API_PORT || 8787);
  createApi().listen(port, "127.0.0.1", () => {
    console.log(`HalalMap API http://127.0.0.1:${port}`);
  });
}
