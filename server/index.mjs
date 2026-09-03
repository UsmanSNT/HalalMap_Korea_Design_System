import { createServer } from "node:http";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import pg from "pg";

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

const serverDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(serverDir, "data");
mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(resolve(dataDir, "halalmap.sqlite"));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'owner', 'courier', 'admin')),
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const testUsers = [
  ["user@halalmap.test", "Test User", "user", "User123!"],
  ["owner@halalmap.test", "Test Restaurant Owner", "owner", "Owner123!"],
  ["courier@halalmap.test", "Test Courier", "courier", "Courier123!"],
  ["admin@halalmap.test", "Test Admin", "admin", "Admin123!"],
];

const hashPassword = (password, salt = randomBytes(16).toString("hex")) =>
  `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, name, role, password_hash)
  VALUES (?, ?, ?, ?)
`);
for (const [email, name, role, password] of testUsers) {
  insertUser.run(email, name, role, hashPassword(password));
}

const json = (response, status, body) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
};

const readJson = async (request) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16_384) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
};

const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name, role: user.role });

const authenticate = (request) => {
  const authorization = request.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;
  const user = db.prepare(`
    SELECT users.id, users.email, users.name, users.role
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ? AND sessions.expires_at > ?
  `).get(token, Date.now());
  return user ? { token, user } : null;
};

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
      const auth = authenticate(request);
      return auth
        ? json(response, 200, { user: publicUser(auth.user) })
        : json(response, 401, { error: "Session yaroqsiz yoki muddati tugagan" });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      const auth = authenticate(request);
      if (auth) db.prepare("DELETE FROM sessions WHERE token = ?").run(auth.token);
      return json(response, 200, { success: true });
    }

    // ── Restaurants ──────────────────────────────────────────────

    if (request.method === "GET" && url.pathname === "/api/restaurants") {
      const category = url.searchParams.get("category");
      const search = url.searchParams.get("q");
      let filtered = RESTAURANTS;
      if (category) filtered = filtered.filter((r) => r.category === category);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (r) => r.name.toLowerCase().includes(q) || r.nameKo.includes(q) || r.category.toLowerCase().includes(q),
        );
      }
      return json(response, 200, { restaurants: filtered });
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/restaurants/")) {
      const id = url.pathname.split("/")[3];
      const restaurant = RESTAURANTS.find((r) => r.id === id);
      if (!restaurant) return json(response, 404, { error: "Restoran topilmadi" });

      if (url.pathname.endsWith("/menu")) {
        const menu = MENUS[id] ?? [];
        return json(response, 200, { restaurant: { id, name: restaurant.name }, menu });
      }
      return json(response, 200, { restaurant });
    }

    // ── Mosques ──────────────────────────────────────────────────

    if (request.method === "GET" && url.pathname === "/api/mosques") {
      const type = url.searchParams.get("type");
      let filtered = MOSQUES;
      if (type) filtered = filtered.filter((m) => m.type === type);
      return json(response, 200, { mosques: filtered });
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/mosques/")) {
      const id = url.pathname.split("/")[3];
      const mosque = MOSQUES.find((m) => m.id === id);
      return mosque
        ? json(response, 200, { mosque })
        : json(response, 404, { error: "Masjid topilmadi" });
    }

    // ── Prayer Times ─────────────────────────────────────────────

    if (request.method === "GET" && url.pathname === "/api/prayer-times") {
      return json(response, 200, { prayerTimes: PRAYER_TIMES, location: "이태원동, 서울" });
    }

    return json(response, 404, { error: "Endpoint topilmadi" });
  } catch (error) {
    console.error(error);
    return json(response, 500, { error: "Server xatosi" });
  }
});

// ── Seed Data ──────────────────────────────────────────────────

