// Imports mosques/prayer rooms and halal restaurants in South Korea from OpenStreetMap (Overpass API)
// into src/data/osm.generated.json.
//
//   node scripts/import-osm.mjs                 # query Overpass
//   node scripts/import-osm.mjs --input r.json  # reuse a saved Overpass JSON response
//
// Data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright
// Entries are tagged "unverified" for halal status; curated and approved community places win over OSM
// duplicates (see src/lib/PlacesContext.tsx).

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OVERPASS_URL = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../src/data/osm.generated.json");

const QUERY = `[out:json][timeout:120];
area["ISO3166-1"="KR"][admin_level=2]->.kr;
(
  nwr["amenity"="place_of_worship"]["religion"="muslim"](area.kr);
  nwr["amenity"~"^(restaurant|fast_food|cafe|food_court)$"]["diet:halal"~"^(yes|only)$"](area.kr);
);
out center tags;`;

const CUISINES = { korean: "korean", turkish: "turkish", kebab: "turkish", uzbek: "uzbek", indian: "indian", indonesian: "indonesian", coffee_shop: "cafe" };

const clean = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");

function coordsOf(el) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  return typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;
}

function addressOf(tags) {
  const full = clean(tags["addr:full"]);
  if (full) return full;
  return ["addr:province", "addr:city", "addr:district", "addr:street", "addr:housenumber"]
    .map((k) => clean(tags[k]))
    .filter(Boolean)
    .join(" ");
}

function phoneOf(tags) {
  const first = clean(tags.phone || tags["contact:phone"]).split(";")[0].trim();
  return /^\+?[0-9][0-9\- ()]{6,19}$/.test(first) ? first : undefined;
}

function hoursOf(tags) {
  const m = clean(tags.opening_hours).match(/^(?:Mo-Su )?(\d\d:\d\d)-(\d\d:\d\d)$/);
  return m ? { open: m[1], close: m[2] } : {};
}

function mosqueKind(tags, name) {
  if (tags.building === "mosque" || /mosque|masjid|islamic|성원|모스크|사원/i.test(name)) return "mosque";
  return /prayer|musalla|mussalla|기도실/i.test(name) ? "prayer-room" : "mosque";
}

function cuisineOf(tags, name) {
  if (tags.amenity === "cafe" || /cafe|카페/i.test(name)) return "cafe";
  for (const token of clean(tags.cuisine).split(";")) {
    const mapped = CUISINES[token.trim()];
    if (mapped) return mapped;
  }
  return "other";
}

export function normalize(elements) {
  const mosques = [];
  const restaurants = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const coords = coordsOf(el);
    const name = clean(tags["name:en"]) || clean(tags.name);
    if (!coords || !name) continue;
    const base = {
      id: `osm-${el.type}-${el.id}`,
      name,
      nameKo: clean(tags["name:ko"]) || clean(tags.name) || name,
      address: addressOf(tags),
      coords,
      phone: phoneOf(tags),
    };
    if (tags.amenity === "place_of_worship") {
      mosques.push({ ...base, kind: mosqueKind(tags, name), facilities: [] });
    } else {
      restaurants.push({ ...base, cuisine: cuisineOf(tags, name), halal: "unverified", ...hoursOf(tags) });
    }
  }
  const byId = (a, b) => a.id.localeCompare(b.id);
  return { mosques: mosques.sort(byId), restaurants: restaurants.sort(byId) };
}

async function main() {
  const inputIndex = process.argv.indexOf("--input");
  const raw =
    inputIndex !== -1
      ? JSON.parse(readFileSync(process.argv[inputIndex + 1], "utf8"))
      : await (async () => {
          const response = await fetch(OVERPASS_URL, { method: "POST", body: new URLSearchParams({ data: QUERY }) });
          if (!response.ok) throw new Error(`Overpass responded ${response.status}`);
          return response.json();
        })();

  const result = { generatedAt: new Date().toISOString(), ...normalize(raw.elements ?? []) };
  writeFileSync(OUT, `${JSON.stringify(result, null, 1)}\n`);
  console.log(`Wrote ${result.mosques.length} mosques/prayer rooms and ${result.restaurants.length} restaurants to ${OUT}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
