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

  CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('restaurant', 'mosque', 'prayer_room')),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS place_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action TEXT NOT NULL CHECK (action IN ('add', 'correction')),
    type TEXT NOT NULL CHECK (type IN ('restaurant', 'mosque', 'prayer_room')),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS role_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    requested_role TEXT NOT NULL CHECK (requested_role IN ('courier', 'owner')),
    phone TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS partner_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role TEXT NOT NULL CHECK (role IN ('courier', 'owner')),
    nickname TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    document_data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, nickname)
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

const seedPartner = db.prepare(`INSERT OR IGNORE INTO partner_accounts (user_id, role, nickname, password_hash, full_name, phone, address, document_data, status) SELECT id, ?, ?, ?, name, ?, ?, ?, 'approved' FROM users WHERE email = ?`);
seedPartner.run("courier", "courier_test", hashPassword("Courier123!"), "010-0000-0001", "Seoul", JSON.stringify({ driverLicense: "TEST-DL", vehiclePlate: "12가3456", vehicleRegistration: "TEST-VR" }), "courier@halalmap.test");
seedPartner.run("owner", "owner_test", hashPassword("Owner123!"), "010-0000-0002", "Seoul", JSON.stringify({ restaurantName: "신당 할랄 키친", identityNumber: "TEST-ID", businessRegistrationNumber: "000-00-00000" }), "owner@halalmap.test");

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
const prayerCache = new Map();

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

    if (request.method === "GET" && url.pathname === "/api/prayer-times") {
      const latitude = Number(url.searchParams.get("latitude") || 37.5665);
      const longitude = Number(url.searchParams.get("longitude") || 126.9780);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < 32 || latitude > 40 || longitude < 123 || longitude > 133) return json(response, 400, { error: "Faqat Koreya hududidagi koordinatalar qabul qilinadi" });
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(new Date());
      const part = (type) => parts.find((item) => item.type === type)?.value;
      const date = `${part("day")}-${part("month")}-${part("year")}`;
      const cacheKey = `${date}:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
      if (prayerCache.has(cacheKey)) return json(response, 200, prayerCache.get(cacheKey));
      const upstream = new URL(`https://api.aladhan.com/v1/timings/${date}`);
      upstream.searchParams.set("latitude", String(latitude)); upstream.searchParams.set("longitude", String(longitude)); upstream.searchParams.set("method", "3"); upstream.searchParams.set("school", "0"); upstream.searchParams.set("timezonestring", "Asia/Seoul"); upstream.searchParams.set("calendarMethod", "UAQ");
      const apiResponse = await fetch(upstream, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
      if (!apiResponse.ok) return json(response, 502, { error: "Namoz vaqti manbasi javob bermadi" });
      const payload = await apiResponse.json();
      const data = payload?.data;
      if (!data?.timings) return json(response, 502, { error: "Namoz vaqti ma’lumoti noto‘g‘ri" });
      const result = { source: "AlAdhan", calculationMethod: "Muslim World League", timezone: "Asia/Seoul", coordinates: { latitude, longitude }, timings: { Fajr: data.timings.Fajr, Sunrise: data.timings.Sunrise, Dhuhr: data.timings.Dhuhr, Asr: data.timings.Asr, Maghrib: data.timings.Maghrib, Isha: data.timings.Isha }, date: data.date };
      prayerCache.set(cacheKey, result);
      return json(response, 200, result);
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

    if (request.method === "POST" && url.pathname === "/api/place-submissions") {
      const auth = authenticate(request);
      if (!auth) return json(response, 401, { error: "Login talab qilinadi" });
      const body = await readJson(request);
      const action = body.action === "correction" ? "correction" : "add";
      const type = ["restaurant", "mosque", "prayer_room"].includes(body.type) ? body.type : "";
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const address = typeof body.address === "string" ? body.address.trim() : "";
      const details = typeof body.details === "string" ? body.details.trim() : "";
      if (!type || !name || !address) return json(response, 400, { error: "Turi, nomi va manzili majburiy" });
      const result = db.prepare("INSERT INTO place_submissions (user_id, action, type, name, address, details) VALUES (?, ?, ?, ?, ?, ?)").run(auth.user.id, action, type, name, address, details);
      return json(response, 201, { success: true, id: Number(result.lastInsertRowid), status: "pending" });
    }

    if (request.method === "POST" && url.pathname === "/api/role-applications") {
      const auth = authenticate(request);
      if (!auth) return json(response, 401, { error: "Login talab qilinadi" });
      const body = await readJson(request);
      const requestedRole = body.requestedRole === "courier" ? "courier" : body.requestedRole === "owner" ? "owner" : "";
      const phone = typeof body.phone === "string" ? body.phone.trim() : "";
      const details = typeof body.details === "string" ? body.details.trim() : "";
      if (!requestedRole || !phone || !details) return json(response, 400, { error: "Barcha ma’lumotlarni kiriting" });
      db.prepare("INSERT INTO role_applications (user_id, requested_role, phone, details) VALUES (?, ?, ?, ?)").run(auth.user.id, requestedRole, phone, details);
      return json(response, 201, { success: true, status: "pending" });
    }

    if (request.method === "POST" && url.pathname === "/api/partners/register") {
      const auth = authenticate(request);
      if (!auth) return json(response, 401, { error: "Asosiy akkauntga login talab qilinadi" });
      const body = await readJson(request);
      const role = body.role === "courier" ? "courier" : body.role === "owner" ? "owner" : "";
      const nickname = typeof body.nickname === "string" ? body.nickname.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
      const phone = typeof body.phone === "string" ? body.phone.trim() : "";
      const address = typeof body.address === "string" ? body.address.trim() : "";
      const documents = body.documents && typeof body.documents === "object" ? body.documents : {};
      if (!role || nickname.length < 3 || password.length < 8 || !fullName || !phone || !address) return json(response, 400, { error: "Majburiy maydonlarni to‘liq kiriting. Parol kamida 8 belgi bo‘lsin" });
      const required = role === "courier" ? ["driverLicense", "vehiclePlate", "vehicleRegistration"] : ["restaurantName", "identityNumber", "businessRegistrationNumber"];
      if (required.some((key) => typeof documents[key] !== "string" || !documents[key].trim())) return json(response, 400, { error: "Kerakli hujjat raqamlarini kiriting" });
      try {
        db.prepare("INSERT INTO partner_accounts (user_id, role, nickname, password_hash, full_name, phone, address, document_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(auth.user.id, role, nickname, hashPassword(password), fullName, phone, address, JSON.stringify(documents));
      } catch (error) {
        if (String(error).includes("UNIQUE")) return json(response, 409, { error: "Bu nickname band" });
        throw error;
      }
      return json(response, 201, { success: true, status: "pending" });
    }

    if (request.method === "POST" && url.pathname === "/api/partners/login") {
      const auth = authenticate(request);
      if (!auth) return json(response, 401, { error: "Asosiy akkauntga login talab qilinadi" });
      const body = await readJson(request);
      const role = body.role === "courier" ? "courier" : body.role === "owner" ? "owner" : "";
      const nickname = typeof body.nickname === "string" ? body.nickname.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      const account = db.prepare("SELECT * FROM partner_accounts WHERE role = ? AND nickname = ?").get(role, nickname);
      if (!account || account.user_id !== auth.user.id || !verifyPassword(password, account.password_hash)) return json(response, 401, { error: "Nickname yoki parol noto‘g‘ri" });
      if (account.status !== "approved") return json(response, 403, { error: account.status === "pending" ? "Ariza hali Admin tasdig‘idan o‘tmagan" : "Ariza rad etilgan" });
      return json(response, 200, { success: true, role: account.role });
    }

    if (request.method === "GET" && url.pathname === "/api/admin/place-submissions") {
      const auth = authenticate(request);
      if (!auth || auth.user.role !== "admin") return json(response, 403, { error: "Admin huquqi talab qilinadi" });
      const rows = db.prepare(`SELECT ps.*, users.email AS reporter_email FROM place_submissions ps JOIN users ON users.id = ps.user_id ORDER BY ps.created_at DESC`).all();
      return json(response, 200, { submissions: rows });
    }

    const reviewMatch = url.pathname.match(/^\/api\/admin\/place-submissions\/(\d+)$/);
    if (request.method === "PATCH" && reviewMatch) {
      const auth = authenticate(request);
      if (!auth || auth.user.role !== "admin") return json(response, 403, { error: "Admin huquqi talab qilinadi" });
      const body = await readJson(request);
      const status = body.status === "approved" ? "approved" : body.status === "rejected" ? "rejected" : "";
      if (!status) return json(response, 400, { error: "Noto‘g‘ri status" });
      const submission = db.prepare("SELECT * FROM place_submissions WHERE id = ? AND status = 'pending'").get(Number(reviewMatch[1]));
      if (!submission) return json(response, 404, { error: "Kutilayotgan taklif topilmadi" });
      db.exec("BEGIN");
      try {
        if (status === "approved") db.prepare("INSERT INTO places (type, name, address, details) VALUES (?, ?, ?, ?)").run(submission.type, submission.name, submission.address, submission.details);
        db.prepare("UPDATE place_submissions SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, auth.user.id, submission.id);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
      return json(response, 200, { success: true, status });
    }

    return json(response, 404, { error: "Endpoint topilmadi" });
  } catch (error) {
    console.error(error);
    return json(response, 500, { error: "Server xatosi" });
  }
});

const port = Number(process.env.API_PORT || 8787);
api.listen(port, "127.0.0.1", () => {
  console.log(`HalalMap API http://127.0.0.1:${port}`);
});
