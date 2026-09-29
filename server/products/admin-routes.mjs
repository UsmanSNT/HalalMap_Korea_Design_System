// Admin API (Bearer token, role=admin). Everything the admin console edits lives here:
// products, ingredients + aliases, ingredient rules, certifications, user submissions, data sources, places.

import { transaction, nowIso } from "../db.mjs";
import { requireAdmin } from "../lib/auth.mjs";
import { HttpError, intParam, json, parseJsonColumn, readJson } from "../lib/http.mjs";
import { createRouter } from "../lib/router.mjs";
import { guessLang, normalizeKey } from "./ingredients/normalize.mjs";
import { analyzeIngredientText, loadOverrides, rebuildAllProductIngredients, rebuildProductIngredients } from "./analysis.mjs";
import { analyzeStoredProduct, getProductById, listCertifications, listSources, productView, publicAnalysis, upsertProduct } from "./store.mjs";
import { refreshIngredientAnalysis } from "./seed.mjs";
import { getSubmission, listSubmissions, reviewSubmission, SUBMISSION_STATUSES } from "./submissions.mjs";
import { normalizeBarcode } from "./barcode.mjs";
import { parsePlacesFile } from "../places/importers/file.mjs";
import { placeSources, recordImportRun, upsertImportedPlace, PLACE_KINDS } from "../places/repo.mjs";
import { STATUS } from "./rules/ruleset.mjs";
import { sourceUsable } from "./lookup.mjs";

const RULE_STATUSES = [STATUS.FLAGGED, STATUS.CLEARED, STATUS.CHECK];
const RULE_TYPES = ["ingredient", "category", "term"];
const VERIFICATION = ["unverified", "verified", "needs_review", "rejected"];
const CERT_STATUSES = ["valid", "expired", "revoked", "suspended"];
const HALAL_STATUSES = ["certified", "muslim-owned", "halal-friendly"];

