import React, { useState } from "react";

// ── Material Design 3 tokens ───────────────────────────────────────────────────
const M = {
  green:      "#1B6B4A",
  greenLight: "#E8F5ED",
  greenContainer: "#C8E6D0",
  gold:       "#C4883A",
  goldLight:  "#FEF3E2",
  surface:    "#FFFBFF",
  surfaceVar: "#F4F0F4",
  bg:         "#FAF8F2",
  outline:    "#79747E",
  outlineVar: "#CAC4D0",
  text:       "#1C1B1F",
  textMid:    "#49454F",
  muted:      "#79747E",
  radius:     12,   // Material 3 rounded corners
  radiusFull: 100,
};

// Material icons (path data)
const MIcon = ({ d, size = 22, color = M.muted }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d={d}/></svg>
);

const ICONS = {
  home:    "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  search:  "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  bag:     "M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z",
  mosque:  "M12 2L8 6H6l-2 2v2h2v10h3v-4h2v4h3V10h2V8l-2-2h-2L12 2zm0 2.4L14 6H10l2-1.6zM8 8h8v1H8V8z",
  person:  "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  notify:  "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  pin:     "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  chevron: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  star:    "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  prayer:  "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
  map:     "M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z",
};

const CATEGORIES = [
  { emoji: "🍖", label: "한식 할랄" },
  { emoji: "🥙", label: "터키" },
  { emoji: "🍽️", label: "우즈베크" },
  { emoji: "🍛", label: "인도" },
  { emoji: "🥗", label: "아랍" },
  { emoji: "🍜", label: "파키스탄" },
];

const RESTAURANTS = [
  { name: "신당 할랄 키친", rating: 4.8, reviews: 3241, dist: "2.3km", time: "25-35분", fee: "₩2,000", badge: "HALAL CERTIFIED", img: "1498654896293-37c98e7f5fe4" },
  { name: "이태원 케밥 하우스", rating: 4.6, reviews: 1820, dist: "0.8km", time: "15-25분", fee: "무료", badge: "HALAL CERTIFIED", img: "1529042410759-befb1204b468" },
];

const MOSQUES = [
  { name: "서울중앙성원", sub: "Seoul Central Mosque", dist: "1.2km", walk: "15분", prayer: "아스르 14:32" },
  { name: "이태원 마스지드", sub: "Itaewon Masjid", dist: "0.3km", walk: "4분", prayer: "아스르 14:35" },
];

