import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { importLegacyPlaces, stashLegacyPlaces } from "./places/legacy-codex.mjs";

const serverDir = dirname(fileURLToPath(import.meta.url));

export const dataDir = process.env.HALALMAP_DATA_DIR
  ? resolve(process.env.HALALMAP_DATA_DIR)
  : resolve(serverDir, "data");
export const uploadsDir = resolve(dataDir, "uploads");
export const dbPath = process.env.HALALMAP_DB_PATH
  ? resolve(process.env.HALALMAP_DB_PATH)
  : resolve(dataDir, "halalmap.sqlite");

const migrationsDir = resolve(serverDir, "migrations");

/** Applies every `migrations/NNN_*.sql` file that has not run yet, in order, each inside a transaction. */
export function migrate(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  const applied = new Set(db.prepare("SELECT version FROM schema_migrations").all().map((row) => row.version));
  const files = readdirSync(migrationsDir).filter((name) => name.endsWith(".sql")).sort();
  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    if (applied.has(version)) continue;
    const sql = readFileSync(resolve(migrationsDir, file), "utf8");
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(version);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw new Error(`Migration ${version} failed: ${error.message}`);
    }
  }
}

/** Opens the HalalMap SQLite database (the same file that already holds users/sessions) and migrates it. */
export function openDatabase(path = dbPath) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  // A database written by the earlier places implementation has a differently shaped `places` table: move it aside,
  // migrate, then carry its rows over (see places/legacy-codex.mjs).
  stashLegacyPlaces(db);
  migrate(db);
  importLegacyPlaces(db);
  return db;
}

const transactionDepth = new WeakMap();

/**
 * Runs `fn` inside a transaction; commits on success, rolls back and rethrows on error.
 * Re-entrant: nested calls become SAVEPOINTs, so helpers can be composed freely.
 */
export function transaction(db, fn) {
  const level = transactionDepth.get(db) ?? 0;
  const savepoint = `sp_${level}`;
  db.exec(level === 0 ? "BEGIN" : `SAVEPOINT ${savepoint}`);
  transactionDepth.set(db, level + 1);
  try {
    const result = fn();
    db.exec(level === 0 ? "COMMIT" : `RELEASE ${savepoint}`);
    return result;
  } catch (error) {
    db.exec(level === 0 ? "ROLLBACK" : `ROLLBACK TO ${savepoint}; RELEASE ${savepoint}`);
    throw error;
  } finally {
    transactionDepth.set(db, level);
  }
}

export const nowIso = () => new Date().toISOString();
