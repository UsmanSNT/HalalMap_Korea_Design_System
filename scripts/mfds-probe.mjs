// Prints the real shape of the Food Safety Korea (MFDS) responses so the adapter's field names can be verified.
//   FOODSAFETYKOREA_API_KEY=... node scripts/mfds-probe.mjs [barcode]
// The API key is never printed.

const key = process.env.FOODSAFETYKOREA_API_KEY;
if (!key) {
  console.error("Set FOODSAFETYKOREA_API_KEY (free key: https://www.foodsafetykorea.go.kr/api/)");
  process.exit(2);
}
const barcode = process.argv[2] || "8801007000000";
const bases = process.env.FOODSAFETYKOREA_BASE_URL
  ? [process.env.FOODSAFETYKOREA_BASE_URL]
  : ["https://openapi.foodsafetykorea.go.kr/api", "http://openapi.foodsafetykorea.go.kr/api"];

for (const base of bases) {
  for (const [service, query] of [["C005", `BAR_CD=${barcode}`], ["C002", "PRDLST_REPORT_NO=1"]]) {
    const url = `${base.replace(/\/$/, "")}/${encodeURIComponent(key)}/${service}/json/1/2/${query}`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const text = await response.text();
      console.log(`\n# ${base.replace(/^https?:\/\//, "")} ${service} -> HTTP ${response.status}`);
      console.log(text.replaceAll(key, "<KEY>").slice(0, 1500));
    } catch (error) {
      console.log(`\n# ${base} ${service} -> ${error.message}`);
    }
  }
}
