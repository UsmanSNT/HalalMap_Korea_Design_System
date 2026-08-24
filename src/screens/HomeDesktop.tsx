import React, { useState } from "react";

const G = {
  green:      "#1B6B4A",
  greenDark:  "#14503A",
  greenLight: "#E8F5ED",
  greenMid:   "#2A8A60",
  gold:       "#C4883A",
  goldLight:  "#FEF3E2",
  cream:      "#FAF8F2",
  surface:    "#FFFFFF",
  bg:         "#F4F1EB",
  border:     "#E5E2DC",
  borderLight:"#EDE9E3",
  text:       "#1A1A18",
  textMid:    "#4A4A48",
  muted:      "#8A8A88",
  dim:        "#ABABAB",
};

const LANGUAGES = [
  { id: "ko", flag: "🇰🇷", label: "KO" },
  { id: "en", flag: "🇺🇸", label: "EN" },
  { id: "uz", flag: "🇺🇿", label: "UZ" },
  { id: "ru", flag: "🇷🇺", label: "RU" },
];

const CATEGORIES = [
  { emoji: "🍖", label: "한식 할랄" },
  { emoji: "🥙", label: "터키" },
  { emoji: "🍽️", label: "우즈베크" },
  { emoji: "🍛", label: "인도" },
  { emoji: "🥗", label: "아랍" },
  { emoji: "🍜", label: "파키스탄" },
  { emoji: "🍲", label: "인도네시아" },
  { emoji: "🔍", label: "할랄 스캐너" },
];

const RESTAURANTS = [
  { name: "신당 할랄 키친", badge: "HALAL CERTIFIED", rating: 4.8, reviews: 3241, dist: "2.3km", time: "25–35분", fee: "₩2,000", priceRange: "₩₩", img: "1498654896293-37c98e7f5fe4", category: "한식" },
  { name: "이태원 케밥 하우스", badge: "HALAL CERTIFIED", rating: 4.6, reviews: 1820, dist: "0.8km", time: "15–25분", fee: "무료", priceRange: "₩₩", img: "1529042410759-befb1204b468", category: "터키" },
  { name: "마스지드 서울 카페", badge: "MUSLIM-OWNED", rating: 4.9, reviews: 947, dist: "1.1km", time: "20–30분", fee: "무료", priceRange: "₩", img: "1414235077428-338989a2e8c0", category: "카페" },
  { name: "우즈베키스탄 플로프", badge: "HALAL CERTIFIED", rating: 4.7, reviews: 612, dist: "3.1km", time: "30–40분", fee: "₩1,500", priceRange: "₩₩", img: "1565557623262-b51ff2a27b73", category: "우즈베크" },
  { name: "델리 스파이스 코리아", badge: "HALAL FRIENDLY", rating: 4.3, reviews: 389, dist: "4.2km", time: "35–45분", fee: "₩2,500", priceRange: "₩₩₩", img: "1414235077428-338989a2e8c0", category: "인도" },
  { name: "자카르타 나시고렝", badge: "HALAL CERTIFIED", rating: 4.5, reviews: 284, dist: "2.8km", time: "30–40분", fee: "₩2,000", priceRange: "₩₩", img: "1498654896293-37c98e7f5fe4", category: "인도네시아" },
];

const PRAYER_TIMES = [
  { name: "파즈르", time: "04:47", passed: true },
  { name: "두흐르", time: "12:15", passed: true },
  { name: "아스르", time: "14:32", passed: false, next: true },
  { name: "마그립", time: "17:48", passed: false },
  { name: "이샤",   time: "19:21", passed: false },
];

