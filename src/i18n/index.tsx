import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "ko" | "en" | "uz";

export const DEFAULT_LANGUAGE: Language = "ko";
export const LANGUAGE_STORAGE_KEY = "halalmap-language";

export const languageOptions: { code: Language; flag: string; name: string; englishName: string }[] = [
  { code: "ko", flag: "🇰🇷", name: "한국어", englishName: "Korean" },
  { code: "en", flag: "🇺🇸", name: "English", englishName: "English" },
  { code: "uz", flag: "🇺🇿", name: "O'zbekcha", englishName: "Uzbek" },
];

const en = {
  "common.continue": "Continue", "common.logout": "Log out", "common.selectScreen": "Select screen", "common.sessionLoading": "Checking session…",
  "language.title": "Select language", "language.subtitle": "Choose the language you want to use",
  "nav.home": "Home", "nav.search": "Search", "nav.orders": "Orders", "nav.prayer": "Prayer", "nav.profile": "Profile",
  "section.onboarding": "Onboarding", "section.home": "Home", "section.searchMap": "Search & Map", "section.mosquePrayer": "Mosque & Prayer",
  "section.scanner": "Scanner", "section.orders": "Orders", "section.profile": "Profile", "section.community": "Community",
  "section.smart": "Smart features", "section.travel": "Travel", "section.events": "Events", "section.rewards": "Rewards", "section.accessibility": "Accessibility",
} as const;

export type TranslationKey = keyof typeof en;

const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  ko: {
    "common.continue": "계속하기", "common.logout": "로그아웃", "common.selectScreen": "화면 선택", "common.sessionLoading": "세션 확인 중…",
    "language.title": "언어 선택", "language.subtitle": "사용할 언어를 선택하세요",
    "nav.home": "홈", "nav.search": "검색", "nav.orders": "주문", "nav.prayer": "기도", "nav.profile": "프로필",
    "section.onboarding": "온보딩", "section.home": "홈", "section.searchMap": "검색 및 지도", "section.mosquePrayer": "모스크 및 기도",
    "section.scanner": "할랄 스캐너", "section.orders": "주문", "section.profile": "프로필", "section.community": "커뮤니티",
    "section.smart": "스마트 기능", "section.travel": "여행", "section.events": "이벤트", "section.rewards": "리워드", "section.accessibility": "접근성",
  },
  uz: {
    "common.continue": "Davom etish", "common.logout": "Chiqish", "common.selectScreen": "Ekranni tanlash", "common.sessionLoading": "Sessiya tekshirilmoqda…",
    "language.title": "Tilni tanlang", "language.subtitle": "Foydalanmoqchi bo'lgan tilingizni tanlang",
    "nav.home": "Bosh sahifa", "nav.search": "Qidiruv", "nav.orders": "Buyurtmalar", "nav.prayer": "Namoz", "nav.profile": "Profil",
    "section.onboarding": "Kirish", "section.home": "Bosh sahifa", "section.searchMap": "Qidiruv va xarita", "section.mosquePrayer": "Masjid va namoz",
    "section.scanner": "Halol skaner", "section.orders": "Buyurtmalar", "section.profile": "Profil", "section.community": "Hamjamiyat",
    "section.smart": "Aqlli funksiyalar", "section.travel": "Sayohat", "section.events": "Tadbirlar", "section.rewards": "Mukofotlar", "section.accessibility": "Maxsus imkoniyatlar",
  },
};

const isLanguage = (value: string | null): value is Language => value === "ko" || value === "en" || value === "uz";

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isLanguage(saved)) return saved;
  const browserLanguage = window.navigator.language.toLowerCase().split("-")[0];
  return isLanguage(browserLanguage) ? browserLanguage : DEFAULT_LANGUAGE;
};

type I18nContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);
  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage, t: (key) => translations[language][key] ?? translations.en[key] }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}

export function LocalizedText({ ko, en, uz }: Record<Language, string>) {
  const { language } = useI18n();
  return <>{({ ko, en, uz })[language]}</>;
}
