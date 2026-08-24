import React, { useState } from "react";
import {
  GeometricPattern, StatusBar, BottomNav, HalalBadge, StarRating,
  RestaurantCardV, RestaurantCardH, MosqueCard, SectionHeader, PriceTag, BackButton, TabId
} from "../components/Shared";

// ── 6. Home Screen ─────────────────────────────────────────────────────────────
const categories = [
  { icon: "🍖", label: "한식 할랄" },
  { icon: "🥙", label: "터키" },
  { icon: "🍽️", label: "우즈베크" },
  { icon: "🍛", label: "인도" },
  { icon: "🥗", label: "아랍" },
  { icon: "🫕", label: "파키스탄" },
  { icon: "🍜", label: "인도네시아" },
  { icon: "🔍", label: "전체" },
];

export const HomeScreen = ({ onTabChange }: { onTabChange?: (t: TabId) => void }) => (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    {/* Sticky Header */}
    <div className="relative overflow-hidden flex-shrink-0" style={{ backgroundColor: "var(--green)" }}>
      <GeometricPattern color="white" opacity={0.05} />
      <StatusBar dark />
      <div className="relative z-10 px-5 pb-5">
        {/* Location + bell */}
        <div className="flex items-center justify-between mb-4">
          <button className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <path d="M7 1C4.8 1 3 2.8 3 5C3 8 7 13 7 13C7 13 11 8 11 5C11 2.8 9.2 1 7 1ZM7 6.5C6.2 6.5 5.5 5.8 5.5 5C5.5 4.2 6.2 3.5 7 3.5C7.8 3.5 8.5 4.2 8.5 5C8.5 5.8 7.8 6.5 7 6.5Z"/>
            </svg>
            <span className="text-white text-sm font-semibold">이태원동, 용산구</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M3 5l3 3 3-3"/>
            </svg>
          </button>
          <button className="relative w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.6">
              <path d="M4 4h12v8a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
              <path d="M8 4V2M12 4V2"/>
              <circle cx="14" cy="4" r="3" fill="var(--danger)" stroke="none"/>
            </svg>
          </button>
        </div>

        {/* Prayer banner */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3.5 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M10 2C8 2 6 3.8 6 6C6 9 8.5 10.5 10 13C11.5 10.5 14 9 14 6C14 3.8 12 2 10 2Z"/>
              <path d="M7.5 5.5C7.5 4 8.6 2.8 10 2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" strokeLinecap="round"/>
              <line x1="10" y1="13" x2="10" y2="18" strokeWidth="1.5" strokeLinecap="round" stroke="white"/>
              <line x1="7" y1="18" x2="13" y2="18" strokeWidth="1.5" strokeLinecap="round" stroke="white"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-medium">다음 기도</p>
            <p className="text-white font-bold text-sm">아스르 Asr · <span style={{ color: "var(--gold)" }}>2시간 14분 후</span></p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold text-base">14:32</p>
            <div className="w-20 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "38%", backgroundColor: "var(--gold)" }} />
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--muted)" strokeWidth="1.8">
            <circle cx="8" cy="8" r="5.5"/>
            <path d="M13.5 13.5L17 17" strokeLinecap="round"/>
          </svg>
          <span className="text-sm text-[var(--muted)] flex-1">할랄 음식, 레스토랑 검색...</span>
          <div className="w-px h-4 bg-[var(--border)]" />
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--muted)" strokeWidth="1.8">
            <circle cx="6" cy="9" r="3.5"/>
            <path d="M9.5 9H17" strokeLinecap="round"/>
            <path d="M12 6.5L14.5 9L12 11.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 phone-scroll">
      {/* Categories */}
      <div className="pt-4 pb-2">
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((c, i) => (
            <button
              key={i}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl bg-white border border-[var(--border)] min-w-fit"
            >
              <span className="text-xl">{c.icon}</span>
              <span className="text-xs font-medium text-[#1A1A18] whitespace-nowrap">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured restaurants */}
      <div className="pt-4">
        <SectionHeader title="🔥 인기 할랄 식당" action="더보기" />
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
          <RestaurantCardV name="신당 할랄 키친" imageId="1498654896293-37c98e7f5fe4" badge="certified" rating={4.8} count={3241} distance="2.3km" eta="25-35분" fee="₩2,000" />
          <RestaurantCardV name="이태원 케밥 하우스" imageId="1529042410759-befb1204b468" badge="certified" rating={4.6} count={1820} distance="0.8km" eta="15-25분" fee="₩1,500" />
          <RestaurantCardV name="마스지드 서울 카페" imageId="1414235077428-338989a2e8c0" badge="owned" rating={4.9} count={940} distance="1.1km" eta="20-30분" fee="무료" />
        </div>
      </div>

      {/* Nearby mosques */}
      <div className="pt-5">
        <SectionHeader title="🕌 근처 모스크" action="지도 보기" />
        <div className="px-4 space-y-2.5">
          <MosqueCard name="서울중앙성원" nameKo="Seoul Central Mosque" distance="1.2km" nextPrayer="아스르 14:32" walkTime="도보 15분" />
          <MosqueCard name="이태원 마스지드" nameKo="Itaewon Masjid" distance="0.3km" nextPrayer="아스르 14:35" walkTime="도보 4분" />
        </div>
      </div>

      {/* Promo banner */}
      <div className="px-4 pt-5 pb-6">
        <div
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--gold) 0%, #A0692A 100%)" }}
        >
          <GeometricPattern color="white" opacity={0.08} />
          <div className="relative z-10">
            <p className="text-white/80 text-xs font-medium mb-1">신규 회원 혜택</p>
            <p className="text-white font-bold text-lg leading-tight">첫 주문 ₩3,000 할인</p>
            <p className="text-white/70 text-xs mt-1">코드: HALAL3000</p>
            <button className="mt-3 px-4 py-2 bg-white rounded-xl text-xs font-bold" style={{ color: "var(--gold)" }}>
              지금 주문하기 →
            </button>
          </div>
        </div>
      </div>
    </div>

    <BottomNav active="home" onTabChange={onTabChange} />
  </div>
);

