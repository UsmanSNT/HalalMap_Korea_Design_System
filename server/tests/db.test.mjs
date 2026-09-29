import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase, transaction } from "../db.mjs";
import { seedProductKnowledge } from "../products/seed.mjs";

test("migrations apply once, in order, and are recorded", () => {
  const db = openDatabase(":memory:");
  const versions = db.prepare("SELECT version FROM schema_migrations ORDER BY version").all().map((r) => r.version);
  assert.deepEqual(versions, ["001_baseline", "002_sources_and_places", "003_products"]);
  for (const table of ["users", "sessions", "products", "product_sources", "ingredients", "ingredient_aliases", "ingredient_rules", "product_ingredients", "halal_certifications", "product_submissions", "places", "place_sources", "data_sources", "lookup_log", "import_runs"]) {
    assert.ok(db.prepare("SELECT 1 FROM sqlite_master WHERE name = ?").get(table), `${table} exists`);
  }
});

test("an existing pre-migration database (users/sessions only) is upgraded without losing data", () => {
  const dir = mkdtempSync(join(tmpdir(), "halalmap-"));
  try {
    const path = join(dir, "old.sqlite");
    const first = openDatabase(path);
    first.prepare("INSERT INTO users (email, name, role, password_hash) VALUES ('a@b.c', 'A', 'user', 'x:y')").run();
    first.exec("DROP TABLE schema_migrations");
    first.close();
    const upgraded = openDatabase(path);
    assert.equal(upgraded.prepare("SELECT COUNT(*) n FROM users").get().n, 1);
    assert.equal(upgraded.prepare("SELECT COUNT(*) n FROM schema_migrations").get().n, 3);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("transactions are re-entrant: an inner failure rolls back only the inner part", () => {
  const db = openDatabase(":memory:");
  transaction(db, () => {
    db.prepare("INSERT INTO data_sources (key, name, kind) VALUES ('outer', 'o', 'places')").run();
    assert.throws(() => transaction(db, () => {
      db.prepare("INSERT INTO data_sources (key, name, kind) VALUES ('inner', 'i', 'places')").run();
      throw new Error("boom");
    }), /boom/);
  });
  assert.ok(db.prepare("SELECT 1 FROM data_sources WHERE key = 'outer'").get());
  assert.equal(db.prepare("SELECT 1 FROM data_sources WHERE key = 'inner'").get(), undefined);
});

test("seeding is idempotent and does not overwrite admin edits", () => {
  const db = openDatabase(":memory:");
  const first = seedProductKnowledge(db);
  assert.ok(first.ingredients.inserted > 200 && first.rules.inserted > 40);
  assert.equal(first.ingredients.aliasConflicts.length, 0, "alias table has no cross-ingredient conflicts");
  db.prepare("UPDATE ingredient_rules SET reason_en = 'Edited by admin', updated_by = 'admin@x' WHERE rule_key = 'term.pork'").run();
  db.prepare("UPDATE data_sources SET license_status = 'rejected' WHERE key = 'openfoodfacts'").run();
  const second = seedProductKnowledge(db);
  assert.equal(second.ingredients.inserted, 0);
  assert.equal(second.rules.inserted, 0);
  assert.equal(db.prepare("SELECT reason_en FROM ingredient_rules WHERE rule_key = 'term.pork'").get().reason_en, "Edited by admin");
});

test("every seeded rule has a reason in ko, en and uz plus an evidence note", () => {
  const db = openDatabase(":memory:");
  seedProductKnowledge(db);
  for (const rule of db.prepare("SELECT * FROM ingredient_rules").all()) {
    assert.ok(rule.reason_ko && rule.reason_en && rule.reason_uz, rule.rule_key);
    assert.ok(rule.evidence, `${rule.rule_key} has evidence`);
  }
});
