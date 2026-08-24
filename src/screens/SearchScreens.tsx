import React, { useState } from "react";
import { StatusBar, BottomNav, MapPin, RestaurantCardV, HalalBadge, BackButton, TabId } from "../components/Shared";

// ── 14. Search Screen ──────────────────────────────────────────────────────────
const recentSearches = ["이태원 할랄", "케밥", "모스크 근처 식당", "할랄 치킨"];
const trending = ["신당 할랄 키친", "이스탄불 케밥", "비빔밥 할랄", "인도 커리", "삼계탕 할랄", "나시고렝", "피데", "팔라펠"];
const quickCategories = [
  { icon: "🍖", label: "한식 할랄" },
  { icon: "🥙", label: "터키" },
  { icon: "🍛", label: "인도" },
  { icon: "🍜", label: "인도네시아" },
  { icon: "🕌", label: "모스크" },
  { icon: "🔍", label: "스캐너" },
];

export const SearchScreen = ({ onTabChange }: { onTabChange?: (t: TabId) => void }) => {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="px-4 pb-4">
          <h1 className="font-bold text-xl text-[#1A1A18] mb-3">검색</h1>
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--muted)" strokeWidth="1.8">
              <circle cx="8" cy="8" r="5.5"/>
              <path d="M13.5 13.5L17 17" strokeLinecap="round"/>
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="할랄 음식, 레스토랑, 모스크 검색..."
              className="flex-1 bg-transparent text-sm text-[#1A1A18] outline-none placeholder:text-[var(--muted)]"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-[var(--muted)]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4L4 12M4 4l8 8" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 pt-4 space-y-5">
        {/* Voice search */}
        <div className="flex items-center justify-center">
          <button className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: "var(--green)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <rect x="9" y="2" width="6" height="10" rx="3"/>
                <path d="M5 10c0 3.9 3.1 7 7 7s7-3.1 7-7" strokeLinecap="round"/>
                <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round"/>
                <line x1="9" y1="21" x2="15" y2="21" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-xs font-medium text-[var(--muted)]">음성 검색</p>
          </button>
        </div>

        {/* Recent */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-[#1A1A18]">최근 검색</h3>
            <button className="text-xs font-medium" style={{ color: "var(--muted)" }}>전체 삭제</button>
          </div>
          <div className="space-y-1">
            {recentSearches.map((s) => (
              <div key={s} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="6"/>
                    <path d="M8 4.5v4L10.5 11" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="flex-1 text-sm text-[#1A1A18]">{s}</span>
                <button className="text-[var(--muted)]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 4L4 10M4 4l6 6" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div>
          <h3 className="font-bold text-sm text-[#1A1A18] mb-2">🔥 인기 검색어</h3>
          <div className="space-y-2">
            {trending.map((t, i) => (
              <div key={t} className="flex items-center gap-3 py-1.5">
                <span className="text-sm font-bold w-5 text-center" style={{ color: i < 3 ? "var(--danger)" : "var(--muted)" }}>{i + 1}</span>
                <span className="flex-1 text-sm text-[#1A1A18]">{t}</span>
                {i < 3 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--danger)", color: "white" }}>인기</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick categories */}
        <div>
          <h3 className="font-bold text-sm text-[#1A1A18] mb-2">카테고리</h3>
          <div className="grid grid-cols-3 gap-2">
            {quickCategories.map((c) => (
              <button key={c.label} className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-[var(--border)]">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-semibold text-[#1A1A18]">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="h-4" />
      </div>

      <BottomNav active="search" onTabChange={onTabChange} />
    </div>
  );
};

// ── 15. Map View ───────────────────────────────────────────────────────────────
// Fake map using SVG blocks
const FakeMapBg = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 500" xmlns="http://www.w3.org/2000/svg">
    {/* Background */}
    <rect width="390" height="500" fill="#E8E4DC"/>
    {/* Parks / green blocks */}
    <rect x="50" y="60" width="80" height="60" fill="#C8D8C0" rx="4"/>
    <rect x="260" y="180" width="70" height="50" fill="#C8D8C0" rx="4"/>
    <rect x="120" y="300" width="100" height="70" fill="#C8D8C0" rx="4"/>
    {/* Roads */}
    <rect x="0" y="140" width="390" height="14" fill="#F5F2EC"/>
    <rect x="0" y="260" width="390" height="14" fill="#F5F2EC"/>
    <rect x="160" y="0" width="14" height="500" fill="#F5F2EC"/>
    <rect x="300" y="0" width="14" height="500" fill="#F5F2EC"/>
    <rect x="60" y="0" width="10" height="500" fill="#F5F2EC"/>
    {/* Blocks / buildings */}
    {[[10,30,45,100],[10,170,45,80],[10,270,45,80],[180,30,110,100],[180,160,110,90],[180,270,110,80],[320,30,60,100],[320,160,60,90],[320,280,60,110]].map(([x,y,w,h],i) => (
      <rect key={i} x={x} y={y} width={w} height={h} fill="#D8D4CC" rx="3" opacity="0.7"/>
    ))}
    {/* Itaewon label */}
    <text x="195" y="158" textAnchor="middle" fontSize="11" fill="#8B8580" fontFamily="sans-serif" fontWeight="500">이태원로</text>
    <text x="155" y="200" textAnchor="middle" fontSize="10" fill="#8B8580" fontFamily="sans-serif">이태원동</text>
  </svg>
);

const mapPins: { x: number; y: number; type: "restaurant" | "mosque" | "user"; label: string }[] = [
  { x: 195, y: 220, type: "user", label: "현재 위치" },
  { x: 120, y: 175, type: "restaurant", label: "신당 할랄 키친" },
  { x: 240, y: 200, type: "restaurant", label: "이스탄불 케밥" },
  { x: 310, y: 130, type: "restaurant", label: "델리 스파이스" },
  { x: 80, y: 290, type: "restaurant", label: "우즈베키스탄 플로프" },
  { x: 185, y: 120, type: "mosque", label: "서울중앙성원" },
  { x: 330, y: 250, type: "mosque", label: "이태원 마스지드" },
];

export const MapViewScreen = ({ onTabChange }: { onTabChange?: (t: TabId) => void }) => {
  const [activeFilter, setActiveFilter] = useState("레스토랑");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)] relative overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <FakeMapBg />
        {/* Render pins */}
        {mapPins.map((pin, i) => (
          <div key={i} className="absolute" style={{ left: pin.x - 16, top: pin.y - 16 }}>
            <MapPin type={pin.type} />
          </div>
        ))}
      </div>

      {/* Status bar overlay */}
      <div className="relative z-10 flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top search bar */}
      <div className="relative z-10 px-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8">
              <circle cx="7" cy="7" r="5"/>
              <path d="M12 12L15 15" strokeLinecap="round"/>
            </svg>
            <span className="text-sm text-[var(--muted)]">이 지역 검색</span>
          </div>
          <button className="w-10 h-10 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--charcoal)" strokeWidth="1.8">
              <line x1="2" y1="5" x2="16" y2="5" strokeLinecap="round"/>
              <line x1="5" y1="9" x2="13" y2="9" strokeLinecap="round"/>
              <line x1="7" y1="13" x2="11" y2="13" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
          {["레스토랑", "모스크", "기도실"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              style={{
                backgroundColor: activeFilter === f ? "var(--green)" : "white",
                color: activeFilter === f ? "white" : "var(--charcoal)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer (pushes bottom sheet to bottom) */}
      <div className="flex-1" />

      {/* Current location button */}
      <div className="relative z-10 flex justify-end px-4 pb-3">
        <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--info)" strokeWidth="1.8">
            <circle cx="9" cy="9" r="3"/>
            <path d="M9 1v3M9 14v3M1 9h3M14 9h3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Bottom sheet */}
      <div className="relative z-10 bg-white rounded-t-3xl shadow-lg flex-shrink-0">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
        </div>
        <div className="px-4 pb-4">
          <p className="font-bold text-sm text-[#1A1A18] mb-3">주변 결과 8개</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            <RestaurantCardV name="신당 할랄 키친" imageId="1498654896293-37c98e7f5fe4" badge="certified" rating={4.8} count={3241} distance="2.3km" eta="25-35분" fee="₩2,000" />
            <RestaurantCardV name="이스탄불 케밥" imageId="1529042410759-befb1204b468" badge="certified" rating={4.5} count={2110} distance="0.8km" eta="20-30분" fee="무료" />
          </div>
        </div>
      </div>

      <BottomNav active="search" onTabChange={onTabChange} />
    </div>
  );
};

// ── 16. City/Area Selector ─────────────────────────────────────────────────────
const cities = [
  { name: "서울", nameEn: "Seoul", img: "1540608408-6f1b-4a30-b985-4555ab4b4086", count: "243" },
  { name: "부산", nameEn: "Busan", img: "1614854262318-831574f15f1f", count: "48" },
  { name: "인천", nameEn: "Incheon", img: "1547036967-23d11aacaee0", count: "31" },
  { name: "제주", nameEn: "Jeju", img: "1601581975053-7655b55a96a1", count: "22" },
  { name: "대구", nameEn: "Daegu", img: "1570197788417-0e82375c9371", count: "19" },
  { name: "경주", nameEn: "Gyeongju", img: "1509316785289-025f5b846b35", count: "12" },
];

export const CitySelectorScreen = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <h1 className="font-bold text-lg flex-1">방문 도시 선택</h1>
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8">
              <circle cx="7" cy="7" r="5"/>
              <path d="M12 12L15 15" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="도시 또는 지역 검색..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-5">
        {/* Saved */}
        <div>
          <h3 className="font-bold text-sm text-[#1A1A18] mb-2">저장된 도시</h3>
          <div className="space-y-2">
            {[{ name: "서울 이태원", tag: "자주 방문" }, { name: "부산 서면", tag: "저장됨" }].map((s) => (
              <div key={s.name} className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-[var(--border)]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--green-light)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--green)">
                    <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5ZM8 7.5C7.2 7.5 6.5 6.8 6.5 6C6.5 5.2 7.2 4.5 8 4.5C8.8 4.5 9.5 5.2 9.5 6C9.5 6.8 8.8 7.5 8 7.5Z"/>
                  </svg>
                </div>
                <span className="flex-1 text-sm font-semibold text-[#1A1A18]">{s.name}</span>
                <span className="text-xs text-[var(--muted)]">{s.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestion banner */}
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: "var(--gold-light)", border: "1px solid #D4963F30" }}>
          <span className="text-xl">✈️</span>
          <div>
            <p className="font-bold text-sm" style={{ color: "#7A5220" }}>다음 주 부산 방문 예정이신가요?</p>
            <p className="text-xs mt-0.5" style={{ color: "#9A6830" }}>부산역 근처 할랄 식당을 미리 확인해 보세요</p>
            <button className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--gold)", color: "white" }}>
              부산 할랄 보기 →
            </button>
          </div>
        </div>

        {/* Popular cities grid */}
        <div>
          <h3 className="font-bold text-sm text-[#1A1A18] mb-2">인기 도시</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {cities.map((city) => (
              <button key={city.name} className="relative h-24 rounded-2xl overflow-hidden text-left">
                <div className="absolute inset-0 bg-[#D8D4CC]">
                  <img
                    src={`https://images.unsplash.com/photo-${city.img}?w=200&h=130&fit=crop&auto=format&q=80`}
                    alt={city.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 p-3">
                  <p className="text-white font-bold text-sm">{city.name}</p>
                  <p className="text-white/70 text-xs">{city.count}개 할랄</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};

// ── 17. Restaurant Map Detail ──────────────────────────────────────────────────
export const RestaurantMapDetailScreen = () => (
  <div className="flex flex-col h-full relative overflow-hidden bg-[var(--cream)]">
    {/* Map */}
    <div className="absolute inset-0">
      <FakeMapBg />
      {/* Selected pin — larger */}
      <div className="absolute" style={{ left: 100, top: 160 }}>
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-xl px-3 py-1.5 shadow-lg mb-1 border-2" style={{ borderColor: "var(--green)" }}>
            <p className="text-xs font-bold text-[#1A1A18]">신당 할랄 키친</p>
          </div>
          <div className="w-12 h-12 rounded-full border-3 border-white shadow-lg flex items-center justify-center" style={{ backgroundColor: "var(--green)" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M7 2v5M10 2v5M13 2v5M7 7c0 2.8 1.8 4.5 3 4.5s3-1.7 3-4.5"/>
              <line x1="10" y1="11.5" x2="10" y2="18" strokeWidth="1.5" strokeLinecap="round" stroke="white"/>
            </svg>
          </div>
          <div className="w-2 h-2 rounded-full mt-0.5" style={{ backgroundColor: "var(--green)" }} />
        </div>
      </div>
      {/* Other pins */}
      <div className="absolute" style={{ left: 220, top: 192 }}><MapPin type="restaurant" /></div>
      <div className="absolute" style={{ left: 170, top: 112 }}><MapPin type="mosque" /></div>
      <div className="absolute" style={{ left: 177, top: 208 }}><MapPin type="user" /></div>
    </div>

    {/* Status + back */}
    <div className="relative z-10 flex-shrink-0">
      <StatusBar />
      <div className="px-4 pt-1">
        <BackButton />
      </div>
    </div>

    <div className="flex-1" />

    {/* Info card */}
    <div className="relative z-10 bg-white rounded-t-3xl shadow-lg flex-shrink-0 animate-slide-up">
      <div className="flex justify-center pt-3 pb-4">
        <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
      </div>
      <div className="px-4 pb-8 flex gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#E8E6E1] flex-shrink-0">
          <img src="https://images.unsplash.com/photo-1498654896293-37c98e7f5fe4?w=120&h=120&fit=crop&auto=format&q=80" alt="restaurant" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 space-y-1.5">
          <HalalBadge variant="certified" />
          <h2 className="font-bold text-lg text-[#1A1A18] leading-tight">신당 할랄 키친</h2>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span>⭐ 4.8</span>
            <span>·</span>
            <span>📍 2.3km</span>
            <span>·</span>
            <span>⏱ 25-35분</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: "var(--green)" }}>메뉴 보기</button>
            <button className="flex-1 py-2.5 rounded-xl font-semibold text-sm border" style={{ color: "var(--green)", borderColor: "var(--green)" }}>길 찾기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
