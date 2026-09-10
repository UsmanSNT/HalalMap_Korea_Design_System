import { translate } from "./i18n";
import CustomerFeedback from "./components/CustomerFeedback";
import React, { useEffect, useState } from "react";
import { type AuthUser, getCurrentUser, login, logout } from "./api/auth";
import { type TabId } from "./components/Shared";
import DashboardApp from "./dashboard/DashboardApp";
import CourierApp from "./courier/CourierApp";
import AdminApp from "./admin/AdminApp";
import { SplashScreen, OnboardingScreen, SignUpScreen, LoginScreen, LanguageScreen } from "./screens/OnboardingScreens";
import { HomeScreen, RestaurantListScreen, RestaurantDetailScreen, MenuScreen, ItemDetailScreen, CartScreen, CheckoutScreen, OrderConfirmationScreen } from "./screens/HomeScreens";
import { SearchScreen, MapViewScreen, CitySelectorScreen, RestaurantMapDetailScreen } from "./screens/SearchScreens";
import { MosqueListScreen, MosqueDetailScreen, PrayerTimesScreen, QiblaScreen } from "./screens/MosqueScreens";
import { ScannerScreen, ScanResultScreen, ScanHistoryScreen } from "./screens/ScannerScreens";
import { OrderTrackingScreen, OrderHistoryScreen, OrderDetailScreen } from "./screens/OrderScreens";
import { ProfileScreen, SavedPlacesScreen, AddressScreen, SettingsScreen } from "./screens/ProfileScreens";
import { ReviewsScreen, CommunityScreen, ShareScreen } from "./screens/CommunityScreens";
import { AIMealScreen, GroupOrderScreen, MealPlansScreen, GroceryScreen } from "./screens/SmartScreens";
import { TravelPlannerScreen, OfflinePrayerScreen } from "./screens/TravelScreens";
import { NotificationsScreen, RamadanScreen, EidScreen } from "./screens/EngagementScreens";
import { LoyaltyScreen, ReferralScreen } from "./screens/RewardsScreens";
import { TutorialScreen, MultilingualScreen } from "./screens/AccessibilityScreens";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";
import { useIsDesktop } from "./hooks/useIsDesktop";
import { navigateTo, useRouteScreen } from "./services/navigation";

export type ScreenId =
  | "login" | "splash" | "onboarding" | "signup" | "language"
  | "home" | "restaurant-list" | "restaurant-detail" | "menu" | "item-detail" | "cart" | "checkout" | "order-confirmation"
  | "search" | "map-view" | "city-selector" | "restaurant-map-detail"
  | "mosque-list" | "mosque-detail" | "prayer-times" | "qibla"
  | "scanner" | "scan-result" | "scan-history"
  | "order-tracking" | "order-history" | "order-detail"
  | "profile" | "saved-places" | "address" | "settings"
  | "reviews" | "community" | "share"
  | "ai-meal" | "group-order" | "meal-plans" | "grocery"
  | "travel-planner" | "offline-prayer"
  | "notifications" | "ramadan" | "eid"
  | "loyalty" | "referral"
  | "tutorial" | "multilingual";

const SCREEN_GROUPS: { section: string; screens: { id: ScreenId; label: string }[] }[] = [
  { section: "Onboarding", screens: [{ id: "splash", label: "Splash" }, { id: "onboarding", label: "Onboarding" }, { id: "signup", label: "Sign Up" }, { id: "language", label: "Language" }] },
  { section: "Home", screens: [{ id: "home", label: "Home" }, { id: "restaurant-list", label: "Restaurant List" }, { id: "restaurant-detail", label: "Restaurant Detail" }, { id: "menu", label: "Menu" }, { id: "item-detail", label: "Item Detail" }, { id: "cart", label: "Cart" }, { id: "checkout", label: "Checkout" }, { id: "order-confirmation", label: "Order Confirmed" }] },
  { section: "Search & Map", screens: [{ id: "search", label: "Search" }, { id: "map-view", label: "Map View" }, { id: "city-selector", label: "City Selector" }, { id: "restaurant-map-detail", label: "Map Detail" }] },
  { section: "Mosque & Prayer", screens: [{ id: "mosque-list", label: "Mosque List" }, { id: "mosque-detail", label: "Mosque Detail" }, { id: "prayer-times", label: "Prayer Times" }, { id: "qibla", label: "Qibla" }] },
  { section: "Scanner", screens: [{ id: "scanner", label: "Scanner" }, { id: "scan-result", label: "Scan Result" }, { id: "scan-history", label: "Scan History" }] },
  { section: "Orders", screens: [{ id: "order-tracking", label: "Order Tracking" }, { id: "order-history", label: "Order History" }, { id: "order-detail", label: "Order Detail" }] },
  { section: "Profile", screens: [{ id: "profile", label: "Profile" }, { id: "saved-places", label: "Saved Places" }, { id: "address", label: "Address" }, { id: "settings", label: "Settings" }] },
  { section: "Community", screens: [{ id: "reviews", label: "Reviews" }, { id: "community", label: "Community" }, { id: "share", label: "Share" }] },
  { section: "Smart", screens: [{ id: "ai-meal", label: "AI Meal" }, { id: "group-order", label: "Group Order" }, { id: "meal-plans", label: "Meal Plans" }, { id: "grocery", label: "Grocery" }] },
  { section: "Travel", screens: [{ id: "travel-planner", label: "Travel Planner" }, { id: "offline-prayer", label: "Offline Prayer" }] },
  { section: "Events", screens: [{ id: "notifications", label: "Notifications" }, { id: "ramadan", label: "Ramadan" }, { id: "eid", label: "Eid" }] },
  { section: "Rewards", screens: [{ id: "loyalty", label: "Loyalty" }, { id: "referral", label: "Referral" }] },
  { section: "Accessibility", screens: [{ id: "tutorial", label: "Tutorial" }, { id: "multilingual", label: "Multilingual" }] },
];