// ── Android Status Bar ────────────────────────────────────────────────────────
const AndroidStatusBar = ({ light = false }: { light?: boolean }) => {
  const c = light ? "rgba(255,255,255,0.9)" : M.textMid;
  return (
    <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: light ? "white" : M.text, fontFamily: "system-ui, sans-serif" }}>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {/* Signal */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill={c}>
          <rect x="0" y="6" width="3" height="6" rx="1"/>
          <rect x="4" y="4" width="3" height="8" rx="1"/>
          <rect x="8" y="2" width="3" height="10" rx="1"/>
          <rect x="12" y="0" width="3" height="12" rx="1"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill={c}>
          <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" opacity="1"/>
          <path d="M8 6C5.8 6 3.8 6.9 2.4 8.4l1.6 1.6C5.1 8.8 6.4 8 8 8s2.9.8 4 2l1.6-1.6C12.2 6.9 10.2 6 8 6z" opacity="0.8"/>
          <path d="M8 2.5C4.5 2.5 1.4 4 0 6.4l1.6 1.6C3 5.6 5.3 4.5 8 4.5s5 1.1 6.4 3.5L16 6.4C14.6 4 11.5 2.5 8 2.5z" opacity="0.5"/>
        </svg>
        {/* Battery */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div style={{ width: 22, height: 11, border: `1.5px solid ${c}`, borderRadius: 3, padding: 1.5, position: "relative" }}>
            <div style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", width: 2, height: 5, backgroundColor: c, borderRadius: 1 }} />
            <div style={{ width: "75%", height: "100%", backgroundColor: c, borderRadius: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Material 3 Bottom Navigation ──────────────────────────────────────────────
const M3BottomNav = ({ active, onTabChange }: { active: number; onTabChange: (i: number) => void }) => {
  const tabs = [
    { icon: ICONS.home, label: "홈" },
    { icon: ICONS.search, label: "검색" },
    { icon: ICONS.bag, label: "주문" },
    { icon: ICONS.mosque, label: "기도" },
    { icon: ICONS.person, label: "프로필" },
  ];
  return (
    <div style={{ height: 72, backgroundColor: M.surface, borderTop: `1px solid ${M.outlineVar}`, display: "flex", alignItems: "center", flexShrink: 0 }}>
      {tabs.map((tab, i) => {
        const isActive = i === active;
        return (
          <button key={i} onClick={() => onTabChange(i)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 12, background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ width: isActive ? 56 : 40, height: 28, borderRadius: 14, backgroundColor: isActive ? M.greenContainer : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              <MIcon d={tab.icon} size={20} color={isActive ? M.green : M.muted} />
            </div>
            <span style={{ fontSize: 11, color: isActive ? M.green : M.muted, fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomeAndroid() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ width: 360, height: 800, backgroundColor: M.bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Noto Sans KR', 'Inter', sans-serif" }}>

      {/* Status bar — on green header */}
      <div style={{ backgroundColor: M.green }}>
        <AndroidStatusBar light />
      </div>

      {/* Header */}
      <div style={{ backgroundColor: M.green, padding: "4px 16px 16px", position: "relative", overflow: "hidden" }}>
        {/* Subtle pattern */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
          <svg width="100%" height="100%"><defs><pattern id="and-geo" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><g transform="translate(14,14)" stroke="white" strokeWidth="0.7" fill="none"><rect x="-7" y="-7" width="14" height="14"/><rect x="-7" y="-7" width="14" height="14" transform="rotate(45)"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#and-geo)"/></svg>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MIcon d={ICONS.pin} size={16} color="rgba(255,255,255,0.8)" />
            <div>
              <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>이태원동</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>, 용산구</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M7 10l5 5 5-5z"/></svg>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MIcon d={ICONS.notify} size={18} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }} className="scrollbar-hide">

        {/* Prayer time banner — Material card */}
        <div style={{ margin: "12px 12px 0", borderRadius: M.radius, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(135deg, ${M.green} 0%, #14503A 100%)`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MIcon d={ICONS.prayer} size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 500, marginBottom: 1 }}>다음 기도</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "white" }}>아스르 Asr</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <div style={{ flex: 1, height: 3, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 99 }}>
                  <div style={{ width: "62%", height: "100%", backgroundColor: M.gold, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 11, color: M.gold, fontWeight: 600 }}>14:32</span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>2시간 후</span>
          </div>
        </div>

        {/* Search bar — Material 3 */}
        <div style={{ margin: "10px 12px 0" }}>
          <div style={{ height: 44, backgroundColor: M.surfaceVar, borderRadius: 22, display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
            <MIcon d={ICONS.search} size={18} color={M.muted} />
            <span style={{ fontSize: 13, color: M.muted }}>할랄 음식, 레스토랑 검색...</span>
            <div style={{ marginLeft: "auto" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={M.muted}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/></svg>
            </div>
          </div>
        </div>

        {/* Category chips — Material 3 Filter Chips */}
        <div style={{ overflowX: "auto", padding: "10px 12px 0", display: "flex", gap: 7 }} className="scrollbar-hide">
          {CATEGORIES.map((cat, i) => {
            const isActive = i === activeCategory;
            return (
              <button key={i} onClick={() => setActiveCategory(i)}
                style={{ flexShrink: 0, height: 32, padding: "0 12px", borderRadius: 8, border: `1px solid ${isActive ? "transparent" : M.outlineVar}`, backgroundColor: isActive ? M.greenContainer : "transparent", display: "flex", alignItems: "center", gap: 5, cursor: "pointer", transition: "all 0.15s" }}>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={M.green}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                )}
                <span style={{ fontSize: 11, fontWeight: 500, color: isActive ? M.green : M.textMid, whiteSpace: "nowrap" }}>{cat.emoji} {cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section: Popular restaurants */}
        <div style={{ padding: "14px 12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: M.text }}>🔥 인기 할랄 식당</span>
            <button style={{ display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
              <span style={{ fontSize: 12, color: M.green, fontWeight: 600 }}>더보기</span>
              <MIcon d={ICONS.chevron} size={14} color={M.green} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }} className="scrollbar-hide">
            {RESTAURANTS.map((r, i) => (
              <div key={i} style={{ width: 200, flexShrink: 0, backgroundColor: M.surface, borderRadius: M.radius, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)" }}>
                {/* Photo */}
                <div style={{ height: 110, backgroundColor: "#D4D0C8", overflow: "hidden", position: "relative" }}>
                  <img src={`https://images.unsplash.com/photo-${r.img}?w=200&h=110&fit=crop&auto=format&q=80`} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {/* Delivery time chip */}
                  <div style={{ position: "absolute", bottom: 6, left: 6, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 4, padding: "2px 6px" }}>
                    <span style={{ fontSize: 10, color: "white", fontWeight: 500 }}>{r.time}</span>
                  </div>
                </div>
                <div style={{ padding: "8px 10px 10px" }}>
                  {/* Halal badge */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 3, backgroundColor: M.greenLight, borderRadius: 4, padding: "2px 6px", marginBottom: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: 99, backgroundColor: M.green }} />
                    <span style={{ fontSize: 9, color: M.green, fontWeight: 700, letterSpacing: "0.05em" }}>{r.badge}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: M.text, marginBottom: 4 }}>{r.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <MIcon d={ICONS.star} size={12} color={M.gold} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: M.text }}>{r.rating}</span>
                    <span style={{ fontSize: 10, color: M.muted }}>({r.reviews.toLocaleString()})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, color: M.muted }}>📍 {r.dist}</span>
                    <span style={{ fontSize: 10, color: M.muted }}>•</span>
                    <span style={{ fontSize: 10, color: M.muted }}>배달비 {r.fee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Nearby Mosques */}
        <div style={{ padding: "14px 12px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: M.text }}>🕌 근처 모스크</span>
            <button style={{ display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
              <span style={{ fontSize: 12, color: M.green, fontWeight: 600 }}>지도 보기</span>
              <MIcon d={ICONS.chevron} size={14} color={M.green} />
            </button>
          </div>
          {MOSQUES.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", backgroundColor: M.surface, borderRadius: M.radius, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: M.goldLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MIcon d={ICONS.mosque} size={20} color={M.gold} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: M.text }}>{m.name}</p>
                <p style={{ fontSize: 11, color: M.muted, marginTop: 1 }}>{m.sub}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <span style={{ fontSize: 10, color: M.muted }}>📍 {m.dist} · 도보 {m.walk}</span>
                </div>
              </div>
              <div style={{ backgroundColor: M.greenLight, padding: "4px 8px", borderRadius: 8 }}>
                <span style={{ fontSize: 10, color: M.green, fontWeight: 600 }}>{m.prayer}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Promo banner */}
        <div style={{ margin: "0 12px 16px", borderRadius: M.radius, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(135deg, ${M.gold} 0%, #a66b20 100%)`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>첫 주문 특별 혜택</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "white", marginTop: 2 }}>₩3,000 할인 쿠폰</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7H5v2h2V7z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Material 3 Bottom Navigation */}
      <M3BottomNav active={activeTab} onTabChange={setActiveTab} />

      {/* Android gesture bar */}
      <div style={{ height: 20, backgroundColor: M.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 120, height: 4, borderRadius: 99, backgroundColor: M.outlineVar }} />
      </div>
    </div>
  );
}
