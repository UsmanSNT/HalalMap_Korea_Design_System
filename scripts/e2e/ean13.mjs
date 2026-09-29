// EAN-13 barcode rendering for QA: draws a barcode bitmap and writes it as a Y4M video so headless Chromium can
// use it as a fake camera (--use-file-for-fake-video-capture). No third-party dependency.

import { writeFileSync } from "node:fs";

const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const R = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

export const ean13Modules = (code) => {
  if (!/^\d{13}$/.test(code)) throw new Error("EAN-13 needs 13 digits");
  const parity = PARITY[Number(code[0])];
  let bits = "101";
  for (let i = 0; i < 6; i += 1) bits += (parity[i] === "L" ? L : G)[Number(code[i + 1])];
  bits += "01010";
  for (let i = 0; i < 6; i += 1) bits += R[Number(code[i + 7])];
  return `${bits}101`;
};

/** Grayscale bitmap (0 = black, 255 = white) of the barcode centred on a white frame. */
export const barcodeFrame = (code, { width = 640, height = 480, moduleWidth = 4, barHeight = 220 } = {}) => {
  const modules = ean13Modules(code);
  const pixels = new Uint8Array(width * height).fill(255);
  const left = Math.floor((width - modules.length * moduleWidth) / 2);
  const top = Math.floor((height - barHeight) / 2);
  for (let m = 0; m < modules.length; m += 1) {
    if (modules[m] !== "1") continue;
    for (let y = top; y < top + barHeight; y += 1) {
      for (let x = left + m * moduleWidth; x < left + (m + 1) * moduleWidth; x += 1) pixels[y * width + x] = 0;
    }
  }
  return { pixels, width, height };
};

export const writeBarcodeY4m = (path, code, { frames = 30, fps = 10, ...options } = {}) => {
  const { pixels, width, height } = barcodeFrame(code, options);
  const y = Buffer.from(pixels.map((p) => (p === 0 ? 16 : 235)));
  const chroma = Buffer.alloc((width / 2) * (height / 2), 128);
  const header = Buffer.from(`YUV4MPEG2 W${width} H${height} F${fps}:1 Ip A1:1 C420jpeg\n`);
  const frame = Buffer.concat([Buffer.from("FRAME\n"), y, chroma, chroma]);
  writeFileSync(path, Buffer.concat([header, ...Array.from({ length: frames }, () => frame)]));
};
