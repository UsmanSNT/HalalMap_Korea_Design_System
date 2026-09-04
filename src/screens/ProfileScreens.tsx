import React, { useState, useEffect } from "react";
import { GeometricPattern, StatusBar, BottomNav, BackButton, Toggle, HalalBadge, StarRating, TabId } from "../components/Shared";
import { getProfile, type Profile } from "../api/profile";
import { getSavedPlaces, type SavedPlaces } from "../api/savedPlaces";
import type { ScreenId } from "../App";

// ── 28. Profile Screen ─────────────────────────────────────────────────────────
const profileMenu = [
  { icon: "📦", label: "주문 내역", sub: "최근 주문 12개" },
  { icon: "🏠", label: "배달 주소 관리", sub: "3개 저장됨" },
  { icon: "💳", label: "결제 수단", sub: "신한카드 ····4521" },
  { icon: "❤️", label: "저장된 식당 · 모스크", sub: "5개 저장됨" },
  { icon: "🔔", label: "알림 설정", sub: "" },
  { icon: "🌐", label: "언어 설정", sub: "한국어" },
  { icon: "🎟", label: "쿠폰 · 포인트", sub: "3,200포인트" },
  { icon: "❓", label: "고객센터", sub: "" },
  { icon: "📖", label: "앱 사용법", sub: "튜토리얼 다시보기" },
  { icon: "⚙️", label: "설정", sub: "" },
];

const profileNavMap: Record<string, ScreenId> = {
  "주문 내역": "order-history",
  "저장된 식당 · 모스크": "saved-places",
  "배달 주소 관리": "address",
  "결제 수단": "settings",
  "알림 설정": "notifications",
  "언어 설정": "language",
  "쿠폰 · 포인트": "loyalty",
  "고객센터": "community",
  "앱 사용법": "tutorial",
  "설정": "settings",
};