const text = (value, max, field, { required = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (required) throw new HttpError(400, `${field} is required`, "invalid_field");
    return null;
  }
  if (typeof value !== "string") throw new HttpError(400, `${field} must be text`, "invalid_field");
  const trimmed = value.trim();
  if (trimmed.length > max) throw new HttpError(400, `${field} is too long (max ${max})`, "invalid_field");
  if (required && !trimmed) throw new HttpError(400, `${field} is required`, "invalid_field");
  return trimmed || null;
};
const oneOf = (value, allowed, field) => {
  if (!allowed.includes(value)) throw new HttpError(400, `${field} must be one of: ${allowed.join(", ")}`, "invalid_field");
  return value;
};
const dateOrNull = (value, field) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new HttpError(400, `${field} must be YYYY-MM-DD`, "invalid_field");
  return value;
};
const page = (url) => ({ page: intParam(url.searchParams.get("page"), 1, { min: 1 }), perPage: intParam(url.searchParams.get("perPage"), 20, { min: 1, max: 100 }) });
const like = (q) => `%${q.toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export const createAdminRoutes = ({ db, rulesetCache, env = process.env }) => {
  const router = createRouter();
  const admin = (request) => requireAdmin(db, request).user;

  /** Alias/ingredient/rule edits change every analysis: refresh caches and re-match products. */
  const afterKnowledgeChange = () => {
    rulesetCache.invalidate();
    refreshIngredientAnalysis(db);
    rebuildAllProductIngredients(db, rulesetCache.get());
  };

  // ── stats ────────────────────────────────────────────────────────────────
  router.get("/api/admin/stats", ({ request, response }) => {
    admin(request);
    const count = (sql, ...args) => db.prepare(sql).get(...args).n;
    const group = (sql) => Object.fromEntries(db.prepare(sql).all().map((row) => [row.k, row.n]));
    json(response, 200, {
      products: { total: count("SELECT COUNT(*) n FROM products"), byStatus: group("SELECT verification_status k, COUNT(*) n FROM products GROUP BY 1"), byOrigin: group("SELECT data_origin k, COUNT(*) n FROM products GROUP BY 1") },
      ingredients: { total: count("SELECT COUNT(*) n FROM ingredients WHERE is_active = 1"), aliases: count("SELECT COUNT(*) n FROM ingredient_aliases"), byStatus: group("SELECT analysis_status k, COUNT(*) n FROM ingredients WHERE is_active = 1 GROUP BY 1") },
      rules: { total: count("SELECT COUNT(*) n FROM ingredient_rules WHERE is_active = 1"), byStatus: group("SELECT status k, COUNT(*) n FROM ingredient_rules WHERE is_active = 1 GROUP BY 1") },
      certifications: { byStatus: group("SELECT verification_status k, COUNT(*) n FROM halal_certifications GROUP BY 1") },
      submissions: { byStatus: group("SELECT status k, COUNT(*) n FROM product_submissions GROUP BY 1") },
      places: { byKind: group("SELECT kind k, COUNT(*) n FROM places GROUP BY 1"), byOrigin: group("SELECT data_origin k, COUNT(*) n FROM places GROUP BY 1"), byStatus: group("SELECT verification_status k, COUNT(*) n FROM places GROUP BY 1") },
    });
  });

  // ── products ─────────────────────────────────────────────────────────────
  const productDetail = (id) => {
    const row = getProductById(db, id);
    if (!row) throw new HttpError(404, "Product not found", "not_found");
    const ruleset = rulesetCache.get();
    const analysis = analyzeStoredProduct(db, ruleset, row);
    const ingredients = db.prepare(`
      SELECT pi.id, pi.position, pi.parent_position, pi.raw_text, pi.normalized_text, pi.match_type, pi.confidence, pi.percent, pi.origin_note,
             i.key AS ingredient_key, i.canonical_name, i.name_ko, i.analysis_status
      FROM product_ingredients pi LEFT JOIN ingredients i ON i.id = pi.ingredient_id
      WHERE pi.product_id = ? AND pi.position >= 0 ORDER BY pi.position
    `).all(id);
    const overrides = db.prepare(`
      SELECT pi.normalized_text, i.key AS ingredient_key, i.canonical_name
      FROM product_ingredients pi LEFT JOIN ingredients i ON i.id = pi.ingredient_id WHERE pi.product_id = ? AND pi.position < 0
    `).all(id);
    return {
      product: productView(db, row),
      analysis: publicAnalysis(analysis),
      ingredients,
      overrides,
      certifications: listCertifications(db, id),
      sources: listSources(db, id),
      adminNote: row.admin_note,
    };
  };

  router.get("/api/admin/products", ({ request, response, url }) => {
    admin(request);
    const { page: pageNo, perPage } = page(url);
    const where = [];
    const args = [];
    const q = url.searchParams.get("q")?.trim();
    if (q) {
      where.push("(barcode LIKE ? OR lower(name) LIKE ? ESCAPE '\\' OR lower(COALESCE(brand,'')) LIKE ? ESCAPE '\\' OR lower(COALESCE(name_ko,'')) LIKE ? ESCAPE '\\')");
      args.push(`%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`, like(q), like(q), like(q));
    }
    const status = url.searchParams.get("status");
    if (status && VERIFICATION.includes(status)) {
      where.push("verification_status = ?");
      args.push(status);
    }
    const origin = url.searchParams.get("origin");
    if (origin) {
      where.push("data_origin = ?");
      args.push(origin);
    }
    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const total = db.prepare(`SELECT COUNT(*) n FROM products ${clause}`).get(...args).n;
    const rows = db.prepare(`SELECT * FROM products ${clause} ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`).all(...args, perPage, (pageNo - 1) * perPage);
    const ruleset = rulesetCache.get();
    json(response, 200, {
      total, page: pageNo, perPage,
      products: rows.map((row) => {
        const analysis = analyzeStoredProduct(db, ruleset, row);
        return { ...productView(db, row), analysisStatus: analysis.status, analysisCounts: analysis.counts, certificationState: analysis.certification.state };
      }),
    });
  });

  router.get("/api/admin/products/:id", ({ request, response, params }) => {
    admin(request);
    json(response, 200, productDetail(Number(params.id)));
  });

  router.post("/api/admin/products", async ({ request, response }) => {
    const user = admin(request);
    const body = await readJson(request, 64 * 1024);
    const barcode = normalizeBarcode(String(body.barcode ?? ""));
    if (!barcode.ok) throw new HttpError(400, barcode.message, barcode.error);
    if (db.prepare("SELECT 1 FROM products WHERE barcode = ?").get(barcode.code)) throw new HttpError(409, "A product with this barcode already exists", "duplicate");
    const name = text(body.name, 200, "name", { required: true });
    const ingredientsText = text(body.ingredientsRaw, 6000, "ingredientsRaw");
    const now = nowIso();
    const { id } = upsertProduct(db, {
      source: "admin", sourceId: String(user.id), license: "Entered by an HalalMap admin", attribution: "HalalMap", retrievedAt: now,
      barcode: barcode.code, barcodeFormat: barcode.format, name, nameKo: text(body.nameKo, 200, "nameKo"), nameEn: text(body.nameEn, 200, "nameEn"),
      brand: text(body.brand, 100, "brand"), manufacturer: text(body.manufacturer, 100, "manufacturer"), category: text(body.category, 100, "category"),
      countries: [], imageUrl: text(body.imageUrl, 500, "imageUrl"), ingredientsText, ingredientsLang: ingredientsText ? guessLang(ingredientsText) : null,
      ingredientsTrust: "admin_verified", dataOrigin: "admin", verificationStatus: "verified", lastVerifiedAt: now, payload: { createdBy: user.email },
    }, { ruleset: rulesetCache.get() });
    json(response, 201, productDetail(id));
  });

  router.patch("/api/admin/products/:id", async ({ request, response, params }) => {
    const user = admin(request);
    const id = Number(params.id);
    const row = getProductById(db, id);
    if (!row) throw new HttpError(404, "Product not found", "not_found");
    const body = await readJson(request, 64 * 1024);
    const sets = [];
    const values = [];
    const set = (column, value) => { sets.push(`${column} = ?`); values.push(value); };
    const map = { name: ["name", 200], nameKo: ["name_ko", 200], nameEn: ["name_en", 200], brand: ["brand", 100], manufacturer: ["manufacturer", 100], category: ["category", 100], quantity: ["quantity", 60], imageUrl: ["image_url", 500], adminNote: ["admin_note", 1000] };
    for (const [key, [column, max]] of Object.entries(map)) {
      if (body[key] !== undefined) set(column, text(body[key], max, key, { required: key === "name" }));
    }
    let reparse = false;
    if (body.ingredientsRaw !== undefined) {
      const value = text(body.ingredientsRaw, 6000, "ingredientsRaw");
      set("ingredients_raw", value);
      set("ingredients_lang", value ? guessLang(value) : null);
      set("ingredients_source", value ? "admin" : null);
      set("ingredients_trust", value ? "admin_verified" : null);
      reparse = true;
    }
    if (body.verificationStatus !== undefined) {
      set("verification_status", oneOf(body.verificationStatus, VERIFICATION, "verificationStatus"));
      if (body.verificationStatus === "verified") set("last_verified_at", nowIso());
    }
    if (sets.length === 0) throw new HttpError(400, "Nothing to update", "empty_update");
    set("updated_at", nowIso());
    db.prepare(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`).run(...values, id);
    if (reparse) rebuildProductIngredients(db, id, rulesetCache.get());
    console.log(`[admin] ${user.email} updated product ${id}`);
    json(response, 200, productDetail(id));
  });

  router.post("/api/admin/products/:id/overrides", async ({ request, response, params }) => {
    admin(request);
    const id = Number(params.id);
    if (!getProductById(db, id)) throw new HttpError(404, "Product not found", "not_found");
    const body = await readJson(request);
    const key = normalizeKey(text(body.text, 200, "text", { required: true }));
    if (!key) throw new HttpError(400, "text is required", "invalid_field");
    let ingredientId = null;
    if (body.ingredientKey) {
      const ingredient = db.prepare("SELECT id FROM ingredients WHERE key = ? AND is_active = 1").get(String(body.ingredientKey));
      if (!ingredient) throw new HttpError(404, "Ingredient not found", "not_found");
      ingredientId = ingredient.id;
    } else if (body.ignore !== true) {
      throw new HttpError(400, "Provide ingredientKey, or ignore: true to exclude this text", "invalid_field");
    }
    transaction(db, () => {
      db.prepare("DELETE FROM product_ingredients WHERE product_id = ? AND position < 0 AND normalized_text = ?").run(id, key);
      db.prepare(`
        INSERT INTO product_ingredients (product_id, position, parent_position, raw_text, normalized_text, ingredient_id, match_type, confidence)
        VALUES (?, -1, NULL, ?, ?, ?, 'admin', 1)
      `).run(id, String(body.text).trim(), key, ingredientId);
    });
    rebuildProductIngredients(db, id, rulesetCache.get());
    json(response, 200, productDetail(id));
  });

  router.delete("/api/admin/products/:id/overrides/:key", ({ request, response, params }) => {
    admin(request);
    const id = Number(params.id);
    db.prepare("DELETE FROM product_ingredients WHERE product_id = ? AND position < 0 AND normalized_text = ?").run(id, params.key);
    rebuildProductIngredients(db, id, rulesetCache.get());
    json(response, 200, productDetail(id));
  });

  // ── ingredients & aliases ────────────────────────────────────────────────
  const ingredientView = (row) => ({
    id: row.id, key: row.key, canonicalName: row.canonical_name, nameKo: row.name_ko, nameEn: row.name_en, category: row.category, isClass: Boolean(row.is_class),
    mfdsCode: row.mfds_code, mfdsName: row.mfds_name, source: row.source, analysisStatus: row.analysis_status, analysisRuleKey: row.analysis_rule_key,
    note: row.note, isActive: Boolean(row.is_active), updatedBy: row.updated_by, updatedAt: row.updated_at,
  });
  const aliasConflict = (norm, ingredientId) => {
    const alias = db.prepare("SELECT ingredient_id FROM ingredient_aliases WHERE alias_norm = ?").get(norm);
    if (alias && alias.ingredient_id !== ingredientId) return alias.ingredient_id;
    const named = db.prepare("SELECT id, canonical_name, name_ko, name_en, key FROM ingredients").all()
      .find((row) => row.id !== ingredientId && [row.canonical_name, row.name_ko, row.name_en, row.key].some((n) => normalizeKey(n) === norm));
    return named ? named.id : null;
  };
  const ingredientDetail = (id) => {
    const row = db.prepare("SELECT * FROM ingredients WHERE id = ?").get(id);
    if (!row) throw new HttpError(404, "Ingredient not found", "not_found");
    const aliases = db.prepare("SELECT id, alias, lang, source FROM ingredient_aliases WHERE ingredient_id = ? ORDER BY lang, alias").all(id);
    const usage = db.prepare("SELECT COUNT(DISTINCT product_id) n FROM product_ingredients WHERE ingredient_id = ?").get(id).n;
    return { ingredient: ingredientView(row), aliases, productCount: usage };
  };

  router.get("/api/admin/ingredients", ({ request, response, url }) => {
    admin(request);
    const { page: pageNo, perPage } = page(url);
    const where = ["is_active = 1"];
    const args = [];
    const q = url.searchParams.get("q")?.trim();
    if (q) {
      const norm = normalizeKey(q);
      where.push("(lower(canonical_name) LIKE ? ESCAPE '\\' OR lower(COALESCE(name_ko,'')) LIKE ? ESCAPE '\\' OR key LIKE ? ESCAPE '\\' OR id IN (SELECT ingredient_id FROM ingredient_aliases WHERE alias_norm LIKE ?))");
      args.push(like(q), like(q), like(q), `%${norm}%`);
    }
    for (const [param, column] of [["category", "category"], ["status", "analysis_status"]]) {
      const value = url.searchParams.get(param);
      if (value) {
        where.push(`${column} = ?`);
        args.push(value);
      }
    }
    const clause = `WHERE ${where.join(" AND ")}`;
    const total = db.prepare(`SELECT COUNT(*) n FROM ingredients ${clause}`).get(...args).n;
    const rows = db.prepare(`
      SELECT i.*, (SELECT COUNT(*) FROM ingredient_aliases a WHERE a.ingredient_id = i.id) AS alias_count
      FROM ingredients i ${clause} ORDER BY i.category, i.canonical_name LIMIT ? OFFSET ?
    `).all(...args, perPage, (pageNo - 1) * perPage);
    json(response, 200, { total, page: pageNo, perPage, ingredients: rows.map((row) => ({ ...ingredientView(row), aliasCount: row.alias_count })) });
  });

  router.get("/api/admin/ingredient-categories", ({ request, response }) => {
    admin(request);
    json(response, 200, { categories: db.prepare("SELECT category, COUNT(*) n FROM ingredients WHERE is_active = 1 GROUP BY category ORDER BY category").all() });
  });

  router.get("/api/admin/ingredients/:id", ({ request, response, params }) => {
    admin(request);
    json(response, 200, ingredientDetail(Number(params.id)));
  });

  router.post("/api/admin/ingredients", async ({ request, response }) => {
    const user = admin(request);
    const body = await readJson(request, 32 * 1024);
    const nameKo = text(body.nameKo, 100, "nameKo");
    const nameEn = text(body.nameEn, 100, "nameEn");
    const canonical = text(body.canonicalName, 100, "canonicalName") ?? nameEn ?? nameKo;
    if (!canonical) throw new HttpError(400, "A name is required", "invalid_field");
    const key = (text(body.key, 60, "key") ?? normalizeKey(nameEn ?? canonical)).toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_|_$/g, "") || `ingredient_${Date.now()}`;
    if (db.prepare("SELECT 1 FROM ingredients WHERE key = ?").get(key)) throw new HttpError(409, "An ingredient with this key already exists", "duplicate");
    for (const name of [canonical, nameKo, nameEn]) {
      if (name && aliasConflict(normalizeKey(name), -1)) throw new HttpError(409, `"${name}" already belongs to another ingredient`, "alias_conflict");
    }
    const id = Number(db.prepare(`
      INSERT INTO ingredients (key, canonical_name, name_ko, name_en, category, is_class, mfds_code, note, source, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'admin', ?)
    `).run(key, canonical, nameKo, nameEn, text(body.category, 60, "category") ?? "unclassified", body.isClass ? 1 : 0, text(body.mfdsCode, 40, "mfdsCode"), text(body.note, 500, "note"), user.email).lastInsertRowid);
    for (const alias of Array.isArray(body.aliases) ? body.aliases.slice(0, 50) : []) {
      const value = text(alias, 100, "alias");
      const norm = value ? normalizeKey(value) : "";
      if (norm && !aliasConflict(norm, id) && !db.prepare("SELECT 1 FROM ingredient_aliases WHERE alias_norm = ?").get(norm)) {
        db.prepare("INSERT INTO ingredient_aliases (ingredient_id, alias, alias_norm, lang, source) VALUES (?, ?, ?, ?, 'admin')").run(id, value, norm, guessLang(value));
      }
    }
    afterKnowledgeChange();
    json(response, 201, ingredientDetail(id));
  });

  router.patch("/api/admin/ingredients/:id", async ({ request, response, params }) => {
    const user = admin(request);
    const id = Number(params.id);
    if (!db.prepare("SELECT 1 FROM ingredients WHERE id = ?").get(id)) throw new HttpError(404, "Ingredient not found", "not_found");
    const body = await readJson(request, 32 * 1024);
    const sets = [];
    const values = [];
    const map = { canonicalName: ["canonical_name", 100], nameKo: ["name_ko", 100], nameEn: ["name_en", 100], category: ["category", 60], mfdsCode: ["mfds_code", 40], mfdsName: ["mfds_name", 100], note: ["note", 500] };
    for (const [key, [column, max]] of Object.entries(map)) {
      if (body[key] !== undefined) {
        const value = text(body[key], max, key, { required: key === "canonicalName" || key === "category" });
        if (["canonicalName", "nameKo", "nameEn"].includes(key) && value && aliasConflict(normalizeKey(value), id)) throw new HttpError(409, `"${value}" already belongs to another ingredient`, "alias_conflict");
        sets.push(`${column} = ?`);
        values.push(value);
      }
    }
    if (body.isClass !== undefined) { sets.push("is_class = ?"); values.push(body.isClass ? 1 : 0); }
    if (body.isActive !== undefined) { sets.push("is_active = ?"); values.push(body.isActive ? 1 : 0); }
    if (sets.length === 0) throw new HttpError(400, "Nothing to update", "empty_update");
    db.prepare(`UPDATE ingredients SET ${sets.join(", ")}, updated_by = ?, updated_at = ? WHERE id = ?`).run(...values, user.email, nowIso(), id);
    afterKnowledgeChange();
    json(response, 200, ingredientDetail(id));
  });

  router.post("/api/admin/ingredients/:id/aliases", async ({ request, response, params }) => {
    const user = admin(request);
    const id = Number(params.id);
    if (!db.prepare("SELECT 1 FROM ingredients WHERE id = ?").get(id)) throw new HttpError(404, "Ingredient not found", "not_found");
    const body = await readJson(request);
    const alias = text(body.alias, 100, "alias", { required: true });
    const norm = normalizeKey(alias);
    if (!norm) throw new HttpError(400, "Alias must contain letters or digits", "invalid_field");
    const conflict = aliasConflict(norm, id);
    if (conflict) throw new HttpError(409, `"${alias}" already belongs to another ingredient`, "alias_conflict");
    if (!db.prepare("SELECT 1 FROM ingredient_aliases WHERE alias_norm = ?").get(norm)) {
      db.prepare("INSERT INTO ingredient_aliases (ingredient_id, alias, alias_norm, lang, source) VALUES (?, ?, ?, ?, 'admin')").run(id, alias, norm, ["ko", "en", "uz", "ru", "zh", "other"].includes(body.lang) ? body.lang : guessLang(alias));
    }
    db.prepare("UPDATE ingredients SET updated_by = ?, updated_at = ? WHERE id = ?").run(user.email, nowIso(), id);
    afterKnowledgeChange();
    json(response, 201, ingredientDetail(id));
  });

  router.delete("/api/admin/aliases/:id", ({ request, response, params }) => {
    const user = admin(request);
    const alias = db.prepare("SELECT ingredient_id FROM ingredient_aliases WHERE id = ?").get(Number(params.id));
    if (!alias) throw new HttpError(404, "Alias not found", "not_found");
    db.prepare("DELETE FROM ingredient_aliases WHERE id = ?").run(Number(params.id));
    db.prepare("UPDATE ingredients SET updated_by = ?, updated_at = ? WHERE id = ?").run(user.email, nowIso(), alias.ingredient_id);
    afterKnowledgeChange();
    json(response, 200, ingredientDetail(alias.ingredient_id));
  });

  // ── rules ────────────────────────────────────────────────────────────────
  const ruleView = (row) => ({
    id: row.id, key: row.rule_key, title: row.title, matchType: row.match_type, matchValue: row.match_value, status: row.status, priority: row.priority,
    reasonCode: row.reason_code, reason: { ko: row.reason_ko, en: row.reason_en, uz: row.reason_uz }, evidence: row.evidence, evidenceUrl: row.evidence_url,
    source: row.source, isActive: Boolean(row.is_active), updatedBy: row.updated_by, updatedAt: row.updated_at,
  });
  const validateRule = (body, existing = null) => {
    const matchType = oneOf(body.matchType ?? existing?.match_type, RULE_TYPES, "matchType");
    const matchValue = text(body.matchValue ?? existing?.match_value, 400, "matchValue", { required: true });
    if (matchType === "ingredient" && !db.prepare("SELECT 1 FROM ingredients WHERE key = ?").get(matchValue)) throw new HttpError(400, `Unknown ingredient key "${matchValue}"`, "invalid_field");
    if (matchType === "term" && matchValue.split("|").some((term) => normalizeKey(term).length < 2)) throw new HttpError(400, "Every term needs at least 2 letters/digits", "invalid_field");
    const priority = Number(body.priority ?? existing?.priority ?? (matchType === "ingredient" ? 300 : matchType === "term" ? 200 : 100));
    if (!Number.isInteger(priority) || priority < 0 || priority > 1000) throw new HttpError(400, "priority must be an integer 0-1000", "invalid_field");
    const reason = { ko: body.reason?.ko ?? existing?.reason_ko, en: body.reason?.en ?? existing?.reason_en, uz: body.reason?.uz ?? existing?.reason_uz };
    for (const lang of ["ko", "en", "uz"]) text(reason[lang], 600, `reason.${lang}`, { required: true });
    return {
      title: text(body.title ?? existing?.title, 160, "title", { required: true }),
      matchType, matchValue,
      status: oneOf(body.status ?? existing?.status, RULE_STATUSES, "status"),
      priority,
      reasonCode: text(body.reasonCode ?? existing?.reason_code ?? "CUSTOM", 60, "reasonCode", { required: true }),
      reason,
      evidence: text(body.evidence ?? existing?.evidence, 1000, "evidence"),
      evidenceUrl: text(body.evidenceUrl ?? existing?.evidence_url, 500, "evidenceUrl"),
    };
  };

  router.get("/api/admin/rules", ({ request, response, url }) => {
    admin(request);
    const where = [];
    const args = [];
    for (const [param, column] of [["status", "status"], ["type", "match_type"]]) {
      const value = url.searchParams.get(param);
      if (value) { where.push(`${column} = ?`); args.push(value); }
    }
    if (url.searchParams.get("active") !== "all") where.push("is_active = 1");
    const q = url.searchParams.get("q")?.trim();
    if (q) { where.push("(lower(title) LIKE ? ESCAPE '\\' OR lower(match_value) LIKE ? ESCAPE '\\' OR rule_key LIKE ? ESCAPE '\\')"); args.push(like(q), like(q), like(q)); }
    const rows = db.prepare(`SELECT * FROM ingredient_rules ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY priority DESC, rule_key`).all(...args);
    json(response, 200, { rules: rows.map(ruleView), total: rows.length });
  });

  router.post("/api/admin/rules", async ({ request, response }) => {
    const user = admin(request);
    const body = await readJson(request, 32 * 1024);
    const v = validateRule(body);
    const key = (text(body.key, 80, "key") ?? `custom.${Date.now().toString(36)}`).toLowerCase();
    if (!/^[a-z0-9._-]+$/.test(key)) throw new HttpError(400, "key may only contain a-z, 0-9, dot, dash and underscore", "invalid_field");
    if (db.prepare("SELECT 1 FROM ingredient_rules WHERE rule_key = ?").get(key)) throw new HttpError(409, "A rule with this key already exists", "duplicate");
    const id = Number(db.prepare(`
      INSERT INTO ingredient_rules (rule_key, title, match_type, match_value, status, priority, reason_code, reason_ko, reason_en, reason_uz, evidence, evidence_url, source, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin', ?)
    `).run(key, v.title, v.matchType, v.matchValue, v.status, v.priority, v.reasonCode, v.reason.ko, v.reason.en, v.reason.uz, v.evidence, v.evidenceUrl, user.email).lastInsertRowid);
    afterKnowledgeChange();
    json(response, 201, { rule: ruleView(db.prepare("SELECT * FROM ingredient_rules WHERE id = ?").get(id)) });
  });

  router.patch("/api/admin/rules/:id", async ({ request, response, params }) => {
    const user = admin(request);
    const id = Number(params.id);
    const existing = db.prepare("SELECT * FROM ingredient_rules WHERE id = ?").get(id);
    if (!existing) throw new HttpError(404, "Rule not found", "not_found");
    const body = await readJson(request, 32 * 1024);
    const v = validateRule(body, existing);
    db.prepare(`
      UPDATE ingredient_rules SET title = ?, match_type = ?, match_value = ?, status = ?, priority = ?, reason_code = ?, reason_ko = ?, reason_en = ?, reason_uz = ?,
        evidence = ?, evidence_url = ?, is_active = ?, updated_by = ?, updated_at = ? WHERE id = ?
    `).run(v.title, v.matchType, v.matchValue, v.status, v.priority, v.reasonCode, v.reason.ko, v.reason.en, v.reason.uz, v.evidence, v.evidenceUrl,
      body.isActive === undefined ? existing.is_active : body.isActive ? 1 : 0, user.email, nowIso(), id);
    afterKnowledgeChange();
    json(response, 200, { rule: ruleView(db.prepare("SELECT * FROM ingredient_rules WHERE id = ?").get(id)) });
  });

  // Deactivate instead of delete: a deleted seed rule would simply be re-created on the next start.
  router.delete("/api/admin/rules/:id", ({ request, response, params }) => {
    const user = admin(request);
    const id = Number(params.id);
    if (!db.prepare("SELECT 1 FROM ingredient_rules WHERE id = ?").get(id)) throw new HttpError(404, "Rule not found", "not_found");
    db.prepare("UPDATE ingredient_rules SET is_active = 0, updated_by = ?, updated_at = ? WHERE id = ?").run(user.email, nowIso(), id);
    afterKnowledgeChange();
    json(response, 200, { rule: ruleView(db.prepare("SELECT * FROM ingredient_rules WHERE id = ?").get(id)) });
  });

  router.post("/api/admin/rules/test", async ({ request, response }) => {
    admin(request);
    const body = await readJson(request);
    const value = text(body.text, 4000, "text", { required: true });
    const analysis = analyzeIngredientText({ ruleset: rulesetCache.get(), text: value, fuzzy: body.fuzzy === true, inputTrust: "user_confirmed" });
    json(response, 200, { analysis: publicAnalysis(analysis) });
  });

  // ── certifications ───────────────────────────────────────────────────────
  const certView = (row) => ({
    id: row.id, productId: row.product_id, barcode: row.barcode, productName: row.product_name, organization: row.organization, certificateNo: row.certificate_no,
    status: row.status, validFrom: row.valid_from, validUntil: row.valid_until, scope: row.scope, verificationStatus: row.verification_status,
    verificationUrl: row.verification_url, verifiedAt: row.verified_at, verifiedBy: row.verified_by, source: row.source, sourceUrl: row.source_url,
    license: row.license, retrievedAt: row.retrieved_at, note: row.note,
  });
  const certRow = (id) => db.prepare(`
    SELECT c.*, p.barcode, p.name AS product_name FROM halal_certifications c JOIN products p ON p.id = c.product_id WHERE c.id = ?
  `).get(id);

  router.get("/api/admin/certifications", ({ request, response, url }) => {
    admin(request);
    const { page: pageNo, perPage } = page(url);
    const where = [];
    const args = [];
    const status = url.searchParams.get("status");
    if (status) { where.push("c.verification_status = ?"); args.push(status); }
    const q = url.searchParams.get("q")?.trim();
    if (q) { where.push("(p.barcode LIKE ? OR lower(p.name) LIKE ? ESCAPE '\\' OR lower(c.organization) LIKE ? ESCAPE '\\')"); args.push(`%${q}%`, like(q), like(q)); }
    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const total = db.prepare(`SELECT COUNT(*) n FROM halal_certifications c JOIN products p ON p.id = c.product_id ${clause}`).get(...args).n;
    const rows = db.prepare(`
      SELECT c.*, p.barcode, p.name AS product_name FROM halal_certifications c JOIN products p ON p.id = c.product_id ${clause}
      ORDER BY c.updated_at DESC, c.id DESC LIMIT ? OFFSET ?
    `).all(...args, perPage, (pageNo - 1) * perPage);
    json(response, 200, { total, page: pageNo, perPage, certifications: rows.map(certView) });
  });

  const certFields = (body, existing = null) => {
    const verificationStatus = body.verificationStatus ?? existing?.verification_status ?? "unverified";
    oneOf(verificationStatus, VERIFICATION, "verificationStatus");
    const verificationUrl = text(body.verificationUrl ?? existing?.verification_url, 500, "verificationUrl");
    const certificateNo = text(body.certificateNo ?? existing?.certificate_no, 100, "certificateNo");
    // A certificate can only be marked verified with evidence someone else can check.
    if (verificationStatus === "verified" && !verificationUrl && !certificateNo) {
      throw new HttpError(400, "Verified certifications need a verification URL or a certificate number", "evidence_required");
    }
    return {
      organization: text(body.organization ?? existing?.organization, 120, "organization", { required: true }),
      certificateNo, verificationUrl, verificationStatus,
      status: oneOf(body.status ?? existing?.status ?? "valid", CERT_STATUSES, "status"),
      validFrom: dateOrNull(body.validFrom ?? existing?.valid_from, "validFrom"),
      validUntil: dateOrNull(body.validUntil ?? existing?.valid_until, "validUntil"),
      scope: text(body.scope ?? existing?.scope, 300, "scope"),
      note: text(body.note ?? existing?.note, 500, "note"),
      sourceUrl: text(body.sourceUrl ?? existing?.source_url, 500, "sourceUrl"),
    };
  };

  router.post("/api/admin/certifications", async ({ request, response }) => {
    const user = admin(request);
    const body = await readJson(request, 32 * 1024);
    let product = body.productId ? getProductById(db, Number(body.productId)) : null;
    if (!product && body.barcode) {
      const barcode = normalizeBarcode(String(body.barcode));
      if (barcode.ok) product = db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode.code);
    }
    if (!product) throw new HttpError(404, "Product not found", "not_found");
    const v = certFields(body);
    const verified = v.verificationStatus === "verified";
    const id = Number(db.prepare(`
      INSERT INTO halal_certifications (product_id, organization, certificate_no, status, valid_from, valid_until, scope, verification_status, verification_url,
        verified_at, verified_by, source, source_url, license, retrieved_at, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin_entry', ?, 'Entered by an HalalMap admin', ?, ?)
    `).run(product.id, v.organization, v.certificateNo, v.status, v.validFrom, v.validUntil, v.scope, v.verificationStatus, v.verificationUrl,
      verified ? nowIso() : null, verified ? user.email : null, v.sourceUrl, nowIso(), v.note).lastInsertRowid);
    json(response, 201, { certification: certView(certRow(id)) });
  });

  router.patch("/api/admin/certifications/:id", async ({ request, response, params }) => {
    const user = admin(request);
    const id = Number(params.id);
    const existing = db.prepare("SELECT * FROM halal_certifications WHERE id = ?").get(id);
    if (!existing) throw new HttpError(404, "Certification not found", "not_found");
    const body = await readJson(request, 32 * 1024);
    const v = certFields(body, existing);
    const nowVerified = v.verificationStatus === "verified" && existing.verification_status !== "verified";
    db.prepare(`
      UPDATE halal_certifications SET organization = ?, certificate_no = ?, status = ?, valid_from = ?, valid_until = ?, scope = ?, verification_status = ?,
        verification_url = ?, source_url = ?, note = ?, verified_at = ?, verified_by = ?, updated_at = ? WHERE id = ?
    `).run(v.organization, v.certificateNo, v.status, v.validFrom, v.validUntil, v.scope, v.verificationStatus, v.verificationUrl, v.sourceUrl, v.note,
      nowVerified ? nowIso() : v.verificationStatus === "verified" ? existing.verified_at : null,
      nowVerified ? user.email : v.verificationStatus === "verified" ? existing.verified_by : null, nowIso(), id);
    json(response, 200, { certification: certView(certRow(id)) });
  });

  router.delete("/api/admin/certifications/:id", ({ request, response, params }) => {
    admin(request);
    db.prepare("DELETE FROM halal_certifications WHERE id = ?").run(Number(params.id));
    json(response, 200, { success: true });
  });

  // ── submissions ──────────────────────────────────────────────────────────
  router.get("/api/admin/submissions", ({ request, response, url }) => {
    admin(request);
    const { page: pageNo, perPage } = page(url);
    const status = url.searchParams.get("status");
    json(response, 200, listSubmissions(db, { status: SUBMISSION_STATUSES.includes(status) ? status : undefined, page: pageNo, perPage }));
  });

  router.get("/api/admin/submissions/:id", ({ request, response, params }) => {
    admin(request);
    const submission = getSubmission(db, Number(params.id));
    if (!submission) throw new HttpError(404, "Submission not found", "not_found");
    const existing = db.prepare("SELECT * FROM products WHERE barcode = ?").get(submission.barcode);
    const analysis = submission.ingredientsText
      ? analyzeIngredientText({ ruleset: rulesetCache.get(), text: submission.ingredientsText, fuzzy: true, inputTrust: submission.ingredientsInput === "ocr" ? "ocr_unconfirmed" : "typed_unconfirmed" })
      : null;
    json(response, 200, { submission, existingProduct: existing ? productView(db, existing) : null, analysis: analysis ? publicAnalysis(analysis) : null });
  });

  router.post("/api/admin/submissions/:id/review", async ({ request, response, params }) => {
    const user = admin(request);
    const body = await readJson(request, 64 * 1024);
    const edits = {};
    for (const [key, max] of [["name", 200], ["nameKo", 200], ["brand", 100], ["manufacturer", 100], ["category", 100], ["ingredientsText", 6000]]) {
      if (body.edits?.[key] !== undefined) edits[key] = text(body.edits[key], max, key);
    }
    const submission = reviewSubmission(db, Number(params.id), { action: body.action, note: text(body.note, 500, "note"), edits, reviewerId: user.id }, { ruleset: rulesetCache.get() });
    console.log(`[admin] ${user.email} reviewed submission ${params.id}: ${body.action}`);
    json(response, 200, { submission });
  });

  // ── data sources ─────────────────────────────────────────────────────────
  router.get("/api/admin/sources", ({ request, response }) => {
    admin(request);
    const sources = db.prepare("SELECT * FROM data_sources ORDER BY usage_status, kind, name").all().map((row) => ({
      key: row.key, name: row.name, kind: row.kind, homepageUrl: row.homepage_url, apiUrl: row.api_url, license: row.license, licenseUrl: row.license_url,
      attribution: row.attribution, licenseStatus: row.license_status, usageStatus: row.usage_status, requiresApiKey: Boolean(row.requires_api_key),
      apiKeyEnv: row.api_key_env, apiKeyConfigured: row.api_key_env ? Boolean(env[row.api_key_env]) : null, termsNote: row.terms_note, reason: row.reason,
      lastImportAt: row.last_import_at, recordCount: row.record_count, usable: sourceUsable(db, row.key),
    }));
    const runs = db.prepare("SELECT * FROM import_runs ORDER BY id DESC LIMIT 20").all();
    json(response, 200, { sources, runs });
  });

  router.patch("/api/admin/sources/:key", async ({ request, response, params }) => {
    admin(request);
    const existing = db.prepare("SELECT * FROM data_sources WHERE key = ?").get(params.key);
    if (!existing) throw new HttpError(404, "Source not found", "not_found");
    const body = await readJson(request);
    db.prepare("UPDATE data_sources SET license_status = ?, usage_status = ?, reason = ?, terms_note = ?, reviewed_at = ? WHERE key = ?").run(
      oneOf(body.licenseStatus ?? existing.license_status, ["confirmed", "unconfirmed", "rejected"], "licenseStatus"),
      oneOf(body.usageStatus ?? existing.usage_status, ["active", "planned", "rejected"], "usageStatus"),
      body.reason !== undefined ? text(body.reason, 600, "reason") : existing.reason,
      body.termsNote !== undefined ? text(body.termsNote, 1000, "termsNote") : existing.terms_note,
      new Date().toISOString().slice(0, 10), params.key,
    );
    json(response, 200, { success: true });
  });

  // ── places ───────────────────────────────────────────────────────────────
  const placeAdminView = (row) => ({
    id: row.id, kind: row.kind, name: row.name, nameKo: row.name_ko, nameEn: row.name_en, category: row.category, halalStatus: row.halal_status,
    halalEvidence: row.halal_evidence, certBody: row.cert_body, address: row.address, lat: row.lat, lng: row.lng, phone: row.phone, website: row.website,
    dataOrigin: row.data_origin, verificationStatus: row.verification_status, isActive: Boolean(row.is_active), adminNote: row.admin_note,
    provenance: { source: row.source, sourceId: row.source_id, sourceUrl: row.source_url, license: row.license, attribution: row.attribution, retrievedAt: row.retrieved_at, lastVerifiedAt: row.last_verified_at },
  });

  router.get("/api/admin/places", ({ request, response, url }) => {
    admin(request);
    const { page: pageNo, perPage } = page(url);
    const where = [];
    const args = [];
    for (const [param, column] of [["kind", "kind"], ["status", "verification_status"], ["origin", "data_origin"], ["source", "source"]]) {
      const value = url.searchParams.get(param);
      if (value) { where.push(`${column} = ?`); args.push(value); }
    }
    const q = url.searchParams.get("q")?.trim();
    if (q) { where.push("(lower(name) LIKE ? ESCAPE '\\' OR lower(COALESCE(name_ko,'')) LIKE ? ESCAPE '\\' OR lower(COALESCE(address,'')) LIKE ? ESCAPE '\\')"); args.push(like(q), like(q), like(q)); }
    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const total = db.prepare(`SELECT COUNT(*) n FROM places ${clause}`).get(...args).n;
    const rows = db.prepare(`SELECT * FROM places ${clause} ORDER BY data_origin = 'demo', updated_at DESC, name LIMIT ? OFFSET ?`).all(...args, perPage, (pageNo - 1) * perPage);
    json(response, 200, { total, page: pageNo, perPage, places: rows.map((row) => ({ ...placeAdminView(row), sources: placeSources(db, row.id) })) });
  });

  router.patch("/api/admin/places/:id", async ({ request, response, params }) => {
    const user = admin(request);
    const row = db.prepare("SELECT * FROM places WHERE id = ?").get(params.id);
    if (!row) throw new HttpError(404, "Place not found", "not_found");
    const body = await readJson(request, 32 * 1024);
    const sets = [];
    const values = [];
    const map = { name: ["name", 200], nameKo: ["name_ko", 200], nameEn: ["name_en", 200], category: ["category", 60], certBody: ["cert_body", 80], address: ["address", 300], phone: ["phone", 60], website: ["website", 300], adminNote: ["admin_note", 1000] };
    for (const [key, [column, max]] of Object.entries(map)) {
      if (body[key] !== undefined) { sets.push(`${column} = ?`); values.push(text(body[key], max, key, { required: key === "name" })); }
    }
    for (const key of ["lat", "lng"]) {
      if (body[key] !== undefined) {
        const number = body[key] === null ? null : Number(body[key]);
        if (number !== null && !Number.isFinite(number)) throw new HttpError(400, `${key} must be a number`, "invalid_field");
        sets.push(`${key} = ?`);
        values.push(number);
      }
    }
    if (body.halalStatus !== undefined) { sets.push("halal_status = ?"); values.push(body.halalStatus === null ? null : oneOf(body.halalStatus, HALAL_STATUSES, "halalStatus")); }
    if (body.verificationStatus !== undefined) {
      sets.push("verification_status = ?");
      values.push(oneOf(body.verificationStatus, VERIFICATION, "verificationStatus"));
      if (body.verificationStatus === "verified") { sets.push("last_verified_at = ?"); values.push(nowIso()); }
    }
    if (body.isActive !== undefined) { sets.push("is_active = ?"); values.push(body.isActive ? 1 : 0); }
    if (sets.length === 0) throw new HttpError(400, "Nothing to update", "empty_update");
    db.prepare(`UPDATE places SET ${sets.join(", ")}, updated_at = ? WHERE id = ?`).run(...values, nowIso(), params.id);
    console.log(`[admin] ${user.email} updated place ${params.id}`);
    json(response, 200, { place: placeAdminView(db.prepare("SELECT * FROM places WHERE id = ?").get(params.id)) });
  });

  // CSV/JSON import with mandatory provenance (source + license per row or in `defaults`).
  router.post("/api/admin/places/import", async ({ request, response }) => {
    admin(request);
    const body = await readJson(request, 4 * 1024 * 1024);
    const filename = text(body.filename, 120, "filename", { required: true });
    const content = text(body.content, 4 * 1024 * 1024, "content", { required: true });
    const { records, errors } = parsePlacesFile(content, filename, {
      source: text(body.defaults?.source, 80, "defaults.source"), license: text(body.defaults?.license, 200, "defaults.license"),
      attribution: text(body.defaults?.attribution, 200, "defaults.attribution"),
    });
    const startedAt = nowIso();
    const stats = { inserted: 0, updated: 0, merged: 0 };
    for (const record of records) stats[upsertImportedPlace(db, record).action] += 1;
    recordImportRun(db, { source: "admin_import", kind: "places", startedAt, inserted: stats.inserted, updated: stats.updated + stats.merged, skipped: errors.length, detail: filename });
    json(response, 200, { imported: records.length, ...stats, rejected: errors.length, errors: errors.slice(0, 50) });
  });

  return (request, response, url) => router.handle(request, response, url);
};
