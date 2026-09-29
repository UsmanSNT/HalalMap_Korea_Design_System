-- Product scanner domain. Ingredient rules are DATA (ingredient_rules), never if/else in code.

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT NOT NULL UNIQUE,
  barcode_format TEXT,
  name TEXT NOT NULL,
  name_ko TEXT,
  name_en TEXT,
  brand TEXT,
  manufacturer TEXT,
  category TEXT,
  quantity TEXT,
  countries TEXT NOT NULL DEFAULT '[]',
  image_url TEXT,
  ingredients_raw TEXT,
  ingredients_lang TEXT,
  ingredients_source TEXT,
  ingredients_trust TEXT CHECK (ingredients_trust IN ('official', 'community', 'admin_verified', 'user_submitted')),
  allergens TEXT NOT NULL DEFAULT '[]',
  data_origin TEXT NOT NULL DEFAULT 'imported' CHECK (data_origin IN ('imported', 'admin', 'submission')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'needs_review', 'rejected')),
  source TEXT NOT NULL,
  source_id TEXT,
  source_url TEXT,
  license TEXT,
  attribution TEXT,
  retrieved_at TEXT,
  last_verified_at TEXT,
  last_checked_at TEXT,
  admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_status ON products (verification_status);
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);

-- Every source that contributed data for a product (MFDS, Open Food Facts, a user submission, ...).
CREATE TABLE IF NOT EXISTS product_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_id TEXT,
  source_url TEXT,
  license TEXT,
  attribution TEXT,
  retrieved_at TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  UNIQUE (product_id, source)
);

CREATE TABLE IF NOT EXISTS ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  name_ko TEXT,
  name_en TEXT,
  category TEXT NOT NULL DEFAULT 'unclassified',
  is_class INTEGER NOT NULL DEFAULT 0,
  mfds_code TEXT,
  mfds_name TEXT,
  source TEXT NOT NULL DEFAULT 'halalmap_editorial',
  source_url TEXT,
  license TEXT,
  -- Result of evaluating the active rules against this ingredient on its own (a cache, refreshed
  -- whenever rules or ingredients change). Rules stay the single source of truth.
  analysis_status TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (analysis_status IN ('FLAGGED_INGREDIENT', 'CHECK_REQUIRED', 'NO_FLAGGED_INGREDIENTS', 'UNKNOWN')),
  analysis_rule_key TEXT,
  note TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  seed_hash TEXT,
  updated_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients (category);
CREATE INDEX IF NOT EXISTS idx_ingredients_mfds ON ingredients (mfds_code);

CREATE TABLE IF NOT EXISTS ingredient_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  alias_norm TEXT NOT NULL UNIQUE,
  lang TEXT NOT NULL DEFAULT 'other',
  source TEXT NOT NULL DEFAULT 'halalmap_editorial',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_aliases_ingredient ON ingredient_aliases (ingredient_id);

CREATE TABLE IF NOT EXISTS ingredient_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('ingredient', 'category', 'term')),
  match_value TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('FLAGGED_INGREDIENT', 'CHECK_REQUIRED', 'NO_FLAGGED_INGREDIENTS')),
  priority INTEGER NOT NULL DEFAULT 100,
  reason_code TEXT NOT NULL,
  reason_ko TEXT NOT NULL,
  reason_en TEXT NOT NULL,
  reason_uz TEXT NOT NULL,
  evidence TEXT,
  evidence_url TEXT,
  source TEXT NOT NULL DEFAULT 'halalmap_editorial',
  is_active INTEGER NOT NULL DEFAULT 1,
  seed_hash TEXT,
  updated_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rules_match ON ingredient_rules (match_type, match_value);

-- Parsed ingredient list of a product. match_type 'admin' rows are manual corrections and survive re-parsing.
CREATE TABLE IF NOT EXISTS product_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  parent_position INTEGER,
  raw_text TEXT NOT NULL,
  normalized_text TEXT NOT NULL,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('exact', 'alias', 'normalized', 'qualified', 'contains', 'fuzzy', 'unmatched', 'admin')),
  confidence REAL,
  percent REAL,
  origin_note TEXT
);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product ON product_ingredients (product_id, position);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient ON product_ingredients (ingredient_id);

CREATE TABLE IF NOT EXISTS halal_certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  certificate_no TEXT,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'revoked', 'suspended')),
  valid_from TEXT,
  valid_until TEXT,
  scope TEXT,
  -- Only 'verified' certifications can produce HALAL_CERTIFIED. A packaging label claim
  -- (e.g. Open Food Facts label tag) is stored as 'unverified' and shown as an unverified claim only.
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'needs_review', 'rejected')),
  verification_url TEXT,
  verified_at TEXT,
  verified_by TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  license TEXT,
  retrieved_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_certs_product ON halal_certifications (product_id);

CREATE TABLE IF NOT EXISTS product_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT NOT NULL,
  name TEXT,
  name_ko TEXT,
  brand TEXT,
  manufacturer TEXT,
  category TEXT,
  ingredients_text TEXT,
  ingredients_input TEXT NOT NULL DEFAULT 'typed' CHECK (ingredients_input IN ('typed', 'ocr', 'ocr_edited')),
  ocr_confidence REAL,
  product_image TEXT,
  ingredients_image TEXT,
  note TEXT,
  submitter_user_id INTEGER,
  submitter_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'needs_review')),
  reviewer_id INTEGER,
  reviewed_at TEXT,
  review_note TEXT,
  resulting_product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON product_submissions (status, created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_barcode ON product_submissions (barcode);

-- Per (barcode, provider) lookup outcome, so external APIs are not hit on every scan.
CREATE TABLE IF NOT EXISTS lookup_log (
  barcode TEXT NOT NULL,
  provider TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('found', 'not_found', 'error', 'skipped')),
  checked_at INTEGER NOT NULL,
  detail TEXT,
  PRIMARY KEY (barcode, provider)
);
