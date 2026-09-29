// Browser end-to-end check of the place data on a MOBILE viewport: the real OpenStreetMap places imported into the
// database show up on the map (Leaflet markers), in the mosque list and in the restaurant list, with provenance.
//   pnpm dev   then   node scripts/e2e-places.mjs
// Map tiles come from tile.openstreetmap.org and are not needed for the assertions (markers are DOM elements).

import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const base = process.env.E2E_BASE_URL ?? "http://127.0.0.1:8443";
const out = resolve(process.env.E2E_OUT ?? ".tmp-e2e");
const executablePath = process.env.E2E_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
mkdirSync(out, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const api = await (await fetch(`${base}/api/places?limit=500`)).json();
const expected = { all: api.places.filter((p) => p.lat != null).length, mosque: api.counts.mosque, restaurant: api.counts.restaurant };

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "en-US" });
await context.addInitScript(() => localStorage.setItem("halalmap-language", "en"));
// The sandbox has no route to the tile server; markers are DOM elements, so the assertions do not need tiles.
await context.route("https://tile.openstreetmap.org/**", (route) => route.abort());
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
const shot = (name) => page.screenshot({ path: resolve(out, `${name}.png`) });
const pins = () => page.locator(".leaflet-marker-icon").count();
// Pins overlap when the whole country is in view, so a coordinate click could hit a neighbour: click the element itself.
const tapFirstPin = () => page.locator(".leaflet-marker-icon").first().dispatchEvent("click");

try {
  check("API serves real OSM places (not demo)", api.places.length >= 30 && api.places.every((p) => p.dataOrigin === "imported"), `${api.places.length} places`);

  await page.goto(`${base}/#/map-view`);
  await page.waitForSelector(".leaflet-marker-icon", { timeout: 20000 });
  await page.waitForTimeout(500);
  check("map shows a marker for every real place with coordinates", (await pins()) === expected.all, `${await pins()} / ${expected.all}`);
  check("OpenStreetMap attribution is visible on the map", (await page.locator(".leaflet-control-attribution").textContent()).includes("OpenStreetMap"));
  await shot("places-01-map");

  await page.getByRole("button", { name: /^Mosques/ }).click();
  await page.waitForTimeout(300);
  check("mosque filter narrows the markers to mosques", (await pins()) === expected.mosque, `${await pins()} / ${expected.mosque}`);

  await tapFirstPin();
  await page.waitForSelector("text=Details");
  const sheet = await page.locator("body").textContent();
  check("selected place shows its source, licence and community-reported note", /Source: .*OpenStreetMap/.test(sheet) && /ODbL/.test(sheet) && sheet.includes("Community-reported"));
  check("selected place is not labelled halal certified", !/HALAL CERTIFIED/i.test(sheet));
  await shot("places-02-selected");

  await page.getByRole("button", { name: /^Restaurants/ }).click();
  await page.waitForTimeout(300);
  check("restaurant filter narrows the markers to restaurants", (await pins()) === expected.restaurant, `${await pins()} / ${expected.restaurant}`);
  await tapFirstPin();
  await page.waitForSelector("text=Details");
  check("restaurant shows its halal basis from the source tag", /not certified/i.test(await page.locator("body").textContent()));
  await page.getByRole("button", { name: "Details" }).click();
  await page.waitForFunction(() => location.hash.startsWith("#/restaurant-detail"));
  await page.waitForSelector("text=/OpenStreetMap/", { timeout: 10000 });
  check("restaurant detail opens with provenance", true);
  await shot("places-03-restaurant-detail");

  await page.goto(`${base}/#/mosque-list`);
  await page.waitForTimeout(1200);
  const listText = await page.locator("body").textContent();
  const realNames = api.places.filter((p) => p.kind === "mosque").map((p) => p.nameKo || p.name);
  check("mosque list shows real mosques, no demo tag", realNames.slice(0, 3).every((name) => listText.includes(name)) && !listText.includes("DEMO"));
  await shot("places-04-mosque-list");

  await page.goto(`${base}/#/restaurant-list`);
  await page.waitForTimeout(1200);
  const restaurantText = await page.locator("body").textContent();
  check("restaurant list shows the COMMUNITY tag, readable cuisine labels and no delivery-sort chip", restaurantText.includes("COMMUNITY") && !restaurantText.includes("steak_house") && !restaurantText.includes("Fastest delivery"));
  await shot("places-05-restaurant-list");

  check("no uncaught page errors", pageErrors.length === 0, pageErrors.join(" | "));
} catch (error) {
  check("script completed without exceptions", false, error.message);
  await shot("places-zz-failure").catch(() => undefined);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots: ${out}`);
process.exit(failed.length ? 1 : 0);
