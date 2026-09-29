import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { initPlacesSchema } from "../server/places-db.mjs";

const OSM_SOURCE = "OpenStreetMap";
const OSM_LICENSE = "ODbL-1.0";
const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";
const DEFAULT_INPUT = resolve("data/imports/osm-korea.json");
const DEFAULT_DB = resolve("server/data/halalmap.sqlite");
const DEFAULT_REPORT = resolve("data/imports/osm-korea.report.json");
const DEFAULT_SEED_OUTPUT = resolve("data/places/osm-korea.seed.json");

const overpassQuery = (selectors) => `[out:json][timeout:120];
area["ISO3166-1"="KR"][admin_level=2]->.kr;
(
${selectors.map((selector) => `  ${selector}(area.kr);`).join("\n")}
);
out center tags;`;

const OVERPASS_QUERIES = [
  overpassQuery([
  'nwr["amenity"="place_of_worship"]["religion"="muslim"]',
  'nwr["building"="mosque"]',
  'nwr["amenity"="prayer_room"]',
  'nwr["prayer_room"="yes"]',
  'nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]["diet:halal"~"^(yes|only)$"]',
  'nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]["halal"~"^(yes|only)$"]',
  'nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]["cuisine"~"halal",i]',
  'nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]["diet:pork"="no"]',
  'nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]["pork"="no"]',
  'nwr["shop"]["diet:halal"~"^(yes|only)$"]',
  'nwr["shop"]["halal"~"^(yes|only)$"]',
  ]),
  overpassQuery([
  'nwr["amenity"~"^(place_of_worship|prayer_room)$"]["name"~"(Muslim.*Prayer|Prayer.*Muslim|Musalla|Musallah|무슬림.*기도|이슬람.*기도)",i]',
  'nwr["amenity"="place_of_worship"]["name"~"(Mosque|Masjid|Islamic|이슬람|성원)",i]',
  ]),
  overpassQuery([
  'nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]["name"~"(halal|할랄)",i]',
  'nwr["shop"]["name"~"(halal|할랄)",i]',
  ]),
];

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (!arg.startsWith("--")) continue;
  const [key, inlineValue] = arg.slice(2).split("=", 2);
  const next = process.argv[index + 1];
  const value = inlineValue ?? (next && !next.startsWith("--") ? process.argv[++index] : true);
  args.set(key, value);
}

const boolTag = (value) => {
  if (value == null) return null;
  const normalized = String(value).trim().toLowerCase();
  if (["yes", "true", "1", "only", "designated"].includes(normalized)) return true;
  if (["no", "false", "0"].includes(normalized)) return false;
  return null;
};

const first = (...values) => values.find((value) => typeof value === "string" && value.trim())?.trim() ?? null;
const cleanPhone = (value) => value?.split(";")[0]?.trim() || null;
const normalizeText = (value) => (value ?? "")
  .normalize("NFKC")
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, "")
  .replace(/(restaurant|restoran|mosque|masjid|성원|모스크|기도실)$/u, "");

