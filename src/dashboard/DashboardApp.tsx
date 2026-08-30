import React, { useState } from "react";
import { MainDashboard, OrderBoard } from "./OrderScreens";
import { MenuEditor, MenuItemForm, MenuAvailability } from "./MenuScreens";
import { RestaurantSettings, HalalCertification } from "./BusinessScreens";
import { SalesAnalytics, ReviewsManagement } from "./AnalyticsScreens";
import { NotificationCenter } from "./NotificationCenter";

// ── Types ──────────────────────────────────────────────────────────────────────
type DashScreen =
  | "main-dashboard" | "order-board"
  | "menu-editor" | "menu-item-form" | "menu-availability"
  | "restaurant-settings" | "halal-certification"
  | "sales-analytics" | "reviews"
  | "notifications";

// ── Nav data ───────────────────────────────────────────────────────────────────
const NAV_GROUPS: { label: string; items: { id: DashScreen; label: string; icon: React.ReactNode; badge?: number }[] }[] = [
  {
    label: "주문 관리",
    items: [
      { id: "main-dashboard", label: "오늘 현황", icon: <IconGrid /> },
      { id: "order-board", label: "실시간 주문 보드", icon: <IconBoard />, badge: 3 },
    ],
  },
  {
    label: "메뉴 관리",
    items: [
      { id: "menu-editor", label: "메뉴 편집", icon: <IconMenu /> },
      { id: "menu-availability", label: "판매 가용성", icon: <IconToggle /> },
    ],
  },
  {
    label: "식당 관리",
    items: [
      { id: "restaurant-settings", label: "식당 설정", icon: <IconStore /> },
      { id: "halal-certification", label: "할랄 인증", icon: <IconCert /> },
    ],
  },
  {
    label: "분석",
    items: [
      { id: "sales-analytics", label: "매출 분석", icon: <IconChart /> },
      { id: "reviews", label: "리뷰 관리", icon: <IconStar />, badge: 2 },
    ],
  },
];

// ── Sidebar icons (inline SVGs) ────────────────────────────────────────────────
function IconGrid() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>;
}
function IconBoard() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="1" width="4" height="14" rx="1"/><rect x="6" y="1" width="4" height="10" rx="1"/><rect x="11" y="1" width="4" height="12" rx="1"/></svg>;
}
function IconMenu() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2v3m0 6v3M5.5 4.5A3 3 0 0111 8a3 3 0 01-5.5 3.5"/><rect x="2" y="6.5" width="3" height="3" rx="0.5"/><rect x="11" y="6.5" width="3" height="3" rx="0.5"/></svg>;
}
function IconToggle() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="14" height="4" rx="2"/><circle cx="11" cy="6" r="1.5" fill="currentColor" stroke="none"/><rect x="1" y="10" width="14" height="4" rx="2"/><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>;
}
function IconStore() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 7v7h12V7M1 4l1.5-2h11L15 4v1a2 2 0 01-2 2H3a2 2 0 01-2-2V4z"/><path d="M6 14v-4h4v4"/></svg>;
}
function IconCert() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8l2 2 4-4"/></svg>;
}
function IconChart() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12l3-4 3 2 3-5 3 2"/><rect x="2" y="13" width="12" height="1.5" rx="0.75" fill="currentColor" stroke="none"/></svg>;
}
function IconStar() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2l1.6 3.3 3.7.5-2.7 2.6.6 3.6L8 10.3l-3.2 1.7.6-3.6L2.7 5.8l3.7-.5z"/></svg>;
}
function IconBell() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 2a5 5 0 015 5v3l2 2H2l2-2V7a5 5 0 015-5z"/><path d="M7 14a2 2 0 004 0"/></svg>;
}

// ── Screen title map ───────────────────────────────────────────────────────────
const SCREEN_TITLES: Record<DashScreen, string> = {
  "main-dashboard": "오늘 현황",
  "order-board": "실시간 주문 보드",
  "menu-editor": "메뉴 관리",
  "menu-item-form": "새 메뉴 추가",
  "menu-availability": "메뉴 가용성",
  "restaurant-settings": "식당 설정",
  "halal-certification": "할랄 인증 관리",
  "sales-analytics": "매출 분석",
  "reviews": "리뷰 관리",
  "notifications": "알림 센터",
};