// ── Top Navigation Bar ────────────────────────────────────────────────────────
function TopNav({ lang, setLang }: { lang: string; setLang: (l: string) => void }) {
  const [showLang, setShowLang] = useState(false);
  return (
    <div style={{ height: 64, backgroundColor: G.surface, borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", padding: "0 32px", gap: 20, flexShrink: 0, position: "sticky", top: 0, zIndex: 20 }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: G.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.8 1.5 4 3.3 4 5.5C4 8.5 8 13 8 13S12 8.5 12 5.5C12 3.3 10.2 1.5 8 1.5ZM8 7C7.2 7 6.5 6.3 6.5 5.5S7.2 4 8 4s1.5.7 1.5 1.5S8.8 7 8 7Z" fill="white"/></svg>
        </div>
        <div>
          <span style={{ fontSize: 14, fontWeight: 800, color: G.text, letterSpacing: "-0.01em" }}>HalalMap</span>
          <span style={{ fontSize: 10, color: G.muted, display: "block", lineHeight: 1 }}>Korea</span>
        </div>
        <span style={{ fontSize: 18, color: G.gold, fontFamily: "serif", fontWeight: 700 }}>حلال</span>
      </div>

      {/* Search bar — wide center */}
      <div style={{ flex: 1, maxWidth: 500, position: "relative" }}>
        <div style={{ height: 40, backgroundColor: G.bg, border: `1.5px solid ${G.border}`, borderRadius: 20, display: "flex", alignItems: "center", padding: "0 14px", gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ fontSize: 13, color: G.dim }}>할랄 음식, 레스토랑, 모스크 검색...</span>
          <div style={{ marginLeft: "auto", width: 1, height: 20, backgroundColor: G.border }} />
          <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ fontSize: 12, color: G.textMid }}>이태원동</span>
          </div>
        </div>
      </div>

      {/* Prayer time indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", backgroundColor: G.greenLight, borderRadius: 10, flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: G.green, animation: "pulse 2s infinite" }} />
        <div>
          <p style={{ fontSize: 10, color: G.green, fontWeight: 600 }}>다음 기도 · 아스르</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: G.greenDark }}>14:32 · 2시간 후</p>
        </div>
      </div>

      {/* Bell */}
      <button style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: G.bg, border: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, position: "relative" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.textMid} strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <div style={{ position: "absolute", top: 6, right: 7, width: 6, height: 6, borderRadius: 99, backgroundColor: "#E53E3E", border: "2px solid white" }} />
      </button>

      {/* Language dropdown */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button onClick={() => setShowLang(!showLang)}
          style={{ height: 34, padding: "0 10px", border: `1px solid ${G.border}`, borderRadius: 8, backgroundColor: G.surface, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: G.textMid, fontWeight: 600 }}>
          {LANGUAGES.find(l => l.id === lang)?.flag} {LANGUAGES.find(l => l.id === lang)?.label}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={G.muted} strokeWidth="1.5" strokeLinecap="round"><path d="M2 4l3 3 3-3"/></svg>
        </button>
        {showLang && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, width: 140, backgroundColor: G.surface, borderRadius: 10, border: `1px solid ${G.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden" }}>
            {LANGUAGES.map(l => (
              <button key={l.id} onClick={() => { setLang(l.id); setShowLang(false); }}
                style={{ width: "100%", padding: "9px 12px", display: "flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer", backgroundColor: l.id === lang ? G.greenLight : "transparent", fontSize: 12, color: l.id === lang ? G.green : G.textMid, fontWeight: l.id === lang ? 600 : 400 }}>
                <span>{l.flag}</span><span>{l.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: G.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>김</span>
      </div>
    </div>
  );
}

// ── Restaurant Card ───────────────────────────────────────────────────────────
function RestaurantCard({ r }: { r: typeof RESTAURANTS[0] }) {
  const [hovered, setHovered] = useState(false);
  const badgeColor = r.badge === "HALAL CERTIFIED" ? G.green : r.badge === "MUSLIM-OWNED" ? G.gold : "#6B8F71";
  const badgeBg = r.badge === "HALAL CERTIFIED" ? G.greenLight : r.badge === "MUSLIM-OWNED" ? G.goldLight : "#EEF5EF";
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: G.surface, borderRadius: 14, overflow: "hidden", border: `1px solid ${G.borderLight}`, cursor: "pointer", transition: "transform 0.18s, box-shadow 0.18s", transform: hovered ? "translateY(-3px)" : "none", boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
      {/* Photo */}
      <div style={{ height: 140, position: "relative", backgroundColor: "#D9D5CE", overflow: "hidden" }}>
        <img src={`https://images.unsplash.com/photo-${r.img}?w=300&h=140&fit=crop&auto=format&q=80`} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)" }} />
        {/* Delivery time */}
        <div style={{ position: "absolute", bottom: 8, left: 8, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 6, padding: "3px 7px" }}>
          <span style={{ fontSize: 10, color: "white", fontWeight: 600 }}>⏱ {r.time}</span>
        </div>
        {/* Fav button */}
        <div style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 3, backgroundColor: badgeBg, borderRadius: 5, padding: "2px 7px", marginBottom: 5 }}>
          <div style={{ width: 4, height: 4, borderRadius: 99, backgroundColor: badgeColor }} />
          <span style={{ fontSize: 9, color: badgeColor, fontWeight: 700, letterSpacing: "0.05em" }}>{r.badge}</span>
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: G.text, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill={G.gold}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: G.text }}>{r.rating}</span>
          <span style={{ fontSize: 10, color: G.muted }}>({r.reviews.toLocaleString()})</span>
          <span style={{ fontSize: 10, color: G.dim }}>· {r.category}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: G.muted }}>📍 {r.dist} · 배달비 {r.fee}</span>
          <span style={{ fontSize: 11, color: G.muted, fontWeight: 600 }}>{r.priceRange}</span>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar: Map preview ──────────────────────────────────────────────────────
