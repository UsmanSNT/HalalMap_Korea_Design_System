// Wikidata importer (CC0 1.0): mosques in South Korea with labels/coordinates/website.
// Used mostly to enrich OpenStreetMap places with Korean/English names; merged by proximity + name.

export const WIKIDATA_SOURCE = "wikidata";
export const WIKIDATA_LICENSE = "CC0 1.0";
export const WIKIDATA_ATTRIBUTION = "Wikidata (CC0)";

export const SPARQL_QUERY = `SELECT ?item
  (SAMPLE(?ko) AS ?nameKo) (SAMPLE(?en) AS ?nameEn) (SAMPLE(?coord) AS ?coord)
  (SAMPLE(?website) AS ?website) (SAMPLE(?address) AS ?address)
WHERE {
  ?item wdt:P31/wdt:P279* wd:Q32815 .   # instance of mosque (or a subclass)
  ?item wdt:P17 wd:Q884 .               # country: South Korea
  OPTIONAL { ?item wdt:P625 ?coord . }
  OPTIONAL { ?item wdt:P856 ?website . }
  OPTIONAL { ?item wdt:P6375 ?address . }
  OPTIONAL { ?item rdfs:label ?ko . FILTER(LANG(?ko) = "ko") }
  OPTIONAL { ?item rdfs:label ?en . FILTER(LANG(?en) = "en") }
}
GROUP BY ?item`;

/** "Point(126.99 37.53)" -> { lat, lng } */
export const parseWktPoint = (wkt) => {
  const match = /Point\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i.exec(wkt ?? "");
  return match ? { lng: Number(match[1]), lat: Number(match[2]) } : null;
};

export const normalizeWikidataBindings = (body, { retrievedAt = new Date().toISOString() } = {}) => {
  const records = [];
  const skipped = {};
  for (const binding of body.results?.bindings ?? []) {
    const qid = /\/(Q\d+)$/.exec(binding.item?.value ?? "")?.[1];
    const nameKo = binding.nameKo?.value ?? null;
    const nameEn = binding.nameEn?.value ?? null;
    const point = parseWktPoint(binding.coord?.value);
    if (!qid || !(nameKo || nameEn)) {
      skipped.unnamed = (skipped.unnamed ?? 0) + 1;
      continue;
    }
    if (!point) {
      skipped.no_coordinates = (skipped.no_coordinates ?? 0) + 1;
      continue;
    }
    records.push({
      kind: "mosque",
      name: nameKo ?? nameEn,
      nameKo,
      nameEn,
      address: binding.address?.value ?? "",
      lat: point.lat,
      lng: point.lng,
      website: binding.website?.value ?? null,
      facilities: [],
      source: WIKIDATA_SOURCE,
      sourceId: qid,
      sourceUrl: `https://www.wikidata.org/wiki/${qid}`,
      license: WIKIDATA_LICENSE,
      attribution: WIKIDATA_ATTRIBUTION,
      retrievedAt,
      raw: { qid },
    });
  }
  return { records, skipped };
};

export const fetchWikidata = async ({ fetchImpl = fetch, env = process.env, timeoutMs = 60_000 } = {}) => {
  const userAgent = env.WIKIDATA_USER_AGENT || "HalalMapKorea/1.0 (https://github.com/UsmanSNT/HalalMap_Korea_Design_System)";
  const response = await fetchImpl(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(SPARQL_QUERY)}`, {
    headers: { "User-Agent": userAgent, Accept: "application/sparql-results+json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`wikidata_http_${response.status}`);
  return response.json();
};
