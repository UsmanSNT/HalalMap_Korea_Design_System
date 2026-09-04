import React, { useState, useRef, useEffect } from "react";
import { languageOptions, type Language } from "../i18n";

export type Lang = Language;

export const LANGUAGES: { id: Lang; flag: string; name: string; native: string }[] =
  languageOptions.map(({ code, flag, englishName, name }) => ({ id: code, flag, name: englishName, native: name }));

export const SECTION_LABELS: Record<string, Record<Lang, string>> = {
  "온보딩 & 인증": { ko: "온보딩 & 인증", en: "Onboarding", uz: "Kirish" },
  "홈 & 탐색": { ko: "홈 & 탐색", en: "Home & Discover", uz: "Bosh sahifa" },
  "검색 & 지도": { ko: "검색 & 지도", en: "Search & Map", uz: "Qidiruv & Xarita" },
  "모스크 & 기도": { ko: "모스크 & 기도", en: "Mosque & Prayer", uz: "Masjid & Namoz" },
  "할랄 스캐너": { ko: "할랄 스캐너", en: "Halal Scanner", uz: "Halol Skaner" },
  "주문 & 추적": { ko: "주문 & 추적", en: "Orders & Tracking", uz: "Buyurtmalar" },
  "프로필 & 설정": { ko: "프로필 & 설정", en: "Profile & Settings", uz: "Profil" },
  "커뮤니티 & 소셜": { ko: "커뮤니티 & 소셜", en: "Community", uz: "Hamjamiyat" },
  "스마트 기능": { ko: "스마트 기능", en: "Smart Features", uz: "Aqlli funksiyalar" },
  "여행 모드": { ko: "여행 모드", en: "Travel Mode", uz: "Sayohat rejimi" },
  "알림 & 이벤트": { ko: "알림 & 이벤트", en: "Notifications", uz: "Bildirishnomalar" },
  "포인트 & 리워드": { ko: "포인트 & 리워드", en: "Rewards", uz: "Mukofotlar" },
  "접근성 & 언어": { ko: "접근성 & 언어", en: "Accessibility", uz: "Imkoniyatlar" },
};

export const UI_STRINGS: Record<string, Record<Lang, string>> = {
  ownerDash: { ko: "사장님 대시보드", en: "Owner Dashboard", uz: "Restoran paneli" },
  deliveryApp: { ko: "배달 파트너 앱", en: "Delivery Partner", uz: "Kuryerlik ilovasi" },
  adminConsole: { ko: "어드민 콘솔", en: "Admin Console", uz: "Admin paneli" },
  screenCount: { ko: "화면", en: "screens", uz: "ekran" },
};

// ── Compact inline dropdown (for sidebar footer) ───────────────────────────────
export const LanguageSwitcherCompact = ({
  lang, onChange,
}: { lang: Lang; onChange: (l: Lang) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.id === lang)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
        style={{
          backgroundColor: open ? "rgba(27,107,74,0.25)" : "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
        <span className="text-base leading-none">{current.flag}</span>
        <span className="flex-1 text-left">{current.native}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M2 4l3 3 3-3"/>
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl overflow-hidden"
          style={{ backgroundColor: "#252522", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 50 }}>
          {LANGUAGES.map(l => (
            <button key={l.id} onClick={() => { onChange(l.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-colors"
              style={{
                color: l.id === lang ? "white" : "rgba(255,255,255,0.6)",
                backgroundColor: l.id === lang ? "rgba(27,107,74,0.3)" : "transparent",
              }}
              onMouseEnter={e => { if (l.id !== lang) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = l.id === lang ? "rgba(27,107,74,0.3)" : "transparent"; }}>
              <span className="text-base">{l.flag}</span>
              <span className="font-semibold">{l.native}</span>
              <span className="ml-auto text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{l.name}</span>
              {l.id === lang && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 6l3 3 5-5"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Rail icon (for collapsed sidebar) ─────────────────────────────────────────
export const LanguageSwitcherIcon = ({
  lang, onChange,
}: { lang: Lang; onChange: (l: Lang) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.id === lang)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex justify-center">
      <button onClick={() => setOpen(!open)} title={current.native}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all"
        style={{ backgroundColor: open ? "rgba(27,107,74,0.3)" : "rgba(255,255,255,0.06)" }}>
        {current.flag}
      </button>
      {open && (
        <div className="absolute bottom-full left-12 mb-1 rounded-xl overflow-hidden"
          style={{ backgroundColor: "#252522", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 50, width: 180 }}>
          {LANGUAGES.map(l => (
            <button key={l.id} onClick={() => { onChange(l.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left"
              style={{ color: l.id === lang ? "white" : "rgba(255,255,255,0.6)", backgroundColor: l.id === lang ? "rgba(27,107,74,0.3)" : "transparent" }}>
              <span className="text-base">{l.flag}</span>
              <span>{l.native}</span>
              {l.id === lang && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Full radio list (for Settings screen) ─────────────────────────────────────
export const LanguageSwitcherFull = ({
  lang, onChange,
}: { lang: Lang; onChange: (l: Lang) => void }) => (
  <div className="space-y-2">
    {LANGUAGES.map(l => (
      <button key={l.id} onClick={() => onChange(l.id)}
        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all"
        style={{
          backgroundColor: lang === l.id ? "var(--green-light)" : "transparent",
          border: `1.5px solid ${lang === l.id ? "var(--green)" : "var(--border)"}`,
        }}>
        <span className="text-2xl">{l.flag}</span>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm" style={{ color: lang === l.id ? "var(--green-dark)" : "var(--charcoal)" }}>
            {l.native}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{l.name}</p>
        </div>
        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          style={{ borderColor: lang === l.id ? "var(--green)" : "var(--border)", backgroundColor: lang === l.id ? "var(--green)" : "transparent" }}>
          {lang === l.id && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M2 5l2.5 2.5 4-4"/>
            </svg>
          )}
        </div>
      </button>
    ))}
  </div>
);
