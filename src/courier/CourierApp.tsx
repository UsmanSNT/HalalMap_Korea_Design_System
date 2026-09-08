import { useRouteScreen } from "../services/navigation";
import React, { useState } from "react";
import { C } from "./CourierShared";
import { CourierRegistrationScreen, CourierLoginScreen, VerificationPendingScreen } from "./OnboardingScreens";
import {
  GoOnlineScreen, OrderFeedScreen, OrderAcceptedScreen,
  AtRestaurantScreen, DeliveringScreen, DeliveryCompleteScreen, DeliveryIssueScreen,
} from "./MainFlowScreens";
import { EarningsDashboard, DeliveryHistory, PayoutScreen } from "./EarningsScreens";
import { CourierProfile, CourierSettings } from "./ProfileScreens";

// ── Screen registry ────────────────────────────────────────────────────────────
type CourierScreenId =
  | "registration" | "login" | "verification"
  | "go-online" | "order-feed" | "order-accepted" | "at-restaurant"
  | "delivering" | "delivery-complete" | "delivery-issue"
  | "earnings" | "history" | "payout"
  | "courier-profile" | "courier-settings";

interface ScreenDef {
  id: CourierScreenId;
  label: string;
}

const SCREEN_GROUPS: { section: string; screens: ScreenDef[] }[] = [
  {
    section: "Yetkazib berish",
    screens: [
      { id: "go-online", label: "Ishni boshlash" },
      { id: "order-feed", label: "Yangi buyurtmalar" },
      { id: "order-accepted", label: "Oshxonaga borish" },
      { id: "at-restaurant", label: "Buyurtmani olish" },
      { id: "delivering", label: "Mijozga yetkazish" },
      { id: "delivery-complete", label: "Yetkazildi" },
      { id: "delivery-issue", label: "Muammo haqida xabar" },
    ],
  },
  {
    section: "Daromad",
    screens: [
      { id: "earnings", label: "Daromad holati" },
      { id: "history", label: "Yetkazish tarixi" },
      { id: "payout", label: "To‘lovlar" },
    ],
  },
  {
    section: "Profil",
    screens: [
      { id: "courier-profile", label: "Mening profilim" },
      { id: "courier-settings", label: "Sozlamalar" },
    ],
  },
];

// ── Render screen ──────────────────────────────────────────────────────────────
const renderCourierScreen = (id: CourierScreenId, navigate: (id: CourierScreenId) => void) => {
  switch (id) {
    case "registration":     return <CourierRegistrationScreen />;
    case "login":            return <CourierLoginScreen />;
    case "verification":     return <VerificationPendingScreen />;
    case "go-online":        return <GoOnlineScreen onGoOnline={() => navigate("order-feed")} />;
    case "order-feed":       return <OrderFeedScreen onAccept={() => navigate("order-accepted")} />;
    case "order-accepted":   return <OrderAcceptedScreen onArrive={() => navigate("at-restaurant")} />;
    case "at-restaurant":    return <AtRestaurantScreen onPickedUp={() => navigate("delivering")} />;
    case "delivering":       return <DeliveringScreen onComplete={() => navigate("delivery-complete")} />;
    case "delivery-complete": return <DeliveryCompleteScreen onNext={() => navigate("order-feed")} />;
    case "delivery-issue":   return <DeliveryIssueScreen />;
    case "earnings":         return <EarningsDashboard />;
    case "history":          return <DeliveryHistory />;
    case "payout":           return <PayoutScreen />;
    case "courier-profile":  return <CourierProfile />;
    case "courier-settings": return <CourierSettings />;
  }
};

// ── Sidebar ────────────────────────────────────────────────────────────────────
const SIDEBAR_BG = "#080F18";
const SIDEBAR_ACTIVE = "#0F2030";

// ── App shell ──────────────────────────────────────────────────────────────────
export default function CourierApp({ onSwitch }: { onSwitch: () => void }) {
  const [active, setActive] = useRouteScreen<CourierScreenId>("courier", "go-online");

  const [menuOpen, setMenuOpen] = useState(false);
  React.useEffect(() => setMenuOpen(false), [active]);
  return (
    <div className={`workspace-shell ${menuOpen ? "menu-open" : ""} courier-shell flex h-dvh w-full overflow-hidden`} style={{ backgroundColor: "#04090F" }}>
      <button className="workspace-menu-toggle" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰ {menuOpen ? "Menyuni yopish" : "Ish paneli menyusi"}</button>
      {/* Sidebar */}
      <div className="flex flex-col w-64 h-full flex-shrink-0 overflow-y-auto"
        style={{ backgroundColor: SIDEBAR_BG, borderRight: "1px solid rgba(255,255,255,0.05)" }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: C.greenGlow }}>
              🏍️
            </div>
            <div>
              <p className="font-bold text-sm leading-tight" style={{ color: C.text }}>HalalMap</p>
              <p className="font-bold text-sm leading-tight" style={{ color: C.green }}>Courier</p>
            </div>
          </div>
          <p className="text-[10px] mt-2 font-mono uppercase tracking-widest" style={{ color: C.dim }}>
            Yetkazib berish ish paneli
          </p>
        </div>

        {/* Nav groups */}
        <div className="flex-1 px-3 space-y-5 pb-4">
          {SCREEN_GROUPS.map(group => (
            <div key={group.section}>
              <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2" style={{ color: C.dim }}>
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.screens.map(screen => (
                  <button key={screen.id}
                    onClick={() => setActive(screen.id)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      backgroundColor: active === screen.id ? SIDEBAR_ACTIVE : "transparent",
                      color: active === screen.id ? C.green : C.muted,
                      borderLeft: active === screen.id ? `2px solid ${C.green}` : "2px solid transparent",
                    }}>
                    {screen.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: switch modes */}
        <div className="px-3 pb-5 flex-shrink-0 space-y-2">
          <button onClick={onSwitch}
            className="w-full py-3 rounded-xl text-xs font-bold transition-all"
            style={{ backgroundColor: C.card, color: C.muted, border: `1px solid ${C.border}` }}>
            ← Asosiy ilovaga qaytish
          </button>
          <p className="text-center text-[9px] font-mono" style={{ color: C.dim }}>
            HalalMap Korea · Courier v1.0
          </p>
        </div>
      </div>

      <main className="min-w-0 min-h-0 flex-1" style={{ backgroundColor: C.bg }}>{renderCourierScreen(active, setActive)}</main>
    </div>
  );
}
