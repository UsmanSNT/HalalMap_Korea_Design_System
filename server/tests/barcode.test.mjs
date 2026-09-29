import { test } from "node:test";
import assert from "node:assert/strict";
import { expandUpcE, gtinCheckDigit, isValidGtin, normalizeBarcode, gtinFromQr } from "../products/barcode.mjs";

test("EAN-13 (Korean 880 prefix) is accepted as-is", () => {
  assert.deepEqual(normalizeBarcode("8801043015202"), { ok: true, code: "8801043015202", format: "EAN_13" });
});

test("EAN-8 is accepted as-is", () => {
  assert.deepEqual(normalizeBarcode("96385074"), { ok: true, code: "96385074", format: "EAN_8" });
});

test("UPC-A is padded to EAN-13", () => {
  assert.deepEqual(normalizeBarcode("036000291452"), { ok: true, code: "0036000291452", format: "UPC_A" });
});

test("UPC-E is expanded to UPC-A then EAN-13", () => {
  assert.equal(expandUpcE("01234565"), "012345000065");
  assert.deepEqual(normalizeBarcode("01234565"), { ok: true, code: "01234565", format: "EAN_8" }); // valid EAN-8 checksum wins
  const upcE = "04252614"; // not a valid EAN-8, valid UPC-E of 042100005264
  assert.equal(isValidGtin("042100005264"), true);
  assert.equal(normalizeBarcode(upcE).code, "0042100005264");
  assert.equal(normalizeBarcode(upcE).format, "UPC_E");
});

test("bad check digits, lengths and text are rejected with a reason", () => {
  assert.equal(normalizeBarcode("8801043015203").error, "bad_checksum");
  assert.equal(normalizeBarcode("1234").error, "bad_length");
  assert.equal(normalizeBarcode("   ").error, "empty");
  assert.equal(normalizeBarcode("hello world").error, "not_a_product_code");
  assert.equal(normalizeBarcode(42).error, "invalid");
});

test("spaces and dashes are tolerated", () => {
  assert.equal(normalizeBarcode("880-1043 015202").code, "8801043015202");
});

test("GS1 Digital Link QR codes yield a GTIN; other QR codes do not", () => {
  assert.equal(gtinFromQr("https://id.gs1.org/01/08801043015202/10/ABC"), "08801043015202");
  assert.equal(normalizeBarcode("https://id.gs1.org/01/08801043015202").code, "8801043015202");
  assert.equal(normalizeBarcode("https://example.com/promo?id=1").error, "not_a_product_code");
});

test("check digit maths", () => {
  assert.equal(gtinCheckDigit("880104301520"), 2);
});