const toRadians = (degrees) => degrees * Math.PI / 180;
const distanceMeters = (a, b) => {
  const earthRadius = 6_371_000;
  const deltaLatitude = toRadians(b.latitude - a.latitude);
  const deltaLongitude = toRadians(b.longitude - a.longitude);
  const latitude1 = toRadians(a.latitude);
  const latitude2 = toRadians(b.latitude);
  const haversine = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(deltaLongitude / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
};

const buildAddress = (tags) => first(
  tags["addr:full"],
  [tags["addr:province"], tags["addr:city"], tags["addr:district"], tags["addr:street"], tags["addr:housenumber"]]
    .filter(Boolean)
    .join(" "),
);

const determineType = (tags) => {
  const name = tags.name ?? "";
  if (tags.amenity === "prayer_room" || tags.prayer_room === "yes" || /(Muslim.*Prayer|Prayer.*Muslim|Musalla|Musallah|무슬림.*기도|이슬람.*기도)/iu.test(name)) return "prayer_room";
  if (tags.religion === "muslim" || tags.building === "mosque") return "mosque";
  if (tags.shop) return "halal_market";
  return "restaurant";
};

const determineHalalStatus = (tags, type) => {
  if (type === "mosque" || type === "prayer_room") return "unknown";
  if (first(tags["halal:certification"], tags["halal:certified_by"], tags.certification)) return "halal_certified";
  if (tags.halal === "only" || tags["diet:halal"] === "only") return "self_certified";
  if (tags.halal === "yes" || tags["diet:halal"] === "yes" || /halal/i.test(tags.cuisine ?? "")) return "muslim_friendly";
  if (tags.pork === "no" || tags["diet:pork"] === "no") return "pork_free";
  return "unknown";
};

const normalizeElement = (element, importedAt) => {
  const tags = element.tags ?? {};
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  const type = determineType(tags);
  const sourceRecordId = `${element.type}/${element.id}`;
  const nameKo = first(tags["name:ko"], /[가-힣]/u.test(tags.name ?? "") ? tags.name : null);
  const nameEn = first(tags["name:en"], !/[가-힣]/u.test(tags.name ?? "") ? tags.name : null);
  const name = first(nameEn, nameKo, tags.name);
  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    nameKo,
    nameEn,
    type,
    category: first(tags.cuisine, tags.shop, tags.amenity),
    address: buildAddress(tags),
    latitude,
    longitude,
    phone: cleanPhone(first(tags.phone, tags["contact:phone"])),
    website: first(tags.website, tags["contact:website"]),
    halalStatus: determineHalalStatus(tags, type),
    certification: first(tags["halal:certification"], tags["halal:certified_by"], tags.certification),
    hasPrayerRoom: type === "mosque" || type === "prayer_room" ? true : boolTag(first(tags.prayer_room, tags.prayer)),
    hasWudu: boolTag(first(tags.ablution, tags.wudu, tags["washing_facilities"])),
    hasWomenPrayerArea: boolTag(first(tags["female:prayer"], tags["women:prayer"], tags.female)),
    source: OSM_SOURCE,
    sourceUrl: `https://www.openstreetmap.org/${sourceRecordId}`,
    sourceLicense: OSM_LICENSE,
    sourceRecordId,
    lastVerifiedAt: importedAt,
    sourceUpdatedAt: element.timestamp ?? null,
    verificationStatus: "imported",
    isActive: true,
    rawTags: tags,
    rawElement: element,
  };
};

const deduplicate = (places) => {
  const unique = [];
  const duplicates = [];
  for (const place of places) {
    const normalizedName = normalizeText(place.nameKo || place.nameEn || place.name);
    const normalizedAddress = normalizeText(place.address);
    const match = unique.find((candidate) => {
      if (candidate.type !== place.type) return false;
      const sameName = normalizedName && normalizedName === normalizeText(candidate.nameKo || candidate.nameEn || candidate.name);
      const sameAddress = normalizedAddress && normalizedAddress === normalizeText(candidate.address);
      return distanceMeters(candidate, place) <= 75 && (sameName || sameAddress);
    });
    if (match) {
      duplicates.push({ kept: match.sourceRecordId, removed: place.sourceRecordId });
      continue;
    }
    unique.push(place);
  }
  return { unique, duplicates };
};

const fetchOverpass = async () => {
  const endpoint = String(args.get("endpoint") || "https://overpass-api.de/api/interpreter");
  const queryIndex = args.has("query-index") ? Number(args.get("query-index")) : null;
  const queries = queryIndex == null ? OVERPASS_QUERIES : [OVERPASS_QUERIES[queryIndex]];
  if (queries.some((query) => !query)) throw new Error("Invalid --query-index; expected 0, 1 or 2");
  const elements = new Map();
  let metadata = null;
  for (const query of queries) {
    const response = await fetch(endpoint, {
      method: "POST",
      signal: AbortSignal.timeout(150_000),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": "HalalMap-Korea/1.0 (open-data import; contact via repository)",
      },
      body: new URLSearchParams({ data: query }),
    });
    if (!response.ok) throw new Error(`Overpass request failed: ${response.status} ${response.statusText}`);
    const payload = await response.json();
    if (payload.remark) throw new Error(`Overpass returned an incomplete result: ${payload.remark}`);
    metadata ??= payload;
    for (const element of payload.elements ?? []) elements.set(`${element.type}/${element.id}`, element);
  }
  return { ...metadata, elements: [...elements.values()] };
};

const inputPath = resolve(String(args.get("input") || DEFAULT_INPUT));
const dbPath = resolve(String(args.get("db") || DEFAULT_DB));
const reportPath = resolve(String(args.get("report") || DEFAULT_REPORT));
const seedOutputPath = resolve(String(args.get("seed-output") || DEFAULT_SEED_OUTPUT));
const importedAt = new Date().toISOString();

