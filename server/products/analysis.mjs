// Glue between the parser, matcher and rules engine. Everything here is deterministic.

import { parseIngredientText, flattenItems } from "./ingredients/parser.mjs";
import { resolveTree } from "./ingredients/matcher.mjs";
import { evaluateNode, summarizeProduct } from "./rules/engine.mjs";
import { transaction } from "../db.mjs";

/** Builds the admin-override lookup used by the matcher from product_ingredients rows (position = -1). */
export const loadOverrides = (db, productId) => {
  const overrides = new Map();
  if (productId == null) return overrides;
  const rows = db.prepare("SELECT normalized_text, ingredient_id FROM product_ingredients WHERE product_id = ? AND position < 0").all(productId);
  for (const row of rows) {
    overrides.set(row.normalized_text, row.ingredient_id == null ? { ignored: true } : { ingredientId: row.ingredient_id });
  }
  return overrides;
};

/**
 * @param {object} args
 * @param {object} args.ruleset
 * @param {string} args.text  raw ingredient list
 * @param {'verified_source'|'user_confirmed'|'ocr_unconfirmed'|'typed_unconfirmed'} [args.inputTrust]
 * @param {boolean} [args.fuzzy]  tolerate OCR/typing errors (unverified matches can only raise flags)
 */
export const analyzeIngredientText = ({ ruleset, text, inputTrust = "verified_source", fuzzy = false, certifications = [], dataWarnings = [], overrides = new Map(), today }) => {
  const parsed = parseIngredientText(text);
  const nodes = resolveTree(parsed.items, ruleset, { fuzzy }, overrides);
  const results = nodes.map((node) => evaluateNode(node, ruleset));
  const summary = summarizeProduct({ results, certifications, inputTrust, dataWarnings, today, ruleset });
  return {
    ...summary,
    parse: { cleaned: parsed.cleaned, allergens: parsed.allergens, warnings: parsed.warnings },
    nodes,
  };
};

/** Re-parses a product's ingredient text into product_ingredients (admin override rows are kept). */
export const rebuildProductIngredients = (db, productId, ruleset) => {
  const product = db.prepare("SELECT ingredients_raw FROM products WHERE id = ?").get(productId);
  if (!product) return 0;
  const overrides = loadOverrides(db, productId);
  const parsed = parseIngredientText(product.ingredients_raw ?? "");
  const nodes = resolveTree(parsed.items, ruleset, { fuzzy: false }, overrides);

  const insert = db.prepare(`
    INSERT INTO product_ingredients (product_id, position, parent_position, raw_text, normalized_text, ingredient_id, match_type, confidence, percent, origin_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  let count = 0;
  transaction(db, () => {
    db.prepare("DELETE FROM product_ingredients WHERE product_id = ? AND position >= 0").run(productId);
    const walk = (list, parentPosition) => {
      for (const node of list) {
        const position = count;
        count += 1;
        insert.run(
          productId, position, parentPosition, node.raw, node.key, node.ingredient?.id ?? null,
          node.matchType, node.confidence ?? null, node.percent ?? null, node.origin ?? null,
        );
        walk(node.children, position);
      }
    };
    walk(nodes, null);
  });
  return count;
};

/** Re-matches every product after the dictionary changed. Cheap enough for SQLite; runs in one pass. */
export const rebuildAllProductIngredients = (db, ruleset) => {
  const ids = db.prepare("SELECT id FROM products WHERE ingredients_raw IS NOT NULL AND ingredients_raw != ''").all();
  for (const { id } of ids) rebuildProductIngredients(db, id, ruleset);
  return ids.length;
};

export { flattenItems };
