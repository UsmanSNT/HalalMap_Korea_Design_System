// Builds src/data/osm.generated.json (mosques, prayer rooms, halal restaurants in South Korea) from OpenStreetMap.
//
//   node scripts/import-osm.mjs --input data/imports/osm-korea-core.json   # rebuild from the committed snapshot
//   node scripts/import-osm.mjs --fetch                                    # refresh from Overpass, update the snapshot
//
// Data © OpenStreetMap contributors, ODbL 1.0: https://www.openstreetmap.org/copyright (see docs/place-data.md).
// Rules (kept from the original server import): coordinates are never guessed; halal certification is only
// taken from tags, never inferred from a business name; duplicates within 75 m with the same name or
// address are merged. A refresh refuses incomplete/empty Overpass responses and keeps the last good snapshot.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { distanceKm } from "../src/lib/geo.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = resolve(ROOT, "data/imports/osm-korea-core.json");
const OUT = resolve(ROOT, "src/data/osm.generated.json");
const OVERPASS_URL = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";

const FOOD = "^(restaurant|cafe|fast_food|food_court)$";
const query = (selectors) => `[out:json][timeout:120];
area["ISO3166-1"="KR"][admin_level=2]->.kr;
(
${selectors.map((s) => `  ${s}(area.kr);`).join("\n")}
);
out center tags;`;

const QUERIES = [
  query([
    'nwr["amenity"="place_of_worship"]["religion"="muslim"]',
    'nwr["building"="mosque"]',
    'nwr["amenity"="prayer_room"]',
    'nwr["prayer_room"="yes"]',
    `nwr["amenity"~"${FOOD}"]["diet:halal"~"^(yes|only)$"]`,
    `nwr["amenity"~"${FOOD}"]["halal"~"^(yes|only)$"]`,
    `nwr["amenity"~"${FOOD}"]["cuisine"~"halal",i]`,
    `nwr["amenity"~"${FOOD}"]["diet:pork"="no"]`,
    `nwr["amenity"~"${FOOD}"]["pork"="no"]`,
    'nwr["shop"]["diet:halal"~"^(yes|only)$"]',
    'nwr["shop"]["halal"~"^(yes|only)$"]',
  ]),
  query([
    'nwr["amenity"~"^(place_of_worship|prayer_room)$"]["name"~"(Muslim.*Prayer|Prayer.*Muslim|Musalla|Musallah|무슬림.*기도|이슬람.*기도)",i]',
    'nwr["amenity"="place_of_worship"]["name"~"(Mosque|Masjid|Islamic|이슬람|성원)",i]',
  ]),
  query([`nwr["amenity"~"${FOOD}"]["name"~"(halal|할랄)",i]`, 'nwr["shop"]["name"~"(halal|할랄)",i]']),
];

const first = (...values) => values.find((v) => typeof v === "string" && v.trim())?.trim() ?? null;
const bool = (v) => {
  const n = String(v ?? "").trim().toLowerCase();
  return ["yes", "true", "1", "only", "designated"].includes(n) ? true : null;
};
const HANGUL = /[가-힣]/u;
const PRAYER_ROOM_NAME = /(prayer|musalla|room for namaz|기도실|예배방)/i;

function mosqueKind(tags) {
  const name = tags.name ?? "";
  if (tags.building === "mosque") return "mosque";
  return tags.amenity === "prayer_room" || tags.prayer_room === "yes" || PRAYER_ROOM_NAME.test(name) ? "prayer-room" : "mosque";
}

function halalStatus(tags) {
  if (first(tags["halal:certification"], tags["halal:certified_by"], tags.certification)) return "certified";
  if (tags.halal === "only" || tags["diet:halal"] === "only") return "self-certified";
  if (tags.halal === "yes" || tags["diet:halal"] === "yes" || /halal/i.test(tags.cuisine ?? "")) return "halal-friendly";
  if (tags.pork === "no" || tags["diet:pork"] === "no") return "pork-free";
  return "unverified";
}

function cuisineOf(tags, name) {
  if (tags.amenity === "cafe") return "cafe";
  const tokens = (tags.cuisine ?? "").toLowerCase().split(";").map((s) => s.trim());
  if (tokens.some((t) => ["turkish", "kebab"].includes(t)) || /kebab|turk/i.test(name)) return "turkish";
  if (tokens.includes("uzbek") || /uzbek/i.test(name)) return "uzbek";
  if (tokens.some((t) => ["indian", "pakistani", "nepalese", "bangladeshi", "south_asian"].includes(t))) return "indian";
  if (tokens.includes("indonesian")) return "indonesian";
  if (tokens.includes("korean")) return "korean";
  return "other";
}

