import React, { useState, useEffect } from "react";
import { A, CommandPalette, Toast } from "./AdminShared";
import { AdminHome } from "./OverviewScreens";
import { RestaurantList, RestaurantApproval, RestaurantDetail } from "./RestaurantScreens";
import { UserList, UserDetail } from "./UserScreens";
import { CourierList, CourierApproval, CourierDetail } from "./CourierAdminScreens";
import { AllOrders, LiveOperationsMap } from "./OrdersScreens";
import { HalalDatabase, MosqueManagement, PromotionsManagement } from "./ContentScreens";
import { PlatformAnalytics } from "./AnalyticsScreens";
import { PlatformSettings, AdminUsers } from "./SettingsScreens";

// ── Screen registry ────────────────────────────────────────────────────────────
export type AdminScreenId =
  | "home"
  | "restaurants" | "restaurant-approval" | "restaurant-detail"
  | "users" | "user-detail"
  | "couriers" | "courier-approval" | "courier-detail"
  | "orders" | "live-map"
  | "halal-db" | "mosques" | "promotions"
  | "analytics"
  | "settings" | "admin-users";

interface NavItem { id: AdminScreenId; label: string; icon: React.ReactNode; badge?: number }
interface NavGroup { section: string; items: NavItem[] }

// ── SVG icons ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS: Record<string, React.ReactNode> = {
  home:     <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"/>,
  restaurant: <Icon d="M18 8h1a4 4 0 010 8h-1 M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3 M10 1v3 M14 1v3"/>,
  users:    <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"/>,
  courier:  <Icon d="M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>,
  orders:   <Icon d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0"/>,
  map:      <Icon d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16"/>,
  database: <Icon d="M12 2C6.48 2 2 4.02 2 6.5S6.48 11 12 11s10-2.02 10-4.5S17.52 2 12 2z M2 6.5v5C2 13.98 6.48 16 12 16s10-2.02 10-4.5v-5 M2 11.5v5C2 18.98 6.48 21 12 21s10-2.02 10-4.5v-5"/>,
  mosque:   <Icon d="M12 2L8 7h8L12 2z M6 7h12v3H6z M4 10h16v12H4z M9 10v12 M15 10v12 M8 16h8"/>,
  promo:    <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01"/>,
  analytics:<Icon d="M18 20V10 M12 20V4 M6 20v-6"/>,
  settings: <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>,
  admin:    <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z M22 11l-1.5-1.5L17 13l-1.5-1.5L14 13"/>,
};

const NAV_GROUPS: NavGroup[] = [
  {
    section: "개요",
    items: [{ id: "home", label: "대시보드", icon: ICONS.home }],
  },
  {
    section: "레스토랑",
    items: [
      { id: "restaurants", label: "레스토랑 목록", icon: ICONS.restaurant },
      { id: "restaurant-approval", label: "승인 대기", icon: ICONS.restaurant, badge: 2 },
    ],
  },
  {
    section: "사용자",
    items: [
      { id: "users", label: "사용자 목록", icon: ICONS.users },
    ],
  },
  {
    section: "배달파트너",
    items: [
      { id: "couriers", label: "파트너 목록", icon: ICONS.courier },
      { id: "courier-approval", label: "파트너 승인", icon: ICONS.courier, badge: 1 },
    ],
  },
  {
    section: "주문 & 운영",
    items: [
      { id: "orders", label: "전체 주문", icon: ICONS.orders },
      { id: "live-map", label: "실시간 운영 지도", icon: ICONS.map },
    ],
  },
  {
    section: "콘텐츠 & 데이터",
    items: [
      { id: "halal-db", label: "할랄 데이터베이스", icon: ICONS.database },
      { id: "mosques", label: "모스크 관리", icon: ICONS.mosque },
      { id: "promotions", label: "프로모션 관리", icon: ICONS.promo },
    ],
  },
  {
    section: "분석",
    items: [{ id: "analytics", label: "플랫폼 분석", icon: ICONS.analytics }],
  },
  {
    section: "설정",
    items: [
      { id: "settings", label: "플랫폼 설정", icon: ICONS.settings },
      { id: "admin-users", label: "관리자 계정", icon: ICONS.admin },
    ],
  },
];

