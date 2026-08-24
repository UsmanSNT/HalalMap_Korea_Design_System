import React, { useState } from "react";

// ── Courier color palette ──────────────────────────────────────────────────────
export const C = {
  bg:          "#0E1620",
  surface:     "#152030",
  card:        "#1A2C3E",
  cardAlt:     "#1E3248",
  border:      "rgba(255,255,255,0.07)",
  borderBright:"rgba(255,255,255,0.13)",
  text:        "#EEF2F7",
  muted:       "#7A8FA6",
  dim:         "#3D5068",
  green:       "#22D96B",
  greenDark:   "#17A350",
  greenGlow:   "rgba(34,217,107,0.18)",
  gold:        "#F5A623",
  goldDark:    "#C47E14",
  goldGlow:    "rgba(245,166,35,0.15)",
  blue:        "#4DA8FF",
  blueGlow:    "rgba(77,168,255,0.15)",
  danger:      "#FF4F4F",
  dangerGlow:  "rgba(255,79,79,0.15)",
  purple:      "#9D7FFF",
  orange:      "#FF8C42",
};

// ── Status bar ─────────────────────────────────────────────────────────────────
export const CStatusBar = ({ online = false }: { online?: boolean }) => (
  <div className="flex items-center justify-between px-6 pt-2 pb-1 flex-shrink-0" style={{ backgroundColor: C.bg }}>
    <span className="font-mono text-xs font-bold tabular-nums" style={{ color: C.text }}>9:41</span>
    <div className="flex items-center gap-2">
      {online && (
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
          <span className="text-[10px] font-bold" style={{ color: C.green }}>GPS</span>
        </div>
      )}
      <div className="flex gap-0.5 items-end">
        {[3,4,5,6].map((h, i) => (
          <div key={i} style={{ width: "3px", height: `${h * 2}px`, backgroundColor: i < 3 ? C.text : C.dim, borderRadius: "1px" }} />
        ))}
      </div>
      <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
        <rect x="0.5" y="0.5" width="13" height="9" rx="2" stroke={C.muted} strokeWidth="1"/>
        <rect x="14.5" y="3" width="1.5" height="4" rx="0.5" fill={C.muted}/>
        <rect x="1.5" y="1.5" width="10" height="7" rx="1.5" fill={C.text}/>
      </svg>
    </div>
  </div>
);

// ── Bottom nav ─────────────────────────────────────────────────────────────────
export type CourierTab = "home" | "deliveries" | "earnings" | "profile";

const NAV_ITEMS: { id: CourierTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: "home", label: "홈",
    icon: (a) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={a ? C.green : C.muted} strokeWidth="1.8" strokeLinecap="round"><path d="M3 10L11 3l8 7v8a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V10z"/></svg>,
  },
  {
    id: "deliveries", label: "배달",
    icon: (a) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={a ? C.green : C.muted} strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="8" width="13" height="10" rx="1.5"/><path d="M14 11h3l3 4v3h-3"/><circle cx="5.5" cy="19" r="2"/><circle cx="17.5" cy="19" r="2"/></svg>,
  },
  {
    id: "earnings", label: "수익",
    icon: (a) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={a ? C.green : C.muted} strokeWidth="1.8" strokeLinecap="round"><path d="M11 2v1m0 16v1M5.7 5.7l.7.7M15.6 15.6l.7.7M2 11h1m16 0h1M5.7 16.3l.7-.7M15.6 6.4l.7-.7"/><circle cx="11" cy="11" r="4"/></svg>,
  },
  {
    id: "profile", label: "프로필",
    icon: (a) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={a ? C.green : C.muted} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="7" r="4"/><path d="M2 20c0-4 4-7 9-7s9 3 9 7"/></svg>,
  },
];

