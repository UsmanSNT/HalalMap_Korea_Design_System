import React, { useEffect, useState } from "react";
import {
  GeometricPattern, StatusBar, BottomNav, HalalBadge, StarRating,
  RestaurantCardV, RestaurantCardH, MosqueCard, SectionHeader, PriceTag, BackButton, TabId
} from "../components/Shared";
import { getRestaurants, getRestaurant, getRestaurantMenu, type Restaurant, type MenuItem } from "@/api/restaurants";
import { getMosques, getPrayerTimes, type Mosque, type PrayerTimesData } from "@/api/mosques";
import { useLanguage } from "../i18n/LanguageContext";
import type { ScreenId } from "../App";

const extractImageId = (url: string): string => {
  const match = url.match(/photo-([^?]+)/);
  return match ? match[1] : "1498654896293-37c98e7f5fe4";
};

const halalBadgeMap = (status: string) =>
  status === "certified" ? "certified" as const
    : status === "muslim-owned" ? "owned" as const
    : "friendly" as const;

const formatFee = (fee: number, freeLabel: string) => fee === 0 ? freeLabel : `₩${fee.toLocaleString()}`;

// ── 6. Home Screen ─────────────────────────────────────────────────────────────
const categoryKeys = [
  { icon: "🍖", key: "cat_korean" },
  { icon: "🥙", key: "cat_turkish" },
  { icon: "🍽️", key: "cat_uzbek" },
  { icon: "🍛", key: "cat_indian" },
  { icon: "🥗", key: "cat_arabic" },
  { icon: "🫕", key: "cat_pakistani" },
  { icon: "🍜", key: "cat_indonesian" },
  { icon: "🔍", key: "cat_all" },
];

