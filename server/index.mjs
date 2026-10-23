// HalalMap Korea API: community place submissions with admin approval.
//
// Public:  GET /api/health, GET /api/places, POST /api/submissions, POST /api/uploads, GET /uploads/<id>.jpg,
//          GET /api/reviews/summary, GET /api/reviews?placeId=, POST /api/reviews
// Admin:   GET /api/admin/submissions, POST /api/admin/submissions/:id/(approve|reject),
//          GET /api/admin/reviews, POST /api/admin/reviews/:id/delete
//          (Authorization: Bearer <ADMIN_TOKEN>)
// Also serves the built web app (dist/) so one process hosts site and API on the same origin.
//
// Config (env): PORT, HOST, DATA_DIR, ADMIN_TOKEN (>=24 chars; admin disabled if unset),
//               ALLOWED_ORIGINS (only needed if the web app is hosted on another origin),
//               STATIC_DIR (default ../dist), TRUST_PROXY=cloudflare|1 behind a proxy.
// Requires Node >= 22.13 (node:sqlite). DATA_DIR must be on persistent storage.

import { createServer } from "node:http";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const PORT = Number(process.env.PORT || process.env.API_PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
// Where the client IP comes from for rate limiting: "cloudflare" = CF-Connecting-IP (behind Cloudflare/cloudflared),
// "1" = last X-Forwarded-For hop (single trusted reverse proxy), otherwise the socket address.
const TRUST_PROXY = process.env.TRUST_PROXY || "";
const SERVER_DIR = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(process.env.DATA_DIR || resolve(SERVER_DIR, "data"));
const STATIC_DIR = resolve(process.env.STATIC_DIR || resolve(SERVER_DIR, "../dist"));

const KINDS = ["mosque", "prayer-room", "restaurant"];
const HALAL_STATUSES = ["certified", "self-certified", "muslim-owned", "halal-friendly", "pork-free", "unverified"];
const CUISINES = ["korean", "turkish", "uzbek", "indian", "indonesian", "cafe", "other"];
const KOREA_BOUNDS = { minLat: 33, maxLat: 39, minLng: 124, maxLng: 132 };
const MAX_BODY_BYTES = 8 * 1024;
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const UPLOADS_PER_HOUR = 10;
const REVIEWS_PER_HOUR = 10;
const SUBMISSIONS_PER_HOUR = 5;

mkdirSync(DATA_DIR, { recursive: true });
const UPLOAD_DIR = resolve(DATA_DIR, "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });
const db = new DatabaseSync(resolve(DATA_DIR, "halalmap.sqlite"));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL,
    lng REAL,
    cuisine TEXT,
    halal TEXT,
    place_phone TEXT,
    notes TEXT,
    contact_name TEXT,
    contact_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    admin_note TEXT,
    ip_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    reviewed_at INTEGER
  );
  CREATE INDEX IF NOT EXISTS submissions_status_created ON submissions (status, created_at);
  CREATE INDEX IF NOT EXISTS submissions_ip_created ON submissions (ip_hash, created_at);

  CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL UNIQUE REFERENCES submissions(id),
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    name_ko TEXT,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    cuisine TEXT,
    halal TEXT,
    phone TEXT,
    open TEXT,
    close TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    ip_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS uploads_ip_created ON uploads (ip_hash, created_at);

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    place_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    author_name TEXT,
    client_hash TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE (place_id, client_hash)
  );
  CREATE INDEX IF NOT EXISTS reviews_place_created ON reviews (place_id, created_at);
  CREATE INDEX IF NOT EXISTS reviews_ip_created ON reviews (ip_hash, created_at);
