import React, { useState, useEffect } from "react";
import { GeometricPattern, StatusBar, BottomNav, BackButton, Toggle, HalalBadge, StarRating, TabId } from "../components/Shared";
import { getProfile, type Profile } from "../api/profile";
import { getSavedPlaces, type SavedPlaces } from "../api/savedPlaces";
import { useLanguage } from "../i18n/LanguageContext";
import { LANGUAGES } from "../i18n";
import type { ScreenId } from "../App";

// ── 28. Profile Screen ─────────────────────────────────────────────────────────
export const ProfileScreen = ({ onTabChange, onLogout, onNavigate }: { onTabChange?: (t: TabId) => void; onLogout?: () => void; onNavigate?: (s: ScreenId) => void }) => {
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);

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
            {profile?.initials ?? "..."}
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-white">{profile?.name ?? t("common.loading")}</p>
            <p className="text-white/70 text-sm">{profile?.email ?? ""}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{profile?.membership ?? ""}</span>
              {profile && <span className="text-xs text-white/60">· {profile.points.toLocaleString()} {t("profile.points_unit")}</span>}
            </div>
          </div>
          <button className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8"><path d="M2 12L5 11L13 3a1.4 1.4 0 00-2-2L3 10L2 13z"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div className="flex-1 phone-scroll">
      <div className="bg-white px-4 py-4 flex divide-x divide-[var(--border)]">
        {statsRow.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p className="font-bold text-xl text-[#1A1A18]">{s.val}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="bg-white mt-2 divide-y divide-[var(--border)]">
        {profileMenu.map((item) => (
          <button key={item.label} onClick={() => onNavigate?.(item.target)} className="w-full flex items-center gap-3 px-5 py-4 text-left active:bg-[var(--cream)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--cream)] flex items-center justify-center text-lg flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A18]">{item.label}</p>
              {item.sub && <p className="text-xs text-[var(--muted)] mt-0.5">{item.sub}</p>}
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8">
              <path d="M6 4l4 4-4 4" strokeLinecap="round"/>
            </svg>
          </button>
        ))}
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

  useEffect(() => {
    getSavedPlaces().then(setPlaces).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg flex-1">{t("profile.saved_places_title")}</h1>
        </div>
        <div className="flex bg-[var(--cream)] mx-4 mb-4 rounded-xl p-1">
          {(["restaurants", "mosques"] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === tabId ? "var(--green)" : "transparent",
                color: tab === tabId ? "white" : "var(--muted)",
              }}
            >
              {tabId === "restaurants" ? t("profile.tab_restaurants") : t("profile.tab_mosques")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        {!places ? (
          <p className="text-center text-sm text-[var(--muted)] py-8">{t("common.loading")}</p>
        ) : tab === "restaurants" ? (
          places.restaurants.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-stretch">
              <div className="w-24 h-24 flex-shrink-0 bg-[#E8E6E1]">
                <img src={`https://images.unsplash.com/photo-${r.imageId}?w=180&h=180&fit=crop&auto=format&q=80`} alt={r.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <HalalBadge variant={halalBadgeMap(r.halalStatus)} />
                  <p className="font-bold text-sm text-[#1A1A18] mt-1">{r.name}</p>
                  <StarRating rating={r.rating} count={r.reviewCount} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("profile.order_now")}</button>
                  <button className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--danger)"><path d="M7 12S1 8 1 4.5C1 2.5 2.7 1 4.5 1c.9 0 1.8.4 2.5 1C7.7 1.4 8.6 1 9.5 1 11.3 1 13 2.5 13 4.5 13 8 7 12 7 12Z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          places.mosques.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--gold-light)" }}>
                <span className="text-2xl">🕌</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-base text-[#1A1A18]">{m.name}</p>
                <p className="text-xs text-[var(--muted)]">{m.nameEn} · {m.distance}</p>
              </div>
              <button className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--gold)"><path d="M7 12S1 8 1 4.5C1 2.5 2.7 1 4.5 1c.9 0 1.8.4 2.5 1C7.7 1.4 8.6 1 9.5 1 11.3 1 13 2.5 13 4.5 13 8 7 12 7 12Z"/></svg>
              </button>
            </div>
          ))
        )}
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
  const addressLabels: Record<string, string> = { home: t("home.address_home"), work: "회사", mosque: "모스크 근처" };
  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-3">
        <BackButton onBack={() => onNavigate?.("home")} />
        <h1 className="font-bold text-lg flex-1">{t("profile.address_title")}</h1>
      </div>
    </div>

    <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
      {addressData.map((addr) => (
        <div key={addr.key} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: addr.default ? "var(--green-light)" : "var(--cream)" }}
            >
              {addr.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-sm text-[#1A1A18]">{addressLabels[addr.key]}</p>
                {addr.default && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--green)", color: "white" }}>{t("profile.default_badge")}</span>
                )}
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{addr.addr}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--muted)" strokeWidth="1.5"><path d="M2 10L4.5 9.5L11 3a1 1 0 00-1.5-1.5L3 8L2 11z"/></svg>
              </button>
              {!addr.default && (
                <button className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--danger)" strokeWidth="1.5"><path d="M2 3.5h10M5.5 3.5V2h3v1.5M6 6v4.5M8 6v4.5M3.5 3.5l.5 8h6l.5-8" strokeLinecap="round"/></svg>
                </button>
              )}
            </div>
          </div>
          {!addr.default && (
            <button className="mt-2 text-xs font-medium ml-13 pl-13" style={{ color: "var(--green)", paddingLeft: "52px" }}>
              {t("profile.set_as_default")}
            </button>
          )}
        </div>
      ))}

      {/* Add new */}
      <button className="w-full py-4 rounded-2xl border-2 border-dashed border-[var(--border)] flex items-center justify-center gap-2 font-semibold text-sm" style={{ color: "var(--muted)" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
        {t("profile.add_address")}
      </button>

      {/* Map hint */}
      <div className="h-28 rounded-2xl overflow-hidden bg-[#E8E4DC] relative">
        <img src="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=390&h=130&fit=crop&auto=format&q=80" alt="map" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-md flex items-center gap-2">
            <span>📍</span>
            <p className="text-sm font-semibold text-[#1A1A18]">{t("profile.select_on_map")}</p>
          </div>
        </div>
      </div>
      <div className="h-4" />
    </div>
  </div>
  );
};

