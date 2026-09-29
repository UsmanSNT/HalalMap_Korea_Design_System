// Idempotent loader for the editorial ingredient dictionary, rules and the data-source registry.
// Existing rows are only refreshed when the seed entry changed AND nobody edited the row in the admin console.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transaction, nowIso } from "../db.mjs";
import { guessLang, normalizeKey } from "./ingredients/normalize.mjs";
import { loadRuleset } from "./rules/ruleset.mjs";
import { evaluateOwn } from "./rules/engine.mjs";

const seedDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "seed");
export const readSeed = (name) => JSON.parse(readFileSync(resolve(seedDir, name), "utf8"));
const hashOf = (value) => createHash("sha1").update(JSON.stringify(value)).digest("hex").slice(0, 16);

export const seedDataSources = (db, doc = readSeed("data-sources.json")) => {
  const upsert = db.prepare(`
    INSERT INTO data_sources (key, name, kind, homepage_url, api_url, license, license_url, attribution,
      license_status, usage_status, requires_api_key, api_key_env, terms_note, reason, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (key) DO UPDATE SET name = excluded.name, kind = excluded.kind, homepage_url = excluded.homepage_url,
      api_url = excluded.api_url, license = excluded.license, license_url = excluded.license_url,
      attribution = excluded.attribution, requires_api_key = excluded.requires_api_key, api_key_env = excluded.api_key_env,
      terms_note = excluded.terms_note, reason = excluded.reason,
      license_status = CASE WHEN data_sources.reviewed_at = '' OR data_sources.reviewed_at IS NULL OR data_sources.reviewed_at < excluded.reviewed_at THEN excluded.license_status ELSE data_sources.license_status END,
      usage_status = CASE WHEN data_sources.reviewed_at = '' OR data_sources.reviewed_at IS NULL OR data_sources.reviewed_at < excluded.reviewed_at THEN excluded.usage_status ELSE data_sources.usage_status END
  `);
  const reviewedAt = "2026-09-29";
  transaction(db, () => {
    for (const s of doc.sources) {
      upsert.run(
        s.key, s.name, s.kind, s.homepageUrl ?? null, s.apiUrl ?? null, s.license ?? null, s.licenseUrl ?? null,
        s.attribution ?? null, s.licenseStatus, s.usageStatus, s.requiresApiKey ? 1 : 0, s.apiKeyEnv ?? null,
        s.termsNote ?? null, s.reason ?? null, reviewedAt,
      );
    }
  });
  return doc.sources.length;
};

export const seedIngredients = (db, doc = readSeed("ingredient-dictionary.json")) => {
  const stats = { inserted: 0, updated: 0, unchanged: 0, aliasesAdded: 0, aliasConflicts: [] };
  const findByKey = db.prepare("SELECT id, seed_hash, updated_by FROM ingredients WHERE key = ?");
  const insert = db.prepare(`
    INSERT INTO ingredients (key, canonical_name, name_ko, name_en, category, is_class, source, seed_hash)
    VALUES (?, ?, ?, ?, ?, ?, 'halalmap_editorial', ?)
  `);
  const update = db.prepare(`
    UPDATE ingredients SET canonical_name = ?, name_ko = ?, name_en = ?, category = ?, is_class = ?, seed_hash = ?, updated_at = ?
    WHERE id = ?
  `);
  const aliasOwner = db.prepare("SELECT ingredient_id FROM ingredient_aliases WHERE alias_norm = ?");
  const nameOwner = db.prepare("SELECT id FROM ingredients WHERE key != ? AND (? IN (lower(canonical_name), lower(name_ko), lower(name_en), key))");
  const insertAlias = db.prepare("INSERT INTO ingredient_aliases (ingredient_id, alias, alias_norm, lang, source) VALUES (?, ?, ?, ?, 'halalmap_editorial')");

  transaction(db, () => {
    for (const entry of doc.ingredients) {
      const hash = hashOf(entry);
      const canonical = entry.en || entry.ko;
      const existing = findByKey.get(entry.key);
      let id;
      if (!existing) {
        id = Number(insert.run(entry.key, canonical, entry.ko, entry.en, entry.category, entry.isClass ? 1 : 0, hash).lastInsertRowid);
        stats.inserted += 1;
      } else {
        id = existing.id;
        if (existing.seed_hash !== hash && !existing.updated_by) {
          update.run(canonical, entry.ko, entry.en, entry.category, entry.isClass ? 1 : 0, hash, nowIso(), id);
          stats.updated += 1;
        } else stats.unchanged += 1;
      }
      for (const { alias, lang } of entry.aliases) {
        const norm = normalizeKey(alias);
        if (!norm) continue;
        const owner = aliasOwner.get(norm);
        if (owner) {
          if (owner.ingredient_id !== id) stats.aliasConflicts.push({ alias, key: entry.key });
          continue;
        }
        if (nameOwner.get(entry.key, alias.toLowerCase())) {
          stats.aliasConflicts.push({ alias, key: entry.key });
          continue;
        }
        insertAlias.run(id, alias, norm, lang ?? guessLang(alias));
        stats.aliasesAdded += 1;
      }
    }
  });
  return stats;
};

