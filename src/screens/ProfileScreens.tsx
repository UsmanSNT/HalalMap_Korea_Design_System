import { AddressBook, ProfileEditor } from "../components/CustomerForms";
import { tx } from "../i18n/content";
import { showUnavailable, showFeedback } from "../components/CustomerFeedback";
import { goBack, openEntity, routeParam, navigateTo } from "../services/navigation";
import { useLocal, writeLocal, directions } from "../services/customerState";
import React, { useState, useEffect } from "react";
import { GeometricPattern, StatusBar, BottomNav, BackButton, Toggle, HalalBadge, StarRating, TabId } from "../components/Shared";
import { getRestaurants } from "../api/restaurants";
import { getMosques } from "../api/mosques";
import { getProfile, type Profile } from "../api/profile";
import { getSavedPlaces, type SavedPlaces } from "../api/savedPlaces";
import { useLanguage } from "../i18n/LanguageContext";
import { LANGUAGES } from "../i18n";
import type { ScreenId } from "../App";

// ── 28. Profile Screen ─────────────────────────────────────────────────────────
export const ProfileScreen = ({ onTabChange, onLogout, onNavigate }: { onTabChange?: (t: TabId) => void; onLogout?: () => void; onNavigate?: (s: ScreenId) => void }) => {
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localName] = useLocal("profile-name", "Test User");

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const currentLangName = LANGUAGES.find((l) => l.code === lang)?.name ?? "한국어";

  const profileMenu: { icon: string; label: string; sub: string; target: ScreenId }[] = [
    { icon: "📦", label: t("profile.menu_orders"), sub: t("profile.menu_orders_sub").replace("{count}", "12"), target: "order-history" },
    { icon: "🏠", label: t("profile.menu_address"), sub: t("profile.menu_address_sub").replace("{count}", "3"), target: "address" },
    { icon: "💳", label: t("profile.menu_payment"), sub: "신한카드 ····4521", target: "settings" },
    { icon: "❤️", label: t("profile.menu_saved"), sub: t("profile.menu_saved_sub").replace("{count}", "5"), target: "saved-places" },
    { icon: "🔔", label: t("profile.menu_notifications"), sub: "", target: "notifications" },
    { icon: "🌐", label: t("profile.menu_language"), sub: currentLangName, target: "language" },
    { icon: "🎟", label: t("profile.menu_loyalty"), sub: t("profile.menu_loyalty_sub").replace("{points}", "3,200"), target: "loyalty" },
    { icon: "❓", label: t("profile.menu_support"), sub: "", target: "community" },
    { icon: "📖", label: t("profile.menu_tutorial"), sub: t("profile.menu_tutorial_sub"), target: "tutorial" },
    { icon: "📷", label: t("scanner.history_title"), sub: "", target: "scan-history" },
    { icon: "🍽️", label: t("smart.meal_plan_title"), sub: "", target: "meal-plans" },
    { icon: "👥", label: t("rewards.referral_title"), sub: "", target: "referral" },
    { icon: "🎉", label: t("engagement.eid_deals_title"), sub: "", target: "eid" },
    { icon: "🌐", label: t("accessibility.multilingual_title"), sub: "", target: "multilingual" },
    { icon: "⚙️", label: t("profile.menu_settings"), sub: "", target: "settings" },
  ];

  const statsRow = profile
    ? [
        { label: t("profile.stat_orders"), val: `${profile.stats.orders}회` },
        { label: t("profile.stat_reviews"), val: `${profile.stats.reviews}개` },
        { label: t("profile.stat_saved"), val: `${profile.stats.saved}개` },
      ]
    : [
        { label: t("profile.stat_orders"), val: "-" },
        { label: t("profile.stat_reviews"), val: "-" },
        { label: t("profile.stat_saved"), val: "-" },
      ];

  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="relative overflow-hidden flex-shrink-0" style={{ backgroundColor: "var(--green)" }}>
      <GeometricPattern color="white" opacity={0.06} />
      <StatusBar dark />
      <div className="relative z-10 px-5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white">
            {tx(profile?.initials ?? "...")}
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-white">{tx(localName)}</p>
            <p className="text-white/70 text-sm">{tx(profile?.email ?? "")}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{tx(profile?.membership ?? "")}</span>
              {tx(profile && <span className="text-xs text-white/60">· {tx(profile.points.toLocaleString())} {t("profile.points_unit")}</span>)}
            </div>
          </div>
          <button type="button" onClick={() => onNavigate?.("settings")} className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8"><path d="M2 12L5 11L13 3a1.4 1.4 0 00-2-2L3 10L2 13z"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div className="flex-1 phone-scroll">
      <div className="bg-white px-4 py-4 flex divide-x divide-[var(--border)]">
        {tx(statsRow.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p className="font-bold text-xl text-[#1A1A18]">{tx(s.val)}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{tx(s.label)}</p>
          </div>
        )))}
      </div>

      {/* Menu */}
      <div className="bg-white mt-2 divide-y divide-[var(--border)]">
        {tx(profileMenu.map((item) => (
          <button key={item.label} onClick={() => [t("profile.menu_payment"), t("profile.menu_support")].includes(item.label) ? showUnavailable() : onNavigate?.(item.target)} className="w-full flex items-center gap-3 px-5 py-4 text-left active:bg-[var(--cream)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--cream)] flex items-center justify-center text-lg flex-shrink-0">
              {tx(item.icon)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A18]">{tx(item.label)}</p>
              {tx(item.sub && <p className="text-xs text-[var(--muted)] mt-0.5">{tx(item.sub)}</p>)}
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8">
              <path d="M6 4l4 4-4 4" strokeLinecap="round"/>
            </svg>
          </button>
        )))}
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="text-xs text-[var(--muted)] text-center">HalalMap Korea v1.0.0</p>
        <button onClick={onLogout} className="w-full py-3 rounded-2xl font-semibold text-sm border border-[var(--danger)] text-[var(--danger)]">
          {t("common.logout")}
        </button>
      </div>
    </div>

    <BottomNav active="profile" onTabChange={onTabChange} />
  </div>
  );
};

