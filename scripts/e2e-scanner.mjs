// Browser end-to-end check of the Product Scanner on a MOBILE viewport (Chromium via playwright-core).
//   pnpm dev                        (in another terminal: API + web)
//   node scripts/e2e-scanner.mjs    (E2E_BASE_URL, E2E_CHROMIUM, E2E_OUT are optional)
//
// A fake camera streams a rendered EAN-13 barcode (Y4M) so the real getUserMedia -> decode -> lookup -> result path runs.
// Headless Chromium on Linux has no native BarcodeDetector, so this exercises the ZXing fallback used on iOS Safari.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { writeBarcodeY4m } from "./e2e/ean13.mjs";
import { gtinCheckDigit } from "../server/products/barcode.mjs";

const base = process.env.E2E_BASE_URL ?? "http://127.0.0.1:8443";
const out = resolve(process.env.E2E_OUT ?? ".tmp-e2e");
const executablePath = process.env.E2E_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
mkdirSync(out, { recursive: true });

// Fresh random Korean-prefix barcodes per run: nothing is known about them, so every run starts from "not found"
// (and the script can be repeated against the same database).
const randomEan13 = () => {
  const body = `880${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;
  return `${body}${gtinCheckDigit(body)}`;
};
const CAMERA_CODE = randomEan13();
const MANUAL_CODE = randomEan13();
const FOLLOWUP_CODE = randomEan13();

const y4m = resolve(out, "camera.y4m");
writeBarcodeY4m(y4m, CAMERA_CODE);

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", `--use-file-for-fake-video-capture=${y4m}`],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  permissions: ["camera"],
  locale: "en-US",
});
await context.addInitScript(() => localStorage.setItem("halalmap-language", "en"));
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
const shot = (name) => page.screenshot({ path: resolve(out, `${name}.png`) });

const api = async (path, { method = "GET", token, body } = {}) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
};
const adminToken = (await api("/api/auth/login", { method: "POST", body: { email: "admin@halalmap.test", password: "Admin123!" } })).body.token;

try {
  // 1. Camera scan -> barcode detected -> result page ------------------------------------------------
  await page.goto(`${base}/#/scanner`);
  await page.waitForSelector('[data-testid="scanner-screen"][data-camera="scanning"]', { timeout: 15000 });
  check("camera starts on a mobile viewport", true, `decoder: ${await page.getAttribute('[data-testid="scanner-screen"]', "data-mode")}`);
  await shot("01-scanner-camera");
  await page.waitForFunction((code) => location.hash.includes(`scan-result?barcode=${code}`), CAMERA_CODE, { timeout: 20000 });
  check("EAN-13 detected from the camera stream", true, CAMERA_CODE);
  await page.waitForSelector('[data-testid="scan-result"][data-state="not-found"]', { timeout: 20000 });
  check("unknown barcode shows the not-found state with next steps", (await page.locator('[data-testid="action-ingredient-photo"]').count()) === 1 && (await page.locator('[data-testid="action-contribute"]').count()) === 1);
  await shot("02-not-found");

  // 2. Contribute the product (photo + ingredient text) -----------------------------------------------
  await page.click('[data-testid="action-contribute"]');
  await page.waitForSelector('[data-testid="cs-form"]');
  await page.fill('[data-testid="cs-name"]', "테스트 초코 크래커");
  await page.fill('[data-testid="cs-ingredients"]', "밀가루(밀:미국산), 설탕, 팜유, 젤라틴, 정제소금, 유화제(대두레시틴)");
  await shot("03-contribute-form");
  await page.click('[data-testid="cs-submit"]');
  await page.waitForSelector('[data-testid="cs-success"]');
  check("contribution is accepted as PENDING (not verified data)", /PENDING/.test(await page.textContent('[data-testid="cs-success"]')));
  await shot("04-contribute-pending");
  const stillMissing = await api(`/api/products/lookup/${CAMERA_CODE}`);
  check("a pending contribution is not served as product data", stillMissing.body.found === false && stillMissing.body.pendingSubmission === true);

  // 3. Admin approves -> scan result shows verified analysis --------------------------------------------
  const pending = (await api("/api/admin/submissions?status=pending", { token: adminToken })).body;
  const submissionId = pending.submissions.find((s) => s.barcode === CAMERA_CODE)?.id;
  await api(`/api/admin/submissions/${submissionId}/review`, { method: "POST", token: adminToken, body: { action: "approve", note: "e2e" } });
  await page.goto(`${base}/#/scan-result?barcode=${CAMERA_CODE}`);
  await page.waitForSelector('[data-testid="status-banner"]');
  const status = await page.getAttribute('[data-testid="status-banner"]', "data-status");
  check("verified product analysis: gelatin makes it CHECK_REQUIRED", status === "CHECK_REQUIRED", status);
  check("product name and source are shown", (await page.textContent('[data-testid="product-name"]')).includes("테스트 초코 크래커") && (await page.textContent('[data-testid="source-card"]')).includes("User contribution"));
  check("gelatin is listed under 'check required' with the reason", (await page.textContent('[data-testid="section-CHECK_REQUIRED"]')).includes("Ingredient source could not be determined from available product information."));
  await shot("05-result-check-required");
  await page.evaluate(() => document.querySelector('[data-testid="status-banner"]').scrollIntoView());

  // 4. Manual entry, validation and the flagged / certified presentation ---------------------------------
  await page.goto(`${base}/#/scanner`);
  await page.waitForSelector('[data-testid="manual-barcode"]');
  await page.fill('[data-testid="manual-barcode"]', "1234567");
  await page.click('[data-testid="manual-submit"]');
  check("an invalid barcode is rejected before any request", (await page.locator('[role="alert"]').count()) > 0);
  await page.fill('[data-testid="manual-barcode"]', MANUAL_CODE);
  await page.click('[data-testid="manual-submit"]');
  await page.waitForFunction((code) => location.hash.includes(code), MANUAL_CODE);
  await page.waitForSelector('[data-testid="scan-result"][data-state="not-found"]');
  check("manual barcode entry works", true);

  for (const [code, name, ingredients] of [
    [MANUAL_CODE, "테스트 소시지", "돼지고기(국산), 설탕, 정제소금"],
    [FOLLOWUP_CODE, "테스트 비스킷", "밀가루, 설탕, 정제소금"],
  ]) {
    await api("/api/admin/products", { method: "POST", token: adminToken, body: { barcode: code, name, ingredientsRaw: ingredients } });
  }
  await page.goto(`${base}/#/scan-result?barcode=${MANUAL_CODE}`);
  await page.reload(); // same hash as the previous not-found page: force a fresh lookup
  await page.waitForSelector('[data-testid="status-banner"]');
  check("pork ingredient -> FLAGGED_INGREDIENT with a red banner", (await page.getAttribute('[data-testid="status-banner"]', "data-status")) === "FLAGGED_INGREDIENT");
  check("flagged reason: 'Pork ingredient detected in the ingredient list.'", (await page.textContent('[data-testid="section-FLAGGED_INGREDIENT"]')).includes("Pork ingredient detected in the ingredient list."));
  await shot("06-result-flagged");

  await page.goto(`${base}/#/scan-result?barcode=${FOLLOWUP_CODE}`);
  await page.waitForSelector('[data-testid="status-banner"]');
  check("only unflagged ingredients -> NO FLAGGED INGREDIENTS FOUND (not halal)", (await page.textContent('[data-testid="status-token"]')) === "NO FLAGGED INGREDIENTS FOUND");
  const productForCert = (await api(`/api/admin/products?q=${FOLLOWUP_CODE}`, { token: adminToken })).body.products[0];
  await shot("07-result-no-flags");
  await api("/api/admin/certifications", { method: "POST", token: adminToken, body: { productId: productForCert.id, organization: "KMF (test)", certificateNo: "TEST-1", verificationUrl: "https://example.test/verify/TEST-1", verificationStatus: "verified", validUntil: "2099-12-31" } });
  await page.goto(`${base}/#/scan-result?barcode=${FOLLOWUP_CODE}`);
  await page.reload();
  await page.waitForSelector('[data-testid="status-banner"][data-status="HALAL_CERTIFIED"]');
  check("verified certificate -> HALAL CERTIFIED with organisation and verification link", (await page.textContent('[data-testid="certification-card"]')).includes("KMF (test)") && (await page.locator('[data-testid="certification-card"] a').count()) === 1);
  await shot("08-result-certified");

  // 5. Ingredient label photo -> on-device OCR -> confirmation gate -> analysis ------------------------------
  await page.setContent(`<body style="margin:0;background:#fff"><div id="label" style="display:inline-block;padding:24px 28px;font:34px/1.5 'WenQuanYi Zen Hei';color:#111;background:#fff;width:820px">제품명 테스트 과자<br>원재료명: 밀가루(밀:미국산), 설탕, 젤라틴, 정제소금,<br>유화제(대두레시틴), 팜유<br>알레르기 유발물질: 밀, 대두 함유<br>영양정보 총 내용량 100g</div></body>`);
  const labelPath = resolve(out, "label.png");
  await page.locator("#label").screenshot({ path: labelPath });
  await page.goto(`${base}/?fresh=${Date.now()}#/ingredient-scan`); // setContent replaced the document: load the app again
  await page.waitForSelector('[data-testid="ip-start"]');
  await shot("09-ingredient-photo-start");
  await page.setInputFiles('[data-testid="ip-file"]', labelPath);
  await page.waitForSelector('[data-testid="ip-review"]', { timeout: 120000 });
  const ocrText = await page.inputValue('[data-testid="ip-text"]');
  writeFileSync(resolve(out, "ocr-text.txt"), ocrText);
  check("on-device OCR read Korean ingredient text", /젤\s*라\s*틴/.test(ocrText) && /설\s*탕/.test(ocrText), JSON.stringify(ocrText.slice(0, 80)));
  await shot("10-ingredient-photo-review");
  await page.fill('[data-testid="ip-text"]', "밀가루(밀:미국산), 설탕, 정제소금, 팜유");
  await page.click('[data-testid="ip-analyze"]');
  await page.waitForSelector('[data-testid="ip-result"]');
  const unconfirmed = await page.getAttribute('[data-testid="status-banner"]', "data-status");
  check("unconfirmed OCR text can never be cleared (capped at CHECK_REQUIRED)", unconfirmed === "CHECK_REQUIRED" && (await page.getAttribute('[data-testid="ip-result"]', "data-trust")) === "unconfirmed", unconfirmed);
  await shot("11-ingredient-unconfirmed");
  await page.check('[data-testid="ip-confirm"]');
  await page.click('[data-testid="ip-analyze"]');
  await page.waitForFunction(() => document.querySelector('[data-testid="ip-result"]')?.getAttribute("data-trust") === "confirmed");
  check("after the user confirms the text, the same list may show NO_FLAGGED_INGREDIENTS", (await page.getAttribute('[data-testid="status-banner"]', "data-status")) === "NO_FLAGGED_INGREDIENTS");
  await shot("12-ingredient-confirmed");

  // 6. History + places still work -----------------------------------------------------------------------------
  await page.goto(`${base}/#/scan-history`);
  await page.waitForSelector("text=Scan history");
  check("scan history lists scanned products", (await page.locator("button:has-text('테스트')").count()) >= 2);
  await shot("13-history");
  for (const [hash, expect, name] of [["#/mosque-list", "DEMO", "14-mosque-list"], ["#/restaurant-list", "DEMO", "15-restaurant-list"], ["#/home", "DEMO", "16-home"]]) {
    await page.goto(`${base}/${hash}`);
    await page.waitForTimeout(1200);
    check(`${hash} renders places (demo rows are labelled ${expect})`, (await page.locator(`text=${expect}`).count()) > 0);
    await shot(name);
  }
  check("no uncaught page errors", pageErrors.length === 0, pageErrors.join(" | "));
} catch (error) {
  check("script completed without exceptions", false, error.message);
  await shot("zz-failure").catch(() => undefined);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots: ${out}`);
process.exit(failed.length ? 1 : 0);