function MapPreview() {
  return (
    <div style={{ backgroundColor: G.surface, borderRadius: 14, border: `1px solid ${G.border}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${G.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: G.text }}>📍 주변 지도</span>
        <button style={{ fontSize: 11, color: G.green, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>전체 보기</button>
      </div>
      {/* SVG Fake map */}
      <div style={{ height: 160, position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="160" viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="160" fill="#E8E4DB"/>
          {/* Roads */}
          <line x1="0" y1="80" x2="320" y2="80" stroke="#D4CFBF" strokeWidth="10"/>
          <line x1="160" y1="0" x2="160" y2="160" stroke="#D4CFBF" strokeWidth="10"/>
          <line x1="0" y1="40" x2="320" y2="40" stroke="#DAD6CC" strokeWidth="5"/>
          <line x1="0" y1="120" x2="320" y2="120" stroke="#DAD6CC" strokeWidth="5"/>
          <line x1="80" y1="0" x2="80" y2="160" stroke="#DAD6CC" strokeWidth="5"/>
          <line x1="240" y1="0" x2="240" y2="160" stroke="#DAD6CC" strokeWidth="5"/>
          {/* Blocks */}
          <rect x="5" y="5" width="68" height="28" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="90" y="5" width="62" height="28" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="5" y="50" width="68" height="22" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="90" y="50" width="62" height="22" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="170" y="5" width="62" height="28" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="248" y="5" width="66" height="28" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="170" y="50" width="62" height="22" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="248" y="50" width="66" height="22" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="5" y="90" width="68" height="30" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="170" y="90" width="62" height="30" rx="3" fill="#D4CFBA" opacity="0.6"/>
          <rect x="248" y="90" width="66" height="30" rx="3" fill="#D4CFBA" opacity="0.6"/>
          {/* User location */}
          <circle cx="160" cy="80" r="10" fill="rgba(59,130,246,0.2)"/>
          <circle cx="160" cy="80" r="5" fill="#3B82F6"/>
          <circle cx="160" cy="80" r="2.5" fill="white"/>
          {/* Restaurant pins */}
          <circle cx="100" cy="55" r="7" fill={G.green}/>
          <text x="100" y="58.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">🍽</text>
          <circle cx="200" cy="95" r="7" fill={G.green}/>
          <text x="200" y="98.5" textAnchor="middle" fill="white" fontSize="8">🍽</text>
          <circle cx="65" cy="110" r="7" fill={G.green}/>
          <text x="65" y="113.5" textAnchor="middle" fill="white" fontSize="8">🍽</text>
          {/* Mosque pins */}
          <circle cx="255" cy="55" r="7" fill={G.gold}/>
          <text x="255" y="58.5" textAnchor="middle" fill="white" fontSize="8">🕌</text>
          <circle cx="130" cy="125" r="7" fill={G.gold}/>
          <text x="130" y="128.5" textAnchor="middle" fill="white" fontSize="8">🕌</text>
        </svg>
      </div>
      <div style={{ padding: "8px 14px 10px", display: "flex", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: G.green }} />
          <span style={{ fontSize: 10, color: G.muted }}>레스토랑 8</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: G.gold }} />
          <span style={{ fontSize: 10, color: G.muted }}>모스크 3</span>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar: Prayer times widget ──────────────────────────────────────────────
function PrayerWidget() {
  return (
    <div style={{ backgroundColor: G.surface, borderRadius: 14, border: `1px solid ${G.border}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", background: `linear-gradient(135deg, ${G.green} 0%, ${G.greenDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>오늘 기도 시간</p>
          <p style={{ fontSize: 12, color: "white", fontWeight: 700, marginTop: 1 }}>이태원동, 서울</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>다음 기도</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: G.gold }}>14:32</p>
        </div>
      </div>
      <div style={{ padding: "6px 0" }}>
        {PRAYER_TIMES.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 14px", backgroundColor: p.next ? G.greenLight : "transparent" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {p.next && <div style={{ width: 4, height: 4, borderRadius: 99, backgroundColor: G.green }} />}
              {!p.next && <div style={{ width: 4 }} />}
              <span style={{ fontSize: 12, color: p.passed ? G.dim : p.next ? G.green : G.textMid, fontWeight: p.next ? 700 : 500 }}>{p.name}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: p.next ? 700 : 500, color: p.passed ? G.dim : p.next ? G.green : G.text, fontFamily: "monospace" }}>{p.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sidebar: Qibla mini ───────────────────────────────────────────────────────
function QiblaMini() {
  return (
    <div style={{ backgroundColor: G.surface, borderRadius: 14, border: `1px solid ${G.border}`, padding: "14px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="24" fill="#1A2535" stroke={G.border} strokeWidth="1.5"/>
          {["N","E","S","W"].map((d, i) => {
            const angle = i * 90;
            const r = 18;
            const x = 26 + r * Math.sin(angle * Math.PI / 180);
            const y = 26 - r * Math.cos(angle * Math.PI / 180);
            return <text key={d} x={x} y={y + 4} textAnchor="middle" fill={d === "N" ? "#EF4444" : "rgba(255,255,255,0.5)"} fontSize="8" fontWeight="700">{d}</text>;
          })}
          {/* Needle pointing to qibla (~292°) */}
          <line x1="26" y1="26" x2="26" y2="8" stroke={G.gold} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="26" y1="26" x2="26" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="26" cy="26" r="3" fill={G.gold}/>
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: G.text }}>키블라 방향</p>
        <p style={{ fontSize: 11, color: G.muted, marginTop: 1 }}>서울에서 292.4°</p>
        <p style={{ fontSize: 10, color: G.green, fontWeight: 600, marginTop: 3 }}>현재 방향: 147°</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomeDesktop() {
  const [lang, setLang] = useState("ko");
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div style={{ width: 1440, height: 900, backgroundColor: G.bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Noto Sans KR', 'Inter', sans-serif" }}>
      <TopNav lang={lang} setLang={setLang} />

      {/* Hero banner */}
      <div style={{ position: "relative", height: 180, flexShrink: 0, overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1440&h=180&fit=crop&auto=format&q=80" alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(27,107,74,0.88) 0%, rgba(27,107,74,0.5) 50%, rgba(0,0,0,0.2) 100%)" }} />
        {/* Zellige pattern overlay */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
          <svg width="100%" height="100%"><defs><pattern id="hero-geo" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><g transform="translate(16,16)" stroke="white" strokeWidth="0.7" fill="none"><rect x="-8" y="-8" width="16" height="16"/><rect x="-8" y="-8" width="16" height="16" transform="rotate(45)"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#hero-geo)"/></svg>
        </div>
        <div style={{ position: "absolute", inset: 0, maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>지금 배달 가능 · 주변 {RESTAURANTS.length}개 식당</p>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: 10 }}>이태원의 할랄 맛집을<br/>지금 바로 주문하세요</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ padding: "9px 20px", backgroundColor: G.gold, borderRadius: 10, color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>주문하기 →</button>
              <button style={{ padding: "9px 20px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, color: "white", fontSize: 13, fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", backdropFilter: "blur(8px)" }}>할랄 스캐너 →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", height: "100%", display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>

          {/* Left column */}
          <div style={{ overflow: "auto", display: "flex", flexDirection: "column", gap: 16 }} className="scrollbar-hide">
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: G.muted }}>홈</span>
              <span style={{ fontSize: 11, color: G.dim }}>/</span>
              <span style={{ fontSize: 11, color: G.text, fontWeight: 600 }}>이태원동 · 할랄 레스토랑</span>
            </div>

            {/* Category filter chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map((cat, i) => {
                const isActive = i === activeCategory;
                return (
                  <button key={i} onClick={() => setActiveCategory(i)}
                    style={{ height: 34, padding: "0 14px", borderRadius: 99, border: `1.5px solid ${isActive ? G.green : G.border}`, backgroundColor: isActive ? G.greenLight : G.surface, color: isActive ? G.green : G.textMid, fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
                    {cat.emoji} {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Sort / filter bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 13, color: G.textMid }}><span style={{ fontWeight: 700, color: G.text }}>{RESTAURANTS.length}개</span> 식당</p>
              <div style={{ display: "flex", gap: 8 }}>
                {["거리순", "평점순", "배달비순"].map((s, i) => (
                  <button key={s} style={{ height: 30, padding: "0 12px", borderRadius: 8, border: `1px solid ${i === 0 ? G.green : G.border}`, backgroundColor: i === 0 ? G.greenLight : G.surface, color: i === 0 ? G.green : G.muted, fontSize: 11, fontWeight: i === 0 ? 700 : 500, cursor: "pointer" }}>{s}</button>
                ))}
              </div>
            </div>

            {/* 3-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {RESTAURANTS.map((r, i) => <RestaurantCard key={i} r={r} />)}
            </div>
          </div>

          {/* Right column — sticky sidebar */}
          <div style={{ overflow: "auto", display: "flex", flexDirection: "column", gap: 14 }} className="scrollbar-hide">
            <MapPreview />
            <PrayerWidget />
            <QiblaMini />

            {/* Quick links */}
            <div style={{ backgroundColor: G.surface, borderRadius: 14, border: `1px solid ${G.border}`, padding: "12px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: G.text, marginBottom: 8 }}>빠른 링크</p>
              {[
                { icon: "🕌", label: "근처 모스크", sub: "3개" },
                { icon: "🔍", label: "할랄 스캐너", sub: "인증 확인" },
                { icon: "✈️", label: "여행 모드", sub: "서울 가이드" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < 2 ? `1px solid ${G.borderLight}` : "none", cursor: "pointer" }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: G.text }}>{item.label}</p>
                    <p style={{ fontSize: 10, color: G.muted }}>{item.sub}</p>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.dim} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ height: 40, backgroundColor: G.surface, borderTop: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: 20 }}>
        {["이용약관", "개인정보처리방침", "고객센터", "언어 설정"].map((item, i) => (
          <span key={i} style={{ fontSize: 11, color: G.muted, cursor: "pointer" }}>{item}</span>
        ))}
        <span style={{ fontSize: 11, color: G.dim }}>· HalalMap Korea v1.0 · 한국이슬람교중앙회 인증</span>
      </div>
    </div>
  );
}