// ── 29. Saved Places ───────────────────────────────────────────────────────────
const halalBadgeMap = (status: string) =>
  status === "certified" ? ("certified" as const) : status === "muslim-owned" ? ("owned" as const) : ("friendly" as const);

export const SavedPlacesScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"restaurants" | "mosques">("restaurants");
  const [places, setPlaces] = useState<SavedPlaces | null>(null);
  const [favorites, setFavorites] = useLocal<string[]>("favorite-restaurants", ["sindang-halal", "itaewon-kebab", "masjid-seoul-cafe"]);
  const [mosqueFavorites, setMosqueFavorites] = useLocal<string[]>("favorite-mosques", ["seoul-central", "itaewon-masjid"]);

  useEffect(() => {
    Promise.all([getRestaurants(),getMosques()]).then(([restaurants,mosques]) => setPlaces({
      restaurants: restaurants.map(r => ({id:r.id,name:r.nameKo,halalStatus:r.halalStatus,rating:r.rating,reviewCount:r.reviewCount,imageId:r.photo.match(/photo-([^?]+)/)?.[1] ?? ""})),
      mosques: mosques.map(m => ({id:m.id,name:m.nameKo,nameEn:m.name,distance:m.distance})),
    })).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => goBack("profile")} />
          <h1 className="font-bold text-lg flex-1">{t("profile.saved_places_title")}</h1>
        </div>
        <div className="flex bg-[var(--cream)] mx-4 mb-4 rounded-xl p-1">
          {tx((["restaurants", "mosques"] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === tabId ? "var(--green)" : "transparent",
                color: tab === tabId ? "white" : "var(--muted)",
              }}
            >
              {tx(tabId === "restaurants" ? t("profile.tab_restaurants") : t("profile.tab_mosques"))}
            </button>
          )))}
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        {tx(!places ? (
          <p className="text-center text-sm text-[var(--muted)] py-8">{t("common.loading")}</p>
        ) : tab === "restaurants" ? (
          places.restaurants.filter(r => favorites.includes(r.id)).map((r) => (
            <div key={r.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-stretch">
              <div className="w-24 h-24 flex-shrink-0 bg-[#E8E6E1]">
                <img src={`https://images.unsplash.com/photo-${r.imageId}?w=180&h=180&fit=crop&auto=format&q=80`} alt={tx(r.name)} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <HalalBadge variant={halalBadgeMap(r.halalStatus)} />
                  <p className="font-bold text-sm text-[#1A1A18] mt-1">{tx(r.name)}</p>
                  <StarRating rating={r.rating} count={r.reviewCount} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => openEntity("restaurant-detail","restaurant",r.id)} className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("profile.order_now")}</button>
                  <button type="button" onClick={() => setFavorites(ids => ids.filter(id => id !== r.id))} className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--danger)"><path d="M7 12S1 8 1 4.5C1 2.5 2.7 1 4.5 1c.9 0 1.8.4 2.5 1C7.7 1.4 8.6 1 9.5 1 11.3 1 13 2.5 13 4.5 13 8 7 12 7 12Z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          places.mosques.filter(m => mosqueFavorites.includes(m.id)).map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--gold-light)" }}>
                <span className="text-2xl">🕌</span>
              </div>
              <div className="flex-1">
                <button onClick={() => openEntity("mosque-detail","mosque",m.id)} className="font-bold text-base text-[#1A1A18]">{tx(m.name)}</button>
                <p className="text-xs text-[var(--muted)]">{tx(m.nameEn)} · {tx(m.distance)}</p>
              </div>
              <button type="button" onClick={() => setMosqueFavorites(ids => ids.filter(id => id !== m.id))} className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--gold)"><path d="M7 12S1 8 1 4.5C1 2.5 2.7 1 4.5 1c.9 0 1.8.4 2.5 1C7.7 1.4 8.6 1 9.5 1 11.3 1 13 2.5 13 4.5 13 8 7 12 7 12Z"/></svg>
              </button>
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

// ── 30. Address Management ─────────────────────────────────────────────────────
const addressData = [
  { icon: "🏠", key: "home", addr: "서울특별시 용산구 이태원로 123, 501호", default: true },
  { icon: "🏢", key: "work", addr: "서울특별시 강남구 테헤란로 456, 12층", default: false },
  { icon: "🕌", key: "mosque", addr: "서울특별시 용산구 우사단로10길 39", default: false },
];

export const AddressScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  return <div className="flex flex-col h-full bg-[var(--cream)]"><StatusBar /><header className="flex gap-3 items-center p-4"><BackButton onBack={() => goBack("profile")} /><h1 className="font-bold text-lg">{t("profile.address_title")}</h1></header><div className="flex-1 phone-scroll p-4"><AddressBook /></div></div>;
};