// ── 7. Restaurant List ─────────────────────────────────────────────────────────
const filters = ["거리순", "⭐ 평점", "배달비", "인증유형", "음식종류"];

const restaurants = [
  { name: "신당 할랄 키친", imageId: "1498654896293-37c98e7f5fe4", badge: "certified" as const, rating: 4.8, count: 3241, distance: "2.3km", eta: "25-35분", fee: "₩2,000", cuisine: "한식" },
  { name: "우즈베키스탄 플로프 하우스", imageId: "1565557623262-b51ff2a27b73", badge: "owned" as const, rating: 4.7, count: 892, distance: "3.1km", eta: "30-40분", fee: "₩1,500", cuisine: "우즈베크" },
  { name: "이스탄불 케밥 & 피데", imageId: "1529042410759-befb1204b468", badge: "certified" as const, rating: 4.5, count: 2110, distance: "0.8km", eta: "20-30분", fee: "무료", cuisine: "터키" },
  { name: "델리 스파이스 하우스", imageId: "1617196034183-421b4040d6fd", badge: "friendly" as const, rating: 4.3, count: 654, distance: "4.2km", eta: "40-50분", fee: "₩2,500", cuisine: "인도" },
  { name: "자카르타 나시고렝", imageId: "1414235077428-338989a2e8c0", badge: "certified" as const, rating: 4.6, count: 1345, distance: "2.8km", eta: "35-45분", fee: "₩2,000", cuisine: "인도네시아" },
];