const RESTAURANTS = [
  {
    id: "sindang-halal",
    name: "Sindang Halal Kitchen",
    nameKo: "신당 할랄 키친",
    category: "korean",
    halalStatus: "certified",
    certBody: "KMF",
    rating: 4.8,
    reviewCount: 3241,
    distance: "2.3km",
    deliveryTime: "25-35분",
    deliveryFee: 2000,
    minOrder: 15000,
    address: "서울특별시 중구 신당동 123-4",
    phone: "02-1234-5678",
    hours: "09:00-22:00",
    description: "이슬람 식품청 인증 할랄 한식 전문점. 돼지고기 및 알코올 완전 배제.",
    photo: "https://images.unsplash.com/photo-1498654896293-37c98e7f5fe4?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "itaewon-kebab",
    name: "Itaewon Kebab House",
    nameKo: "이태원 케밥 하우스",
    category: "turkish",
    halalStatus: "certified",
    certBody: "KMF",
    rating: 4.6,
    reviewCount: 1872,
    distance: "0.8km",
    deliveryTime: "15-25분",
    deliveryFee: 1500,
    minOrder: 12000,
    address: "서울특별시 용산구 이태원로 45-7",
    phone: "02-2345-6789",
    hours: "10:00-23:00",
    description: "정통 터키 케밥과 그릴 요리 전문점.",
    photo: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "uzbekistan-plov",
    name: "Uzbekistan Plov House",
    nameKo: "우즈베키스탄 플로프 하우스",
    category: "uzbek",
    halalStatus: "muslim-owned",
    certBody: null,
    rating: 4.7,
    reviewCount: 956,
    distance: "3.1km",
    deliveryTime: "30-40분",
    deliveryFee: 1500,
    minOrder: 13000,
    address: "서울특별시 용산구 한남동 67-2",
    phone: "02-3456-7890",
    hours: "11:00-22:00",
    description: "우즈베키스탄 전통 플로프와 중앙아시아 요리.",
    photo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "delhi-spice",
    name: "Delhi Spice",
    nameKo: "델리 스파이스",
    category: "indian",
    halalStatus: "halal-friendly",
    certBody: null,
    rating: 4.3,
    reviewCount: 687,
    distance: "4.2km",
    deliveryTime: "35-45분",
    deliveryFee: 2500,
    minOrder: 18000,
    address: "서울특별시 강남구 역삼동 88-3",
    phone: "02-4567-8901",
    hours: "11:00-21:30",
    description: "북인도 카레와 탄두리 전문점. 채식 메뉴 다수.",
    photo: "https://images.unsplash.com/photo-1565557623262-b51ff2a27b73?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "jakarta-nasigoreng",
    name: "Jakarta Nasi Goreng",
    nameKo: "자카르타 나시고렝",
    category: "indonesian",
    halalStatus: "certified",
    certBody: "MUI",
    rating: 4.6,
    reviewCount: 1124,
    distance: "2.8km",
    deliveryTime: "30-40분",
    deliveryFee: 2000,
    minOrder: 14000,
    address: "서울특별시 마포구 합정동 34-1",
    phone: "02-5678-9012",
    hours: "10:30-22:00",
    description: "인도네시아 정통 나시고렝과 동남아 할랄 요리.",
    photo: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "masjid-seoul-cafe",
    name: "Masjid Seoul Cafe",
    nameKo: "마스지드 서울 카페",
    category: "cafe",
    halalStatus: "muslim-owned",
    certBody: null,
    rating: 4.9,
    reviewCount: 2103,
    distance: "1.1km",
    deliveryTime: "20-30분",
    deliveryFee: 0,
    minOrder: 8000,
    address: "서울특별시 용산구 우사단로 12-5",
    phone: "02-6789-0123",
    hours: "08:00-20:00",
    description: "서울중앙성원 근처 무슬림 운영 카페. 할랄 디저트와 음료.",
    photo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&auto=format&q=80",
  },
];