export const HomeScreen = ({ onTabChange, onNavigate }: { onTabChange?: (t: TabId) => void; onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const categories = categoryKeys.map((c) => ({ icon: c.icon, label: t(`home.${c.key}`) }));
  const [restaurantList, setRestaurantList] = useState<Restaurant[]>([]);
  const [mosqueList, setMosqueList] = useState<Mosque[]>([]);
  const [prayer, setPrayer] = useState<{ next: PrayerTimesData["prayers"][number] | null; location: string }>({ next: null, location: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getRestaurants(), getMosques(), getPrayerTimes()])
      .then(([r, m, p]) => {
        if (cancelled) return;
        setRestaurantList(r);
        setMosqueList(m.filter((x) => x.type === "mosque").slice(0, 2));
        const now = new Date();
        const nextPrayer = p.prayerTimes.prayers.find((pr) => {
          if (pr.id === "sunrise") return false;
          const [h, min] = pr.time.split(":").map(Number);
          return h > now.getHours() || (h === now.getHours() && min > now.getMinutes());
        });
        setPrayer({ next: nextPrayer ?? p.prayerTimes.prayers[0], location: p.location });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const featured = restaurantList.slice(0, 3);

  return (
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
            <button onClick={() => onNavigate?.("notifications")} className="relative w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
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
              <p className="text-white/70 text-xs font-medium">{t("home.next_prayer")}</p>
              <p className="text-white font-bold text-sm">
                {prayer.next ? `${prayer.next.name} ${prayer.next.nameEn}` : t("common.loading")}{" "}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-base">{prayer.next?.time ?? "--:--"}</p>
              <div className="w-20 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "38%", backgroundColor: "var(--gold)" }} />
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div onClick={() => onNavigate?.("search")} className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--muted)" strokeWidth="1.8">
              <circle cx="8" cy="8" r="5.5"/>
              <path d="M13.5 13.5L17 17" strokeLinecap="round"/>
            </svg>
            <span className="text-sm text-[var(--muted)] flex-1">{t("home.search_placeholder")}</span>
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
                onClick={() => onNavigate?.(categoryKeys[i].key === "cat_all" ? "restaurant-list" : "search")}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl bg-white border border-[var(--border)] min-w-fit active:scale-95 transition-transform"
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-xs font-medium text-[#1A1A18] whitespace-nowrap">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured restaurants */}
        <div className="pt-4">
          <SectionHeader title={t("home.popular_restaurants")} action={t("common.see_all")} onAction={() => onNavigate?.("restaurant-list")} />
          <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
            {loading ? (
              <p className="text-sm text-[var(--muted)] px-1">{t("common.loading")}</p>
            ) : (
              featured.map((r) => (
                <RestaurantCardV
                  key={r.id}
                  name={r.nameKo}
                  imageId={extractImageId(r.photo)}
                  badge={halalBadgeMap(r.halalStatus)}
                  rating={r.rating}
                  count={r.reviewCount}
                  distance={r.distance}
                  eta={r.deliveryTime}
                  fee={formatFee(r.deliveryFee, t("common.free"))}
                  onClick={() => onNavigate?.("restaurant-detail")}
                />
              ))
            )}
          </div>
        </div>

        {/* Nearby mosques */}
        <div className="pt-5">
          <SectionHeader title={t("home.nearby_mosques")} action={t("home.view_map")} onAction={() => onNavigate?.("mosque-list")} />
          <div className="px-4 space-y-2.5">
            {loading ? (
              <p className="text-sm text-[var(--muted)] px-1">{t("common.loading")}</p>
            ) : (
              mosqueList.map((m) => (
                <MosqueCard
                  key={m.id}
                  name={m.nameKo}
                  nameKo={m.name}
                  distance={m.distance}
                  nextPrayer={prayer.next ? `${prayer.next.name} ${prayer.next.time}` : ""}
                  walkTime={m.walkTime ?? ""}
                  onClick={() => onNavigate?.("mosque-detail")}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick services grid */}
        <div className="pt-5 px-4">
          <h3 className="font-bold text-base text-[#1A1A18] mb-3">{t("home.services")}</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: "📷", key: "svc_scan", screen: "scanner" as ScreenId },
              { icon: "🤖", key: "svc_ai_meal", screen: "ai-meal" as ScreenId },
              { icon: "👥", key: "svc_group_order", screen: "group-order" as ScreenId },
              { icon: "🛒", key: "svc_grocery", screen: "grocery" as ScreenId },
              { icon: "✈️", key: "svc_travel", screen: "travel-planner" as ScreenId },
              { icon: "🌙", key: "svc_ramadan", screen: "ramadan" as ScreenId },
              { icon: "⭐", key: "svc_reviews", screen: "reviews" as ScreenId },
              { icon: "🎁", key: "svc_rewards", screen: "loyalty" as ScreenId },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => onNavigate?.(s.screen)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white border border-[var(--border)] active:scale-95 transition-transform"
              >
                <span className="text-xl">{s.icon}</span>
                <span className="text-[10px] font-medium text-[#1A1A18] leading-tight text-center">{t(`home.${s.key}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Promo banner */}
        <div className="px-4 pt-5 pb-6">
          <div
            className="relative rounded-2xl p-5 overflow-hidden cursor-pointer"
            onClick={() => onNavigate?.("restaurant-list")}
            style={{ background: "linear-gradient(135deg, var(--gold) 0%, #A0692A 100%)" }}
          >
            <GeometricPattern color="white" opacity={0.08} />
            <div className="relative z-10">
              <p className="text-white/80 text-xs font-medium mb-1">{t("home.promo_label")}</p>
              <p className="text-white font-bold text-lg leading-tight">{t("home.promo_title")}</p>
              <p className="text-white/70 text-xs mt-1">{t("home.promo_code")}</p>
              <button className="mt-3 px-4 py-2 bg-white rounded-xl text-xs font-bold" style={{ color: "var(--gold)" }}>
                {t("home.promo_cta")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="home" onTabChange={onTabChange} />
    </div>
  );
};

// ── 7. Restaurant List ─────────────────────────────────────────────────────────
const filterKeys = ["filter_distance", "filter_rating", "filter_fee", "filter_cert", "filter_cuisine"];

const categoryMap: Record<string, string> = {
  korean: "한식", turkish: "터키", uzbek: "우즈베크", indian: "인도",
  indonesian: "인도네시아", cafe: "카페", arabic: "아랍",
};

export const RestaurantListScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const filters = filterKeys.map((k) => t(`home.${k}`));
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [list, setList] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants()
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg flex-1">{t("home.restaurants_title")}</h1>
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
            {t("home.filter_fastest")}
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
        {loading ? (
          <p className="text-sm text-[var(--muted)]">{t("common.loading")}</p>
        ) : (
          <>
            <p className="text-xs text-[var(--muted)] font-medium mb-1">{t("home.nearby_count").replace("{count}", String(list.length))}</p>
            {list.map((r) => (
              <div key={r.id} onClick={() => onNavigate?.("restaurant-detail")} className="cursor-pointer">
                <RestaurantCardH
                  name={r.nameKo}
                  imageId={extractImageId(r.photo)}
                  badge={halalBadgeMap(r.halalStatus)}
                  rating={r.rating}
                  count={r.reviewCount}
                  distance={r.distance}
                  eta={r.deliveryTime}
                  fee={formatFee(r.deliveryFee, t("common.free"))}
                  cuisine={categoryMap[r.category] ?? r.category}
                />
              </div>
            ))}
          </>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
};

// ── 8. Restaurant Detail ───────────────────────────────────────────────────────
const menuTabKeys = ["menu_all", "menu_popular", "menu_korean", "menu_drinks", "menu_sides"];

export const RestaurantDetailScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const menuTabs = menuTabKeys.map((k) => t(`home.${k}`));
  const [activeTab, setActiveTab] = useState(menuTabs[1]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<import("@/api/restaurants").MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getRestaurant("sindang-halal"),
      getRestaurantMenu("sindang-halal"),
    ])
      .then(([r, m]) => {
        if (cancelled) return;
        setRestaurant(r);
        setMenuItems(m.menu);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading || !restaurant) {
    return (
      <div className="flex flex-col h-full bg-[var(--cream)] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">{t("common.loading")}</p>
      </div>
    );
  }

  const previewItems = menuItems.slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Hero */}
      <div className="relative flex-shrink-0">
        <div className="h-52 bg-[#D8D4CD] relative">
          <img
            src={`${restaurant.photo}&w=390&h=210&fit=crop&auto=format&q=80`}
            alt={restaurant.nameKo}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="absolute top-0 left-0 right-0">
          <StatusBar dark />
        </div>
        <div className="absolute top-12 left-4">
          <BackButton dark onBack={() => onNavigate?.("home")} />
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
            <h1 className="font-bold text-xl text-[#1A1A18] leading-tight">{restaurant.nameKo}</h1>
            <HalalBadge variant={halalBadgeMap(restaurant.halalStatus)} />
          </div>
          <p className="text-sm text-[var(--muted)] mb-3">{restaurant.description}</p>

          <div className="flex items-center gap-4 mb-4">
            <StarRating rating={restaurant.rating} count={restaurant.reviewCount} />
            <span className="text-xs text-[var(--muted)]">·</span>
            <span className="text-xs text-[var(--muted)]">📍 {restaurant.distance}</span>
            <span className="text-xs text-[var(--muted)]">·</span>
            <span className="text-xs text-[var(--muted)]">⏱ {restaurant.deliveryTime}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-[var(--border)]">
            {[
              { label: t("home.min_order"), value: `₩${restaurant.minOrder.toLocaleString()}` },
              { label: t("home.delivery_fee"), value: formatFee(restaurant.deliveryFee, t("common.free")) },
              { label: t("home.business_hours"), value: restaurant.hours },
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
            {menuTabs.map((tabLabel) => (
              <button
                key={tabLabel}
                onClick={() => setActiveTab(tabLabel)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: activeTab === tabLabel ? "var(--green)" : "transparent",
                  color: activeTab === tabLabel ? "white" : "var(--muted)",
                }}
              >
                {tabLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Menu items preview */}
        <div className="px-4 pt-4 pb-28 space-y-3">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">🔥 {t("home.menu_popular")}</p>
          {previewItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm">
              <div className="w-20 h-20 rounded-xl bg-[#E8E6E1] flex-shrink-0 overflow-hidden">
                {item.photo && (
                  <img src={`${item.photo}&w=120&h=120&fit=crop&auto=format&q=80`} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 py-1">
                <p className="font-semibold text-sm text-[#1A1A18]">{item.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{item.description}</p>
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
        <button onClick={() => onNavigate?.("menu")} className="w-full py-4 rounded-2xl font-bold text-white text-base" style={{ backgroundColor: "var(--green)" }}>
          {t("home.view_full_menu")}
        </button>
      </div>
    </div>
  );
};

// ── 9. Menu Screen ─────────────────────────────────────────────────────────────
const menuCategoryKeys = ["menu_popular", "menu_korean", "menu_sets", "menu_drinks", "menu_sides"];

export const MenuScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const menuCategories = menuCategoryKeys.map((k) => t(`home.${k}`));
  const [activeTab, setActiveTab] = useState(menuCategories[0]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [restaurantName, setRestaurantName] = useState(t("common.loading"));
  const [apiMenuItems, setApiMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurantMenu("sindang-halal")
      .then((data) => {
        setRestaurantName(data.restaurant.name);
        setApiMenuItems(data.menu);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = apiMenuItems.reduce((acc, item) => acc + (cart[item.id] || 0) * item.price, 0);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <div className="flex-1">
            <h1 className="font-bold text-base">{restaurantName}</h1>
            <p className="text-xs text-[var(--muted)]">{t("home.menu_selection")}</p>
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
          {menuCategories.map((tabLabel) => (
            <button
              key={tabLabel}
              onClick={() => setActiveTab(tabLabel)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeTab === tabLabel ? "var(--green)" : "transparent",
                color: activeTab === tabLabel ? "white" : "var(--muted)",
              }}
            >
              {tabLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="flex-1 phone-scroll px-4 pt-4 space-y-3">
        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide px-1">🔥 {activeTab}</p>
        {loading ? (
          <p className="text-sm text-[var(--muted)]">{t("common.loading")}</p>
        ) : (
          apiMenuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm">
              <div className="relative w-20 h-20 rounded-xl bg-[#E8E6E1] flex-shrink-0 overflow-hidden">
                {item.photo && (
                  <img src={`${item.photo}&w=120&h=120&fit=crop&auto=format&q=80`} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 py-0.5">
                <p className="font-semibold text-sm text-[#1A1A18]">{item.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{item.description}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--green-light)] text-[var(--green)]">{item.category}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <PriceTag amount={item.price} className="text-sm" />
                  {cart[item.id] ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCart(c => ({ ...c, [item.id]: Math.max(0, (c[item.id] || 0) - 1) }))}
                        className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-sm font-bold text-[var(--green)]">−</button>
                      <span className="text-sm font-bold w-4 text-center">{cart[item.id]}</span>
                      <button onClick={() => setCart(c => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }))}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "var(--green)" }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => setCart(c => ({ ...c, [item.id]: 1 }))}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-lg font-light" style={{ backgroundColor: "var(--green)" }}>+</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div className="h-20" />
      </div>

      {/* Cart CTA */}
      {cartCount > 0 && (
        <div className="px-4 pb-8 pt-3 bg-white border-t border-[var(--border)] flex-shrink-0">
          <button className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-between px-5" style={{ backgroundColor: "var(--green)" }}>
            <span className="bg-white/20 rounded-lg px-2.5 py-1 text-sm">{cartCount}{t("home.cart_count_unit")}</span>
            <span>{t("home.view_cart")}</span>
            <span>₩{cartTotal.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ── 10. Item Detail ────────────────────────────────────────────────────────────
export const ItemDetailScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const sizeOptions = [
    { key: "regular", label: t("home.size_regular"), extra: 0 },
    { key: "large", label: t("home.size_large"), extra: 2000 },
  ];
  const spiceOptions = [
    { key: "mild", label: t("home.spice_mild") },
    { key: "medium", label: t("home.spice_medium") },
    { key: "hot", label: t("home.spice_hot") },
  ];
  const [size, setSize] = useState("regular");
  const [spice, setSpice] = useState("medium");
  const [extras, setExtras] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const basePrice = 13500;
  const sizeExtra = size === "large" ? 2000 : 0;
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
        <div className="absolute top-12 left-4"><BackButton dark onBack={() => onNavigate?.("home")} /></div>
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
          <p className="font-semibold text-sm text-[#1A1A18] mb-2.5">{t("home.size_select")} <span className="text-[var(--danger)] text-xs">{t("home.required")}</span></p>
          <div className="space-y-2">
            {sizeOptions.map((s) => (
              <button key={s.key} onClick={() => setSize(s.key)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all"
                style={{ borderColor: size === s.key ? "var(--green)" : "var(--border)", backgroundColor: size === s.key ? "var(--green-light)" : "white" }}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: size === s.key ? "var(--green)" : "var(--border)" }}>
                    {size === s.key && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--green)" }} />}
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
          <p className="font-semibold text-sm text-[#1A1A18] mb-2.5">{t("home.extra_sides")} <span className="text-[var(--muted)] text-xs font-normal">{t("home.optional")}</span></p>
          <div className="space-y-2">
            {["깍두기", "배추김치", "오이무침"].map((ex) => (
              <button key={ex} onClick={() => toggleExtra(ex)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                style={{ borderColor: extras.includes(ex) ? "var(--green)" : "var(--border)", backgroundColor: extras.includes(ex) ? "var(--green-light)" : "white" }}>
                <div className="w-5 h-5 rounded border-2 flex items-center justify-center" style={{ borderColor: extras.includes(ex) ? "var(--green)" : "var(--border)", backgroundColor: extras.includes(ex) ? "var(--green)" : "white" }}>
                  {extras.includes(ex) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4l2.5 2.5L9 1"/></svg>}
                </div>
                <span className="text-sm font-medium text-[#1A1A18] flex-1 text-left">{ex}</span>
                <span className="text-xs text-[var(--muted)]">{t("common.free")}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spice */}
        <div>
          <p className="font-semibold text-sm text-[#1A1A18] mb-2.5">{t("home.spice_select")}</p>
          <div className="flex gap-2">
            {spiceOptions.map((s) => (
              <button key={s.key} onClick={() => setSpice(s.key)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all"
                style={{ borderColor: spice === s.key ? "var(--green)" : "var(--border)", backgroundColor: spice === s.key ? "var(--green)" : "white", color: spice === s.key ? "white" : "var(--charcoal)" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Special instructions */}
        <div>
          <p className="font-semibold text-sm text-[#1A1A18] mb-2">{t("home.special_request")}</p>
          <textarea
            className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[#1A1A18] bg-white outline-none resize-none focus:border-[var(--green)]"
            rows={3}
            placeholder={t("home.special_request_placeholder")}
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
          <button onClick={() => onNavigate?.("cart")} className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-between px-5" style={{ backgroundColor: "var(--green)" }}>
            <span>{t("home.add_to_cart")}</span>
            <PriceTag amount={total} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── 11. Cart ───────────────────────────────────────────────────────────────────
export const CartScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
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
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg flex-1">{t("home.cart_title")}</h1>
          <span className="text-sm font-semibold" style={{ color: "var(--green)" }}>{items.length}{t("home.cart_count_unit")}</span>
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
            {t("home.add_more_items")}
          </button>
        </div>

        {/* Coupon */}
        <div className="bg-white mt-2 px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">{t("home.coupon_title")}</p>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder={t("home.coupon_placeholder")}
              className="flex-1 border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--green)] bg-[var(--cream)]"
            />
            <button className="px-4 py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("common.apply")}</button>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("home.note_placeholder")}
            className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none resize-none bg-[var(--cream)]"
            rows={2}
          />
        </div>

        {/* Price breakdown */}
        <div className="bg-white mt-2 px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">{t("home.order_amount")}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[var(--muted)]">
              <span>{t("home.subtotal")}</span><span>₩{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--muted)]">
              <span>{t("home.delivery_fee")}</span><span>₩{deliveryFee.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm font-semibold" style={{ color: "var(--danger)" }}>
                <span>{t("home.coupon_discount")}</span><span>-₩{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
              <span>{t("home.total")}</span><span>₩{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-8 pt-3 bg-white border-t border-[var(--border)] flex-shrink-0">
        <button onClick={() => onNavigate?.("checkout")} className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-between px-6" style={{ backgroundColor: "var(--green)" }}>
          <span>{t("home.place_order")}</span>
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

export const CheckoutScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const [payment, setPayment] = useState("shinhan");
  const [tip, setTip] = useState(0);
  const total = 34500 + tip;
  const deliveryTimeOptions = [t("home.delivery_asap"), t("home.delivery_scheduled")];

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg">{t("home.checkout_title")}</h1>
        </div>
      </div>

      <div className="flex-1 phone-scroll pb-36 space-y-2">
        {/* Address */}
        <div className="bg-white px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">{t("home.delivery_address")}</p>
          <div className="flex items-start gap-3 p-3 bg-[var(--green-light)] rounded-xl">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--green)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5ZM8 7.5C7.2 7.5 6.5 6.8 6.5 6C6.5 5.2 7.2 4.5 8 4.5C8.8 4.5 9.5 5.2 9.5 6C9.5 6.8 8.8 7.5 8 7.5Z"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[var(--green)]">{t("home.address_home")}</p>
              <p className="text-sm text-[#1A1A18] leading-relaxed">서울특별시 용산구 이태원로 123, 501호</p>
            </div>
            <button className="text-[var(--green)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 13L5 12L13 4a1.4 1.4 0 00-2-2L3 11L2 14z"/></svg>
            </button>
          </div>
        </div>

        {/* Delivery time */}
        <div className="bg-white px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">{t("home.delivery_time")}</p>
          <div className="grid grid-cols-2 gap-2">
            {deliveryTimeOptions.map((opt, i) => (
              <button key={opt} className="py-3 px-4 rounded-xl text-sm font-semibold border transition-all"
                style={{ borderColor: i === 0 ? "var(--green)" : "var(--border)", backgroundColor: i === 0 ? "var(--green-light)" : "white", color: i === 0 ? "var(--green)" : "var(--muted)" }}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">{t("home.payment_method")}</p>
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
            {t("home.add_payment_method")}
          </button>
        </div>

        {/* Tip */}
        <div className="bg-white px-5 py-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A18]">{t("home.courier_tip")} <span className="text-xs font-normal text-[var(--muted)]">{t("home.optional_short")}</span></p>
          <div className="grid grid-cols-4 gap-2">
            {tips.map((tipAmount) => (
              <button key={tipAmount} onClick={() => setTip(tipAmount)}
                className="py-3 rounded-xl text-sm font-bold border transition-all"
                style={{ borderColor: tip === tipAmount ? "var(--green)" : "var(--border)", backgroundColor: tip === tipAmount ? "var(--green)" : "white", color: tip === tipAmount ? "white" : "var(--charcoal)" }}>
                {tipAmount === 0 ? t("home.no_tip") : `₩${tipAmount.toLocaleString()}`}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white px-5 py-4 space-y-2">
          <p className="font-semibold text-sm text-[#1A1A18]">{t("home.payment_amount")}</p>
          <div className="flex justify-between text-sm text-[var(--muted)]"><span>{t("home.subtotal")}</span><span>₩32,500</span></div>
          <div className="flex justify-between text-sm text-[var(--muted)]"><span>{t("home.delivery_fee")}</span><span>₩2,000</span></div>
          {tip > 0 && <div className="flex justify-between text-sm text-[var(--muted)]"><span>{t("home.tip")}</span><span>₩{tip.toLocaleString()}</span></div>}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
            <span>{t("home.total")}</span><span>₩{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 pt-3 bg-white border-t border-[var(--border)] flex-shrink-0">
        <button onClick={() => onNavigate?.("order-confirmation")} className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-between px-6" style={{ backgroundColor: "var(--green)" }}>
          <span>₩{total.toLocaleString()} {t("home.pay_button")}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M5 10h10M12 7l3 3-3 3"/></svg>
        </button>
      </div>
    </div>
  );
};

// ── 13. Order Confirmation ─────────────────────────────────────────────────────
const stepKeys = ["step_received", "step_preparing", "step_pickup", "step_delivered"];

export const OrderConfirmationScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const steps = stepKeys.map((k) => t(`home.${k}`));
  return (
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
        <h1 className="font-bold text-2xl text-white">{t("home.order_received_title")}</h1>
        <p className="text-white/70 text-sm">{t("home.order_received_desc").replace("{restaurant}", "신당 할랄 키친")}</p>
      </div>

      {/* Order number */}
      <div className="bg-white/15 backdrop-blur rounded-2xl px-6 py-4 text-center">
        <p className="text-white/60 text-xs font-medium mb-0.5">{t("home.order_number")}</p>
        <p className="text-white font-bold text-lg tracking-widest">#HMK-20241124-8847</p>
      </div>

      {/* ETA */}
      <div className="bg-white rounded-2xl px-6 py-4 text-center w-full">
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--muted)" }}>{t("home.estimated_delivery")}</p>
        <p className="font-bold text-3xl" style={{ color: "var(--green)" }}>{t("home.minutes_range")}</p>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t("home.arrival_estimate")}</p>
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
      <button onClick={() => onNavigate?.("order-tracking")} className="w-full py-4 rounded-2xl font-bold text-white text-base border-2 border-white/40">
        {t("home.track_order")}
      </button>
      <button onClick={() => onNavigate?.("home")} className="w-full py-3 rounded-2xl font-semibold text-sm bg-white" style={{ color: "var(--green)" }}>
        {t("home.back_to_home")}
      </button>
    </div>
  </div>
  );
};
