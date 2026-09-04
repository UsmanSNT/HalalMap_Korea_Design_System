import React, { useState } from "react";
import { StatusBar, BackButton } from "../components/Shared";
import type { ScreenId } from "../App";
import { useLanguage } from "../i18n/LanguageContext";

// ── 15. Onboarding Tutorial ──────────────────────────────────────────────────
const tutorialSteps = [
  {
    icon: "🔍",
    title: "할랄 식당 검색",
    body: "검색창을 눌러 주변 할랄 인증 식당을 찾아보세요.\n음식 종류, 거리, 인증 유형으로 필터링할 수 있어요.",
    color: "var(--green)",
    illustration: (
      <div className="w-48 h-48 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "var(--green-light)" }} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-44 h-11 bg-white rounded-2xl flex items-center gap-2 px-3 shadow-md border border-[var(--border)]">
            <span className="text-base">🔍</span>
            <span className="text-xs text-[var(--muted)]">할랄 음식 검색...</span>
          </div>
          <div className="flex gap-2">
            {["한식", "터키", "우즈벡", "인도"].map((c) => (
              <div key={c} className="bg-white rounded-full px-2.5 py-1 text-[10px] font-medium text-[#1A1A18] shadow-sm">{c}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="bg-white rounded-xl p-2 shadow-sm flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: "var(--green-light)" }} />
              <div className="space-y-1">
                <div className="h-2 bg-gray-200 rounded w-12" />
                <div className="h-1.5 bg-gray-100 rounded w-8" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-2 shadow-sm flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: "var(--gold-light)" }} />
              <div className="space-y-1">
                <div className="h-2 bg-gray-200 rounded w-12" />
                <div className="h-1.5 bg-gray-100 rounded w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: "🕌",
    title: "기도 시간 & 모스크",
    body: "다음 기도까지 남은 시간을 실시간으로 확인하고,\n근처 모스크와 기도실을 찾아보세요.",
    color: "var(--gold)",
    illustration: (
      <div className="w-48 h-48 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "var(--gold-light)" }} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="rounded-xl p-3 flex items-center gap-2 shadow-md" style={{ background: "linear-gradient(135deg, var(--green-dark), var(--green))" }}>
            <span className="text-2xl">🌙</span>
            <div>
              <p className="text-white text-xs font-semibold">다음 기도: 아스르 Asr</p>
              <div className="h-1.5 bg-white/20 rounded-full mt-1 w-28"><div className="h-full w-1/3 rounded-full bg-[var(--gold)]" /></div>
            </div>
            <p className="text-[var(--gold)] text-sm font-bold">2:14</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white rounded-xl px-3 py-2 shadow-sm text-center">
              <span className="text-lg">🕌</span>
              <p className="text-[10px] font-bold text-[#1A1A18] mt-0.5">서울 중앙</p>
              <p className="text-[9px] text-[var(--muted)]">0.8km</p>
            </div>
            <div className="bg-white rounded-xl px-3 py-2 shadow-sm text-center">
              <span className="text-lg">🧭</span>
              <p className="text-[10px] font-bold text-[#1A1A18] mt-0.5">키블라</p>
              <p className="text-[9px] text-[var(--muted)]">253.4°</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: "📱",
    title: "할랄 스캐너",
    body: "제품 바코드를 스캔해 할랄 여부를 즉시 확인하세요.\n포장 식품 쇼핑 시 꼭 활용해 보세요!",
    color: "var(--green)",
    illustration: (
      <div className="w-48 h-48 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "var(--green-light)" }} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-28 h-28 relative border-2 border-[#1B6B4A] rounded-xl flex items-center justify-center bg-white/50">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-[#1B6B4A] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-[#1B6B4A] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-[#1B6B4A] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-[#1B6B4A] rounded-br-lg" />
            <div className="flex gap-0.5 items-center">
              {[3,5,2,4,3,6,2,4,3].map((h, i) => (
                <div key={i} className="bg-[#1A1A18] w-0.5 rounded-full" style={{ height: `${h * 5}px` }} />
              ))}
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/70 -translate-y-1/2" />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-md">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: "var(--green)" }}>✓</div>
            <p className="text-xs font-bold text-[#1A1A18]">할랄 인증 확인됨</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: "🗺️",
    title: "하단 탭 바 사용법",
    body: "홈, 검색, 주문, 기도, 프로필 — 5개 탭으로\n앱의 모든 기능에 빠르게 접근할 수 있어요.",
    color: "var(--green)",
    illustration: (
      <div className="w-56 h-48 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl" style={{ backgroundColor: "var(--green-light)" }} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="bg-white rounded-2xl shadow-md px-4 py-3 flex gap-4">
            {[
              { icon: "🏠", label: "홈", active: true },
              { icon: "🔍", label: "검색", active: false },
              { icon: "🛵", label: "주문", active: false },
              { icon: "🌙", label: "기도", active: false },
              { icon: "👤", label: "프로필", active: false },
            ].map((tab) => (
              <div key={tab.label} className="flex flex-col items-center gap-0.5">
                <span className="text-lg" style={{ opacity: tab.active ? 1 : 0.4 }}>{tab.icon}</span>
                <span className="text-[9px] font-medium" style={{ color: tab.active ? "var(--green)" : "var(--muted)" }}>{tab.label}</span>
                {tab.active && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--green)" }} />}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {["식당 목록", "기도 시간", "주문 내역", "내 프로필"].map((label) => (
              <div key={label} className="bg-white rounded-lg px-2 py-1 shadow-sm">
                <p className="text-[9px] font-medium text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

export const TutorialScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [step, setStep] = useState(0);
  const current = tutorialSteps[step];
  const isLast = step === tutorialSteps.length - 1;

  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />

      {/* Skip / step counter */}
      <div className="flex items-center justify-between px-5 pt-2 pb-1">
        <p className="text-xs font-medium text-[var(--muted)]">{step + 1} / {tutorialSteps.length}</p>
        <button onClick={() => onNavigate?.("home")} className="text-sm font-medium" style={{ color: "var(--muted)" }}>건너뛰기</button>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        {/* Illustration */}
        <div className="flex items-center justify-center">
          {current.illustration}
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: current.color }}>
            <span>{current.icon}</span>
            <span>{current.title}</span>
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line mt-3">{current.body}</p>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {tutorialSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? "24px" : "8px",
                height: "8px",
                backgroundColor: i === step ? "var(--green)" : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 space-y-3">
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm border"
              style={{ color: "var(--green)", borderColor: "var(--green)" }}
            >
              이전
            </button>
          )}
          <button
            onClick={() => isLast ? onNavigate?.("home") : setStep(s => s + 1)}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white shadow-sm"
            style={{ backgroundColor: isLast ? "var(--gold)" : "var(--green)" }}
          >
            {isLast ? "시작하기" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── 16. Multilingual Content Preview ─────────────────────────────────────────
const menuItems = [
  {
    ko: { name: "할랄 갈비탕", desc: "사골 육수와 소갈비로 만든 진한 탕", price: "₩13,500" },
    en: { name: "Halal Galbi-tang", desc: "Rich beef rib soup with bone broth", price: "₩13,500" },
    ar: { name: "حساء ضلوع البقر الحلال", desc: "حساء غني بضلوع البقر ومرق العظام", price: "₩13,500", rtl: true },
  },
  {
    ko: { name: "비빔밥 (할랄)", desc: "신선한 채소와 할랄 불고기가 들어간 비빔밥", price: "₩11,000" },
    en: { name: "Bibimbap (Halal)", desc: "Mixed rice with veggies & halal bulgogi", price: "₩11,000" },
    ar: { name: "بيبيمباب (حلال)", desc: "أرز مخلوط بالخضار ولحم البقر الحلال", price: "₩11,000", rtl: true },
  },
  {
    ko: { name: "된장찌개 세트", desc: "구수한 된장찌개 + 공기밥 + 반찬 3종", price: "₩12,000" },
    en: { name: "Doenjang-jjigae Set", desc: "Soybean paste stew + rice + 3 side dishes", price: "₩12,000" },
    ar: { name: "طقم حساء دوينجانج", desc: "حساء معجون فول الصويا + أرز + 3 أطباق جانبية", price: "₩12,000", rtl: true },
  },
];

const langs = [
  { code: "ko", label: "한국어", flag: "🇰🇷", dir: "ltr" as const },
  { code: "en", label: "English", flag: "🇺🇸", dir: "ltr" as const },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" as const },
];

export const MultilingualScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const [activePreview, setActivePreview] = useState<"split" | "ko" | "en" | "ar">("split");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <div className="flex-1">
            <h1 className="font-bold text-base text-[#1A1A18]">{t("accessibility.multilingual_title")}</h1>
            <p className="text-[11px] text-[var(--muted)]">한국어 · English · العربية</p>
          </div>
        </div>

        {/* View selector */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {[
            { id: "split", label: t("accessibility.split_view") },
            ...langs.map(l => ({ id: l.code, label: `${l.flag} ${l.label}` })),
          ].map((v) => (
            <button key={v.id} onClick={() => setActivePreview(v.id as typeof activePreview)}
              className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all"
              style={{
                backgroundColor: activePreview === v.id ? "var(--green)" : "transparent",
                color: activePreview === v.id ? "white" : "var(--muted)",
                border: activePreview === v.id ? "none" : "1px solid var(--border)",
              }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 phone-scroll">
        {/* Restaurant header */}
        <div className="relative">
          <div className="h-32 bg-[#C4C0B8]" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=390&h=128&fit=crop&auto=format&q=80)`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-white font-bold text-base">
              {activePreview === "ar" ? "مطعم هالال سيندانغ الكوري" : activePreview === "en" ? "Sindang Halal Korean Kitchen" : "신당 할랄 키친"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>
                {activePreview === "ar" ? "حلال معتمد" : activePreview === "en" ? "HALAL CERTIFIED" : "HALAL 인증"}
              </span>
              <span className="text-white/70 text-xs">⭐ 4.8 · {activePreview === "ar" ? "2.3 كم" : "2.3km"}</span>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="px-4 pt-4 space-y-3">
          {/* Section label */}
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm text-[#1A1A18]">
              {activePreview === "ar" ? "🔥 القائمة الشعبية" : activePreview === "en" ? "🔥 Popular Menu" : "🔥 인기메뉴"}
            </p>
          </div>

          {menuItems.map((item, i) => {
            if (activePreview === "split") {
              return (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
                    {langs.map((lang) => {
                      const content = item[lang.code as keyof typeof item] as { name: string; desc: string; price: string; rtl?: boolean };
                      return (
                        <div key={lang.code} className="p-2.5 min-h-[80px]" dir={content.rtl ? "rtl" : "ltr"}>
                          <div className="flex items-center gap-1 mb-1.5">
                            <span className="text-[10px]">{lang.flag}</span>
                            <span className="text-[9px] font-bold text-[var(--muted)] uppercase">{lang.label}</span>
                          </div>
                          <p className={`font-bold text-[11px] text-[#1A1A18] leading-tight mb-1 ${lang.code === "ar" ? "font-arabic" : ""}`}>
                            {content.name}
                          </p>
                          <p className={`text-[9px] text-[var(--muted)] leading-relaxed line-clamp-2 ${lang.code === "ar" ? "font-arabic" : ""}`}>
                            {content.desc}
                          </p>
                          <p className="font-bold text-[10px] text-[#1A1A18] mt-1">{content.price}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const lang = langs.find(l => l.code === activePreview)!;
            const content = item[lang.code as keyof typeof item] as { name: string; desc: string; price: string; rtl?: boolean };

            return (
              <div key={i} className="bg-white rounded-2xl p-3 shadow-sm flex gap-3" dir={content.rtl ? "rtl" : "ltr"}>
                <div className="w-16 h-16 rounded-xl bg-[#D8D4CC] flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-[#E8E4DC]" />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm text-[#1A1A18] ${lang.code === "ar" ? "font-arabic" : ""}`}>{content.name}</p>
                  <p className={`text-xs text-[var(--muted)] mt-0.5 leading-relaxed ${lang.code === "ar" ? "font-arabic" : ""}`}>{content.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-sm text-[#1A1A18]">{content.price}</p>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "var(--green)" }}>+</button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Language note */}
          <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: "var(--green-light)" }}>
            <span className="text-base mt-0.5">🌐</span>
            <div>
              <p className="font-bold text-xs text-[#1A1A18] mb-0.5">{t("accessibility.translation_note_title")}</p>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                {t("accessibility.translation_note_desc")}
              </p>
            </div>
          </div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};