export const RestaurantListScreen = () => {
  const [activeFilter, setActiveFilter] = useState("거리순");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <h1 className="font-bold text-lg flex-1">할랄 레스토랑</h1>
          <button>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--charcoal)" strokeWidth="1.8">
              <line x1="3" y1="7" x2="19" y2="7" strokeLinecap="round"/>
              <line x1="6" y1="12" x2="16" y2="12" strokeLinecap="round"/>
              <line x1="9" y1="17" x2="13" y2="17" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {/* Sort + filters */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--green)] text-[var(--green)] bg-[var(--green-light)]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="2" y1="3" x2="10" y2="3"/>
              <line x1="4" y1="6" x2="8" y2="6"/>
              <line x1="6" y1="9" x2="6" y2="9" strokeLinecap="round" strokeWidth="2"/>
            </svg>
            빠른배달순
          </button>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
              style={{
                backgroundColor: activeFilter === f ? "var(--green)" : "white",
                color: activeFilter === f ? "white" : "var(--charcoal)",
                borderColor: activeFilter === f ? "var(--green)" : "var(--border)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        <p className="text-xs text-[var(--muted)] font-medium mb-1">근처 할랄 레스토랑 {restaurants.length}개</p>
        {restaurants.map((r, i) => (
          <RestaurantCardH key={i} {...r} />
        ))}
      </div>

      <BottomNav active="home" />
    </div>
  );
};

// ── 8. Restaurant Detail ───────────────────────────────────────────────────────
const menuTabs = ["전체메뉴", "인기메뉴", "한식", "음료", "사이드"];

