// Client-side barcode helpers. Mirrors server/products/barcode.mjs so obviously invalid reads (a common ZXing
// failure mode) are rejected before a network request is made. The server validates again.

export const gtinCheckDigit = (body: string): number => {
  let sum = 0;
  for (let i = 0; i < body.length; i += 1) sum += Number(body[body.length - 1 - i]) * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10;
};

export const isValidGtin = (code: string): boolean =>
  /^\d+$/.test(code) && [8, 12, 13, 14].includes(code.length) && gtinCheckDigit(code.slice(0, -1)) === Number(code.slice(-1));

/** Expands an 8-digit UPC-E code (number system 0/1) to its 12-digit UPC-A equivalent. */
const expandUpcE = (code: string): string | null => {
  if (!/^[01]\d{7}$/.test(code)) return null;
  const d = code.slice(1, 7);
  const last = d[5];
  let body: string;
  if ("012".includes(last)) body = `${d[0]}${d[1]}${last}0000${d[2]}${d[3]}${d[4]}`;
  else if (last === "3") body = `${d[0]}${d[1]}${d[2]}00000${d[3]}${d[4]}`;
  else if (last === "4") body = `${d[0]}${d[1]}${d[2]}${d[3]}00000${d[4]}`;
  else body = `${d[0]}${d[1]}${d[2]}${d[3]}${d[4]}0000${last}`;
  return `${code[0]}${body}${code[7]}`;
};

/** Pulls a GTIN out of a GS1 Digital Link / element-string QR payload. */
const gtinFromQr = (text: string): string | null =>
  /\/01\/(\d{8,14})(?:[/?#]|$)/.exec(text)?.[1] ?? /\(01\)\s*(\d{14})/.exec(text)?.[1] ?? null;

/** Returns the digits of a scanned/typed code if it is a plausible product barcode, otherwise null. */
export const acceptableBarcode = (raw: string): string | null => {
  let text = raw.trim();
  if (!/^[\d\s-]+$/.test(text)) {
    const fromQr = gtinFromQr(text);
    if (!fromQr) return null;
    text = fromQr;
  }
  const digits = text.replace(/[\s-]/g, "");
  if (isValidGtin(digits)) return digits;
  const upcA = digits.length === 8 ? expandUpcE(digits) : null;
  return upcA && isValidGtin(upcA) ? digits : null;
};