const MENUS = {
  "sindang-halal": [
    { id: "m1", category: "인기메뉴", name: "할랄 갈비탕", description: "사골 육수와 소갈비", price: 13500, photo: null },
    { id: "m2", category: "인기메뉴", name: "비빔밥 (할랄)", description: "신선한 채소와 소고기", price: 11000, photo: null },
    { id: "m3", category: "인기메뉴", name: "된장찌개 세트", description: "된장찌개 + 밥 + 반찬", price: 12000, photo: null },
    { id: "m4", category: "인기메뉴", name: "할랄 삼계탕", description: "인삼 닭백숙", price: 16500, photo: null },
    { id: "m5", category: "한식", name: "불고기 정식", description: "양념 소불고기 + 반찬", price: 14000, photo: null },
    { id: "m6", category: "한식", name: "잡채밥", description: "잡채 + 밥", price: 10500, photo: null },
    { id: "m7", category: "세트", name: "2인 세트 A", description: "갈비탕 + 비빔밥 + 음료 2잔", price: 22000, photo: null },
    { id: "m8", category: "음료", name: "식혜", description: "전통 쌀 음료", price: 3000, photo: null },
    { id: "m9", category: "음료", name: "유자차", description: "뜨거운 유자차", price: 3500, photo: null },
  ],
  "itaewon-kebab": [
    { id: "k1", category: "인기메뉴", name: "되네르 케밥", description: "양고기 또는 닭고기 선택", price: 9500, photo: null },
    { id: "k2", category: "인기메뉴", name: "아다나 케밥", description: "매운 양고기 꼬치", price: 14000, photo: null },
    { id: "k3", category: "인기메뉴", name: "이스켄데르 케밥", description: "요거트 소스 케밥", price: 16000, photo: null },
    { id: "k4", category: "사이드", name: "후무스", description: "병아리콩 딥", price: 5000, photo: null },
    { id: "k5", category: "음료", name: "아이란", description: "터키 전통 요거트 음료", price: 3000, photo: null },
  ],
};

const MOSQUES = [
  {
    id: "seoul-central",
    name: "Seoul Central Mosque",
    nameKo: "서울중앙성원",
    subtitle: "이슬람 서울 센터",
    type: "mosque",
    address: "서울특별시 용산구 우사단로10길 39",
    distance: "1.2km",
    walkTime: "도보 15분",
    phone: "02-793-6908",
    facilities: ["우두 시설", "여성 기도실", "주차 가능", "영어 가능"],
    juma: "매주 금요일 12:30",
    photo: "https://images.unsplash.com/photo-1519817650134-7780eb40b2fb?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "itaewon-masjid",
    name: "Itaewon Masjid",
    nameKo: "이태원 마스지드",
    subtitle: null,
    type: "mosque",
    address: "서울특별시 용산구 이태원로 27",
    distance: "0.3km",
    walkTime: "도보 4분",
    phone: "02-795-1234",
    facilities: ["우두 시설", "주차 가능"],
    juma: "매주 금요일 13:00",
    photo: null,
  },
  {
    id: "coex-prayer",
    name: "COEX Prayer Room",
    nameKo: "코엑스 기도실",
    subtitle: null,
    type: "prayer-room",
    address: "서울특별시 강남구 삼성동 코엑스몰 B1",
    distance: "3.8km",
    walkTime: null,
    phone: null,
    facilities: ["우두 시설"],
    juma: null,
    photo: null,
  },
  {
    id: "suwon-mosque",
    name: "Suwon Islamic Center",
    nameKo: "수원 이슬람 성원",
    subtitle: null,
    type: "mosque",
    address: "경기도 수원시 팔달구 매산로 88",
    distance: "12km",
    walkTime: "차량 25분",
    phone: "031-242-5678",
    facilities: ["우두 시설", "여성 기도실", "주차 가능", "한국어 가능"],
    juma: "매주 금요일 12:30",
    photo: null,
  },
];

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

const port = Number(process.env.API_PORT || 8787);
api.listen(port, "127.0.0.1", () => {
  console.log(`HalalMap API http://127.0.0.1:${port}`);
});
