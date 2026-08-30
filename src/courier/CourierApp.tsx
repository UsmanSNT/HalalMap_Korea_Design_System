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
    section: "온보딩",
    screens: [
      { id: "registration", label: "1. 기사 등록" },
      { id: "login", label: "2. 로그인" },
      { id: "verification", label: "3. 서류 심사 중" },
    ],
  },
  {
    section: "배달 플로우",
    screens: [
      { id: "go-online", label: "4. 온라인 전환" },
      { id: "order-feed", label: "5. 주문 대기" },
      { id: "order-accepted", label: "6. 주문 수락" },
      { id: "at-restaurant", label: "7. 식당 도착" },
      { id: "delivering", label: "8. 배달 중" },
      { id: "delivery-complete", label: "9. 배달 완료" },
      { id: "delivery-issue", label: "10. 배달 문제" },
    ],
  },
  {
    section: "수익",
    screens: [
      { id: "earnings", label: "11. 수익 현황" },
      { id: "history", label: "12. 배달 내역" },
      { id: "payout", label: "13. 정산 내역" },
    ],
  },
  {
    section: "프로필",
    screens: [
      { id: "courier-profile", label: "14. 내 프로필" },
      { id: "courier-settings", label: "15. 설정" },
    ],
  },
];

// ── Render screen ──────────────────────────────────────────────────────────────
const renderCourierScreen = (id: CourierScreenId) => {
  switch (id) {
    case "registration":     return <CourierRegistrationScreen />;
    case "login":            return <CourierLoginScreen />;
    case "verification":     return <VerificationPendingScreen />;
    case "go-online":        return <GoOnlineScreen />;
    case "order-feed":       return <OrderFeedScreen />;
    case "order-accepted":   return <OrderAcceptedScreen />;
    case "at-restaurant":    return <AtRestaurantScreen />;
    case "delivering":       return <DeliveringScreen />;
    case "delivery-complete": return <DeliveryCompleteScreen />;
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
  const [active, setActive] = useState<CourierScreenId>("go-online");

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: "#04090F" }}>
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
            배달 파트너 앱 · 15 screens
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
            ← 고객 앱으로
          </button>
          <p className="text-center text-[9px] font-mono" style={{ color: C.dim }}>
            HalalMap Korea · Courier v1.0
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#040810" }}>
        {/* Dot grid background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="courier-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill={C.text} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#courier-dots)" />
        </svg>

        {/* Phone frame */}
        <div className="relative" style={{ width: "390px", height: "844px", flexShrink: 0 }}>
          {/* Shadow glow */}
          <div className="absolute inset-0 rounded-[50px] opacity-30"
            style={{ boxShadow: `0 0 80px ${C.green}40`, pointerEvents: "none" }} />

          {/* Outer frame */}
          <div className="absolute inset-0 rounded-[50px]"
            style={{ backgroundColor: "#0A0F18", border: "2px solid rgba(255,255,255,0.12)" }} />

          {/* Dynamic island */}
          <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[120px] h-[34px] rounded-full z-10"
            style={{ backgroundColor: "#000000" }} />

          {/* Screen content */}
          <div className="absolute inset-[3px] rounded-[48px] overflow-hidden"
            style={{ backgroundColor: C.bg }}>
            {renderCourierScreen(active)}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[120px] h-[5px] rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
    </div>
  );
}
