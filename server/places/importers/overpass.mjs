// OpenStreetMap importer via the Overpass API (ODbL 1.0 — attribution "© OpenStreetMap contributors").
// Mosques, prayer rooms, halal restaurants/cafés and halal markets in South Korea, from community tags:
//   amenity=place_of_worship + religion=muslim, building=mosque, amenity=prayer_room, diet:halal=yes|only, cuisine=halal.
// These tags are community-contributed and NOT certification: everything is imported as `unverified`.

export const OSM_SOURCE = "osm";
export const OSM_LICENSE = "ODbL 1.0";
export const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

export const OVERPASS_QUERY = `[out:json][timeout:180];
area["ISO3166-1"="KR"]["admin_level"="2"]->.kr;
(
  nwr["amenity"="place_of_worship"]["religion"="muslim"](area.kr);
  nwr["building"="mosque"](area.kr);
  nwr["amenity"="prayer_room"](area.kr);
  nwr["amenity"~"^(restaurant|fast_food|cafe|food_court|bar|pub|ice_cream)$"]["diet:halal"~"^(yes|only)$"](area.kr);
  nwr["amenity"~"^(restaurant|fast_food|cafe|food_court)$"]["cuisine"~"(^|;)halal(;|$)"](area.kr);
  nwr["shop"~"^(supermarket|convenience|butcher|grocery|deli|greengrocer|general|food|bakery|confectionery)$"]["diet:halal"~"^(yes|only)$"](area.kr);
  nwr["shop"~"^(supermarket|convenience|butcher|grocery|general|food)$"]["name"~"halal|할랄|Halal",i](area.kr);
);
out center tags;`;

const FOOD_AMENITIES = new Set(["restaurant", "fast_food", "cafe", "food_court", "bar", "pub", "ice_cream"]);
const PRAYER_ROOM_NAME = /기도실|prayer\s*room|musalla|mussalla|musholla|무살라|surau|prayer\s*space|salah\s*room/i;
const HANGUL = /[가-힣]/;
const LATIN = /[A-Za-z]/;

const CUISINE_MAP = [
  [/turk|kebab|doner/, "turkish"], [/uzbek|central_asia|kazakh|kyrgyz/, "uzbek"], [/indian|pakistan|bangladesh|nepal|curry/, "indian"],
  [/indonesia|malay/, "indonesian"], [/arab|lebanese|middle_eastern|egypt|syria|persian|iran|afghan/, "arabic"], [/korean/, "korean"],
];

export const cuisineCategory = (tags) => {
  if (tags.amenity === "cafe") return "cafe";
  const cuisine = String(tags.cuisine ?? "").toLowerCase();
  for (const [pattern, category] of CUISINE_MAP) if (pattern.test(cuisine)) return category;
  return cuisine && cuisine !== "halal" ? cuisine.split(";")[0] : "other";
};

const buildAddress = (tags) => {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [tags["addr:province"], tags["addr:city"], tags["addr:district"], tags["addr:subdistrict"], tags["addr:street"], tags["addr:housenumber"]].filter(Boolean);
  return parts.join(" ");
};

const pickNames = (tags) => {
  const name = tags["name"] ?? tags["name:ko"] ?? tags["name:en"] ?? null;
  const nameKo = tags["name:ko"] ?? (name && HANGUL.test(name) ? name : null);
  const nameEn = tags["name:en"] ?? (name && !HANGUL.test(name) && LATIN.test(name) ? name : null);
  return { name: nameKo ?? name ?? nameEn, nameKo, nameEn };
};

/**
 * Turns one Overpass element into the normalised place record (or null when it cannot be used).
 * Pure function — unit tested with fixtures shaped like real Overpass output.
 */