// ── 31. Settings ───────────────────────────────────────────────────────────────
export const SettingsScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t, lang } = useLanguage();
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPrayer, setNotifPrayer] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const currentLangName = LANGUAGES.find((l) => l.code === lang)?.name ?? "한국어";
  const themeLabels: Record<typeof theme, string> = { light: t("profile.theme_light"), dark: t("profile.theme_dark"), auto: t("profile.theme_auto") };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg">{t("profile.settings_title")}</h1>
        </div>
      </div>

      <div className="flex-1 phone-scroll space-y-2 py-3">
        {/* Notifications */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2">{t("profile.section_notifications")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {[
              { label: t("profile.notif_order"), sub: t("profile.notif_order_sub"), state: notifOrder, set: setNotifOrder },
              { label: t("profile.notif_prayer"), sub: t("profile.notif_prayer_sub"), state: notifPrayer, set: setNotifPrayer },
              { label: t("profile.notif_promo"), sub: t("profile.notif_promo_sub"), state: notifPromo, set: setNotifPromo },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A18]">{n.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{n.sub}</p>
                </div>
                <Toggle on={n.state} onToggle={() => n.set(!n.state)} />
              </div>
            ))}
          </div>
        </div>

        {/* App */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">{t("profile.section_app")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            <button onClick={() => onNavigate?.("language")} className="w-full flex items-center justify-between px-5 py-4">
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1A1A18]">{t("profile.language_row")}</p>
                <p className="text-xs text-[var(--muted)]">Language</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--muted)]">{currentLangName}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </div>
            </button>

            {/* Theme */}
            <div className="px-5 py-4">
              <p className="text-sm font-semibold text-[#1A1A18] mb-3">{t("profile.theme_row")}</p>
              <div className="flex gap-2">
                {(["light", "dark", "auto"] as const).map((themeId) => (
                  <button
                    key={themeId}
                    onClick={() => setTheme(themeId)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                    style={{
                      backgroundColor: theme === themeId ? "var(--green)" : "white",
                      color: theme === themeId ? "white" : "var(--muted)",
                      borderColor: theme === themeId ? "var(--green)" : "var(--border)",
                    }}
                  >
                    {themeLabels[themeId]}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full flex items-center justify-between px-5 py-4">
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1A1A18]">{t("profile.halal_authority")}</p>
                <p className="text-xs text-[var(--muted)]">KMF, JAKIM, IFANCA</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">{t("profile.section_account")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {[t("profile.edit_profile"), t("profile.change_password")].map((item) => (
              <button key={item} className="w-full flex items-center justify-between px-5 py-4">
                <p className="text-sm font-semibold text-[#1A1A18]">{item}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </button>
            ))}
            <button className="w-full flex items-center justify-between px-5 py-4">
              <p className="text-sm font-semibold" style={{ color: "var(--danger)" }}>{t("profile.delete_data")}</p>
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">{t("profile.section_info")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {[t("profile.terms"), t("profile.privacy")].map((item) => (
              <button key={item} className="w-full flex items-center justify-between px-5 py-4">
                <p className="text-sm font-semibold text-[#1A1A18]">{item}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </button>
            ))}
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
