import React from "react";
import { useLanguage } from "../i18n/LanguageContext";

// ── Geometric Pattern ────────────────────────────────────────────────────────
export const GeometricPattern = ({
  color = "currentColor",
  opacity = 0.05,
  className = "",
}: {
  color?: string;
  opacity?: number;
  className?: string;
}) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="geo-pat" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
        {/* 8-point star: two overlapping rotated squares */}
        <g transform="translate(24,24)" stroke={color} strokeWidth="0.9" fill="none" opacity={opacity}>
          <rect x="-10" y="-10" width="20" height="20" />
          <rect x="-10" y="-10" width="20" height="20" transform="rotate(45)" />
          <circle r="4" />
          <line x1="-24" y1="0" x2="-14" y2="0" />
          <line x1="14" y1="0" x2="24" y2="0" />
          <line x1="0" y1="-24" x2="0" y2="-14" />
          <line x1="0" y1="14" x2="0" y2="24" />
        </g>
        <g transform="translate(0,0)" stroke={color} strokeWidth="0.5" fill="none" opacity={opacity * 0.6}>
          <circle cx="0" cy="0" r="2.5" />
          <circle cx="48" cy="0" r="2.5" />
          <circle cx="0" cy="48" r="2.5" />
          <circle cx="48" cy="48" r="2.5" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#geo-pat)" />
  </svg>
);

// ── Status Bar ───────────────────────────────────────────────────────────────
export const StatusBar = ({ dark = false }: { dark?: boolean }) => {
  const c = dark ? "text-white" : "text-[#1A1A18]";
  return (
    <div className={`flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold ${c} flex-shrink-0`}>
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="6" width="3" height="6" rx="0.5" opacity="0.4"/>
          <rect x="4.5" y="4" width="3" height="8" rx="0.5" opacity="0.6"/>
          <rect x="9" y="1.5" width="3" height="10.5" rx="0.5"/>
          <rect x="13.5" y="0" width="2.5" height="12" rx="0.5"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.5C10.5 2.5 12.7 3.5 14.2 5.2L15.5 3.8C13.6 1.8 11 0.5 8 0.5C5 0.5 2.4 1.8 0.5 3.8L1.8 5.2C3.3 3.5 5.5 2.5 8 2.5Z" opacity="0.4"/>
          <path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.6 5.4C12.1 4 10.1 3 8 3C5.9 3 3.9 4 2.4 5.4L3.7 6.8C4.8 5.7 6.3 5 8 5Z" opacity="0.7"/>
          <path d="M8 7.5C9 7.5 9.9 7.9 10.5 8.6L11.8 7.2C10.8 6.2 9.5 5.5 8 5.5C6.5 5.5 5.2 6.2 4.2 7.2L5.5 8.6C6.1 7.9 7 7.5 8 7.5Z"/>
          <circle cx="8" cy="11" r="1.5"/>
        </svg>
        <div className="flex items-center gap-0.5">
          <div className={`w-6 h-3 rounded-sm border ${dark ? "border-white/60" : "border-[#1A1A18]/60"} relative`}>
            <div className="absolute inset-0.5 rounded-sm bg-current" style={{ width: "75%" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Bottom Navigation ────────────────────────────────────────────────────────
type TabId = "home" | "search" | "orders" | "prayer" | "profile";

const tabs: { id: TabId; key: string; icon: (filled: boolean) => React.ReactNode }[] = [
  {
    id: "home",
    key: "common.nav_home",
    icon: (f) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={f ? "var(--green)" : "none"} stroke={f ? "var(--green)" : "var(--muted)"} strokeWidth="1.8">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "search",
    key: "common.nav_search",
    icon: (f) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={f ? "var(--green)" : "var(--muted)"} strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" fill={f ? "var(--green-light)" : "none"}/>
        <path d="M16.5 16.5L21 21" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "orders",
    key: "common.nav_orders",
    icon: (f) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={f ? "var(--green)" : "none"} stroke={f ? "var(--green)" : "var(--muted)"} strokeWidth="1.8">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "prayer",
    key: "common.nav_prayer",
    icon: (f) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={f ? "var(--green)" : "none"} stroke={f ? "var(--green)" : "var(--muted)"} strokeWidth="1.8">
        <path d="M12 3C9 3 6.5 5.5 6.5 8.5C6.5 12 9.5 14.5 12 17C14.5 14.5 17.5 12 17.5 8.5C17.5 5.5 15 3 12 3Z"/>
        <path d="M9 8.5C9 7 10.3 5.5 12 5.5" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round"/>
        <line x1="9" y1="21" x2="15" y2="21" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "profile",
    key: "common.nav_profile",
    icon: (f) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={f ? "var(--green)" : "none"} stroke={f ? "var(--green)" : "var(--muted)"} strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" fill={f ? "var(--green-light)" : "none"}/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export const BottomNav = ({
  active,
  onTabChange,
}: {
  active: TabId;
  onTabChange?: (id: TabId) => void;
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center border-t border-[#E8E6E1] bg-white px-1 pt-2 pb-5 flex-shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange?.(tab.id)}
          className="flex flex-col items-center gap-0.5 flex-1 py-0.5 transition-opacity active:opacity-70"
        >
          {tab.icon(active === tab.id)}
          <span
            className="text-[10px] font-medium"
            style={{ color: active === tab.id ? "var(--green)" : "var(--muted)" }}
          >
            {t(tab.key)}
          </span>
          {active === tab.id && (
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--green)" }} />
          )}
        </button>
      ))}
    </div>
  );
};

// ── Halal Badge ──────────────────────────────────────────────────────────────
type BadgeVariant = "certified" | "owned" | "friendly";
const badgeConfig: Record<BadgeVariant, { key: string; bg: string; text: string; border: string }> = {
  certified: { key: "common.halal_certified", bg: "#E8F3ED", text: "#1B6B4A", border: "#1B6B4A" },
  owned: { key: "common.muslim_owned", bg: "#FDF3E4", text: "#8A5E1A", border: "#C4883A" },
  friendly: { key: "common.halal_friendly", bg: "#EEF4FF", text: "#2C5ECC", border: "#2C5ECC" },
};

export const HalalBadge = ({ variant = "certified" }: { variant?: BadgeVariant }) => {
  const { t } = useLanguage();
  const cfg = badgeConfig[variant];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border + "60" }}
    >
      <svg width="8" height="10" viewBox="0 0 8 10" fill={cfg.text}>
        <path d="M4 0L7.5 1.5V5C7.5 7.2 6 9 4 10C2 9 0.5 7.2 0.5 5V1.5L4 0Z"/>
      </svg>
      {t(cfg.key)}
    </span>
  );
};