function addressOf(tags) {
  return first(tags["addr:full"], ["addr:province", "addr:city", "addr:district", "addr:street", "addr:housenumber"].map((k) => tags[k]).filter(Boolean).join(" ")) ?? "";
}

function phoneOf(tags) {
  const p = first(tags.phone, tags["contact:phone"])?.split(";")[0].trim();
  return p && /^\+?[0-9][0-9\- ()]{6,19}$/.test(p) ? p : undefined;
}

function openingHours(tags) {
  const m = (tags.opening_hours ?? "").trim().match(/^(?:Mo-Su )?(\d\d:\d\d)-(\d\d:\d\d)$/);
  return m ? { open: m[1], close: m[2] } : {};
}

const squash = (s) => (s ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** Pure: Overpass elements -> app records. Exported for tests. */
export function normalize(elements) {
  const records = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const nameKo = first(tags["name:ko"], HANGUL.test(tags.name ?? "") ? tags.name : null);
    const nameEn = first(tags["name:en"], tags.name && !HANGUL.test(tags.name) ? tags.name : null);
    const name = first(nameEn, nameKo, tags.name);
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const worship = tags.religion === "muslim" || tags.building === "mosque" || tags.amenity === "prayer_room" || tags.prayer_room === "yes" || PRAYER_ROOM_NAME.test(tags.name ?? "") || /(Mosque|Masjid|Islamic|이슬람|성원)/i.test(tags.name ?? "") && tags.amenity === "place_of_worship";
    const base = { id: `osm-${el.type}-${el.id}`, name, nameKo: nameKo ?? name, address: addressOf(tags), coords: { lat, lng }, phone: phoneOf(tags) };

    if (worship) {
      const facilities = [];
      if (bool(first(tags.ablution, tags.wudu, tags.washing_facilities))) facilities.push("wudu");
      if (bool(first(tags["female:prayer"], tags["women:prayer"], tags.female))) facilities.push("women");
      records.push({ ...base, group: "mosques", kind: mosqueKind(tags), facilities });
    } else {
      records.push({ ...base, group: "restaurants", cuisine: cuisineOf(tags, name), halal: halalStatus(tags), certBody: first(tags["halal:certification"], tags["halal:certified_by"], tags.certification) ?? undefined, ...openingHours(tags) });
    }
  }

  const kept = [];
  for (const r of records) {
    const key = squash(r.nameKo || r.name);
    const addr = squash(r.address);
    const dup = kept.some((k) => k.group === r.group && distanceKm(k.coords, r.coords) <= 0.075 && ((key && key === squash(k.nameKo || k.name)) || (addr && addr === squash(k.address))));
    if (!dup) kept.push(r);
  }

  const byId = (a, b) => a.id.localeCompare(b.id);
  const strip = ({ group, ...rest }) => JSON.parse(JSON.stringify(rest)); // drops undefined fields
  return {
    mosques: kept.filter((r) => r.group === "mosques").sort(byId).map(strip),
    restaurants: kept.filter((r) => r.group === "restaurants").sort(byId).map(strip),
  };
}

async function fetchSnapshot() {
  const elements = new Map();
  for (const q of QUERIES) {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      signal: AbortSignal.timeout(150_000),
      headers: { "User-Agent": "HalalMap-Korea/1.0 (open-data import; see repository)" },
      body: new URLSearchParams({ data: q }),
    });
    if (!response.ok) throw new Error(`Overpass responded ${response.status}`);
    const payload = await response.json();
    if (payload.remark) throw new Error(`Overpass returned an incomplete result: ${payload.remark}`);
    for (const el of payload.elements ?? []) elements.set(`${el.type}/${el.id}`, el);
  }
  if (elements.size === 0) throw new Error("Overpass returned no elements; keeping the last snapshot");
  const snapshot = { version: 0.6, generator: "HalalMap Korea Overpass snapshot", osm3s: { copyright: "Data from OpenStreetMap, available under ODbL 1.0" }, elements: [...elements.values()] };
  writeFileSync(SNAPSHOT, `${JSON.stringify(snapshot, null, 2)}\n`);
  return snapshot;
}

async function main() {
  const inputIndex = process.argv.indexOf("--input");
  const raw = process.argv.includes("--fetch") ? await fetchSnapshot() : JSON.parse(readFileSync(inputIndex !== -1 ? resolve(process.argv[inputIndex + 1]) : SNAPSHOT, "utf8"));
  const result = { generatedAt: new Date().toISOString(), ...normalize(raw.elements ?? []) };
  writeFileSync(OUT, `${JSON.stringify(result, null, 1)}\n`);
  console.log(`Wrote ${result.mosques.length} mosques/prayer rooms and ${result.restaurants.length} restaurants to src/data/osm.generated.json`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