export const ProfileScreen = ({ onTabChange, onLogout, onNavigate }: { onTabChange?: (t: TabId) => void; onLogout?: () => void; onNavigate?: (s: ScreenId) => void }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const statsRow = profile
    ? [
        { label: "총 주문", val: `${profile.stats.orders}회` },
        { label: "리뷰", val: `${profile.stats.reviews}개` },
        { label: "저장", val: `${profile.stats.saved}개` },
      ]
    : [
        { label: "총 주문", val: "-" },
        { label: "리뷰", val: "-" },
        { label: "저장", val: "-" },
      ];

  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="relative overflow-hidden flex-shrink-0" style={{ backgroundColor: "var(--green)" }}>
      <GeometricPattern color="white" opacity={0.06} />
      <StatusBar dark />
      <div className="relative z-10 px-5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.initials ?? "..."}
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-white">{profile?.name ?? "로딩중..."}</p>
            <p className="text-white/70 text-sm">{profile?.email ?? ""}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{profile?.membership ?? ""}</span>
              {profile && <span className="text-xs text-white/60">· {profile.points.toLocaleString()} 포인트</span>}
            </div>
          </div>
          <button className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8"><path d="M2 12L5 11L13 3a1.4 1.4 0 00-2-2L3 10L2 13z"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div className="flex-1 phone-scroll">
      <div className="bg-white px-4 py-4 flex divide-x divide-[var(--border)]">
        {statsRow.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p className="font-bold text-xl text-[#1A1A18]">{s.val}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="bg-white mt-2 divide-y divide-[var(--border)]">
        {profileMenu.map((item) => (
          <button key={item.label} onClick={() => { const target = profileNavMap[item.label]; if (target) onNavigate?.(target); }} className="w-full flex items-center gap-3 px-5 py-4 text-left active:bg-[var(--cream)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--cream)] flex items-center justify-center text-lg flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A18]">{item.label}</p>
              {item.sub && <p className="text-xs text-[var(--muted)] mt-0.5">{item.sub}</p>}
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8">
              <path d="M6 4l4 4-4 4" strokeLinecap="round"/>
            </svg>
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="text-xs text-[var(--muted)] text-center">HalalMap Korea v1.0.0</p>
        <button onClick={onLogout} className="w-full py-3 rounded-2xl font-semibold text-sm border border-[var(--danger)] text-[var(--danger)]">
          Chiqish
        </button>
      </div>
    </div>

    <BottomNav active="profile" onTabChange={onTabChange} />
  </div>
  );
};

// ── 29. Saved Places ───────────────────────────────────────────────────────────
const halalBadgeMap = (status: string) =>
  status === "certified" ? ("certified" as const) : status === "muslim-owned" ? ("owned" as const) : ("friendly" as const);

export const SavedPlacesScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [tab, setTab] = useState<"restaurants" | "mosques">("restaurants");
  const [places, setPlaces] = useState<SavedPlaces | null>(null);

  useEffect(() => {
    getSavedPlaces().then(setPlaces).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg flex-1">저장된 장소</h1>
        </div>
        <div className="flex bg-[var(--cream)] mx-4 mb-4 rounded-xl p-1">
          {(["restaurants", "mosques"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === t ? "var(--green)" : "transparent",
                color: tab === t ? "white" : "var(--muted)",
              }}
            >
              {t === "restaurants" ? "❤️ 식당" : "🕌 모스크"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        {!places ? (
          <p className="text-center text-sm text-[var(--muted)] py-8">로딩중...</p>
        ) : tab === "restaurants" ? (
          places.restaurants.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-stretch">
              <div className="w-24 h-24 flex-shrink-0 bg-[#E8E6E1]">
                <img src={`https://images.unsplash.com/photo-${r.imageId}?w=180&h=180&fit=crop&auto=format&q=80`} alt={r.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <HalalBadge variant={halalBadgeMap(r.halalStatus)} />
                  <p className="font-bold text-sm text-[#1A1A18] mt-1">{r.name}</p>
                  <StarRating rating={r.rating} count={r.reviewCount} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--green)" }}>주문하기</button>
                  <button className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--danger)"><path d="M7 12S1 8 1 4.5C1 2.5 2.7 1 4.5 1c.9 0 1.8.4 2.5 1C7.7 1.4 8.6 1 9.5 1 11.3 1 13 2.5 13 4.5 13 8 7 12 7 12Z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          places.mosques.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--gold-light)" }}>
                <span className="text-2xl">🕌</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-base text-[#1A1A18]">{m.name}</p>
                <p className="text-xs text-[var(--muted)]">{m.nameEn} · {m.distance}</p>
              </div>
              <button className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--gold)"><path d="M7 12S1 8 1 4.5C1 2.5 2.7 1 4.5 1c.9 0 1.8.4 2.5 1C7.7 1.4 8.6 1 9.5 1 11.3 1 13 2.5 13 4.5 13 8 7 12 7 12Z"/></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── 30. Address Management ─────────────────────────────────────────────────────
const addresses = [
  { icon: "🏠", label: "집", addr: "서울특별시 용산구 이태원로 123, 501호", default: true },
  { icon: "🏢", label: "회사", addr: "서울특별시 강남구 테헤란로 456, 12층", default: false },
  { icon: "🕌", label: "모스크 근처", addr: "서울특별시 용산구 우사단로10길 39", default: false },
];

export const AddressScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-3">
        <BackButton onBack={() => onNavigate?.("home")} />
        <h1 className="font-bold text-lg flex-1">배달 주소 관리</h1>
      </div>
    </div>

    <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
      {addresses.map((addr) => (
        <div key={addr.label} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: addr.default ? "var(--green-light)" : "var(--cream)" }}
            >
              {addr.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-sm text-[#1A1A18]">{addr.label}</p>
                {addr.default && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--green)", color: "white" }}>기본</span>
                )}
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{addr.addr}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--muted)" strokeWidth="1.5"><path d="M2 10L4.5 9.5L11 3a1 1 0 00-1.5-1.5L3 8L2 11z"/></svg>
              </button>
              {!addr.default && (
                <button className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--danger)" strokeWidth="1.5"><path d="M2 3.5h10M5.5 3.5V2h3v1.5M6 6v4.5M8 6v4.5M3.5 3.5l.5 8h6l.5-8" strokeLinecap="round"/></svg>
                </button>
              )}
            </div>
          </div>
          {!addr.default && (
            <button className="mt-2 text-xs font-medium ml-13 pl-13" style={{ color: "var(--green)", paddingLeft: "52px" }}>
              기본 주소로 설정
            </button>
          )}
        </div>
      ))}

      {/* Add new */}
      <button className="w-full py-4 rounded-2xl border-2 border-dashed border-[var(--border)] flex items-center justify-center gap-2 font-semibold text-sm" style={{ color: "var(--muted)" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
        새 주소 추가
      </button>

      {/* Map hint */}
      <div className="h-28 rounded-2xl overflow-hidden bg-[#E8E4DC] relative">
        <img src="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=390&h=130&fit=crop&auto=format&q=80" alt="map" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-md flex items-center gap-2">
            <span>📍</span>
            <p className="text-sm font-semibold text-[#1A1A18]">지도에서 선택</p>
          </div>
        </div>
      </div>
      <div className="h-4" />
    </div>
  </div>
);

// ── 31. Settings ───────────────────────────────────────────────────────────────
export const SettingsScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPrayer, setNotifPrayer] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg">설정</h1>
        </div>
      </div>

      <div className="flex-1 phone-scroll space-y-2 py-3">
        {/* Notifications */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2">알림</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {[
              { label: "주문 업데이트", sub: "주문 상태 변경 시 알림", state: notifOrder, set: setNotifOrder },
              { label: "기도 시간 알림", sub: "각 기도 시간 전 알림", state: notifPrayer, set: setNotifPrayer },
              { label: "프로모션", sub: "할인 및 쿠폰 알림", state: notifPromo, set: setNotifPromo },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A18]">{n.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{n.sub}</p>
                </div>
                <Toggle on={n.state} onToggle={() => n.set(!n.state)} />
              </div>
            ))}
          </div>
        </div>

        {/* App */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">앱</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-[#1A1A18]">언어</p>
                <p className="text-xs text-[var(--muted)]">Language</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--muted)]">한국어</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </div>
            </div>

            {/* Theme */}
            <div className="px-5 py-4">
              <p className="text-sm font-semibold text-[#1A1A18] mb-3">테마</p>
              <div className="flex gap-2">
                {(["light", "dark", "auto"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                    style={{
                      backgroundColor: theme === t ? "var(--green)" : "white",
                      color: theme === t ? "white" : "var(--muted)",
                      borderColor: theme === t ? "var(--green)" : "var(--border)",
                    }}
                  >
                    {t === "light" ? "라이트" : t === "dark" ? "다크" : "자동"}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-[#1A1A18]">할랄 인증 기관</p>
                <p className="text-xs text-[var(--muted)]">KMF, JAKIM, IFANCA</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">계정</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {["개인정보 변경", "비밀번호 변경"].map((item) => (
              <button key={item} className="w-full flex items-center justify-between px-5 py-4">
                <p className="text-sm font-semibold text-[#1A1A18]">{item}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </button>
            ))}
            <button className="w-full flex items-center justify-between px-5 py-4">
              <p className="text-sm font-semibold" style={{ color: "var(--danger)" }}>데이터 삭제 요청</p>
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">정보</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {["이용약관", "개인정보처리방침"].map((item) => (
              <button key={item} className="w-full flex items-center justify-between px-5 py-4">
                <p className="text-sm font-semibold text-[#1A1A18]">{item}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </button>
            ))}
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-sm font-semibold text-[#1A1A18]">앱 버전</p>
              <p className="text-sm text-[var(--muted)]">1.0.0</p>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
};
