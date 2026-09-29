// Barcode / GTIN normalisation. Products are keyed by a canonical digit string:
//   - EAN-13 (also UPC-A, which is an EAN-13 with a leading 0, and UPC-E expanded to UPC-A)
//   - EAN-8 stays 8 digits
// Korean retail products carry GS1 Korea prefix 880.

const onlyDigits = (value) => /^\d+$/.test(value);

/** GTIN mod-10 check digit for the digits *before* the check digit. */
export const gtinCheckDigit = (body) => {
  let sum = 0;
  for (let i = 0; i < body.length; i += 1) {
    const digit = Number(body[body.length - 1 - i]);
    sum += digit * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
};

export const isValidGtin = (code) =>
  onlyDigits(code) && [8, 12, 13, 14].includes(code.length) && gtinCheckDigit(code.slice(0, -1)) === Number(code.slice(-1));

/** Expands an 8-digit UPC-E code (number system 0/1) to its 12-digit UPC-A equivalent. */
export const expandUpcE = (code) => {
  if (!/^[01]\d{7}$/.test(code)) return null;
  const ns = code[0];
  const d = code.slice(1, 7);
  const check = code[7];
  const last = d[5];
  let body;
  if ("012".includes(last)) body = `${d[0]}${d[1]}${last}0000${d[2]}${d[3]}${d[4]}`;
  else if (last === "3") body = `${d[0]}${d[1]}${d[2]}00000${d[3]}${d[4]}`;
  else if (last === "4") body = `${d[0]}${d[1]}${d[2]}${d[3]}00000${d[4]}`;
  else body = `${d[0]}${d[1]}${d[2]}${d[3]}${d[4]}0000${last}`;
  return `${ns}${body}${check}`;
};

/** Pulls a GTIN out of a QR payload when it is a GS1 Digital Link (…/01/<gtin>…) or a GS1 element string ((01)<gtin>). */
export const gtinFromQr = (text) => {
  const link = /\/01\/(\d{8,14})(?:[/?#]|$)/.exec(text);
  if (link) return link[1];
  const element = /\(01\)\s*(\d{14})/.exec(text);
  if (element) return element[1];
  return null;
};

/**
 * @returns {{ok: true, code: string, format: string}|{ok: false, error: string, message: string}}
 */
export const normalizeBarcode = (input) => {
  if (typeof input !== "string") return { ok: false, error: "invalid", message: "Barcode must be a string" };
  let text = input.trim();
  if (!text) return { ok: false, error: "empty", message: "Barcode is empty" };

  if (!/^[\d\s-]+$/.test(text)) {
    const fromQr = gtinFromQr(text);
    if (!fromQr) return { ok: false, error: "not_a_product_code", message: "This code is not a product barcode" };
    text = fromQr;
  }
  text = text.replace(/[\s-]/g, "");
  if (!onlyDigits(text)) return { ok: false, error: "invalid", message: "Barcode must contain digits only" };

  if (text.length === 14) {
    // GTIN-14 (case/carton). Retail lookup uses the embedded 13-digit item code.
    const item = text.slice(1, 13);
    const code = `${item}${gtinCheckDigit(item)}`;
    if (!isValidGtin(text)) return { ok: false, error: "bad_checksum", message: "Barcode check digit is invalid" };
    return { ok: true, code, format: "GTIN_14" };
  }
  if (text.length === 13) {
    if (!isValidGtin(text)) return { ok: false, error: "bad_checksum", message: "Barcode check digit is invalid" };
    return { ok: true, code: text, format: text.startsWith("0") ? "UPC_A" : "EAN_13" };
  }
  if (text.length === 12) {
    if (!isValidGtin(text)) return { ok: false, error: "bad_checksum", message: "Barcode check digit is invalid" };
    return { ok: true, code: `0${text}`, format: "UPC_A" };
  }
  if (text.length === 8) {
    if (isValidGtin(text)) return { ok: true, code: text, format: "EAN_8" };
    const expanded = expandUpcE(text);
    if (expanded && isValidGtin(expanded)) return { ok: true, code: `0${expanded}`, format: "UPC_E" };
    return { ok: false, error: "bad_checksum", message: "Barcode check digit is invalid" };
  }
  return { ok: false, error: "bad_length", message: "Barcode must have 8, 12, 13 or 14 digits" };
};

/** Korean retail products use the GS1 Korea prefix 880 (EAN-13). */
export const isKoreanPrefix = (code) => code.length === 13 && code.startsWith("880");
