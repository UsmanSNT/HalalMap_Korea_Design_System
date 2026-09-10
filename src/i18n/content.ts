import { contentDict } from "./dictionaries/content";
import { translate, type Lang } from "./index";

const entries = Object.entries(contentDict.ko).sort((a,b) => b[1].length-a[1].length);
// Localize display values only. IDs, filter values and fixture records stay stable.
export function tx<T>(value: T): T {
  if (Array.isArray(value)) return value.map(tx) as T;
  if (typeof value !== "string") return value;
  const lang = (localStorage.getItem("halalmap-language") ?? "ko") as Lang;
  if (lang === "ko" || !/[가-힣]/.test(value)) return value;
  const normalized = value.trim().replace(/\s+/g, " ");
  const exact = entries.find(([,source]) => source === normalized);
  if (exact) return translate(lang, `content.${exact[0]}`) as T;
  let text: string = value;
  for (const [key, source] of entries) {
    if (source.length > 1) text = text.split(source).join(translate(lang, `content.${key}`));
  }
  text = text.replace(/(\d+)분/g, `$1 ${lang === "uz" ? "daqiqa" : "min"}`).replace(/(\d+)[개회명]/g, "$1");
  return text as T;
}
