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
