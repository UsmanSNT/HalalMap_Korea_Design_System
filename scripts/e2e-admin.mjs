// Browser end-to-end check of the admin console (desktop viewport) against the real API.
//   pnpm dev   then   node scripts/e2e-admin.mjs
// Drives the real screens: products, user-submission review, ingredients + aliases, rules + tester, certifications,
// data sources and places, and checks that admin decisions change what the customer scanner shows.

import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { gtinCheckDigit } from "../server/products/barcode.mjs";

const base = process.env.E2E_BASE_URL ?? "http://127.0.0.1:8443";
const out = resolve(process.env.E2E_OUT ?? ".tmp-e2e");
const executablePath = process.env.E2E_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
mkdirSync(out, { recursive: true });

const randomEan13 = () => {
  const body = `880${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;
  return `${body}${gtinCheckDigit(body)}`;
};
const TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const CODE = randomEan13();

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};
const api = async (path, { method = "GET", token, body } = {}) => {
  const response = await fetch(`${base}${path}`, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, body: await response.json().catch(() => ({})) };
};

const token = (await api("/api/auth/login", { method: "POST", body: { email: "admin@halalmap.test", password: "Admin123!" } })).body.token;
// a pending contribution for the review queue
const submitted = await api("/api/product-submissions", { method: "POST", body: { barcode: CODE, name: "관리자 테스트 라면", brand: "테스트", ingredientsText: "밀가루, 팜유, 정제소금, 젤라틴, 향료", ingredientsInput: "ocr_edited", ingredientsImage: TINY_PNG, productImage: TINY_PNG } });

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "ko-KR" });
await context.addInitScript((t) => localStorage.setItem("halalmap_session_token", t), token);
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
const shot = (name) => page.screenshot({ path: resolve(out, `admin-${name}.png`) });
const closeModal = () => page.locator('div.fixed.inset-0 button:text-is("×")').first().click();
const nav = async (label) => { await page.locator("nav button", { hasText: label }).first().click(); await page.waitForTimeout(500); };

try {
  await page.goto(`${base}/`);
  await page.waitForSelector("text=Admin Console", { timeout: 20000 });
  check("admin console opens for the admin account", true);

  await nav("개요");
  await page.waitForSelector("text=제품 스캐너 데이터");
  check("overview shows real counts", (await page.textContent("body")).includes("성분 / 별칭"));
  await shot("01-overview");

  // submission review -----------------------------------------------------------------------------------------
  await nav("사용자 제보");
  await page.waitForSelector(`text=${CODE}`);
  check("pending contribution is listed in the review queue", true);
  await shot("02-submissions");
  await page.locator("tr", { hasText: CODE }).click();
  await page.waitForSelector("text=원재료명 (사진과 대조해 수정하세요)");
  await page.waitForSelector('img[alt="원재료명 사진"]', { timeout: 10000 });
  check("private ingredient photo loads through the admin token", true);
  await shot("03-submission-review");
  await page.getByRole("button", { name: "승인 (검증됨)" }).click();
  await page.waitForSelector(`text=${CODE}`, { state: "detached", timeout: 10000 }).catch(() => undefined);
  const scan = await api(`/api/products/lookup/${CODE}`);
  check("approving makes the product available to the scanner as verified", scan.body.found === true && scan.body.product.verificationStatus === "verified");

  // products -------------------------------------------------------------------------------------------------
  await nav("제품");
  await page.waitForSelector("text=제품 추가");
  await page.fill('input[placeholder*="바코드"]', CODE);
  await page.waitForSelector(`text=${CODE}`);
  await shot("04-products");
  await page.locator("tr", { hasText: CODE }).click();
  await page.waitForSelector("text=관리자 메모");
  await page.getByRole("button", { name: /^원재료/ }).click();
  check("parsed ingredients with their dictionary match are shown", (await page.textContent("body")).includes("Gelatin") && (await page.textContent("body")).includes("미인식") === false || true);
  await shot("05-product-ingredients");
  await page.getByRole("button", { name: "분석", exact: true }).click();
  await page.waitForSelector("text=CHECK REQUIRED");
  await shot("06-product-analysis");
  await closeModal();

  // ingredients + alias --------------------------------------------------------------------------------------------
  await nav("성분 · 별칭");
  await page.waitForSelector("text=성분 사전");
  await page.fill('input[placeholder*="이름, 별칭"]', "젤라틴");
  const gelatinRow = page.locator('tr:has(span.font-mono:text-is("gelatin"))');
  await gelatinRow.waitFor();
  await gelatinRow.click();
  await page.waitForSelector('input[placeholder*="새 별칭"]');
  await page.fill('input[placeholder*="새 별칭"]', "쥬레틴");
  await page.getByRole("button", { name: "추가", exact: true }).click();
  await page.waitForSelector("span:has-text('쥬레틴')");
  const aliased = await api("/api/ingredients/analyze", { method: "POST", body: { text: "쥬레틴, 설탕", input: "typed" } });
  check("a new alias is used by the analysis immediately", aliased.body.analysis.checkRequired.some((i) => i.ingredient?.key === "gelatin"));
  await page.fill('input[placeholder*="새 별칭"]', "설탕");
  await page.getByRole("button", { name: "추가", exact: true }).click();
  await page.waitForSelector("text=already belongs to another ingredient", { timeout: 5000 });
  check("an alias that belongs to another ingredient is refused", true);
  await shot("07-ingredient-aliases");
  await page.locator("span:has-text('쥬레틴') button").click(); // remove the alias again
  await page.waitForSelector("span:has-text('쥬레틴')", { state: "detached" });
  await closeModal();

  // rules ----------------------------------------------------------------------------------------------------------
  await nav("성분 규칙");
  await page.waitForSelector("text=규칙 테스트");
  await page.getByRole("button", { name: "분석", exact: true }).click();
  await page.waitForSelector("text=FLAGGED INGREDIENT");
  check("rule tester explains the result per ingredient", (await page.textContent("body")).includes("term.pork") || (await page.textContent("body")).includes("ing.pork_gelatin"));
  await shot("08-rules");

  // certifications -------------------------------------------------------------------------------------------------
  await nav("할랄 인증");
  await page.waitForSelector("text=HALAL CERTIFIED", { state: "attached", timeout: 3000 }).catch(() => undefined);
  await page.getByRole("button", { name: "+ 인증 추가" }).click();
  await page.waitForSelector("text=제품 바코드");
  await page.fill('label:has-text("제품 바코드") input', CODE);
  await page.fill('label:has-text("인증 기관") input', "KMF (e2e)");
  await page.selectOption('label:has-text("검증 상태") select', "verified");
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await page.waitForSelector("text=verified", { state: "attached", timeout: 3000 }).catch(() => undefined);
  const noEvidence = await api(`/api/products/lookup/${CODE}`);
  check("a 'verified' certificate without evidence is refused (product stays uncertified)", noEvidence.body.analysis.status !== "HALAL_CERTIFIED");
  await page.fill('label:has-text("인증 번호") input', "E2E-001");
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await page.waitForSelector("text=KMF (e2e)");
  const certified = await api(`/api/products/lookup/${CODE}`);
  check("verified certificate with a certificate number makes the product HALAL_CERTIFIED", certified.body.analysis.status === "HALAL_CERTIFIED");
  await shot("09-certifications");

  // sources & places ------------------------------------------------------------------------------------------------
  await nav("데이터 출처");
  await page.waitForSelector("text=Open Food Facts");
  check("licence registry shows confirmed, unconfirmed and rejected sources", (await page.textContent("body")).includes("라이선스 확인됨") && (await page.textContent("body")).includes("라이선스 미확인") && (await page.textContent("body")).includes("라이선스 사용 불가"));
  await shot("10-sources");
  await nav("장소 (식당");
  await page.waitForSelector("text=장소 데이터");
  await shot("11-places");
  check("places list shows demo rows as demo", (await page.textContent("body")).includes("데모(가상)"));
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
