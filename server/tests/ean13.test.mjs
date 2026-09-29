import { test } from "node:test";
import assert from "node:assert/strict";
import zxing from "@zxing/library";
import { ean13Modules, barcodeFrame } from "../../scripts/e2e/ean13.mjs";
import { isValidGtin } from "../products/barcode.mjs";

const { BarcodeFormat, BinaryBitmap, DecodeHintType, HybridBinarizer, MultiFormatReader, RGBLuminanceSource } = zxing;

test("QA barcode renderer produces a 95-module EAN-13 with guards", () => {
  const modules = ean13Modules("8801043015202");
  assert.equal(modules.length, 95);
  assert.equal(modules.slice(0, 3), "101");
  assert.equal(modules.slice(45, 50), "01010");
  assert.equal(modules.slice(-3), "101");
  assert.ok(isValidGtin("8801043015202"));
});

test("known EAN-13 pattern: first digit 4 selects parity LGLLGG", () => {
  // digits 0,0,6,3,8,1 -> L0 G0 L6 L3 G8 G1
  assert.equal(ean13Modules("4006381333931").slice(3, 45), "0001101" + "0100111" + "0101111" + "0111101" + "0001001" + "0110011");
});

test("the rendered barcode decodes with the same ZXing library the browser fallback uses", () => {
  for (const code of ["8801043015202", "4006381333931", "8809999900016"]) {
    const { pixels, width, height } = barcodeFrame(code);
    const reader = new MultiFormatReader();
    reader.setHints(new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]]]));
    const result = reader.decode(new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(new Uint8ClampedArray(pixels), width, height))));
    assert.equal(result.getText(), code);
  }
});