// ── DashboardApp ───────────────────────────────────────────────────────────────
export default function DashboardApp({ onSwitch }: { onSwitch: () => void }) {
  const [screen, setScreen] = useState<DashScreen>("main-dashboard");
  const now = new Date();
  const dateStr = now.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
  const unreadNotifs = 5;

  const navTo = (s: string) => setScreen(s as DashScreen);

  const renderScreen = () => {
    switch (screen) {
      case "main-dashboard":     return <MainDashboard onNav={navTo} />;
      case "order-board":        return <OrderBoard />;
      case "menu-editor":        return <MenuEditor onAddItem={() => setScreen("menu-item-form")} />;
      case "menu-item-form":     return <MenuItemForm onBack={() => setScreen("menu-editor")} />;
      case "menu-availability":  return <MenuAvailability />;
      case "restaurant-settings": return <RestaurantSettings />;
      case "halal-certification": return <HalalCertification />;
      case "sales-analytics":    return <SalesAnalytics />;
      case "reviews":            return <ReviewsManagement />;
      case "notifications":      return <NotificationCenter onNav={navTo} />;
      default:                   return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ fontFamily: "'Noto Sans KR', 'Inter', sans-serif", backgroundColor: "#F0EDE8" }}>
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: "#1A1A18" }}>
        {/* Brand */}
        <div className="relative overflow-hidden flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Geo pattern */}
          <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dash-geo" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <g transform="translate(14,14)" stroke="white" strokeWidth="0.6" fill="none">
                  <rect x="-6" y="-6" width="12" height="12"/>
                  <rect x="-6" y="-6" width="12" height="12" transform="rotate(45)"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dash-geo)"/>
          </svg>
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--green)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1C4.8 1 3 2.8 3 5C3 8 7 12.5 7 12.5C7 12.5 11 8 11 5C11 2.8 9.2 1 7 1ZM7 6.5C6.2 6.5 5.5 5.8 5.5 5C5.5 4.2 6.2 3.5 7 3.5C7.8 3.5 8.5 4.2 8.5 5C8.5 5.8 7.8 6.5 7 6.5Z" fill="white"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-tight">HalalMap Korea</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>사장님 대시보드</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: "var(--green)" }}>신</div>
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>신당 할랄 키친</span>
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-5 py-2.5" style={{ backgroundColor: "rgba(27,107,74,0.15)", borderBottom: "1px solid rgba(27,107,74,0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
          <span className="text-[11px] font-medium" style={{ color: "#4ade80" }}>영업 중 · 현재 주문 4건</span>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-1">
              <p className="px-5 py-1.5 text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                {group.label}
              </p>
              {group.items.map(item => {
                const active = screen === item.id;
                return (
                  <button key={item.id} onClick={() => setScreen(item.id)}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all relative group"
                    style={{
                      backgroundColor: active ? "rgba(27,107,74,0.2)" : "transparent",
                      borderLeft: active ? "2.5px solid var(--green)" : "2.5px solid transparent",
                    }}>
                    <span style={{ color: active ? "var(--green)" : "rgba(255,255,255,0.45)" }} className="flex-shrink-0 group-hover:text-white transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-xs font-medium truncate transition-colors" style={{ color: active ? "white" : "rgba(255,255,255,0.55)" }}>
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#3B82F6" }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onSwitch}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 7h10M5 4L2 7l3 3"/>
            </svg>
            고객 앱으로 전환
          </button>
          <p className="text-[10px] text-center" style={{ color: "rgba(255,255,255,0.18)" }}>HalalMap Korea v2.4 · 사장님 전용</p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-14 flex-shrink-0 flex items-center gap-4 px-6 bg-white" style={{ borderBottom: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="flex-1">
            <h1 className="font-bold text-sm text-[#1A1A18]">{SCREEN_TITLES[screen]}</h1>
            <p className="text-[11px] text-[var(--muted)]">{dateStr}</p>
          </div>

          {/* New order pulse indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: "#EFF6FF" }}>
            <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            <span className="text-xs font-bold" style={{ color: "#1D4ED8" }}>신규 주문 3건</span>
          </div>

          {/* Notification bell */}
          <button onClick={() => setScreen("notifications")}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--cream)] transition-colors"
            style={{ color: screen === "notifications" ? "var(--green)" : "#1A1A18" }}>
            <IconBell />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: "var(--danger)" }}>
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "var(--green)" }}>
              사
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-[#1A1A18]">김사장</p>
              <p className="text-[10px] text-[var(--muted)]">신당 할랄 키친</p>
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main className="flex-1 overflow-hidden" style={{ backgroundColor: "#F0EDE8" }}>
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}