let payload;
if (args.get("fetch")) {
  payload = await fetchOverpass();
  if (payload.remark) throw new Error(`Overpass returned an incomplete result: ${payload.remark}`);
  if (!Array.isArray(payload.elements) || payload.elements.length === 0) {
    throw new Error("Overpass returned no elements; refusing to replace the last known-good snapshot");
  }
  await mkdir(dirname(inputPath), { recursive: true });
  await writeFile(inputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
} else {
  payload = JSON.parse(await readFile(inputPath, "utf8"));
}

const normalized = (payload.elements ?? []).map((element) => normalizeElement(element, importedAt)).filter(Boolean);
const { unique, duplicates } = deduplicate(normalized);

await mkdir(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
initPlacesSchema(db);

const upsert = db.prepare(`
  INSERT INTO places (
    id, name, name_ko, name_en, type, category, address, latitude, longitude, phone, website,
    halal_status, certification, has_prayer_room, has_wudu, has_women_prayer_area,
    source_name, source_url, source_license, source_record_id, last_verified_at, source_updated_at,
    verification_status, is_active, raw_tags_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(source_name, source_record_id) DO UPDATE SET
    name = excluded.name,
    name_ko = excluded.name_ko,
    name_en = excluded.name_en,
    type = excluded.type,
    category = excluded.category,
    address = excluded.address,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    phone = excluded.phone,
    website = excluded.website,
    halal_status = excluded.halal_status,
    certification = excluded.certification,
    has_prayer_room = excluded.has_prayer_room,
    has_wudu = excluded.has_wudu,
    has_women_prayer_area = excluded.has_women_prayer_area,
    source_url = excluded.source_url,
    source_license = excluded.source_license,
    last_verified_at = excluded.last_verified_at,
    source_updated_at = excluded.source_updated_at,
    is_active = excluded.is_active,
    raw_tags_json = excluded.raw_tags_json,
    updated_at = CURRENT_TIMESTAMP
`);
const upsertSource = db.prepare(`
  INSERT INTO place_sources (place_id, source_name, source_record_id, source_url, source_license, raw_payload_json)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(place_id, source_name, source_record_id) DO UPDATE SET
    source_url = excluded.source_url,
    source_license = excluded.source_license,
    imported_at = CURRENT_TIMESTAMP,
    raw_payload_json = excluded.raw_payload_json
`);

db.exec("BEGIN IMMEDIATE");
try {
  for (const place of unique) {
    upsert.run(
      place.id, place.name, place.nameKo, place.nameEn, place.type, place.category, place.address,
      place.latitude, place.longitude, place.phone, place.website, place.halalStatus, place.certification,
      place.hasPrayerRoom == null ? null : Number(place.hasPrayerRoom),
      place.hasWudu == null ? null : Number(place.hasWudu),
      place.hasWomenPrayerArea == null ? null : Number(place.hasWomenPrayerArea),
      place.source, place.sourceUrl, place.sourceLicense, place.sourceRecordId, place.lastVerifiedAt,
      place.sourceUpdatedAt, place.verificationStatus, Number(place.isActive), JSON.stringify(place.rawTags),
    );
    upsertSource.run(
      place.id, place.source, place.sourceRecordId, place.sourceUrl, place.sourceLicense,
      JSON.stringify(place.rawElement),
    );
  }
  if (args.get("deactivate-missing") && unique.length > 0) {
    const ids = new Set(unique.map((place) => place.sourceRecordId));
    const existing = db.prepare("SELECT id, source_record_id FROM places WHERE source_name = ?").all(OSM_SOURCE);
    const deactivate = db.prepare("UPDATE places SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    for (const row of existing) if (!ids.has(row.source_record_id)) deactivate.run(row.id);
  }
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}

const counts = Object.fromEntries(["mosque", "prayer_room", "restaurant", "halal_market"].map((type) => [
  type,
  unique.filter((place) => place.type === type).length,
]));
const report = {
  importedAt,
  source: OSM_SOURCE,
  sourceUrl: OSM_COPYRIGHT_URL,
  sourceLicense: OSM_LICENSE,
  queries: args.has("query-index") ? [OVERPASS_QUERIES[Number(args.get("query-index"))]] : OVERPASS_QUERIES,
  rawElements: payload.elements?.length ?? 0,
  normalized: normalized.length,
  unique: unique.length,
  duplicatesRemoved: duplicates.length,
  counts,
  missing: {
    address: unique.filter((place) => !place.address).length,
    phone: unique.filter((place) => !place.phone).length,
    website: unique.filter((place) => !place.website).length,
    koreanName: unique.filter((place) => !place.nameKo).length,
    englishName: unique.filter((place) => !place.nameEn).length,
    certification: unique.filter((place) => place.type === "restaurant" && !place.certification).length,
  },
  duplicates,
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await mkdir(dirname(seedOutputPath), { recursive: true });
await writeFile(seedOutputPath, `${JSON.stringify({
  generatedAt: importedAt,
  source: OSM_SOURCE,
  sourceUrl: OSM_COPYRIGHT_URL,
  sourceLicense: OSM_LICENSE,
  places: unique.map(({ rawTags, rawElement, ...place }) => place),
}, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
