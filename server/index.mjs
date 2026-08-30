import { createServer } from "node:http";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:halalmap_dev@127.0.0.1:5432/halalmap";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
});

const query = (text, params) => pool.query(text, params);

// ── Schema ──────────────────────────────────────────────────────────────────
await query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'owner', 'courier', 'admin')),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Halal-certification style shown on the restaurant card (certified/owned/friendly)
  CREATE TABLE IF NOT EXISTS restaurant_submissions (
    id SERIAL PRIMARY KEY,
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    cuisine TEXT,
    badge TEXT NOT NULL DEFAULT 'friendly' CHECK (badge IN ('certified', 'owned', 'friendly')),
    certifying_body TEXT,
    address TEXT NOT NULL,
    city TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    phone TEXT,
    description TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    reject_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS mosque_submissions (
    id SERIAL PRIMARY KEY,
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    has_prayer_room BOOLEAN NOT NULL DEFAULT true,
    address TEXT NOT NULL,
    city TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    contact TEXT,
    capacity INTEGER,
    description TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    reject_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_restaurant_submissions_status ON restaurant_submissions(status);
  CREATE INDEX IF NOT EXISTS idx_mosque_submissions_status ON mosque_submissions(status);
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

for (const [email, name, role, password] of testUsers) {
  await query(
    `INSERT INTO users (email, name, role, password_hash) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [email, name, role, hashPassword(password)]
  );
}

// ── HTTP helpers ────────────────────────────────────────────────────────────
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
    if (size > 65_536) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
};

const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name, role: user.role });

const authenticate = async (request) => {
  const authorization = request.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;
  const result = await query(
    `SELECT users.id, users.email, users.name, users.role
     FROM sessions JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = $1 AND sessions.expires_at > $2`,
    [token, Date.now()]
  );
  return result.rows[0] ? { token, user: result.rows[0] } : null;
};

const requireAuth = async (request, response) => {
  const auth = await authenticate(request);
  if (!auth) {
    json(response, 401, { error: "Session yaroqsiz yoki muddati tugagan" });
    return null;
  }
  return auth;
};

const str = (value, max = 2000) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const num = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

const publicSubmission = (row) => ({
  id: row.id,
  name: row.name,
  badge: row.badge,
  cuisine: row.cuisine,
  certifyingBody: row.certifying_body,
  address: row.address,
  city: row.city,
  lat: row.lat,
  lng: row.lng,
  phone: row.phone,
  description: row.description,
  photoUrl: row.photo_url,
  status: row.status,
  rejectReason: row.reject_reason,
  submittedBy: row.submitted_by,
  createdAt: row.created_at,
});

const publicMosqueSubmission = (row) => ({
  id: row.id,
  name: row.name,
  hasPrayerRoom: row.has_prayer_room,
  address: row.address,
  city: row.city,
  lat: row.lat,
  lng: row.lng,
  contact: row.contact,
  capacity: row.capacity,
  description: row.description,
  photoUrl: row.photo_url,
  status: row.status,
  rejectReason: row.reject_reason,
  submittedBy: row.submitted_by,
  createdAt: row.created_at,
});

// ── Server ──────────────────────────────────────────────────────────────────
const api = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    const { method } = request;
    const path = url.pathname;

    // ── Health ──
    if (method === "GET" && path === "/api/health") {
      const startedAt = Date.now();
      const result = await query("SELECT 1 AS connected, current_database() AS database");
      return json(response, 200, {
        status: "ok",
        database: "connected",
        databaseName: result.rows[0].database,
        latencyMs: Date.now() - startedAt,
      });
    }

    // ── Auth ──
    if (method === "POST" && path === "/api/auth/login") {
      const body = await readJson(request);
      const email = str(body.email, 200).toLowerCase();
      const password = typeof body.password === "string" ? body.password : "";
      const result = await query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];
      if (!user || !verifyPassword(password, user.password_hash)) {
        return json(response, 401, { error: "Email yoki parol noto‘g‘ri" });
      }
      await query("DELETE FROM sessions WHERE expires_at <= $1", [Date.now()]);
      const token = randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await query("INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)", [token, user.id, expiresAt]);
      return json(response, 200, { token, user: publicUser(user) });
    }

    if (method === "GET" && path === "/api/auth/me") {
      const auth = await authenticate(request);
      return auth
        ? json(response, 200, { user: publicUser(auth.user) })
        : json(response, 401, { error: "Session yaroqsiz yoki muddati tugagan" });
    }

    if (method === "POST" && path === "/api/auth/logout") {
      const auth = await authenticate(request);
      if (auth) await query("DELETE FROM sessions WHERE token = $1", [auth.token]);
      return json(response, 200, { success: true });
    }

    // ── Restaurant submissions (crowdsourced halal restaurant data) ──
    if (method === "POST" && path === "/api/restaurants") {
      const auth = await requireAuth(request, response);
      if (!auth) return;
      const body = await readJson(request);
      const name = str(body.name, 200);
      const address = str(body.address, 400);
      if (!name || !address) return json(response, 400, { error: "Nomi va manzili majburiy" });
      const badge = ["certified", "owned", "friendly"].includes(body.badge) ? body.badge : "friendly";
      const result = await query(
        `INSERT INTO restaurant_submissions
           (submitted_by, name, cuisine, badge, certifying_body, address, city, lat, lng, phone, description, photo_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [auth.user.id, name, str(body.cuisine, 100), badge, str(body.certifyingBody, 200), address,
         str(body.city, 100), num(body.lat), num(body.lng), str(body.phone, 50), str(body.description, 2000), str(body.photoUrl, 1000)]
      );
      return json(response, 201, { submission: publicSubmission(result.rows[0]) });
    }

    if (method === "GET" && path === "/api/restaurants") {
      const status = ["pending", "approved", "rejected"].includes(url.searchParams.get("status"))
        ? url.searchParams.get("status") : "approved";
      const result = await query(
        "SELECT * FROM restaurant_submissions WHERE status = $1 ORDER BY created_at DESC LIMIT 200",
        [status]
      );
      return json(response, 200, { restaurants: result.rows.map(publicSubmission) });
    }

    if (method === "GET" && path === "/api/restaurants/mine") {
      const auth = await requireAuth(request, response);
      if (!auth) return;
      const result = await query(
        "SELECT * FROM restaurant_submissions WHERE submitted_by = $1 ORDER BY created_at DESC",
        [auth.user.id]
      );
      return json(response, 200, { restaurants: result.rows.map(publicSubmission) });
    }

    // ── Mosque / prayer room submissions ──
    if (method === "POST" && path === "/api/mosques") {
      const auth = await requireAuth(request, response);
      if (!auth) return;
      const body = await readJson(request);
      const name = str(body.name, 200);
      const address = str(body.address, 400);
      if (!name || !address) return json(response, 400, { error: "Nomi va manzili majburiy" });
      const result = await query(
        `INSERT INTO mosque_submissions
           (submitted_by, name, has_prayer_room, address, city, lat, lng, contact, capacity, description, photo_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [auth.user.id, name, body.hasPrayerRoom !== false, address, str(body.city, 100),
         num(body.lat), num(body.lng), str(body.contact, 100), Number.isInteger(body.capacity) ? body.capacity : null,
         str(body.description, 2000), str(body.photoUrl, 1000)]
      );
      return json(response, 201, { submission: publicMosqueSubmission(result.rows[0]) });
    }

    if (method === "GET" && path === "/api/mosques") {
      const status = ["pending", "approved", "rejected"].includes(url.searchParams.get("status"))
        ? url.searchParams.get("status") : "approved";
      const result = await query(
        "SELECT * FROM mosque_submissions WHERE status = $1 ORDER BY created_at DESC LIMIT 200",
        [status]
      );
      return json(response, 200, { mosques: result.rows.map(publicMosqueSubmission) });
    }

    if (method === "GET" && path === "/api/mosques/mine") {
      const auth = await requireAuth(request, response);
      if (!auth) return;
      const result = await query(
        "SELECT * FROM mosque_submissions WHERE submitted_by = $1 ORDER BY created_at DESC",
        [auth.user.id]
      );
      return json(response, 200, { mosques: result.rows.map(publicMosqueSubmission) });
    }

    // ── Admin moderation ──
    const restaurantModerationMatch = path.match(/^\/api\/admin\/restaurants\/(\d+)\/(approve|reject)$/);
    const mosqueModerationMatch = path.match(/^\/api\/admin\/mosques\/(\d+)\/(approve|reject)$/);

    if (method === "POST" && (restaurantModerationMatch || mosqueModerationMatch)) {
      const auth = await requireAuth(request, response);
      if (!auth) return;
      if (auth.user.role !== "admin") return json(response, 403, { error: "Faqat admin uchun" });

      const match = restaurantModerationMatch || mosqueModerationMatch;
      const [, id, action] = match;
      const table = restaurantModerationMatch ? "restaurant_submissions" : "mosque_submissions";
      const body = await readJson(request).catch(() => ({}));
      const status = action === "approve" ? "approved" : "rejected";
      const result = await query(
        `UPDATE ${table} SET status = $1, reviewed_by = $2, reviewed_at = now(), reject_reason = $3
         WHERE id = $4 RETURNING *`,
        [status, auth.user.id, action === "reject" ? str(body.reason, 500) : null, id]
      );
      if (!result.rows[0]) return json(response, 404, { error: "Topilmadi" });
      const mapper = restaurantModerationMatch ? publicSubmission : publicMosqueSubmission;
      return json(response, 200, { submission: mapper(result.rows[0]) });
    }

    if (method === "GET" && path === "/api/admin/submissions") {
      const auth = await requireAuth(request, response);
      if (!auth) return;
      if (auth.user.role !== "admin") return json(response, 403, { error: "Faqat admin uchun" });
      const status = ["pending", "approved", "rejected"].includes(url.searchParams.get("status"))
        ? url.searchParams.get("status") : "pending";
      const [restaurants, mosques] = await Promise.all([
        query("SELECT * FROM restaurant_submissions WHERE status = $1 ORDER BY created_at DESC", [status]),
        query("SELECT * FROM mosque_submissions WHERE status = $1 ORDER BY created_at DESC", [status]),
      ]);
      return json(response, 200, {
        restaurants: restaurants.rows.map(publicSubmission),
        mosques: mosques.rows.map(publicMosqueSubmission),
      });
    }

    return json(response, 404, { error: "Endpoint topilmadi" });
  } catch (error) {
    console.error(error);
    return json(response, 500, { error: "Server xatosi" });
  }
});

const port = Number(process.env.API_PORT || 8787);
api.listen(port, "127.0.0.1", () => {
  console.log(`HalalMap API http://127.0.0.1:${port} (Postgres: ${DATABASE_URL.replace(/:[^:@]*@/, ":****@")})`);
});
