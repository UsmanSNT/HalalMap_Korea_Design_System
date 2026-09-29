import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { HttpError } from "./http.mjs";

const testUsers = [
  ["user@halalmap.test", "Test User", "user", "User123!"],
  ["owner@halalmap.test", "Test Restaurant Owner", "owner", "Owner123!"],
  ["courier@halalmap.test", "Test Courier", "courier", "Courier123!"],
  ["admin@halalmap.test", "Test Admin", "admin", "Admin123!"],
];

export const hashPassword = (password, salt = randomBytes(16).toString("hex")) =>
  `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

export const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

/**
 * The well-known test accounts (including an admin) are seeded for local development and the
 * demo. They are NOT seeded when NODE_ENV=production unless HALALMAP_SEED_TEST_USERS=1, because
 * the admin console can now edit product/ingredient/rule data.
 */
export const seedTestUsers = (db) => {
  const enabled =
    process.env.HALALMAP_SEED_TEST_USERS === "1" ||
    (process.env.HALALMAP_SEED_TEST_USERS !== "0" && process.env.NODE_ENV !== "production");
  if (!enabled) return;
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, name, role, password_hash)
    VALUES (?, ?, ?, ?)
  `);
  for (const [email, name, role, password] of testUsers) {
    insertUser.run(email, name, role, hashPassword(password));
  }
};

export const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name, role: user.role });

export const authenticate = (db, request) => {
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

export const requireAdmin = (db, request) => {
  const auth = authenticate(db, request);
  if (!auth) throw new HttpError(401, "Avtorizatsiya talab qilinadi", "unauthorized");
  if (auth.user.role !== "admin") throw new HttpError(403, "Admin huquqi talab qilinadi", "forbidden");
  return auth;
};
