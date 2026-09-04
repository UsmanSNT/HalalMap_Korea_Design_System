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

export type ScreenId =
  | "splash" | "onboarding" | "signup" | "language"
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

const DEMO_USER: AuthUser = { id: 1, email: "demo@halalmap.test", name: "Demo User", role: "user" };

type NavFn = (screen: ScreenId) => void;

function CustomerScreen({ id, onTabChange, onLogout, onNavigate }: { id: ScreenId; onTabChange: (tab: TabId) => void; onLogout: () => void; onNavigate: NavFn }) {
  const goBack = () => onNavigate("home");
  switch (id) {
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
  const [current, setCurrent] = useState<ScreenId>("splash");
  const [history, setHistory] = useState<ScreenId[]>([]);

  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser(u ?? DEMO_USER))
      .catch(() => setUser(DEMO_USER))
      .finally(() => setRestoringSession(false));
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setUser(await login(email, password));
      setCurrent("home");
      return true;
    } catch {
      setUser(DEMO_USER);
      setCurrent("home");
      return true;
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
    setUser(DEMO_USER);
    setCurrent("splash");
    setHistory([]);
  };

  const handleNavigate = (screen: ScreenId) => {
    setHistory((prev) => [...prev, current]);
    setCurrent(screen);
  };

  if (restoringSession) return <main className="grid min-h-dvh place-items-center bg-[var(--cream)] text-sm font-semibold text-[var(--green)]">Session tekshirilmoqda…</main>;

  if (user?.role === "owner") return <DashboardApp onSwitch={handleLogout} />;
  if (user?.role === "courier") return <CourierApp onSwitch={handleLogout} />;
  if (user?.role === "admin") return <AdminApp onSwitch={handleLogout} />;

  const handleTabChange = (tab: TabId) => {
    setHistory([]);
    setCurrent(TAB_SCREENS[tab]);
  };

  return (
    <LanguageProvider>
      <AppShell current={current} setCurrent={setCurrent} setHistory={setHistory} handleTabChange={handleTabChange} handleLogout={handleLogout} handleNavigate={handleNavigate} />
    </LanguageProvider>
  );
}

function AppShell({
  current,
  setCurrent,
  setHistory,
  handleTabChange,
  handleLogout,
  handleNavigate,
}: {
  current: ScreenId;
  setCurrent: (s: ScreenId) => void;
  setHistory: (h: ScreenId[]) => void;
  handleTabChange: (tab: TabId) => void;
  handleLogout: () => void;
  handleNavigate: NavFn;
}) {
  const { t } = useLanguage();
  return (
    <div className="relative min-h-dvh bg-[#EDEAE5]">
      <div className="fixed right-3 top-3 z-50 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/95 p-2 shadow-lg backdrop-blur">
        <select value={current} onChange={(event) => { setHistory([]); setCurrent(event.target.value as ScreenId); }} aria-label="Ekranni tanlash" className="max-w-40 rounded-lg bg-[var(--cream)] px-2 py-1.5 text-xs font-semibold outline-none">
          {SCREEN_GROUPS.map((group) => <optgroup key={group.section} label={group.section}>{group.screens.map((screen) => <option key={screen.id} value={screen.id}>{screen.label}</option>)}</optgroup>)}
        </select>
        <button onClick={handleLogout} className="rounded-lg bg-[var(--danger)] px-3 py-1.5 text-xs font-bold text-white">{t("common.logout")}</button>
      </div>
      <main className="mx-auto h-dvh w-full max-w-[390px] overflow-hidden bg-[var(--cream)]">
        <CustomerScreen id={current} onTabChange={handleTabChange} onLogout={handleLogout} onNavigate={handleNavigate} />
      </main>
    </div>
  );
}