export const RestaurantDetailScreen = () => {
  const [activeTab, setActiveTab] = useState("인기메뉴");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Hero */}
      <div className="relative flex-shrink-0">
        <div className="h-52 bg-[#D8D4CD] relative">
          <img
            src="https://images.unsplash.com/photo-1498654896293-37c98e7f5fe4?w=390&h=210&fit=crop&auto=format&q=80"
            alt="신당 할랄 키친"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        {/* Overlay status bar + back */}
        <div className="absolute top-0 left-0 right-0">
          <StatusBar dark />
        </div>
        <div className="absolute top-12 left-4">
          <BackButton dark />
        </div>
        <div className="absolute top-12 right-4 flex gap-2">
          <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.6">
              <path d="M9 1.5L11.5 6.5H16.5L12.5 9.5L14 14.5L9 11.5L4 14.5L5.5 9.5L1.5 6.5H6.5L9 1.5Z"/>
            </svg>
          </button>
          <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.6">
              <circle cx="14" cy="4" r="2.5"/>
              <circle cx="4" cy="9" r="2.5"/>
              <circle cx="14" cy="14" r="2.5"/>
              <line x1="11.5" y1="5.5" x2="6.5" y2="7.5"/>
              <line x1="11.5" y1="12.5" x2="6.5" y2="10.5"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 phone-scroll">
        {/* Info card */}
        <div className="bg-white px-5 pt-4 pb-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h1 className="font-bold text-xl text-[#1A1A18] leading-tight">신당 할랄 키친</h1>
            <HalalBadge variant="certified" />
          </div>
          <p className="text-sm text-[var(--muted)] mb-3">이슬람 식품청 인증 할랄 한식 전문점. 돼지고기 및 알코올 완전 배제.</p>

          <div className="flex items-center gap-4 mb-4">
            <StarRating rating={4.8} count={3241} />
            <span className="text-xs text-[var(--muted)]">·</span>
            <span className="text-xs text-[var(--muted)]">📍 2.3km</span>
            <span className="text-xs text-[var(--muted)]">·</span>
            <span className="text-xs text-[var(--muted)]">⏱ 25-35분</span>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-[var(--border)]">
            {[
              { label: "최소주문", value: "₩10,000" },
              { label: "배달비", value: "₩2,000" },
              { label: "영업시간", value: "09:00–22:00" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-xs text-[var(--muted)]">{item.label}</p>
                <p className="text-sm font-semibold text-[#1A1A18] mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu tabs */}
        <div className="sticky top-0 bg-white border-b border-[var(--border)] z-10">
          <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
            {menuTabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: activeTab === t ? "var(--green)" : "transparent",
                  color: activeTab === t ? "white" : "var(--muted)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Menu items preview */}
        <div className="px-4 pt-4 pb-28 space-y-3">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">🔥 인기메뉴</p>
          {[
            { name: "할랄 갈비탕", desc: "사골 육수와 소갈비, 12시간 정성껏 우린 국물", price: 13500, imageId: "1569050467447-ce54b3bbc37d" },
            { name: "비빔밥 (할랄)", desc: "신선한 채소와 할랄 소고기, 참기름 드레싱", price: 11000, imageId: "1583394293214-b483ffd7e3f7" },
            { name: "된장찌개 세트", desc: "전통 된장에 두부, 야채, 밥 포함", price: 12000, imageId: "1617196034183-421b4040d6fd" },
          ].map((item) => (
            <div key={item.name} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm">
              <div className="w-20 h-20 rounded-xl bg-[#E8E6E1] flex-shrink-0 overflow-hidden">
                <img src={`https://images.unsplash.com/photo-${item.imageId}?w=120&h=120&fit=crop&auto=format&q=80`} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 py-1">
                <p className="font-semibold text-sm text-[#1A1A18]">{item.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{item.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <PriceTag amount={item.price} className="text-sm" />
                  <button
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-lg font-light shadow-sm"
                    style={{ backgroundColor: "var(--green)" }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-8 pt-3 bg-white border-t border-[var(--border)] flex-shrink-0">
        <button className="w-full py-4 rounded-2xl font-bold text-white text-base" style={{ backgroundColor: "var(--green)" }}>
          메뉴 전체 보기
        </button>
      </div>
    </div>
  );
};

// ── 9. Menu Screen ─────────────────────────────────────────────────────────────
const menuCategories = ["인기메뉴", "한식", "세트메뉴", "음료", "사이드"];
const menuItems = [
  { name: "할랄 갈비탕", desc: "사골 육수 12시간 우린 국물", price: 13500, imageId: "1569050467447-ce54b3bbc37d", tags: ["No Pork", "No Alcohol"], popular: true },
  { name: "비빔밥 (할랄)", desc: "신선 야채 + 할랄 소고기", price: 11000, imageId: "1583394293214-b483ffd7e3f7", tags: ["Halal Beef"], popular: true },
  { name: "된장찌개 세트", desc: "전통 된장, 두부, 야채, 밥 포함", price: 12000, imageId: "1617196034183-421b4040d6fd", tags: ["Vegetable"], popular: false },
  { name: "할랄 삼계탕", desc: "국산 닭, 인삼, 찹쌀 들어간 보양식", price: 16500, imageId: "1498654896293-37c98e7f5fe4", tags: ["Halal Chicken"], popular: true },
];

export const MenuScreen = () => {
  const [activeTab, setActiveTab] = useState("인기메뉴");
  const [cart, setCart] = useState<Record<string, number>>({});
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = menuItems.reduce((acc, item) => acc + (cart[item.name] || 0) * item.price, 0);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="font-bold text-base">신당 할랄 키친</h1>
            <p className="text-xs text-[var(--muted)]">메뉴 선택</p>
          </div>
          <button className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--charcoal)" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: "var(--danger)" }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {menuCategories.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeTab === t ? "var(--green)" : "transparent",
                color: activeTab === t ? "white" : "var(--muted)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="flex-1 phone-scroll px-4 pt-4 space-y-3">
        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide px-1">🔥 {activeTab}</p>
        {menuItems.map((item) => (
          <div key={item.name} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm">
            <div className="relative w-20 h-20 rounded-xl bg-[#E8E6E1] flex-shrink-0 overflow-hidden">
              <img src={`https://images.unsplash.com/photo-${item.imageId}?w=120&h=120&fit=crop&auto=format&q=80`} alt={item.name} className="w-full h-full object-cover" />
              {item.popular && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white" style={{ backgroundColor: "var(--danger)" }}>BEST</div>
              )}
            </div>
            <div className="flex-1 py-0.5">
              <p className="font-semibold text-sm text-[#1A1A18]">{item.name}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{item.desc}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--green-light)] text-[var(--green)]">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <PriceTag amount={item.price} className="text-sm" />
                {cart[item.name] ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCart(c => ({ ...c, [item.name]: Math.max(0, (c[item.name] || 0) - 1) }))}
                      className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-sm font-bold text-[var(--green)]">−</button>
                    <span className="text-sm font-bold w-4 text-center">{cart[item.name]}</span>
                    <button onClick={() => setCart(c => ({ ...c, [item.name]: (c[item.name] || 0) + 1 }))}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "var(--green)" }}>+</button>
                  </div>
                ) : (
                  <button onClick={() => setCart(c => ({ ...c, [item.name]: 1 }))}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-lg font-light" style={{ backgroundColor: "var(--green)" }}>+</button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="h-20" />
      </div>

      {/* Cart CTA */}
      {cartCount > 0 && (
        <div className="px-4 pb-8 pt-3 bg-white border-t border-[var(--border)] flex-shrink-0">
          <button className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-between px-5" style={{ backgroundColor: "var(--green)" }}>
            <span className="bg-white/20 rounded-lg px-2.5 py-1 text-sm">{cartCount}개</span>
            <span>장바구니 보기</span>
            <span>₩{cartTotal.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ── 10. Item Detail ────────────────────────────────────────────────────────────
export const ItemDetailScreen = () => {
  const [size, setSize] = useState("보통");
  const [spice, setSpice] = useState("보통");
  const [extras, setExtras] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const basePrice = 13500;
  const sizeExtra = size === "대" ? 2000 : 0;
  const total = (basePrice + sizeExtra) * qty;

  const toggleExtra = (item: string) =>
    setExtras((e) => e.includes(item) ? e.filter((x) => x !== item) : [...e, item]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Hero */}
      <div className="relative flex-shrink-0">
        <div className="h-60 bg-[#D8D4CD] relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=390&h=260&fit=crop&auto=format&q=80" alt="할랄 갈비탕" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-0 left-0 right-0">
          <StatusBar dark />
        </div>
        <div className="absolute top-12 left-4"><BackButton dark /></div>
      </div>

      <div className="flex-1 phone-scroll px-5 pt-5 pb-4 space-y-5">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1"><HalalBadge variant="certified" /></div>
            <h1 className="font-bold text-xl text-[#1A1A18]">할랄 갈비탕</h1>
            <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">사골 육수를 12시간 우린 진한 국물에 소갈비를 듬뿍 넣은 한국 전통 보양식. 돼지고기·알코올 완전 배제.</p>
          </div>
          <PriceTag amount={basePrice} className="text-lg flex-shrink-0" />
        </div>

        {/* Size */}
        <div>
          <p className="font-semibold text-sm text-[#1A1A18] mb-2.5">사이즈 선택 <span className="text-[var(--danger)] text-xs">필수</span></p>
          <div className="space-y-2">
            {[{ label: "보통 (1인)", extra: 0 }, { label: "대 (2인)", extra: 2000 }].map((s) => (
              <button key={s.label} onClick={() => setSize(s.label.split(" ")[0])}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all"
                style={{ borderColor: size === s.label.split(" ")[0] ? "var(--green)" : "var(--border)", backgroundColor: size === s.label.split(" ")[0] ? "var(--green-light)" : "white" }}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: size === s.label.split(" ")[0] ? "var(--green)" : "var(--border)" }}>
                    {size === s.label.split(" ")[0] && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--green)" }} />}
                  </div>
                  <span className="text-sm font-medium text-[#1A1A18]">{s.label}</span>
                </div>
                {s.extra > 0 && <span className="text-sm font-medium" style={{ color: "var(--green)" }}>+₩{s.extra.toLocaleString()}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div>
          <p className="font-semibold text-sm text-[#1A1A18] mb-2.5">추가 반찬 <span className="text-[var(--muted)] text-xs font-normal">선택사항</span></p>
          <div className="space-y-2">
            {["깍두기", "배추김치", "오이무침"].map((ex) => (
              <button key={ex} onClick={() => toggleExtra(ex)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                style={{ borderColor: extras.includes(ex) ? "var(--green)" : "var(--border)", backgroundColor: extras.includes(ex) ? "var(--green-light)" : "white" }}>
                <div className="w-5 h-5 rounded border-2 flex items-center justify-center" style={{ borderColor: extras.includes(ex) ? "var(--green)" : "var(--border)", backgroundColor: extras.includes(ex) ? "var(--green)" : "white" }}>
                  {extras.includes(ex) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4l2.5 2.5L9 1"/></svg>}
                </div>
                <span className="text-sm font-medium text-[#1A1A18] flex-1 text-left">{ex}</span>
                <span className="text-xs text-[var(--muted)]">무료</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spice */}
        <div>
          <p className="font-semibold text-sm text-[#1A1A18] mb-2.5">맵기 선택</p>
          <div className="flex gap-2">
            {["안맵게", "보통", "맵게"].map((s) => (
              <button key={s} onClick={() => setSpice(s)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all"
                style={{ borderColor: spice === s ? "var(--green)" : "var(--border)", backgroundColor: spice === s ? "var(--green)" : "white", color: spice === s ? "white" : "var(--charcoal)" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Special instructions */}
        <div>
          <p className="font-semibold text-sm text-[#1A1A18] mb-2">특별 요청사항</p>
          <textarea
            className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[#1A1A18] bg-white outline-none resize-none focus:border-[var(--green)]"
            rows={3}
            placeholder="가게에 요청할 사항을 적어주세요..."
            defaultValue=""
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-4 pb-8 pt-3 bg-white border-t border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl px-3 py-2">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center font-bold text-sm">−</button>
            <span className="text-sm font-bold w-5 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "var(--green)" }}>+</button>
          </div>
          <button className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-between px-5" style={{ backgroundColor: "var(--green)" }}>
            <span>장바구니 담기</span>
            <PriceTag amount={total} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── 11. Cart ───────────────────────────────────────────────────────────────────
export const CartScreen = () => {
  const [items, setItems] = useState([
    { name: "할랄 갈비탕", option: "보통", price: 13500, qty: 1 },
    { name: "비빔밥 (할랄)", option: "기본", price: 11000, qty: 2 },
    { name: "오이무침", option: "사이드", price: 3000, qty: 1 },
  ]);
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState("");
  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const deliveryFee = 2000;
  const discount = coupon ? 3000 : 0;
  const total = subtotal + deliveryFee - discount;

  const updateQty = (idx: number, delta: number) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <h1 className="font-bold text-lg flex-1">장바구니</h1>
          <span className="text-sm font-semibold" style={{ color: "var(--green)" }}>{items.length}개</span>
        </div>
      </div>

      <div className="flex-1 phone-scroll pb-36">
        {/* Restaurant */}
        <div className="bg-white px-5 py-4 flex items-center gap-3 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--green-light)] flex items-center justify-center">
            <span className="text-lg">🍖</span>
          </div>
          <div>
            <p className="font-bold text-sm text-[#1A1A18]">신당 할랄 키친</p>
            <p className="text-xs text-[var(--muted)]">할랄 한식 전문</p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white mt-2 px-5 divide-y divide-[var(--border)]">
          {items.map((item, i) => (
            <div key={i} className="py-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1A1A18]">{item.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{item.option}</p>
                <PriceTag amount={item.price * item.qty} className="text-sm mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(i, -1)} className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-sm font-bold">−</button>
                <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                <button onClick={() => updateQty(i, 1)} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "var(--green)" }}>+</button>
              </div>
            </div>
          ))}
          <button className="w-full py-4 text-sm font-semibold text-center" style={{ color: "var(--green)" }}>
            + 다른 메뉴 추가
          </button>
        </div>

        {/* Coupon */}
        <div className="bg-white mt-2 px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">할인 코드</p>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="쿠폰 코드 입력 (예: HALAL3000)"
              className="flex-1 border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--green)] bg-[var(--cream)]"
            />
            <button className="px-4 py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>적용</button>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="가게에 요청사항을 남겨주세요..."
            className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none resize-none bg-[var(--cream)]"
            rows={2}
          />
        </div>

        {/* Price breakdown */}
        <div className="bg-white mt-2 px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">주문 금액</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[var(--muted)]">
              <span>소계</span><span>₩{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--muted)]">
              <span>배달비</span><span>₩{deliveryFee.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm font-semibold" style={{ color: "var(--danger)" }}>
                <span>쿠폰 할인</span><span>-₩{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
              <span>합계</span><span>₩{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-8 pt-3 bg-white border-t border-[var(--border)] flex-shrink-0">
        <button className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-between px-6" style={{ backgroundColor: "var(--green)" }}>
          <span>주문하기</span>
          <span>₩{total.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
};

// ── 12. Checkout ───────────────────────────────────────────────────────────────
const paymentMethods = [
  { id: "shinhan", label: "신한카드", sub: "····4521", icon: "💳" },
  { id: "kakao", label: "카카오페이", sub: "연결됨", icon: "🟡" },
  { id: "toss", label: "토스페이", sub: "연결됨", icon: "💙" },
];
const tips = [0, 500, 1000, 2000];

export const CheckoutScreen = () => {
  const [payment, setPayment] = useState("shinhan");
  const [tip, setTip] = useState(0);
  const total = 34500 + tip;

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <h1 className="font-bold text-lg">결제</h1>
        </div>
      </div>

      <div className="flex-1 phone-scroll pb-36 space-y-2">
        {/* Address */}
        <div className="bg-white px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">배달 주소</p>
          <div className="flex items-start gap-3 p-3 bg-[var(--green-light)] rounded-xl">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--green)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5ZM8 7.5C7.2 7.5 6.5 6.8 6.5 6C6.5 5.2 7.2 4.5 8 4.5C8.8 4.5 9.5 5.2 9.5 6C9.5 6.8 8.8 7.5 8 7.5Z"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[var(--green)]">집</p>
              <p className="text-sm text-[#1A1A18] leading-relaxed">서울특별시 용산구 이태원로 123, 501호</p>
            </div>
            <button className="text-[var(--green)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 13L5 12L13 4a1.4 1.4 0 00-2-2L3 11L2 14z"/></svg>
            </button>
          </div>
        </div>

        {/* Delivery time */}
        <div className="bg-white px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">배달 시간</p>
          <div className="grid grid-cols-2 gap-2">
            {["최대한 빨리 (30-40분)", "시간 지정"].map((opt, i) => (
              <button key={opt} className="py-3 px-4 rounded-xl text-sm font-semibold border transition-all"
                style={{ borderColor: i === 0 ? "var(--green)" : "var(--border)", backgroundColor: i === 0 ? "var(--green-light)" : "white", color: i === 0 ? "var(--green)" : "var(--muted)" }}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">결제 수단</p>
          {paymentMethods.map((pm) => (
            <button key={pm.id} onClick={() => setPayment(pm.id)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all"
              style={{ borderColor: payment === pm.id ? "var(--green)" : "var(--border)", backgroundColor: payment === pm.id ? "var(--green-light)" : "white" }}>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: payment === pm.id ? "var(--green)" : "var(--border)" }}>
                {payment === pm.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--green)" }} />}
              </div>
              <span className="text-lg">{pm.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-[#1A1A18]">{pm.label}</p>
                <p className="text-xs text-[var(--muted)]">{pm.sub}</p>
              </div>
            </button>
          ))}
          <button className="w-full py-3 rounded-xl border border-dashed border-[var(--border)] text-sm font-medium" style={{ color: "var(--muted)" }}>
            + 결제수단 추가
          </button>
        </div>

        {/* Tip */}
        <div className="bg-white px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">배달원 팁 <span className="text-xs font-normal text-[var(--muted)]">선택</span></p>
          <div className="grid grid-cols-4 gap-2">
            {tips.map((t) => (
              <button key={t} onClick={() => setTip(t)}
                className="py-3 rounded-xl text-sm font-bold border transition-all"
                style={{ borderColor: tip === t ? "var(--green)" : "var(--border)", backgroundColor: tip === t ? "var(--green)" : "white", color: tip === t ? "white" : "var(--charcoal)" }}>
                {t === 0 ? "없음" : `₩${t.toLocaleString()}`}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white px-5 py-4 space-y-2">
          <p className="font-semibold text-sm text-[#1A1A18]">결제 금액</p>
          <div className="flex justify-between text-sm text-[var(--muted)]"><span>소계</span><span>₩32,500</span></div>
          <div className="flex justify-between text-sm text-[var(--muted)]"><span>배달비</span><span>₩2,000</span></div>
          {tip > 0 && <div className="flex justify-between text-sm text-[var(--muted)]"><span>팁</span><span>₩{tip.toLocaleString()}</span></div>}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
            <span>합계</span><span>₩{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 pt-3 bg-white border-t border-[var(--border)] flex-shrink-0">
        <button className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-between px-6" style={{ backgroundColor: "var(--green)" }}>
          <span>₩{total.toLocaleString()} 결제하기</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M5 10h10M12 7l3 3-3 3"/></svg>
        </button>
      </div>
    </div>
  );
};

// ── 13. Order Confirmation ─────────────────────────────────────────────────────
const steps = ["주문접수", "조리중", "픽업완료", "배달완료"];

export const OrderConfirmationScreen = () => (
  <div className="flex flex-col h-full relative overflow-hidden" style={{ backgroundColor: "var(--green)" }}>
    <GeometricPattern color="white" opacity={0.05} />
    <StatusBar dark />

    <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10 px-6">
      {/* Check animation */}
      <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="2.5" fill="none" strokeOpacity="0.4"/>
          <path d="M14 24L21 31L34 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="100" className="animate-draw-check"/>
        </svg>
      </div>

      <div className="text-center space-y-1">
        <h1 className="font-bold text-2xl text-white">주문이 접수되었습니다! 🎉</h1>
        <p className="text-white/70 text-sm">신당 할랄 키친에서 조리를 시작합니다</p>
      </div>

      {/* Order number */}
      <div className="bg-white/15 backdrop-blur rounded-2xl px-6 py-4 text-center">
        <p className="text-white/60 text-xs font-medium mb-0.5">주문번호</p>
        <p className="text-white font-bold text-lg tracking-widest">#HMK-20241124-8847</p>
      </div>

      {/* ETA */}
      <div className="bg-white rounded-2xl px-6 py-4 text-center w-full">
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--muted)" }}>예상 배달 시간</p>
        <p className="font-bold text-3xl" style={{ color: "var(--green)" }}>35–45분</p>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>오후 3:15 ~ 3:25 도착 예정</p>
      </div>

      {/* Status steps */}
      <div className="w-full bg-white/10 backdrop-blur rounded-2xl p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-1.5 relative flex-1">
              {i < steps.length - 1 && (
                <div className="absolute top-3 left-1/2 w-full h-0.5" style={{ backgroundColor: i < 1 ? "white" : "rgba(255,255,255,0.3)" }} />
              )}
              <div className="w-6 h-6 rounded-full z-10 flex items-center justify-center" style={{ backgroundColor: i <= 1 ? "white" : "rgba(255,255,255,0.2)" }}>
                {i === 1 ? (
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: "var(--green)" }} />
                ) : i < 1 ? (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4l2.5 2.5L9 1"/></svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                )}
              </div>
              <p className="text-white/80 text-[9px] font-medium text-center leading-tight">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Buttons */}
    <div className="relative z-10 px-5 pb-10 space-y-3">
      <button className="w-full py-4 rounded-2xl font-bold text-white text-base border-2 border-white/40">
        주문 추적하기
      </button>
      <button className="w-full py-3 rounded-2xl font-semibold text-sm bg-white" style={{ color: "var(--green)" }}>
        홈으로 돌아가기
      </button>
    </div>
  </div>
);
