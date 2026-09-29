import { HttpError, floatParam, intParam, json } from "../lib/http.mjs";
import { getPlace, mosqueView, placeAttributions, placeCounts, placeSources, queryPlaces, restaurantView, PLACE_KINDS } from "./repo.mjs";
import { loadDemoSeed } from "./seed.mjs";

const originFrom = (url) => {
  const lat = floatParam(url.searchParams.get("lat"));
  const lng = floatParam(url.searchParams.get("lng"));
  if (lat == null || lng == null || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
};

const listQuery = (url, kinds) => ({
  kinds,
  q: url.searchParams.get("q")?.trim().slice(0, 80) || null,
  category: url.searchParams.get("category") || null,
  halalStatus: url.searchParams.get("halalStatus") || null,
  origin: originFrom(url),
  radiusKm: floatParam(url.searchParams.get("radiusKm")),
  limit: intParam(url.searchParams.get("limit"), 100, { min: 1, max: 500 }),
  offset: intParam(url.searchParams.get("offset"), 0, { min: 0 }),
});

/** Public place endpoints. Same paths/shapes as before, now backed by the database. */
export const createPlaceRoutes = ({ db }) => async (request, response, url) => {
  if (request.method !== "GET") return false;
  const path = url.pathname;

  if (path === "/api/restaurants") {
    const query = listQuery(url, ["restaurant"]);
    const { rows, total } = queryPlaces(db, query);
    json(response, 200, { restaurants: rows.map((row) => restaurantView(row, query.origin)), total });
    return true;
  }

  const restaurantMatch = /^\/api\/restaurants\/([^/]+)(\/menu)?$/.exec(path);
  if (restaurantMatch) {
    const row = getPlace(db, decodeURIComponent(restaurantMatch[1]));
    if (!row || (row.kind !== "restaurant" && row.kind !== "market")) throw new HttpError(404, "Restoran topilmadi", "not_found");
    if (restaurantMatch[2]) {
      const menu = loadDemoSeed().menus[row.id] ?? [];
      json(response, 200, { restaurant: { id: row.id, name: row.name }, menu });
    } else {
      json(response, 200, { restaurant: { ...restaurantView(row, originFrom(url)), sources: placeSources(db, row.id) } });
    }
    return true;
  }

  if (path === "/api/mosques") {
    const type = url.searchParams.get("type");
    const kinds = type === "mosque" ? ["mosque"] : type === "prayer-room" || type === "prayer_room" ? ["prayer_room"] : ["mosque", "prayer_room"];
    const query = listQuery(url, kinds);
    const { rows, total } = queryPlaces(db, query);
    json(response, 200, { mosques: rows.map((row) => mosqueView(row, query.origin)), total });
    return true;
  }

  const mosqueMatch = /^\/api\/mosques\/([^/]+)$/.exec(path);
  if (mosqueMatch) {
    const row = getPlace(db, decodeURIComponent(mosqueMatch[1]));
    if (!row || (row.kind !== "mosque" && row.kind !== "prayer_room")) throw new HttpError(404, "Masjid topilmadi", "not_found");
    json(response, 200, { mosque: { ...mosqueView(row, originFrom(url)), sources: placeSources(db, row.id) } });
    return true;
  }

  // Unified endpoint (all kinds, including halal markets).
  if (path === "/api/places") {
    // `kind=a,b` (current) or repeated `type=a&type=b` (earlier client); "halal_market" is the older name of "market".
    const kindParam = url.searchParams.get("kind") ?? url.searchParams.getAll("type").join(",");
    const kinds = kindParam
      ? kindParam.split(",").map((k) => k.trim().replace("-", "_").replace("halal_market", "market")).filter((k) => PLACE_KINDS.includes(k))
      : PLACE_KINDS;
    const query = listQuery(url, kinds);
    const { rows, total } = queryPlaces(db, query);
    json(response, 200, {
      places: rows.map((row) => (row.kind === "mosque" || row.kind === "prayer_room" ? mosqueView(row, query.origin) : restaurantView(row, query.origin))),
      total,
      counts: placeCounts(db),
      attributions: placeAttributions(db),
    });
    return true;
  }

  const placeMatch = /^\/api\/places\/([^/]+)$/.exec(path);
  if (placeMatch) {
    const row = getPlace(db, decodeURIComponent(placeMatch[1]));
    if (!row) throw new HttpError(404, "Joy topilmadi", "not_found");
    const view = row.kind === "mosque" || row.kind === "prayer_room" ? mosqueView(row, originFrom(url)) : restaurantView(row, originFrom(url));
    json(response, 200, { place: { ...view, sources: placeSources(db, row.id) } });
    return true;
  }
  return false;
};