export const CBottomNav = ({ active, onTabChange }: { active: CourierTab; onTabChange?: (t: CourierTab) => void }) => (
  <div className="flex-shrink-0 flex items-center justify-around px-2 pt-2 pb-3"
    style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.border}` }}>
    {NAV_ITEMS.map(item => (
      <button key={item.id} onClick={() => onTabChange?.(item.id)}
        className="flex flex-col items-center gap-1 flex-1 py-1 transition-opacity active:opacity-70">
        {item.icon(active === item.id)}
        <span className="text-[10px] font-semibold" style={{ color: active === item.id ? C.green : C.muted }}>
          {item.label}
        </span>
      </button>
    ))}
  </div>
);

// ── Swipe-to-confirm ───────────────────────────────────────────────────────────
export const SwipeConfirm = ({
  label, onConfirm, color = C.green, disabled = false,
}: { label: string; onConfirm?: () => void; color?: string; disabled?: boolean }) => {
  const [state, setState] = useState<"idle" | "going" | "done">("idle");

  const trigger = () => {
    if (state !== "idle" || disabled) return;
    setState("going");
    setTimeout(() => {
      setState("done");
      onConfirm?.();
    }, 650);
  };

  return (
    <div onClick={trigger}
      className="relative h-16 rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{
        backgroundColor: state === "done" ? color : C.card,
        border: `1.5px solid ${state !== "idle" ? color : C.borderBright}`,
        opacity: disabled ? 0.4 : 1,
      }}>
      {/* Track fill */}
      <div className="absolute inset-0 transition-all duration-[650ms] rounded-2xl"
        style={{
          right: state === "idle" ? "calc(100% - 64px)" : "0%",
          backgroundColor: color,
          opacity: state === "done" ? 1 : 0.25,
        }} />
      {/* Thumb */}
      <div className="absolute top-2 bottom-2 w-12 rounded-xl flex items-center justify-center transition-all duration-[650ms]"
        style={{
          backgroundColor: color,
          left: state === "idle" ? "4px" : "calc(100% - 52px)",
          opacity: state === "done" ? 0 : 1,
        }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M8 11h6M11 8l3 3-3 3"/>
        </svg>
      </div>
      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center pl-16">
        <span className="font-bold text-base" style={{ color: state === "done" ? "white" : C.text }}>
          {state === "done" ? "✓ 완료!" : label}
        </span>
      </div>
    </div>
  );
};

// ── Dark route map ─────────────────────────────────────────────────────────────
export const DarkRouteMap = ({
  mode, height = 280,
}: { mode: "toRestaurant" | "toCustomer" | "overview"; height?: number }) => {
  // Key coordinates
  const rest = { x: 155, y: 195 };
  const cust = { x: 275, y: 118 };
  const courier = mode === "toRestaurant" ? { x: 72, y: 252 } : { x: 155, y: 195 };

  // Route path
  const routePath = mode === "toRestaurant"
    ? `M72,252 L72,195 L155,195`
    : mode === "toCustomer"
    ? `M155,195 L155,118 L275,118`
    : `M72,252 L72,195 L155,195 M155,195 L155,118 L275,118`;

  const routeColor = mode === "toRestaurant" ? C.green : C.blue;

  const vb = `0 0 390 ${height}`;

  return (
    <svg width="390" height={height} viewBox={vb} style={{ display: "block" }}>
      {/* Dark map ground */}
      <rect width="390" height={height} fill="#0A1A2F"/>

      {/* Grid roads - minor */}
      {[50,100,150,200,250,300,350].map(x => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2={height} stroke="#0F2240" strokeWidth="8"/>
      ))}
      {[50,100,150,200,250].map((y, i) => {
        if (y > height) return null;
        return <line key={`h${y}`} x1="0" y1={y} x2="390" y2={y} stroke="#0F2240" strokeWidth={i === 1 ? 14 : 8}/>;
      })}

      {/* Main arteries - brighter */}
      <line x1="0" y1="195" x2="390" y2="195" stroke="#132A45" strokeWidth="16"/>
      <line x1="155" y1="0" x2="155" y2={height} stroke="#132A45" strokeWidth="14"/>

      {/* Road labels */}
      <text x="10" y="190" fill="#1E4060" fontSize="9" fontFamily="'Noto Sans KR',sans-serif">이태원로</text>
      <text x="160" y="90" fill="#1E4060" fontSize="9" fontFamily="'Noto Sans KR',sans-serif">우사단로</text>

      {/* Buildings */}
      {[
        [10,10,55,40],[80,10,50,35],[170,10,60,40],[250,15,55,35],[325,10,55,40],
        [10,65,40,25],[60,65,55,30],[220,60,50,32],[310,65,45,30],
        [10,115,45,30],[230,110,55,35],[330,115,45,30],
        [10,220,55,35],[80,225,50,30],[230,222,55,32],[320,218,55,35],
        [10,265,50,30],[80,268,45,28],[230,268,50,28],[325,265,50,30],
      ].map(([x, y, w, h], i) => {
        if (y > height) return null;
        return <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#0C1E32" stroke="#142840" strokeWidth="0.5"/>;
      })}

      {/* Route glow */}
      <path d={routePath} fill="none" stroke={routeColor} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"/>
      {/* Route line */}
      <path d={routePath} fill="none" stroke={routeColor} strokeWidth="3.5"
        strokeDasharray={mode === "overview" ? "none" : "12 6"} strokeLinecap="round" strokeLinejoin="round"/>

      {/* Restaurant marker */}
      <circle cx={rest.x} cy={rest.y} r="18" fill={C.green} opacity="0.15"/>
      <circle cx={rest.x} cy={rest.y} r="11" fill={C.green}/>
      <text x={rest.x} y={rest.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">R</text>
      <text x={rest.x} y={rest.y - 22} textAnchor="middle" fill={C.green} fontSize="9" fontWeight="700"
        fontFamily="'Noto Sans KR',sans-serif">식당</text>

      {/* Customer marker */}
      {mode !== "toRestaurant" && (
        <g>
          <circle cx={cust.x} cy={cust.y} r="18" fill={C.blue} opacity="0.15"/>
          <circle cx={cust.x} cy={cust.y} r="11" fill={C.blue}/>
          <text x={cust.x} y={cust.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">C</text>
          <text x={cust.x} y={cust.y - 22} textAnchor="middle" fill={C.blue} fontSize="9" fontWeight="700"
            fontFamily="'Noto Sans KR',sans-serif">고객</text>
        </g>
      )}

      {/* Courier location */}
      <circle cx={courier.x} cy={courier.y} r="22" fill={C.greenGlow}/>
      <circle cx={courier.x} cy={courier.y} r="12" fill="white" stroke={C.green} strokeWidth="3"/>
      {/* Motorcycle icon simplified */}
      <circle cx={courier.x - 4} cy={courier.y} r="3" fill={C.green}/>
      <circle cx={courier.x + 4} cy={courier.y} r="3" fill={C.green}/>
      <path d={`M${courier.x - 3},${courier.y - 2} L${courier.x + 1},${courier.y - 4} L${courier.x + 4},${courier.y - 4}`}
        stroke={C.green} strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* ETA label */}
      {mode === "toRestaurant" && (
        <g>
          <rect x="80" y="258" width="60" height="18" rx="9" fill={C.green}/>
          <text x="110" y="271" textAnchor="middle" fill="white" fontSize="10" fontWeight="700"
            fontFamily="'JetBrains Mono',monospace">6분</text>
        </g>
      )}
      {mode === "toCustomer" && (
        <g>
          <rect x="160" y="200" width="65" height="18" rx="9" fill={C.blue}/>
          <text x="192" y="213" textAnchor="middle" fill="white" fontSize="10" fontWeight="700"
            fontFamily="'JetBrains Mono',monospace">12분</text>
        </g>
      )}
    </svg>
  );
};

// ── Earnings chip ──────────────────────────────────────────────────────────────
export const EarningsChip = ({ amount, size = "sm" }: { amount: number; size?: "sm" | "lg" }) => (
  <div className="inline-flex items-center gap-1 rounded-xl"
    style={{ backgroundColor: C.goldGlow, padding: size === "lg" ? "6px 12px" : "3px 8px" }}>
    <span className="font-mono font-bold tabular-nums" style={{
      color: C.gold,
      fontSize: size === "lg" ? "20px" : "13px",
    }}>
      ₩{amount.toLocaleString()}
    </span>
  </div>
);

// ── Section heading ─────────────────────────────────────────────────────────────
export const CSectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest px-5 pt-4 pb-1.5" style={{ color: C.dim }}>
    {children}
  </p>
);

// ── Row with right chevron ─────────────────────────────────────────────────────
export const CRow = ({
  icon, label, value, danger = false, onClick,
}: { icon: React.ReactNode; label: string; value?: string; danger?: boolean; onClick?: () => void }) => (
  <button onClick={onClick}
    className="w-full flex items-center gap-4 px-5 py-4 transition-colors active:opacity-70"
    style={{ borderBottom: `1px solid ${C.border}` }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: danger ? C.dangerGlow : C.cardAlt }}>
      {icon}
    </div>
    <span className="flex-1 text-left font-medium text-sm" style={{ color: danger ? C.danger : C.text }}>{label}</span>
    {value && <span className="text-sm font-semibold" style={{ color: C.muted }}>{value}</span>}
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.dim} strokeWidth="2" strokeLinecap="round">
      <path d="M6 4l4 4-4 4"/>
    </svg>
  </button>
);

// ── Large toggle ───────────────────────────────────────────────────────────────
export const CLargeToggle = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label?: string }) => (
  <div className="flex items-center gap-3">
    {label && <span className="font-medium text-sm flex-1" style={{ color: C.text }}>{label}</span>}
    <div onClick={onToggle}
      className="w-16 h-8 rounded-full cursor-pointer transition-all relative"
      style={{ backgroundColor: on ? C.green : C.card, border: `1.5px solid ${on ? C.green : C.borderBright}` }}>
      <div className="absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all"
        style={{ left: on ? "calc(100% - 28px)" : "4px" }} />
    </div>
  </div>
);