const TAB_SCREENS: Record<TabId, ScreenId> = {
  home: "home", search: "search", orders: "order-history", prayer: "prayer-times", profile: "profile",
};

const ALL_SCREEN_IDS: ScreenId[] = ["login", ...SCREEN_GROUPS.flatMap((group) => group.screens.map((screen) => screen.id))];



const ROLE_DASHBOARD_LABELS: Partial<Record<AuthUser["role"], string>> = {
  owner: "🍽️ Oshxona paneliga qaytish",
  courier: "🏍️ Kuryer paneliga qaytish",
  admin: "🛠️ Admin paneliga qaytish",
};

type ViewMode = "customer" | "role";

type NavFn = (screen: ScreenId) => void;

function CustomerScreen({ id, onTabChange, onLogout, onNavigate }: { id: ScreenId; onTabChange: (tab: TabId) => void; onLogout: () => void; onNavigate: NavFn }) {
  switch (id) {
    case "login": return <HomeScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "splash": return <SplashScreen onNavigate={onNavigate} />;
    case "onboarding": return <OnboardingScreen onNavigate={onNavigate} />;
    case "signup": return <SignUpScreen onNavigate={onNavigate} />;
    case "language": return <LanguageScreen onNavigate={onNavigate} />;
    case "home": return <HomeScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "restaurant-list": return <RestaurantListScreen onNavigate={onNavigate} />;
    case "restaurant-detail": return <RestaurantDetailScreen onNavigate={onNavigate} />;
    case "menu": return <MenuScreen onNavigate={onNavigate} />;
    case "item-detail": return <ItemDetailScreen onNavigate={onNavigate} />;
    case "cart": return <CartScreen onNavigate={onNavigate} />;
    case "checkout": return <CheckoutScreen onNavigate={onNavigate} />;
    case "order-confirmation": return <OrderConfirmationScreen onNavigate={onNavigate} />;
    case "search": return <SearchScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "map-view": return <MapViewScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "city-selector": return <CitySelectorScreen onNavigate={onNavigate} />;
    case "restaurant-map-detail": return <RestaurantMapDetailScreen onNavigate={onNavigate} />;
    case "mosque-list": return <MosqueListScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "mosque-detail": return <MosqueDetailScreen onNavigate={onNavigate} />;
    case "prayer-times": return <PrayerTimesScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "qibla": return <QiblaScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "scanner": return <ScannerScreen onNavigate={onNavigate} />;
    case "scan-result": return <ScanResultScreen verdict="halal" onNavigate={onNavigate} />;
    case "scan-history": return <ScanHistoryScreen onNavigate={onNavigate} />;
    case "order-tracking": return <OrderTrackingScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "order-history": return <OrderHistoryScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "order-detail": return <OrderDetailScreen onNavigate={onNavigate} />;
    case "profile": return <ProfileScreen onTabChange={onTabChange} onLogout={onLogout} onNavigate={onNavigate} />;
    case "saved-places": return <SavedPlacesScreen onNavigate={onNavigate} />;
    case "address": return <AddressScreen onNavigate={onNavigate} />;
    case "settings": return <SettingsScreen onNavigate={onNavigate} />;
    case "reviews": return <ReviewsScreen onNavigate={onNavigate} />;
    case "community": return <CommunityScreen onNavigate={onNavigate} />;
    case "share": return <ShareScreen onNavigate={onNavigate} />;
    case "ai-meal": return <AIMealScreen onNavigate={onNavigate} />;
    case "group-order": return <GroupOrderScreen onNavigate={onNavigate} />;
    case "meal-plans": return <MealPlansScreen onNavigate={onNavigate} />;
    case "grocery": return <GroceryScreen onNavigate={onNavigate} />;
    case "travel-planner": return <TravelPlannerScreen onNavigate={onNavigate} />;
    case "offline-prayer": return <OfflinePrayerScreen onNavigate={onNavigate} />;
    case "notifications": return <NotificationsScreen onNavigate={onNavigate} />;
    case "ramadan": return <RamadanScreen onNavigate={onNavigate} />;
    case "eid": return <EidScreen onNavigate={onNavigate} />;
    case "loyalty": return <LoyaltyScreen onNavigate={onNavigate} />;
    case "referral": return <ReferralScreen onNavigate={onNavigate} />;
    case "tutorial": return <TutorialScreen onNavigate={onNavigate} />;
    case "multilingual": return <MultilingualScreen onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("role");
  const current = useRouteScreen(ALL_SCREEN_IDS, "home");

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setRestoringSession(false));
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setUser(await login(email, password));
      const authScreens = ["login", "signup", "splash", "onboarding", "language"];
      const restored = localStorage.getItem("halalmap-last-screen");
      navigateTo(!authScreens.includes(current) ? window.location.hash.replace(/^#\/?/, "") || "home" : restored || "home", true);
      setViewMode("role");
      return true;
    } catch { return false; }
  };

  const handleLogout = async () => {
    const authScreens = ["login", "signup", "splash", "onboarding", "language"];
    if (!authScreens.includes(current)) localStorage.setItem("halalmap-last-screen", window.location.hash.replace(/^#\/?/, "") || "home");
    try { await logout(); } catch {}
    setUser(null);
    navigateTo("login", true);
    setViewMode("role");
  };

  const handleNavigate = (screen: ScreenId) => navigateTo(screen);

  const switchToCustomer = () => setViewMode("customer");
  const switchToRole = () => setViewMode("role");

  if (restoringSession) return <main className="grid min-h-dvh place-items-center bg-[var(--cream)] text-sm font-semibold text-[var(--green)]">{translate((localStorage.getItem("halalmap-language") ?? "ko") as "ko" | "en" | "uz", "common.session_checking")}</main>;

  if (user?.role === "owner" && viewMode === "role") return <DashboardApp onSwitch={switchToCustomer} />;
  if (user?.role === "courier" && viewMode === "role") return <CourierApp onSwitch={switchToCustomer} />;
  if (user?.role === "admin" && viewMode === "role") return <AdminApp onSwitch={switchToCustomer} />;

  const handleTabChange = (tab: TabId) => navigateTo(TAB_SCREENS[tab]);
  if (!user && !["splash", "onboarding", "signup", "language"].includes(current)) {
    return <LanguageProvider><main className="customer-shell mx-auto h-dvh w-full max-w-[430px] bg-[var(--cream)]"><CustomerFeedback /><LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} /></main></LanguageProvider>;
  }

  return (
    <LanguageProvider>
      <AppShell current={current} handleTabChange={handleTabChange} handleLogout={handleLogout} handleNavigate={handleNavigate} role={user?.role} switchToRole={switchToRole} />
    </LanguageProvider>
  );
}

function AppShell({
  current,
  handleTabChange,
  handleLogout,
  handleNavigate,
  role,
  switchToRole,
}: {
  current: ScreenId;
  handleTabChange: (tab: TabId) => void;
  handleLogout: () => void;
  handleNavigate: NavFn;
  role?: AuthUser["role"];
  switchToRole: () => void;
}) {
  const { t } = useLanguage();
  const isDesktop = useIsDesktop();
  const roleDashboardLabel = role && ROLE_DASHBOARD_LABELS[role];
  const [devPanelOpen, setDevPanelOpen] = useState(false);

  return (
    <div className="relative min-h-dvh bg-[#EDEAE5]">
      <CustomerFeedback />
      {import.meta.env.DEV && new URLSearchParams(location.search).has("qa") && <div className="fixed right-3 top-3 z-50">
        {!devPanelOpen ? (
          <button onClick={() => setDevPanelOpen(true)} aria-label="QA panelini ochish" title="QA panel (dizaynni Figma bilan solishtirish uchun)"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white/95 text-base shadow-lg backdrop-blur">
            🛠️
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/95 p-2 shadow-lg backdrop-blur">
            <select value={current} onChange={(event) => navigateTo(event.target.value, true)} aria-label="Ekranni tanlash" className="max-w-40 rounded-lg bg-[var(--cream)] px-2 py-1.5 text-xs font-semibold outline-none">
              {SCREEN_GROUPS.map((group) => <optgroup key={group.section} label={group.section}>{group.screens.map((screen) => <option key={screen.id} value={screen.id}>{screen.label}</option>)}</optgroup>)}
            </select>
            <button onClick={handleLogout} className="rounded-lg bg-[var(--danger)] px-3 py-1.5 text-xs font-bold text-white">{t("common.logout")}</button>
            <button onClick={() => setDevPanelOpen(false)} aria-label="QA panelini yopish" className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-xs font-bold text-[var(--muted)]">✕</button>
          </div>
        )}
      </div>
      }
      {roleDashboardLabel && (
        <button onClick={switchToRole} className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[var(--green)] px-4 py-3 text-xs font-bold text-white shadow-xl">
          {roleDashboardLabel}
        </button>
      )}
        <main className="customer-shell mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-[var(--cream)] shadow-xl">
          <CustomerScreen key={window.location.hash} id={current} onTabChange={handleTabChange} onLogout={handleLogout} onNavigate={handleNavigate} />
        </main>
    </div>
  );
}
