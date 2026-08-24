import React, { useState } from "react";
import { C, CStatusBar, CBottomNav } from "./CourierShared";

// ── 14. Courier Profile ────────────────────────────────────────────────────────
export const CourierProfile = () => {
  const [activeTab, setActiveTab] = useState<"info" | "zones" | "docs">("info");

  const ZONES = [
    { name: "이태원동", active: true },
    { name: "한남동", active: true },
    { name: "용산동", active: true },
    { name: "홍대", active: false },
    { name: "강남", active: false },
    { name: "여의도", active: false },
    { name: "마포구", active: true },
    { name: "서초구", active: false },
  ];

  const DOCS = [
    { label: "신분증", status: "verified" as const },
    { label: "운전면허증", status: "verified" as const },
    { label: "이륜차보험", status: "verified" as const },
    { label: "배달 대행 계약서", status: "reviewing" as const },
    { label: "통장 사본", status: "verified" as const },
  ];

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    verified: { bg: "#162A20", text: C.green, label: "인증완료" },
    reviewing: { bg: "#1E2A10", text: "#A0C040", label: "검토중" },
    pending: { bg: "#2A1A10", text: C.gold, label: "미제출" },
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar />

      {/* Profile hero */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0 relative"
        style={{ background: `linear-gradient(180deg, #0C2030 0%, ${C.bg} 100%)` }}>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center relative flex-shrink-0 border-2"
            style={{ backgroundColor: C.card, borderColor: C.green }}>
            <span style={{ fontSize: "40px" }}>🏍️</span>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
              style={{ backgroundColor: C.green, borderColor: C.bg }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-xl" style={{ color: C.text }}>김민준</p>
            <div className="flex items-center gap-1.5 mt-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="12" height="12" viewBox="0 0 10 10" fill={C.gold}>
                  <path d="M5 1l.9 2 2.1.3-1.5 1.5.4 2.1L5 6l-1.9 1 .4-2.1L2 3.3l2.1-.3z"/>
                </svg>
              ))}
              <span className="font-mono text-sm font-bold tabular-nums ml-1" style={{ color: C.gold }}>4.92</span>
              <span className="text-xs" style={{ color: C.dim }}>(329건)</span>
            </div>
            <p className="text-xs mt-1.5 font-bold px-2 py-0.5 rounded-full inline-block"
              style={{ backgroundColor: C.goldGlow, color: C.gold }}>
              이륜차 · 배달파트너 2년차
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-5">
          {[
            { label: "총 배달", value: "1,241건" },
            { label: "이번 달", value: "329건" },
            { label: "수락률", value: "94%" },
          ].map(stat => (
            <div key={stat.label} className="flex-1 rounded-2xl py-3 text-center" style={{ backgroundColor: C.card }}>
              <p className="font-mono font-bold tabular-nums" style={{ color: C.text, fontSize: "18px" }}>{stat.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-2 pb-4 flex-shrink-0">
        {(["info", "zones", "docs"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ backgroundColor: activeTab === t ? C.green : C.card, color: activeTab === t ? "#0E1620" : C.muted }}>
            {t === "info" ? "차량 정보" : t === "zones" ? "배달 구역" : "서류"}
          </button>
        ))}
      </div>

      <div className="flex-1 phone-scroll px-4 space-y-3">
        {activeTab === "info" && (
          <>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
              {[
                { label: "차량 종류", value: "이륜차 (오토바이)" },
                { label: "차량 번호", value: "서울 가 1234" },
                { label: "연락처", value: "010-9876-5432" },
                { label: "가입일", value: "2022년 11월 15일" },
                { label: "배달 파트너 ID", value: "HMK-DRV-00429" },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3.5"
                  style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <p className="text-sm" style={{ color: C.muted }}>{item.label}</p>
                  <p className="font-bold text-sm" style={{ color: C.text }}>{item.value}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-4 rounded-2xl font-bold text-sm"
              style={{ backgroundColor: C.card, color: C.muted, border: `1px solid ${C.border}` }}>
              프로필 수정
            </button>
          </>
        )}

        {activeTab === "zones" && (
          <>
            <p className="text-xs pb-1" style={{ color: C.muted }}>활성 구역을 선택하면 해당 지역 주문이 우선 표시됩니다.</p>
            <div className="flex flex-wrap gap-2">
              {ZONES.map(z => (
                <div key={z.name} className="px-4 py-2 rounded-full font-bold text-sm"
                  style={{
                    backgroundColor: z.active ? C.green : C.card,
                    color: z.active ? "#0E1620" : C.muted,
                    border: `1.5px solid ${z.active ? C.green : C.border}`,
                  }}>
                  {z.name}
                </div>
              ))}
            </div>
            <p className="text-xs text-center pt-2" style={{ color: C.dim }}>구역 변경은 설정에서 가능합니다</p>
          </>
        )}

        {activeTab === "docs" && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            {DOCS.map((doc, i) => {
              const sc = statusColors[doc.status];
              return (
                <div key={doc.label} className="flex items-center justify-between px-4 py-4"
                  style={{ borderBottom: i < DOCS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: sc.bg }}>
                      {doc.status === "verified" ? "✅" : doc.status === "reviewing" ? "🔄" : "📎"}
                    </div>
                    <p className="font-bold text-sm" style={{ color: C.text }}>{doc.label}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div className="h-4" />
      </div>

      <CBottomNav active="profile" />
    </div>
  );
};

// ── 15. Courier Settings ───────────────────────────────────────────────────────
export const CourierSettings = () => {
  const [orderSound, setOrderSound] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [language, setLanguage] = useState<"ko" | "en" | "uz">("ko");
  const [navApp, setNavApp] = useState<"naver" | "kakao" | "google">("kakao");

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className="w-14 h-8 rounded-full relative transition-all duration-300 flex-shrink-0"
      style={{ backgroundColor: value ? C.green : C.card, border: `1px solid ${value ? C.green : C.border}` }}>
      <div className="absolute w-6 h-6 rounded-full top-0.5 transition-all duration-300"
        style={{ backgroundColor: value ? "#0E1620" : C.dim, left: value ? "calc(100% - 28px)" : "2px" }} />
    </button>
  );

  const NAV_APPS = [
    { id: "naver" as const, name: "네이버 지도", icon: "🟢" },
    { id: "kakao" as const, name: "카카오맵", icon: "💛" },
    { id: "google" as const, name: "구글 지도", icon: "🔵" },
  ];

  const LANGS = [
    { id: "ko" as const, label: "한국어" },
    { id: "en" as const, label: "English" },
    { id: "uz" as const, label: "O'zbekcha" },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar />

      <div className="px-5 py-4 flex-shrink-0" style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <p className="font-bold text-lg" style={{ color: C.text }}>설정</p>
      </div>

      <div className="flex-1 phone-scroll px-4 pt-4 space-y-6">
        {/* Notifications section */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.dim }}>알림 및 소리</p>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            {/* Order sound - prominent */}
            <div className="px-4 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="font-bold text-base" style={{ color: C.text }}>주문 알림 소리</p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>새 주문 도착 시 큰 소리로 알림 (권장)</p>
                </div>
                <Toggle value={orderSound} onChange={setOrderSound} />
              </div>
              {orderSound && (
                <div className="mt-3 flex gap-2">
                  {["크게", "보통", "작게"].map((v, i) => (
                    <button key={v}
                      className="flex-1 py-2 rounded-xl text-xs font-bold"
                      style={{ backgroundColor: i === 0 ? C.green : C.cardAlt, color: i === 0 ? "#0E1620" : C.muted }}>
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p className="font-bold text-sm" style={{ color: C.text }}>푸시 알림</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>배달 현황 및 정산 알림</p>
              </div>
              <Toggle value={pushNotifs} onChange={setPushNotifs} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="font-bold text-sm" style={{ color: C.text }}>자동 수락</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>새 주문 자동 수락 (구역 내 2km)</p>
              </div>
              <Toggle value={autoAccept} onChange={setAutoAccept} />
            </div>
          </div>
        </div>

        {/* Navigation app */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.dim }}>내비게이션 앱</p>
          <div className="flex flex-col gap-2">
            {NAV_APPS.map(app => (
              <button key={app.id} onClick={() => setNavApp(app.id)}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all"
                style={{
                  backgroundColor: navApp === app.id ? "#0F2A1A" : C.card,
                  border: `1.5px solid ${navApp === app.id ? C.green : C.border}`,
                }}>
                <span className="text-2xl">{app.icon}</span>
                <p className="font-bold flex-1" style={{ color: navApp === app.id ? C.green : C.text }}>{app.name}</p>
                {navApp === app.id && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: C.green }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="#0E1620">
                      <path d="M2 6l3 3 5-5" stroke="#0E1620" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.dim }}>언어 / Language</p>
          <div className="flex gap-2">
            {LANGS.map(l => (
              <button key={l.id} onClick={() => setLanguage(l.id)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
                style={{
                  backgroundColor: language === l.id ? C.green : C.card,
                  color: language === l.id ? "#0E1620" : C.muted,
                  border: `1px solid ${language === l.id ? C.green : C.border}`,
                }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.dim }}>계정</p>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            {["고객센터 문의", "이용약관", "개인정보처리방침", "앱 버전 1.0.0"].map((item, i, arr) => (
              <div key={item} className="flex items-center justify-between px-4 py-4"
                style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <p className="text-sm" style={{ color: C.text }}>{item}</p>
                {i < 3 && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.dim} strokeWidth="1.5"><path d="M6 4l4 4-4 4"/></svg>}
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button className="w-full py-4 rounded-2xl font-bold text-sm"
          style={{ backgroundColor: "#2A0F10", color: "#E05050", border: "1px solid #3A1A1A" }}>
          로그아웃
        </button>
        <div className="h-4" />
      </div>

      <CBottomNav active="profile" />
    </div>
  );
};