// ── 31. Settings ───────────────────────────────────────────────────────────────
export const SettingsScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t, lang } = useLanguage();
  const [notifOrder, setNotifOrder] = useLocal("notify-order", true);
  const [notifPrayer, setNotifPrayer] = useLocal("notify-prayer", true);
  const [notifPromo, setNotifPromo] = useLocal("notify-promo", false);
  const [theme, setTheme] = useLocal<"light" | "dark" | "auto">("theme", "light");
  const [editingProfile, setEditingProfile] = useState(false);
  const currentLangName = LANGUAGES.find((l) => l.code === lang)?.name ?? "한국어";
  const themeLabels: Record<typeof theme, string> = { light: t("profile.theme_light"), dark: t("profile.theme_dark"), auto: t("profile.theme_auto") };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => goBack("profile")} />
          <h1 className="font-bold text-lg">{t("profile.settings_title")}</h1>
        </div>
      </div>

      <div className="flex-1 phone-scroll space-y-2 py-3">
        {/* Notifications */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2">{t("profile.section_notifications")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {tx([
              { label: t("profile.notif_order"), sub: t("profile.notif_order_sub"), state: notifOrder, set: setNotifOrder },
              { label: t("profile.notif_prayer"), sub: t("profile.notif_prayer_sub"), state: notifPrayer, set: setNotifPrayer },
              { label: t("profile.notif_promo"), sub: t("profile.notif_promo_sub"), state: notifPromo, set: setNotifPromo },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A18]">{tx(n.label)}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{tx(n.sub)}</p>
                </div>
                <Toggle on={n.state} onToggle={() => n.set(!n.state)} />
              </div>
            )))}
          </div>
        </div>

        {/* App */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">{t("profile.section_app")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            <button onClick={() => onNavigate?.("language")} className="w-full flex items-center justify-between px-5 py-4">
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1A1A18]">{t("profile.language_row")}</p>
                <p className="text-xs text-[var(--muted)]">{t("profile.language_row")}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--muted)]">{tx(currentLangName)}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </div>
            </button>

            {/* Theme */}
            <div className="px-5 py-4">
              <p className="text-sm font-semibold text-[#1A1A18] mb-3">{t("profile.theme_row")}</p>
              <div className="flex gap-2">
                {tx((["light", "dark", "auto"] as const).map((themeId) => (
                  <button
                    key={themeId}
                    onClick={() => themeId === "light" ? setTheme(themeId) : showUnavailable()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                    style={{
                      backgroundColor: theme === themeId ? "var(--green)" : "white",
                      color: theme === themeId ? "white" : "var(--muted)",
                      borderColor: theme === themeId ? "var(--green)" : "var(--border)",
                    }}
                  >
                    {tx(themeLabels[themeId])}
                  </button>
                )))}
              </div>
            </div>

            <button type="button" onClick={showUnavailable} className="w-full flex items-center justify-between px-5 py-4">
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1A1A18]">{t("profile.halal_authority")}</p>
                <p className="text-xs text-[var(--muted)]">KMF, JAKIM, IFANCA</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {editingProfile && <ProfileEditor />}
        {/* Account */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">{t("profile.section_account")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {tx([t("profile.edit_profile"), t("profile.change_password")].map((item) => (
              <button type="button" onClick={() => item === t("profile.edit_profile") ? setEditingProfile(v => !v) : showUnavailable()} key={item} className="w-full flex items-center justify-between px-5 py-4">
                <p className="text-sm font-semibold text-[#1A1A18]">{tx(item)}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </button>
            )))}
            <button type="button" onClick={showUnavailable} className="w-full flex items-center justify-between px-5 py-4">
              <p className="text-sm font-semibold" style={{ color: "var(--danger)" }}>{t("profile.delete_data")}</p>
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">{t("profile.section_info")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {tx([t("profile.terms"), t("profile.privacy")].map((item) => (
              <button type="button" onClick={() => item === t("profile.edit_profile") ? setEditingProfile(v => !v) : showUnavailable()} key={item} className="w-full flex items-center justify-between px-5 py-4">
                <p className="text-sm font-semibold text-[#1A1A18]">{tx(item)}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </button>
            )))}
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-sm font-semibold text-[#1A1A18]">{t("profile.app_version")}</p>
              <p className="text-sm text-[var(--muted)]">1.0.0</p>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
};
