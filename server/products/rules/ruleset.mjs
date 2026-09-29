// Loads ingredients, aliases and rules from the database into an in-memory ruleset.
// Rules are DATA: admins (or seed files) change classification without touching code.

import { createHash } from "node:crypto";
import { normalizeKey } from "../ingredients/normalize.mjs";

export const STATUS = Object.freeze({
  FLAGGED: "FLAGGED_INGREDIENT",
  CHECK: "CHECK_REQUIRED",
  CLEARED: "NO_FLAGGED_INGREDIENTS",
  UNKNOWN: "UNKNOWN",
});

const signatureQueries = [
  "SELECT COUNT(*) AS n, COALESCE(MAX(updated_at), '') AS m FROM ingredient_rules",
  "SELECT COUNT(*) AS n, COALESCE(MAX(updated_at), '') AS m FROM ingredients",
  "SELECT COUNT(*) AS n, COALESCE(MAX(id), 0) AS m FROM ingredient_aliases",
];

export const loadRuleset = (db) => {
  const ingredientRows = db.prepare("SELECT * FROM ingredients WHERE is_active = 1").all();
  const ingredientsById = new Map(ingredientRows.map((row) => [row.id, row]));
  const ingredientsByKey = new Map(ingredientRows.map((row) => [row.key, row]));

  const aliasMap = new Map();
  const aliasRows = db.prepare(`
    SELECT a.alias, a.alias_norm, a.ingredient_id FROM ingredient_aliases a
    JOIN ingredients i ON i.id = a.ingredient_id WHERE i.is_active = 1
  `).all();
  for (const row of aliasRows) {
    aliasMap.set(row.alias_norm, { ingredientId: row.ingredient_id, alias: row.alias, canonical: false });
  }
  for (const row of ingredientRows) {
    for (const name of [row.canonical_name, row.name_ko, row.name_en, row.key]) {
      const norm = normalizeKey(name);
      if (norm && !aliasMap.has(norm)) aliasMap.set(norm, { ingredientId: row.id, alias: name, canonical: true });
      else if (norm && aliasMap.get(norm).ingredientId === row.id) aliasMap.get(norm).canonical = true;
    }
  }
  const aliasesByLength = [...aliasMap.entries()]
    .map(([norm, value]) => ({ norm, ...value }))
    .sort((a, b) => b.norm.length - a.norm.length || (a.norm < b.norm ? -1 : 1));

  const rules = db.prepare("SELECT * FROM ingredient_rules WHERE is_active = 1 ORDER BY priority DESC, id ASC").all().map((row) => ({
    ...row,
    // Term rules may list several terms separated by "|" (e.g. "돼지|돈육|pork").
    matchTerms: row.match_type === "term" ? row.match_value.split("|").map(normalizeKey).filter(Boolean) : [],
  }));

  const signature = signatureQueries.map((sql) => JSON.stringify(db.prepare(sql).get())).join("|");
  const version = createHash("sha1").update(signature).digest("hex").slice(0, 12);

  return { rules, ingredientsById, ingredientsByKey, aliasMap, aliasesByLength, signature, version };
};

/** Cheap cache: rebuilds when the ingredient/alias/rule tables changed (also by another process, e.g. an import script). */
export class RulesetCache {
  constructor(db) {
    this.db = db;
    this.ruleset = null;
  }

  currentSignature() {
    return signatureQueries.map((sql) => JSON.stringify(this.db.prepare(sql).get())).join("|");
  }

  get() {
    if (!this.ruleset || this.ruleset.signature !== this.currentSignature()) this.ruleset = loadRuleset(this.db);
    return this.ruleset;
  }

  invalidate() {
    this.ruleset = null;
  }
}
