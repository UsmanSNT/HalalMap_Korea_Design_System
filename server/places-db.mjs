const PLACE_TYPES = ["mosque", "prayer_room", "restaurant", "halal_market"];
const HALAL_STATUSES = [
  "halal_certified",
  "self_certified",
  "muslim_friendly",
  "pork_free",
  "unknown",
];

export const initPlacesSchema = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_ko TEXT,
      name_en TEXT,
      type TEXT NOT NULL CHECK (type IN ('mosque', 'prayer_room', 'restaurant', 'halal_market')),
      category TEXT,
      address TEXT,
      latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
      longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
      phone TEXT,
      website TEXT,
      halal_status TEXT NOT NULL DEFAULT 'unknown'
        CHECK (halal_status IN ('halal_certified', 'self_certified', 'muslim_friendly', 'pork_free', 'unknown')),
      certification TEXT,
      has_prayer_room INTEGER CHECK (has_prayer_room IN (0, 1) OR has_prayer_room IS NULL),
      has_wudu INTEGER CHECK (has_wudu IN (0, 1) OR has_wudu IS NULL),
      has_women_prayer_area INTEGER CHECK (has_women_prayer_area IN (0, 1) OR has_women_prayer_area IS NULL),
      source_name TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_license TEXT NOT NULL,
      source_record_id TEXT NOT NULL,
      last_verified_at TEXT,
      source_updated_at TEXT,
      verification_status TEXT NOT NULL DEFAULT 'imported'
        CHECK (verification_status IN ('imported', 'verified', 'needs_review')),
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      raw_tags_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (source_name, source_record_id)
    );

    CREATE TABLE IF NOT EXISTS place_sources (
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      source_name TEXT NOT NULL,
      source_record_id TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_license TEXT NOT NULL,
      imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      raw_payload_json TEXT,
      PRIMARY KEY (place_id, source_name, source_record_id)
    );

    CREATE INDEX IF NOT EXISTS idx_places_type_active ON places(type, is_active);
    CREATE INDEX IF NOT EXISTS idx_places_halal_active ON places(halal_status, is_active);
    CREATE INDEX IF NOT EXISTS idx_places_coordinates ON places(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_places_verification ON places(verification_status, is_active);
  `);
};

export const seedPlaces = (db, places) => {
  const existing = db.prepare("SELECT count(*) AS count FROM places").get().count;
  if (existing > 0 || !Array.isArray(places) || places.length === 0) return 0;
  const insert = db.prepare(`
    INSERT OR IGNORE INTO places (
      id, name, name_ko, name_en, type, category, address, latitude, longitude, phone, website,
      halal_status, certification, has_prayer_room, has_wudu, has_women_prayer_area,
      source_name, source_url, source_license, source_record_id, last_verified_at, source_updated_at,
      verification_status, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const place of places) {
      insert.run(
        place.id, place.name, place.nameKo, place.nameEn, place.type, place.category, place.address,
        place.latitude, place.longitude, place.phone, place.website, place.halalStatus, place.certification,
        place.hasPrayerRoom == null ? null : Number(place.hasPrayerRoom),
        place.hasWudu == null ? null : Number(place.hasWudu),
        place.hasWomenPrayerArea == null ? null : Number(place.hasWomenPrayerArea),
        place.source, place.sourceUrl, place.sourceLicense, place.sourceRecordId,
        place.lastVerifiedAt, place.sourceUpdatedAt, place.verificationStatus, Number(place.isActive),
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return places.length;
};

const booleanOrNull = (value) => value == null ? null : Boolean(value);

export const placeFromRow = (row) => row ? {
  id: row.id,
  name: row.name,
  nameKo: row.name_ko,
  nameEn: row.name_en,
  type: row.type,
  category: row.category,
  address: row.address,
  latitude: row.latitude,
  longitude: row.longitude,
  phone: row.phone,
  website: row.website,
  halalStatus: row.halal_status,
  certification: row.certification,
  hasPrayerRoom: booleanOrNull(row.has_prayer_room),
  hasWudu: booleanOrNull(row.has_wudu),
  hasWomenPrayerArea: booleanOrNull(row.has_women_prayer_area),
  source: row.source_name,
  sourceUrl: row.source_url,
  sourceLicense: row.source_license,
  sourceRecordId: row.source_record_id,
  lastVerifiedAt: row.last_verified_at,
  sourceUpdatedAt: row.source_updated_at,
  verificationStatus: row.verification_status,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
} : null;

export const validatePlaceInput = (body, { partial = false } = {}) => {
  const errors = [];
  const required = ["name", "type", "latitude", "longitude", "source", "sourceUrl", "sourceLicense"];
  if (!partial) {
    for (const field of required) {
      if (body[field] == null || body[field] === "") errors.push(`${field} is required`);
    }
  }
  if (body.type != null && !PLACE_TYPES.includes(body.type)) errors.push("Invalid place type");
  if (body.halalStatus != null && !HALAL_STATUSES.includes(body.halalStatus)) errors.push("Invalid halal status");
  if (body.latitude != null && (!Number.isFinite(Number(body.latitude)) || Number(body.latitude) < -90 || Number(body.latitude) > 90)) {
    errors.push("Invalid latitude");
  }
  if (body.longitude != null && (!Number.isFinite(Number(body.longitude)) || Number(body.longitude) < -180 || Number(body.longitude) > 180)) {
    errors.push("Invalid longitude");
  }
  return errors;
};

export { PLACE_TYPES, HALAL_STATUSES };
