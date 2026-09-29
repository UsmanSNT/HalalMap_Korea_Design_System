-- Registry of every external/open data source with its licence review state.
-- Importers refuse to run against a source whose licence_status is 'rejected',
-- and require an explicit acknowledgement while it is still 'unconfirmed'.
CREATE TABLE IF NOT EXISTS data_sources (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('places', 'products', 'ingredients', 'certification', 'editorial', 'user')),
  homepage_url TEXT,
  api_url TEXT,
  license TEXT,
  license_url TEXT,
  attribution TEXT,
  license_status TEXT NOT NULL DEFAULT 'unconfirmed' CHECK (license_status IN ('confirmed', 'unconfirmed', 'rejected')),
  usage_status TEXT NOT NULL DEFAULT 'planned' CHECK (usage_status IN ('active', 'planned', 'rejected')),
  requires_api_key INTEGER NOT NULL DEFAULT 0,
  api_key_env TEXT,
  terms_note TEXT,
  reason TEXT,
  reviewed_at TEXT,
  last_import_at TEXT,
  record_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS import_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  kind TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'ok', 'error')),
  inserted INTEGER NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL DEFAULT 0,
  skipped INTEGER NOT NULL DEFAULT 0,
  detail TEXT
);

-- Restaurants, mosques, prayer rooms and halal markets share one table (existing UI treats
-- mosques and prayer rooms as one list). Every row carries its own provenance.
CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('restaurant', 'mosque', 'prayer_room', 'market')),
  name TEXT NOT NULL,
  name_ko TEXT,
  name_en TEXT,
  subtitle TEXT,
  category TEXT,
  halal_status TEXT CHECK (halal_status IN ('certified', 'muslim-owned', 'halal-friendly')),
  halal_evidence TEXT,
  cert_body TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  lat REAL,
  lng REAL,
  phone TEXT,
  website TEXT,
  opening_hours TEXT,
  description TEXT,
  facilities TEXT NOT NULL DEFAULT '[]',
  juma TEXT,
  photo TEXT,
  data_origin TEXT NOT NULL DEFAULT 'imported' CHECK (data_origin IN ('imported', 'demo', 'admin', 'submission')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'needs_review', 'rejected')),
  is_active INTEGER NOT NULL DEFAULT 1,
  source TEXT,
  source_id TEXT,
  source_url TEXT,
  license TEXT,
  attribution TEXT,
  retrieved_at TEXT,
  last_verified_at TEXT,
  admin_note TEXT,
  -- Source-specific extras that have no column of their own (demo delivery fields, extra OSM tags …).
  extra TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_places_source ON places (source, source_id) WHERE source IS NOT NULL AND source_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_places_kind ON places (kind, is_active);
CREATE INDEX IF NOT EXISTS idx_places_geo ON places (lat, lng);

-- One row per source that contributed to a place (a place can be enriched by several sources).
CREATE TABLE IF NOT EXISTS place_sources (
  place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_id TEXT,
  source_url TEXT,
  license TEXT,
  attribution TEXT,
  retrieved_at TEXT,
  raw TEXT,
  PRIMARY KEY (place_id, source)
);