export const normalizeOsmElement = (element, { retrievedAt = new Date().toISOString() } = {}) => {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat ?? null;
  const lng = element.lon ?? element.center?.lon ?? null;
  const names = pickNames(tags);
  if (!names.name) return { skip: "unnamed" };
  if (lat == null || lng == null) return { skip: "no_coordinates" };

  let kind;
  let halalStatus = null;
  let halalEvidence = null;
  if (tags.amenity === "prayer_room") kind = "prayer_room";
  else if (tags.building === "mosque" || (tags.amenity === "place_of_worship" && tags.religion === "muslim")) {
    kind = PRAYER_ROOM_NAME.test([tags.name, tags["name:en"], tags["name:ko"]].filter(Boolean).join(" ")) ? "prayer_room" : "mosque";
  } else if (FOOD_AMENITIES.has(tags.amenity)) kind = "restaurant";
  else if (tags.shop) kind = "market";
  else return { skip: "unsupported" };

  if (kind === "restaurant" || kind === "market") {
    const diet = tags["diet:halal"];
    if (diet === "yes" || diet === "only") {
      halalStatus = "halal-friendly";
      halalEvidence = `OpenStreetMap tag diet:halal=${diet} (community reported, not certified)`;
    } else if (/(^|;)halal(;|$)/.test(String(tags.cuisine ?? ""))) {
      halalStatus = "halal-friendly";
      halalEvidence = "OpenStreetMap tag cuisine=halal (community reported, not certified)";
    } else if (/halal|할랄/i.test(tags.name ?? "")) {
      halalStatus = "halal-friendly";
      halalEvidence = "Name contains 'halal' (OpenStreetMap; not verified)";
    }
    if (!halalStatus) return { skip: "no_halal_tag" };
  }

  const type = element.type ?? "node";
  return {
    record: {
      kind,
      ...names,
      category: kind === "restaurant" ? cuisineCategory(tags) : kind === "market" ? tags.shop : null,
      halalStatus,
      halalEvidence,
      address: buildAddress(tags),
      city: tags["addr:city"] ?? null,
      province: tags["addr:province"] ?? null,
      lat,
      lng,
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      website: tags.website ?? tags["contact:website"] ?? null,
      openingHours: tags.opening_hours ?? null,
      description: tags.description ?? tags["description:ko"] ?? tags["description:en"] ?? null,
      facilities: [],
      source: OSM_SOURCE,
      sourceId: `${type}/${element.id}`,
      sourceUrl: `https://www.openstreetmap.org/${type}/${element.id}`,
      license: OSM_LICENSE,
      attribution: OSM_ATTRIBUTION,
      retrievedAt,
      raw: Object.fromEntries(Object.entries(tags).filter(([key]) => /^(amenity|shop|religion|denomination|diet:|cuisine|name|addr:|opening_hours|phone|website|operator|wheelchair)/.test(key))),
    },
  };
};

export const normalizeOsmResponse = (body, options) => {
  const records = [];
  const skipped = {};
  const seen = new Set();
  for (const element of body.elements ?? []) {
    const result = normalizeOsmElement(element, options);
    if (result.skip) {
      skipped[result.skip] = (skipped[result.skip] ?? 0) + 1;
      continue;
    }
    if (seen.has(result.record.sourceId)) continue;
    seen.add(result.record.sourceId);
    records.push(result.record);
  }
  return { records, skipped, osmBase: body.osm3s?.timestamp_osm_base ?? null };
};

export const overpassEndpoints = (env = process.env) =>
  (env.OVERPASS_URLS || "https://overpass-api.de/api/interpreter,https://overpass.kumi.systems/api/interpreter").split(",").map((u) => u.trim()).filter(Boolean);

export const fetchOverpass = async ({ fetchImpl = fetch, env = process.env, query = OVERPASS_QUERY, timeoutMs = 200_000 } = {}) => {
  const userAgent = env.OVERPASS_USER_AGENT || env.OFF_USER_AGENT || "HalalMapKorea/1.0 (https://github.com/UsmanSNT/HalalMap_Korea_Design_System)";
  let lastError;
  for (const endpoint of overpassEndpoints(env)) {
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": userAgent, Accept: "application/json" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`overpass_http_${response.status}`);
      return { body: await response.json(), endpoint };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Overpass unavailable (${lastError?.message ?? "unknown error"})`);
};