// ── Render screen ──────────────────────────────────────────────────────────────
function renderAdminScreen(id: AdminScreenId, navigate: (id: AdminScreenId) => void): React.ReactNode {
  switch (id) {
    case "home":                return <AdminHome />;
    case "restaurants":         return <RestaurantList onDetail={() => navigate("restaurant-detail")} />;
    case "restaurant-approval": return <RestaurantApproval />;
    case "restaurant-detail":   return <RestaurantDetail />;
    case "users":               return <UserList onDetail={() => navigate("user-detail")} />;
    case "user-detail":         return <UserDetail />;
    case "couriers":            return <CourierList onDetail={() => navigate("courier-detail")} />;
    case "courier-approval":    return <CourierApproval />;
    case "courier-detail":      return <CourierDetail />;
    case "orders":              return <AllOrders />;
    case "live-map":            return <LiveOperationsMap />;
    case "halal-db":            return <HalalDatabase />;
    case "mosques":             return <MosqueManagement />;
    case "promotions":          return <PromotionsManagement />;
    case "analytics":           return <PlatformAnalytics />;
    case "settings":            return <PlatformSettings />;
    case "admin-users":         return <AdminUsers />;
    default:                    return <AdminHome />;
  }
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function AdminApp({ onSwitch }: { onSwitch: () => void }) {
  const [current, setCurrent] = useState<AdminScreenId>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifCount] = useState(7);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPaletteOpen(true); }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const sidebarW = collapsed ? A.sidebarWCollapsed : A.sidebarW;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: A.bg, fontFamily: "'Inter','Noto Sans KR',sans-serif" }}>
      {/* Sidebar */}
      <aside className="flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-200"
        style={{ width: sidebarW, backgroundColor: A.sidebar, borderRight: `1px solid ${A.border}` }}>

        {/* Logo + collapse button */}
        <div className="flex items-center justify-between flex-shrink-0 px-4 py-4"
          style={{ height: A.headerH, borderBottom: `1px solid ${A.border}` }}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: A.green }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1C4.8 1 3 2.8 3 5C3 8 7 12 7 12C7 12 11 8 11 5C11 2.8 9.2 1 7 1ZM7 6.5C6.2 6.5 5.5 5.8 5.5 5C5.5 4.2 6.2 3.5 7 3.5C7.8 3.5 8.5 4.2 8.5 5C8.5 5.8 7.8 6.5 7 6.5Z" fill="white"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-xs leading-tight" style={{ color: A.text }}>HalalMap</p>
                <p className="text-[10px] font-semibold" style={{ color: A.green }}>Admin Console</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto"
              style={{ backgroundColor: A.green }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C4.8 1 3 2.8 3 5C3 8 7 12 7 12C7 12 11 8 11 5C11 2.8 9.2 1 7 1ZM7 6.5C6.2 6.5 5.5 5.8 5.5 5C5.5 4.2 6.2 3.5 7 3.5C7.8 3.5 8.5 4.2 8.5 5C8.5 5.8 7.8 6.5 7 6.5Z" fill="white"/>
              </svg>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ color: A.dim }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = A.bg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {collapsed ? <><path d="M2 3h10M2 7h10M2 11h10"/></> : <><path d="M3 3l4 4-4 4M8 7h6"/></>}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
          {NAV_GROUPS.map(group => (
            <div key={group.section} className="mb-1">
              {!collapsed && (
                <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: A.dim }}>
                  {group.section}
                </p>
              )}
              {group.items.map(item => {
                const isActive = current === item.id;
                return (
                  <button key={item.id} onClick={() => setCurrent(item.id)}
                    className="w-full flex items-center gap-2.5 transition-all relative"
                    style={{
                      padding: collapsed ? "10px 0" : "8px 12px 8px 16px",
                      backgroundColor: isActive ? A.greenLight : "transparent",
                      color: isActive ? A.green : A.muted,
                      justifyContent: collapsed ? "center" : "flex-start",
                    }}
                    title={collapsed ? item.label : undefined}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = A.borderLight; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = isActive ? A.greenLight : "transparent"; }}>
                    {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full" style={{ backgroundColor: A.green }} />}
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="text-sm font-medium flex-1 text-left truncate">{item.label}</span>
                        {item.badge && (
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ backgroundColor: A.danger, color: "#fff" }}>{item.badge}</span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1.5 right-2.5 w-2 h-2 rounded-full" style={{ backgroundColor: A.danger }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: switch mode */}
        <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: `1px solid ${A.border}` }}>
          {!collapsed ? (
            <button onClick={onSwitch}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{ backgroundColor: A.bg, color: A.muted, border: `1px solid ${A.border}` }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M8 3L3 7l5 4M3 7h11"/>
              </svg>
              고객 앱으로 돌아가기
            </button>
          ) : (
            <button onClick={onSwitch} className="w-full flex items-center justify-center py-2" style={{ color: A.dim }}
              title="고객 앱으로">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M9 3L4 8l5 5M4 8h12"/>
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex items-center flex-shrink-0 px-6 gap-4"
          style={{ height: A.headerH, backgroundColor: A.surface, borderBottom: `1px solid ${A.border}` }}>

          {/* ⌘K search */}
          <button onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.dim, width: 220 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="6" cy="6" r="4"/><path d="M10 10l2.5 2.5"/>
            </svg>
            <span className="flex-1 text-left text-xs">검색 또는 이동...</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: A.surface, border: `1px solid ${A.border}` }}>⌘K</kbd>
          </button>

          <div className="flex-1" />

          {/* Live badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: A.greenLight, color: A.greenText }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: A.green }} />
            실시간
          </div>

          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: A.muted }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = A.bg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9 2C5.68 2 3 4.68 3 8v5H15V8c0-3.32-2.68-6-6-6z M7 13v1a2 2 0 004 0v-1"/>
            </svg>
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ backgroundColor: A.danger }}>{notifCount}</span>
            )}
          </button>

          {/* Admin avatar */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = A.bg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: A.greenLight, color: A.greenText }}>김</div>
            <div className="leading-tight">
              <p className="text-xs font-semibold" style={{ color: A.text }}>김관리자</p>
              <p className="text-[10px]" style={{ color: A.dim }}>슈퍼 어드민</p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: A.bg }}>
          <div className="px-8 py-6">
            {renderAdminScreen(current, setCurrent)}
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={() => {}} />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
