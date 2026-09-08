import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = process.env.PLAYWRIGHT_MODULE ? require(process.env.PLAYWRIGHT_MODULE) : require('playwright');
const registry = readFileSync('src/services/routeRegistry.ts', 'utf8');
const routes = Object.fromEntries([...registry.matchAll(/^  (customer|owner|courier|admin): \[([^\]]+)\]/gm)].map(([,workspace,body]) => [workspace, [...body.matchAll(/"([^"]+)"/g)].map(match=>match[1])]));
const base = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:8443';
mkdirSync('plans/qa', { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [], results = [];
page.on('pageerror', error => errors.push({ route: page.url(), message: error.message }));
// Test the real existing local login endpoint with the repository's documented test account.
await page.goto(base);
await page.getByRole('button', { name: 'Customer + admin paneli', exact: false }).click();
await page.locator('button[type="submit"]').click();
await page.locator('.customer-content').waitFor({ timeout: 15000 });
const widths = process.argv.includes('--quick') ? [1440,390] : [1440,1280,1024,768,430,390,360];
for (const width of widths) {
  await page.setViewportSize({ width, height: 900 });
  for (const [workspace, screens] of Object.entries(routes)) for (const screen of screens) {
    await page.goto(`${base}/#/${workspace}/${screen}`);
    await page.waitForTimeout(90);
    await page.locator('.customer-content, .workspace-shell, [role="alert"]').first().waitFor({ timeout: 15000 });
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      bodyWidth: document.documentElement.scrollWidth,
      contentWidth: document.querySelector('.customer-content, .workspace-shell')?.getBoundingClientRect().width,
      blank: document.body.innerText.trim().length < 20,
      error: document.body.innerText.includes('Sahifani ochishda xato yuz berdi'),
    }));
    results.push({ width, workspace, screen, ...state });
  }
  console.log(`Checked ${Object.values(routes).flat().length} routes at ${width}px`);
}
for (const [width,workspace,screen] of [[1440,'customer','home'],[768,'customer','restaurant-list'],[390,'customer','home'],[390,'courier','go-online'],[390,'owner','main-dashboard'],[390,'admin','home']]) {
  await page.setViewportSize({ width, height: 900 }); await page.goto(`${base}/#/${workspace}/${screen}`); await page.waitForTimeout(250);
  await page.screenshot({ path: `plans/qa/${workspace}-${screen}-${width}.png`, fullPage: true });
}
writeFileSync('plans/qa/route-checks.json',JSON.stringify({ errors, results },null,2)+'\n');
console.log(JSON.stringify({ errors, failures: results.filter(item=>item.overflow||item.blank||item.error), total:results.length },null,2));
await browser.close();
if (errors.length || results.some(item=>item.overflow||item.blank||item.error)) process.exitCode=1;
