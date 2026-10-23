import type { Lang } from "@/locale/dictionaries";

// Chromium/WebView ship no Uzbek date data (month/weekday names come out as "M10"/"Fri"), so Uzbek is tabled here.
const UZ_WEEKDAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const UZ_HIJRI_MONTHS = ["Muharram", "Safar", "Rabiul avval", "Rabiul oxir", "Jumodul avval", "Jumodul oxir", "Rajab", "Sha'bon", "Ramazon", "Shavvol", "Zulqa'da", "Zulhijja"];

const LOCALES: Record<Lang, string> = { ko: "ko-KR", en: "en-US", uz: "en-US" };

export function formatGregorian(date: Date, lang: Lang): string {
  if (lang === "uz") return `${UZ_WEEKDAYS[date.getDay()]}, ${date.getDate()}-${UZ_MONTHS[date.getMonth()]}`;
  return new Intl.DateTimeFormat(LOCALES[lang], { weekday: "long", day: "numeric", month: "long" }).format(date);
}

/** Umm al-Qura Hijri date, or null where the engine lacks that calendar. */
export function formatHijri(date: Date, lang: Lang): string | null {
  try {
    if (lang === "uz") {
      const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(date);
      const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
      const month = UZ_HIJRI_MONTHS[get("month") - 1];
      return month ? `${get("day")}-${month}, ${get("year")}` : null;
    }
    return new Intl.DateTimeFormat(`${LOCALES[lang]}-u-ca-islamic-umalqura`, { day: "numeric", month: "long", year: "numeric" }).format(date);
  } catch {
    return null;
  }
}