export const seedRules = (db, doc = readSeed("ingredient-rules.json")) => {
  const stats = { inserted: 0, updated: 0, unchanged: 0 };
  const find = db.prepare("SELECT id, seed_hash, updated_by FROM ingredient_rules WHERE rule_key = ?");
  const insert = db.prepare(`
    INSERT INTO ingredient_rules (rule_key, title, match_type, match_value, status, priority, reason_code,
      reason_ko, reason_en, reason_uz, evidence, evidence_url, source, seed_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const update = db.prepare(`
    UPDATE ingredient_rules SET title = ?, match_type = ?, match_value = ?, status = ?, priority = ?, reason_code = ?,
      reason_ko = ?, reason_en = ?, reason_uz = ?, evidence = ?, evidence_url = ?, source = ?, seed_hash = ?, updated_at = ?
    WHERE id = ?
  `);
  transaction(db, () => {
    for (const rule of doc.rules) {
      const hash = hashOf(rule);
      const values = [
        rule.title, rule.matchType, rule.matchValue, rule.status, rule.priority, rule.reasonCode,
        rule.reason.ko, rule.reason.en, rule.reason.uz, rule.evidence ?? null, rule.evidenceUrl ?? null, rule.source ?? "halalmap_editorial",
      ];
      const existing = find.get(rule.key);
      if (!existing) {
        insert.run(rule.key, ...values, hash);
        stats.inserted += 1;
      } else if (existing.seed_hash !== hash && !existing.updated_by) {
        update.run(...values, hash, nowIso(), existing.id);
        stats.updated += 1;
      } else stats.unchanged += 1;
    }
  });
  return stats;
};

/** Recomputes ingredients.analysis_status / analysis_rule_key from the active rules (a display/list cache). */
export const refreshIngredientAnalysis = (db) => {
  const ruleset = loadRuleset(db);
  const update = db.prepare("UPDATE ingredients SET analysis_status = ?, analysis_rule_key = ? WHERE id = ?");
  transaction(db, () => {
    for (const ingredient of ruleset.ingredientsById.values()) {
      const node = {
        raw: ingredient.canonical_name,
        text: ingredient.canonical_name,
        key: normalizeKey(ingredient.canonical_name),
        percent: null,
        origin: null,
        ingredient,
        matchType: "exact",
        confidence: 1,
        children: [],
      };
      const result = evaluateOwn(node, ruleset);
      const key = result.rule?.rule_key ?? null;
      if (ingredient.analysis_status !== result.status || ingredient.analysis_rule_key !== key) update.run(result.status, key, ingredient.id);
    }
  });
};

export const seedProductKnowledge = (db) => {
  const sources = seedDataSources(db);
  const ingredients = seedIngredients(db);
  const rules = seedRules(db);
  refreshIngredientAnalysis(db);
  return { sources, ingredients, rules };
};