// ── Star Rating ──────────────────────────────────────────────────────────────
export const StarRating = ({ rating, count }: { rating: number; count?: number }) => (
  <div className="flex items-center gap-1">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="#C4883A">
      <path d="M6 1l1.5 3 3.5.5-2.5 2.5.6 3.5L6 9 2.9 10.5l.6-3.5L1 4.5 4.5 4z"/>
    </svg>
    <span className="text-sm font-semibold text-[#1A1A18]">{rating}</span>
    {count && <span className="text-xs text-[#6B7280]">({count.toLocaleString()})</span>}
  </div>
);

// ── Restaurant Card (vertical, for carousels) ────────────────────────────────
export const RestaurantCardV = ({
  name,
  imageId,
  badge,
  rating,
  count,
  distance,
  eta,
  fee,
  onClick,
}: {
  name: string;
  imageId: string;
  badge?: BadgeVariant;
  rating: number;
  count?: number;
  distance: string;
  eta: string;
  fee: string;
  onClick?: () => void;
}) => (
  <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0 w-52 cursor-pointer active:scale-[0.98] transition-transform">
    <div className="relative h-32 bg-[#E8E6E1]">
      <img
        src={`https://images.unsplash.com/photo-${imageId}?w=300&h=200&fit=crop&auto=format&q=80`}
        alt={name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-3 space-y-1.5">
      <p className="font-semibold text-sm text-[#1A1A18] leading-tight">{name}</p>
      {badge && <HalalBadge variant={badge} />}
      <StarRating rating={rating} count={count} />
      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
        <span>📍 {distance}</span>
        <span>·</span>
        <span>⏱ {eta}</span>
        <span>·</span>
        <span>{fee}</span>
      </div>
    </div>
  </div>
);

// ── Restaurant Card (horizontal, for list) ───────────────────────────────────
export const RestaurantCardH = ({
  name,
  imageId,
  badge,
  rating,
  count,
  distance,
  eta,
  fee,
  cuisine,
  onClick,
}: {
  name: string;
  imageId: string;
  badge?: BadgeVariant;
  rating: number;
  count?: number;
  distance: string;
  eta: string;
  fee: string;
  cuisine?: string;
  onClick?: () => void;
}) => (
  <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-stretch cursor-pointer active:scale-[0.98] transition-transform">
    <div className="w-24 h-24 flex-shrink-0 bg-[#E8E6E1]">
      <img
        src={`https://images.unsplash.com/photo-${imageId}?w=200&h=200&fit=crop&auto=format&q=80`}
        alt={name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-3 flex-1 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-[#1A1A18] leading-tight">{name}</p>
        {cuisine && <span className="text-[10px] text-[#6B7280] bg-[#F5F3EF] px-2 py-0.5 rounded-full flex-shrink-0">{cuisine}</span>}
      </div>
      {badge && <HalalBadge variant={badge} />}
      <StarRating rating={rating} count={count} />
      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
        <span>{distance}</span>
        <span>·</span>
        <span>{eta}</span>
        <span>·</span>
        <span>{fee}</span>
      </div>
    </div>
  </div>
);

// ── Mosque Card ──────────────────────────────────────────────────────────────
export const MosqueCard = ({
  name,
  nameKo,
  distance,
  nextPrayer,
  walkTime,
  onClick,
}: {
  name: string;
  nameKo?: string;
  distance: string;
  nextPrayer: string;
  walkTime: string;
  onClick?: () => void;
}) => (
  <div onClick={onClick} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: "var(--gold-light)" }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6">
        <path d="M12 2C9 2 7 4 7 6.5C7 9.5 9.5 11.5 12 14C14.5 11.5 17 9.5 17 6.5C17 4 15 2 12 2Z"/>
        <path d="M8 6C8 4.5 9.8 3 12 3" strokeLinecap="round"/>
        <line x1="12" y1="14" x2="12" y2="22" strokeLinecap="round" strokeWidth="1.5"/>
        <line x1="5" y1="22" x2="19" y2="22" strokeLinecap="round" strokeWidth="1.5"/>
        <line x1="5" y1="18" x2="8" y2="18" strokeLinecap="round" strokeWidth="1.5"/>
        <line x1="16" y1="18" x2="19" y2="18" strokeLinecap="round" strokeWidth="1.5"/>
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-[#1A1A18] truncate">{name}</p>
      {nameKo && <p className="text-xs text-[#6B7280]">{nameKo}</p>}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-[#6B7280]">📍 {distance}</span>
        <span className="text-xs text-[#6B7280]">·</span>
        <span className="text-xs text-[#6B7280]">🚶 {walkTime}</span>
      </div>
    </div>
    <div
      className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
      style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}
    >
      {nextPrayer}
    </div>
  </div>
);

// ── Order Status Chip ────────────────────────────────────────────────────────
type OrderStatus = "pending" | "preparing" | "delivering" | "delivered" | "cancelled";
const statusConfig: Record<OrderStatus, { key: string; bg: string; text: string }> = {
  pending: { key: "common.status_pending", bg: "#FEF3C7", text: "#92400E" },
  preparing: { key: "common.status_preparing", bg: "#DBEAFE", text: "#1E40AF" },
  delivering: { key: "common.status_delivering", bg: "#EDE9FE", text: "#5B21B6" },
  delivered: { key: "common.status_delivered", bg: "#D1FAE5", text: "#065F46" },
  cancelled: { key: "common.status_cancelled", bg: "#FEE2E2", text: "#991B1B" },
};

export const OrderStatusChip = ({ status }: { status: OrderStatus }) => {
  const { t } = useLanguage();
  const cfg = statusConfig[status];
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {t(cfg.key)}
    </span>
  );
};

// ── Section Header ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) => (
  <div className="flex items-center justify-between px-4 mb-3">
    <h3 className="font-bold text-base text-[#1A1A18]">{title}</h3>
    {action && (
      <button onClick={onAction} className="text-sm font-medium" style={{ color: "var(--green)" }}>
        {action} →
      </button>
    )}
  </div>
);

// ── Price Tag ─────────────────────────────────────────────────────────────────
export const PriceTag = ({ amount, className = "" }: { amount: number; className?: string }) => (
  <span className={`font-bold text-[#1A1A18] ${className}`}>
    ₩{amount.toLocaleString()}
  </span>
);

// ── Toggle ────────────────────────────────────────────────────────────────────
export const Toggle = ({ on, onToggle }: { on: boolean; onToggle?: () => void }) => (
  <button
    onClick={onToggle}
    className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
    style={{ backgroundColor: on ? "var(--green)" : "#D1D5DB" }}
  >
    <span
      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
      style={{ transform: on ? "translateX(26px)" : "translateX(2px)" }}
    />
  </button>
);

// ── Back Button ────────────────────────────────────────────────────────────────
export const BackButton = ({ onBack, dark = false }: { onBack?: () => void; dark?: boolean }) => (
  <button
    onClick={onBack}
    className="w-9 h-9 rounded-full flex items-center justify-center"
    style={{ backgroundColor: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)" }}
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={dark ? "white" : "#1A1A18"} strokeWidth="1.8" strokeLinecap="round">
      <path d="M13 5L8 10L13 15"/>
    </svg>
  </button>
);

// ── Map Pin ────────────────────────────────────────────────────────────────────
export const MapPin = ({ type }: { type: "restaurant" | "mosque" | "user" }) => {
  if (type === "user") {
    return (
      <div className="relative flex items-center justify-center w-8 h-8">
        <div
          className="absolute w-8 h-8 rounded-full animate-pulse-ring"
          style={{ backgroundColor: "rgba(44,123,229,0.3)" }}
        />
        <div
          className="w-4 h-4 rounded-full border-2 border-white shadow"
          style={{ backgroundColor: "var(--info)" }}
        />
      </div>
    );
  }
  const color = type === "restaurant" ? "var(--green)" : "var(--gold)";
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        {type === "restaurant" ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M5 1v4M7 1v4M9 1v4M5 5c0 2 1.5 3 2 3s2-1 2-3"/>
            <line x1="7" y1="8" x2="7" y2="13"/>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
            <path d="M6 1C4 1 2.5 2.8 2.5 4.5C2.5 7 5 8.5 6 10C7 8.5 9.5 7 9.5 4.5C9.5 2.8 8 1 6 1Z"/>
            <path d="M4 4C4 3 4.8 2 6 2" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: color }} />
    </div>
  );
};

// ── Floating Label Input ──────────────────────────────────────────────────────
export const FloatingInput = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  icon,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ReactNode;
}) => (
  <div className="relative">
    <div
      className={`relative border rounded-xl px-4 pt-5 pb-2 bg-white transition-all ${
        error ? "border-[#D94F4F]" : "border-[#E8E6E1] focus-within:border-[#1B6B4A]"
      }`}
    >
      <label
        className={`absolute left-4 text-xs font-medium transition-all ${
          error ? "text-[#D94F4F]" : "text-[#1B6B4A]"
        }`}
        style={{ top: "8px" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-[#1A1A18] outline-none placeholder:text-[#9CA3AF]"
      />
      {icon && <div className="absolute right-4 top-1/2 -translate-y-1/2">{icon}</div>}
    </div>
    {error && <p className="mt-1 text-xs text-[#D94F4F] px-1">{error}</p>}
  </div>
);

export type { TabId, OrderStatus };
