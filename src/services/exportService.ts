export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  const headers = [...new Set(rows.flatMap(row => Object.keys(row)))];
  const cell = (value: unknown) => {
    let text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.split('"').join('""')}"`;
  };
  const csv = [headers.map(cell).join(","), ...rows.map(row => headers.map(key => cell(row[key])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
