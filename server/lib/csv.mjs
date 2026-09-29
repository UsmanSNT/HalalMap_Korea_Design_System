// Small RFC 4180 CSV reader (quotes, escaped quotes, CRLF, BOM) + byte decoding that copes with CP949/EUC-KR files
// (data.go.kr CSV downloads are frequently EUC-KR).

export const decodeText = (buffer) => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer).replace(/^﻿/, "");
  } catch {
    return new TextDecoder("euc-kr").decode(buffer);
  }
};

/** @returns {string[][]} */
export const parseCsvRows = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += char;
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
};

/** @returns {{headers: string[], records: Record<string,string>[]}} */
export const parseCsv = (text) => {
  const [headerRow = [], ...rows] = parseCsvRows(text);
  const headers = headerRow.map((h) => h.trim());
  const records = rows.map((cells) => Object.fromEntries(headers.map((header, i) => [header, (cells[i] ?? "").trim()])));
  return { headers, records };
};