`);

// Additive migrations for databases created by earlier versions.
for (const table of ["submissions", "places"]) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === "photo_id")) db.exec(`ALTER TABLE ${table} ADD COLUMN photo_id TEXT`);
}

// ── helpers ──────────────────────────────────────────────────────

const hash = (value) => createHash("sha256").update(value).digest("hex");

function corsHeaders(request) {
  const origin = request.headers.origin;
  if (!origin) return {};
  const allowed = ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin);
  return allowed
    ? {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes("*") ? "*" : origin,
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Max-Age": "600",
        Vary: "Origin",
      }
    : {};
}

function send(request, response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...corsHeaders(request),
  });
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "payload_too_large");
    chunks.push(chunk);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new HttpError(400, "invalid_json");
  }
}

async function readBytes(request, maxBytes) {
  const declared = Number(request.headers["content-length"] || 0);
  if (declared > maxBytes) throw new HttpError(413, "payload_too_large");
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new HttpError(413, "payload_too_large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function clientIp(request) {
  if (TRUST_PROXY === "cloudflare") {
    const ip = request.headers["cf-connecting-ip"];
    if (typeof ip === "string" && ip.trim()) return ip.trim();
  } else if (TRUST_PROXY === "1") {
    // The last hop is the one our own proxy appended; earlier entries are client-controlled.
    const hops = String(request.headers["x-forwarded-for"] || "").split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return request.socket.remoteAddress || "unknown";
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const text = (value, max, { required = false, field } = {}) => {
  const cleaned = typeof value === "string" ? value.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim() : "";
  if (required && !cleaned) throw new HttpError(422, `${field}_required`);
  if (cleaned.length > max) throw new HttpError(422, `${field}_too_long`);
  return cleaned || null;
};
const PHONE_RE = /^\+?[0-9][0-9\- ()]{6,19}$/;
const phone = (value, { required = false, field } = {}) => {
  const cleaned = text(value, 20, { required, field });
  if (cleaned && !PHONE_RE.test(cleaned)) throw new HttpError(422, `${field}_invalid`);
  return cleaned;
};
const oneOf = (value, allowed, field, { required = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (required) throw new HttpError(422, `${field}_required`);
    return null;
  }
  if (!allowed.includes(value)) throw new HttpError(422, `${field}_invalid`);
  return value;
};
const coordinate = (value, min, max, field) => {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(422, `${field}_invalid`);
  return n;
};
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const hhmm = (value, field) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !HHMM.test(value)) throw new HttpError(422, `${field}_invalid`);
  return value;
};

function requireAdmin(request) {
  if (ADMIN_TOKEN.length < 24) throw new HttpError(503, "admin_disabled");
  const header = request.headers.authorization || "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(hash(given));
  const b = Buffer.from(hash(ADMIN_TOKEN));
  if (!timingSafeEqual(a, b)) throw new HttpError(401, "unauthorized");
}

const publicPlace = (row) => ({
  id: `c-${row.id}`,
  kind: row.kind,
  name: row.name,
  nameKo: row.name_ko || row.name,
  address: row.address,
  lat: row.lat,
  lng: row.lng,
  cuisine: row.cuisine,
  halal: row.halal,
  phone: row.phone,
  open: row.open,
  close: row.close,
  photoUrl: row.photo_id ? `/uploads/${row.photo_id}.jpg` : null,
});

const adminSubmission = (row) => ({
  id: row.id,
  kind: row.kind,
  name: row.name,
  address: row.address,
  lat: row.lat,
  lng: row.lng,
  cuisine: row.cuisine,
  halal: row.halal,
  placePhone: row.place_phone,
  notes: row.notes,
  contactName: row.contact_name,
  contactPhone: row.contact_phone,
  status: row.status,
  adminNote: row.admin_note,
  photoUrl: row.photo_id ? `/uploads/${row.photo_id}.jpg` : null,
  createdAt: row.created_at,
  reviewedAt: row.reviewed_at,
});

// ── handlers ─────────────────────────────────────────────────────

function createSubmission(body, ip) {
  // Honeypot: real users never see or fill this field; bots do. Pretend success.
  if (typeof body.website === "string" && body.website.trim()) return { ok: true };

  const ipHash = hash(ip);
  const since = Date.now() - 60 * 60 * 1000;
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM submissions WHERE ip_hash = ? AND created_at > ?").get(ipHash, since);
  if (count >= SUBMISSIONS_PER_HOUR) throw new HttpError(429, "rate_limited");

  const kind = oneOf(body.kind, KINDS, "kind", { required: true });
  const isRestaurant = kind === "restaurant";
  const row = {
    id: randomUUID(),
    kind,
    name: text(body.name, 120, { required: true, field: "name" }),
    address: text(body.address, 250, { required: true, field: "address" }),
    lat: coordinate(body.lat, KOREA_BOUNDS.minLat, KOREA_BOUNDS.maxLat, "lat"),
    lng: coordinate(body.lng, KOREA_BOUNDS.minLng, KOREA_BOUNDS.maxLng, "lng"),
    cuisine: isRestaurant ? oneOf(body.cuisine, CUISINES, "cuisine") : null,
    halal: isRestaurant ? oneOf(body.halal, HALAL_STATUSES, "halal") : null,
    place_phone: phone(body.placePhone, { field: "place_phone" }),
    notes: text(body.notes, 500, { field: "notes" }),
    contact_name: text(body.contactName, 80, { field: "contact_name" }),
    contact_phone: phone(body.contactPhone, { required: true, field: "contact_phone" }),
    photo_id: photoRef(body.photoId),
    ip_hash: ipHash,
    created_at: Date.now(),
  };
  if ((row.lat === null) !== (row.lng === null)) throw new HttpError(422, "coordinates_incomplete");

  db.prepare(`
    INSERT INTO submissions (id, kind, name, address, lat, lng, cuisine, halal, place_phone, notes, contact_name, contact_phone, photo_id, ip_hash, created_at)
    VALUES (:id, :kind, :name, :address, :lat, :lng, :cuisine, :halal, :place_phone, :notes, :contact_name, :contact_phone, :photo_id, :ip_hash, :created_at)
  `).run(row);
  return { ok: true };
}

function approveSubmission(id, body) {
  const sub = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);
  if (!sub) throw new HttpError(404, "not_found");
  if (sub.status !== "pending") throw new HttpError(409, "already_reviewed");

  const lat = coordinate(body.lat ?? sub.lat, KOREA_BOUNDS.minLat, KOREA_BOUNDS.maxLat, "lat");
  const lng = coordinate(body.lng ?? sub.lng, KOREA_BOUNDS.minLng, KOREA_BOUNDS.maxLng, "lng");
  if (lat === null || lng === null) throw new HttpError(422, "coordinates_required");

  const isRestaurant = sub.kind === "restaurant";
  const place = {
    id: randomUUID(),
    submission_id: sub.id,
    kind: sub.kind,
    name: text(body.name ?? sub.name, 120, { required: true, field: "name" }),
    name_ko: text(body.nameKo, 120, { field: "name_ko" }),
    address: text(body.address ?? sub.address, 250, { required: true, field: "address" }),
    lat,
    lng,
    cuisine: isRestaurant ? oneOf(body.cuisine ?? sub.cuisine, CUISINES, "cuisine") : null,
    halal: isRestaurant ? oneOf(body.halal ?? sub.halal ?? "unverified", HALAL_STATUSES, "halal") : null,
    phone: phone(body.phone ?? sub.place_phone, { field: "phone" }),
    open: hhmm(body.open, "open"),
    close: hhmm(body.close, "close"),
    photo_id: sub.photo_id,
    created_at: Date.now(),
  };
  if ((place.open === null) !== (place.close === null)) throw new HttpError(422, "hours_incomplete");

  db.exec("BEGIN");
  try {
    db.prepare(`
      INSERT INTO places (id, submission_id, kind, name, name_ko, address, lat, lng, cuisine, halal, phone, open, close, photo_id, created_at)
      VALUES (:id, :submission_id, :kind, :name, :name_ko, :address, :lat, :lng, :cuisine, :halal, :phone, :open, :close, :photo_id, :created_at)
    `).run(place);
    db.prepare("UPDATE submissions SET status = 'approved', reviewed_at = ?, admin_note = ? WHERE id = ?")
      .run(Date.now(), text(body.adminNote, 500, { field: "admin_note" }), sub.id);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { ok: true };
}

function rejectSubmission(id, body) {
  const result = db
    .prepare("UPDATE submissions SET status = 'rejected', reviewed_at = ?, admin_note = ? WHERE id = ? AND status = 'pending'")
    .run(Date.now(), text(body.adminNote, 500, { field: "admin_note" }), id);
  if (result.changes === 0) {
    const exists = db.prepare("SELECT 1 FROM submissions WHERE id = ?").get(id);
    throw new HttpError(exists ? 409 : 404, exists ? "already_reviewed" : "not_found");
  }
  return { ok: true };
}

// ── photos ───────────────────────────────────────────────────────

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Validates a photo id from a submission: it must be one of our uploads. */
function photoRef(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !UUID.test(value)) throw new HttpError(422, "photo_invalid");
  if (!db.prepare("SELECT 1 FROM uploads WHERE id = ?").get(value)) throw new HttpError(422, "photo_invalid");
  return value;
}

/** Accepts one JPEG (the web app re-encodes every photo to JPEG, which also strips EXIF/location data). */
async function createUpload(request, ip) {
  if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("image/jpeg")) throw new HttpError(415, "jpeg_only");
  const ipHash = hash(ip);
  const since = Date.now() - 60 * 60 * 1000;
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM uploads WHERE ip_hash = ? AND created_at > ?").get(ipHash, since);
  if (count >= UPLOADS_PER_HOUR) throw new HttpError(429, "rate_limited");

  const bytes = await readBytes(request, MAX_UPLOAD_BYTES);
  const isJpeg = bytes.length > 1024 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!isJpeg) throw new HttpError(415, "jpeg_only");

  const id = randomUUID();
  writeFileSync(resolve(UPLOAD_DIR, `${id}.jpg`), bytes);
  db.prepare("INSERT INTO uploads (id, ip_hash, created_at) VALUES (?, ?, ?)").run(id, ipHash, Date.now());
  return { photoId: id };
}

const UPLOAD_PATH = /^\/uploads\/([0-9a-f-]{36})\.jpg$/;

function serveUpload(request, response, id) {
  const file = resolve(UPLOAD_DIR, `${id}.jpg`);
  if (!UUID.test(id) || !existsSync(file)) throw new HttpError(404, "not_found");
  response.writeHead(200, {
    "Content-Type": "image/jpeg",
    "Content-Length": statSync(file).size,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  if (request.method === "HEAD") return response.end();
  createReadStream(file).pipe(response);
}

// ── reviews ──────────────────────────────────────────────────────

// OSM-derived places only exist client-side, so their ids are validated by shape; community places must exist.
const PLACE_ID = /^(osm-(node|way|relation)-\d{1,15}|c-[0-9a-f-]{36})$/;
const CLIENT_ID = /^[A-Za-z0-9-]{16,64}$/;

const publicReview = (row) => ({
  id: row.id,
  rating: row.rating,
  comment: row.comment,
  name: row.author_name,
  createdAt: row.created_at,
});

function reviewSummary() {
  const rows = db.prepare("SELECT place_id, AVG(rating) AS avg, COUNT(*) AS count FROM reviews GROUP BY place_id").all();
  return Object.fromEntries(rows.map((r) => [r.place_id, { avg: Math.round(r.avg * 10) / 10, count: r.count }]));
}

function listReviews(placeId) {
  if (!PLACE_ID.test(placeId)) throw new HttpError(422, "place_invalid");
  const rows = db.prepare("SELECT * FROM reviews WHERE place_id = ? ORDER BY created_at DESC LIMIT 30").all(placeId);
  const stats = db.prepare("SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE place_id = ?").get(placeId);
  return { avg: stats.count ? Math.round(stats.avg * 10) / 10 : null, count: stats.count, reviews: rows.map(publicReview) };
}

function createReview(body, ip) {
  if (typeof body.website === "string" && body.website.trim()) return { ok: true }; // honeypot

  const placeId = typeof body.placeId === "string" ? body.placeId : "";
  if (!PLACE_ID.test(placeId)) throw new HttpError(422, "place_invalid");
  if (placeId.startsWith("c-") && !db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId.slice(2))) throw new HttpError(404, "place_not_found");
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(422, "rating_invalid");
  if (typeof body.clientId !== "string" || !CLIENT_ID.test(body.clientId)) throw new HttpError(422, "client_invalid");

  const ipHash = hash(ip);
  const since = Date.now() - 60 * 60 * 1000;
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM reviews WHERE ip_hash = ? AND created_at > ?").get(ipHash, since);
  if (count >= REVIEWS_PER_HOUR) throw new HttpError(429, "rate_limited");

  try {
    db.prepare("INSERT INTO reviews (id, place_id, rating, comment, author_name, client_hash, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      randomUUID(),
      placeId,
      rating,
      text(body.comment, 500, { field: "comment" }),
      text(body.name, 40, { field: "name" }),
      hash(body.clientId),
      ipHash,
      Date.now(),
    );
  } catch (error) {
    if (String(error?.message).includes("UNIQUE")) throw new HttpError(409, "already_reviewed");
    throw error;
  }
  return { ok: true };
}

// ── static web app ───────────────────────────────────────────────

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".ico": "image/x-icon", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

// Fonts come from Google Fonts (see src/index.css); everything else is same-origin.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(self), camera=(), microphone=()",
};

/** Serves a file from STATIC_DIR; unknown paths fall back to index.html (hash routing needs only "/"). */
function serveStatic(request, response, pathname) {
  if (!existsSync(resolve(STATIC_DIR, "index.html"))) throw new HttpError(404, "not_found");
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    throw new HttpError(400, "bad_path");
  }
  if (decoded.includes("\0")) throw new HttpError(400, "bad_path");
  let target = resolve(STATIC_DIR, "." + decoded);
  // Path traversal guard: the resolved path must stay inside STATIC_DIR.
  if (target !== STATIC_DIR && !target.startsWith(STATIC_DIR + sep)) throw new HttpError(403, "forbidden");
  if (!existsSync(target) || statSync(target).isDirectory()) {
    // A missing hashed asset must 404 (not return the app shell) so stale clients fail visibly.
    if (decoded.startsWith("/assets/")) throw new HttpError(404, "not_found");
    target = resolve(STATIC_DIR, "index.html");
  }
  const type = MIME[extname(target)] ?? "application/octet-stream";
  const immutable = target.startsWith(resolve(STATIC_DIR, "assets") + sep); // hashed filenames
  response.writeHead(200, {
    "Content-Type": type,
    "Content-Length": statSync(target).size,
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
    ...SECURITY_HEADERS,
  });
  if (request.method === "HEAD") return response.end();
  createReadStream(target).pipe(response);
}

const ADMIN_ROUTE = /^\/api\/admin\/submissions\/([0-9a-f-]{36})\/(approve|reject)$/;

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    const { pathname } = url;
    const method = request.method ?? "GET";

    if (method === "OPTIONS") return send(request, response, 204);

    if (method === "GET" && pathname === "/api/health") return send(request, response, 200, { status: "ok" });

    if (method === "GET" && pathname === "/api/places") {
      const rows = db.prepare("SELECT * FROM places ORDER BY created_at").all();
      return send(request, response, 200, { places: rows.map(publicPlace) });
    }

    if (method === "POST" && pathname === "/api/submissions") {
      return send(request, response, 201, createSubmission(await readJson(request), clientIp(request)));
    }

    if (method === "POST" && pathname === "/api/uploads") {
      return send(request, response, 201, await createUpload(request, clientIp(request)));
    }

    const uploadMatch = method === "GET" || method === "HEAD" ? UPLOAD_PATH.exec(pathname) : null;
    if (uploadMatch) return serveUpload(request, response, uploadMatch[1]);

    if (method === "GET" && pathname === "/api/reviews/summary") return send(request, response, 200, { summary: reviewSummary() });
    if (method === "GET" && pathname === "/api/reviews") return send(request, response, 200, listReviews(url.searchParams.get("placeId") || ""));
    if (method === "POST" && pathname === "/api/reviews") {
      return send(request, response, 201, createReview(await readJson(request), clientIp(request)));
    }

    if (method === "GET" && pathname === "/api/admin/reviews") {
      requireAdmin(request);
      const rows = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 100").all();
      return send(request, response, 200, { reviews: rows.map((r) => ({ ...publicReview(r), placeId: r.place_id })) });
    }

    const reviewDelete = method === "POST" ? /^\/api\/admin\/reviews\/([0-9a-f-]{36})\/delete$/.exec(pathname) : null;
    if (reviewDelete) {
      requireAdmin(request);
      const result = db.prepare("DELETE FROM reviews WHERE id = ?").run(reviewDelete[1]);
      if (result.changes === 0) throw new HttpError(404, "not_found");
      return send(request, response, 200, { ok: true });
    }

    if (method === "GET" && pathname === "/api/admin/submissions") {
      requireAdmin(request);
      const status = oneOf(url.searchParams.get("status") || "pending", ["pending", "approved", "rejected"], "status");
      const rows = db.prepare("SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC LIMIT 200").all(status);
      return send(request, response, 200, { submissions: rows.map(adminSubmission) });
    }

    const adminMatch = method === "POST" ? ADMIN_ROUTE.exec(pathname) : null;
    if (adminMatch) {
      requireAdmin(request);
      const body = await readJson(request);
      const [, id, action] = adminMatch;
      return send(request, response, 200, action === "approve" ? approveSubmission(id, body) : rejectSubmission(id, body));
    }

    if ((method === "GET" || method === "HEAD") && !pathname.startsWith("/api/")) return serveStatic(request, response, pathname);

    throw new HttpError(404, "not_found");
  } catch (error) {
    if (error instanceof HttpError) return send(request, response, error.status, { error: error.message });
    console.error(error);
    return send(request, response, 500, { error: "server_error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`HalalMap http://${HOST}:${PORT} (web ${existsSync(STATIC_DIR) ? "served from " + STATIC_DIR : "NOT built: run pnpm build"}; admin ${ADMIN_TOKEN.length >= 24 ? "enabled" : "DISABLED: set ADMIN_TOKEN"})`);
});
