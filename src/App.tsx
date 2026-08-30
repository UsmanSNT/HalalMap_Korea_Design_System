import React, { useEffect, useState } from "react";
import { type AuthUser, getCurrentUser, login, logout } from "./api/auth";
import { type TabId } from "./components/Shared";
import { type DeviceType, useDeviceType, getDeviceOverride, setDeviceOverride } from "./hooks/useDeviceType";
import DashboardApp from "./dashboard/DashboardApp";
import CourierApp from "./courier/CourierApp";
import AdminApp from "./admin/AdminApp";
import { SplashScreen, OnboardingScreen, SignUpScreen, LoginScreen, LanguageScreen } from "./screens/OnboardingScreens";
import { HomeScreen, RestaurantListScreen, RestaurantDetailScreen, MenuScreen, ItemDetailScreen, CartScreen, CheckoutScreen, OrderConfirmationScreen } from "./screens/HomeScreens";
import HomeDesktop from "./screens/HomeDesktop";
import HomeAndroid from "./screens/HomeAndroid";
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

type ScreenId =
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

function CustomerScreen({ id, deviceType, onTabChange, onLogout, onNavigate }: { id: ScreenId; deviceType: DeviceType; onTabChange: (tab: TabId) => void; onLogout: () => void; onNavigate: (screen: string) => void }) {
  switch (id) {
    case "splash": return <SplashScreen />;
    case "onboarding": return <OnboardingScreen />;
    case "signup": return <SignUpScreen />;
    case "language": return <LanguageScreen />;
    case "home":
      if (deviceType === "android") return <HomeAndroid onNavigate={onNavigate} onTabChange={onTabChange} />;
      return <HomeScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "restaurant-list": return <RestaurantListScreen onNavigate={onNavigate} />;
    case "restaurant-detail": return <RestaurantDetailScreen onNavigate={onNavigate} />;
    case "menu": return <MenuScreen onNavigate={onNavigate} />;
    case "item-detail": return <ItemDetailScreen onNavigate={onNavigate} />;
    case "cart": return <CartScreen onNavigate={onNavigate} />;
    case "checkout": return <CheckoutScreen onNavigate={onNavigate} />;
    case "order-confirmation": return <OrderConfirmationScreen onNavigate={onNavigate} />;
    case "search": return <SearchScreen onTabChange={onTabChange} />;
    case "map-view": return <MapViewScreen onTabChange={onTabChange} />;
    case "city-selector": return <CitySelectorScreen />;
    case "restaurant-map-detail": return <RestaurantMapDetailScreen />;
    case "mosque-list": return <MosqueListScreen onTabChange={onTabChange} />;
    case "mosque-detail": return <MosqueDetailScreen />;
    case "prayer-times": return <PrayerTimesScreen onTabChange={onTabChange} />;
    case "qibla": return <QiblaScreen onTabChange={onTabChange} />;
    case "scanner": return <ScannerScreen />;
    case "scan-result": return <ScanResultScreen verdict="halal" />;
    case "scan-history": return <ScanHistoryScreen />;
    case "order-tracking": return <OrderTrackingScreen onTabChange={onTabChange} />;
    case "order-history": return <OrderHistoryScreen onTabChange={onTabChange} />;
    case "order-detail": return <OrderDetailScreen />;
    case "profile": return <ProfileScreen onTabChange={onTabChange} onLogout={onLogout} />;
    case "saved-places": return <SavedPlacesScreen />;
    case "address": return <AddressScreen />;
    case "settings": return <SettingsScreen />;
    case "reviews": return <ReviewsScreen />;
    case "community": return <CommunityScreen />;
    case "share": return <ShareScreen />;
    case "ai-meal": return <AIMealScreen />;
    case "group-order": return <GroupOrderScreen />;
    case "meal-plans": return <MealPlansScreen />;
    case "grocery": return <GroceryScreen />;
    case "travel-planner": return <TravelPlannerScreen />;
    case "offline-prayer": return <OfflinePrayerScreen />;
    case "notifications": return <NotificationsScreen />;
    case "ramadan": return <RamadanScreen />;
    case "eid": return <EidScreen />;
    case "loyalty": return <LoyaltyScreen />;
    case "referral": return <ReferralScreen />;
    case "tutorial": return <TutorialScreen />;
    case "multilingual": return <MultilingualScreen />;
  }
}

const DEVICE_LABELS: Record<DeviceType, string> = { desktop: "🖥️ Desktop", android: "🤖 Android", ios: "🍎 iOS" };

const ROLE_DASHBOARD_LABELS: Partial<Record<AuthUser["role"], string>> = {
  owner: "🍽️ Oshxona paneliga qaytish",
  courier: "🏍️ Kuryer paneliga qaytish",
  admin: "🛠️ Admin paneliga qaytish",
};

type ViewMode = "customer" | "role";
type BootStep = "splash" | "onboarding" | "auth";

const ONBOARDED_KEY = "halalmap-onboarded";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [current, setCurrent] = useState<ScreenId>("home");
  const [viewMode, setViewMode] = useState<ViewMode>("role");
  const [bootStep, setBootStep] = useState<BootStep>(() =>
    localStorage.getItem(ONBOARDED_KEY) ? "auth" : "splash"
  );
  const deviceType = useDeviceType();
  const [deviceOverride, setDeviceOverrideState] = useState<DeviceType | null>(() => getDeviceOverride());

  useEffect(() => {
    if (bootStep !== "splash") return;
    const timer = setTimeout(() => setBootStep("onboarding"), 1800);
    return () => clearTimeout(timer);
  }, [bootStep]);

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    setBootStep("auth");
  };

  const navigate = (screen: string) => setCurrent(screen as ScreenId);

  const handleDeviceOverride = (value: DeviceType | null) => {
    setDeviceOverride(value);
    setDeviceOverrideState(value);
  };

  useEffect(() => {
    getCurrentUser().then(setUser).finally(() => setRestoringSession(false));
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setUser(await login(email, password));
      return true;
    } catch {
      return false;
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setCurrent("home");
    setViewMode("role");
  };

  const switchToCustomer = () => setViewMode("customer");
  const switchToRole = () => setViewMode("role");

  if (restoringSession) return <main className="grid min-h-dvh place-items-center bg-[var(--cream)] text-sm font-semibold text-[var(--green)]">Session tekshirilmoqda…</main>;
  if (!user) {
    if (bootStep === "splash") return <main className="mx-auto h-dvh w-full max-w-[390px] overflow-hidden bg-[var(--cream)]"><SplashScreen /></main>;
    if (bootStep === "onboarding") return <main className="mx-auto h-dvh w-full max-w-[390px] overflow-hidden bg-[var(--cream)]"><OnboardingScreen onSkip={finishOnboarding} onDone={finishOnboarding} /></main>;
    return <main className="mx-auto h-dvh w-full max-w-[390px] overflow-hidden bg-[var(--cream)]"><LoginScreen onLogin={handleLogin} /></main>;
  }
  if (user.role === "owner" && viewMode === "role") return <DashboardApp onSwitch={switchToCustomer} />;
  if (user.role === "courier" && viewMode === "role") return <CourierApp onSwitch={switchToCustomer} />;
  if (user.role === "admin" && viewMode === "role") return <AdminApp onSwitch={switchToCustomer} />;

  const handleTabChange = (tab: TabId) => setCurrent(TAB_SCREENS[tab]);
  const effectiveDevice = deviceOverride ?? deviceType;
  const isDesktopHome = current === "home" && effectiveDevice === "desktop";

  const devToolbar = (
    <div className="fixed right-3 top-3 z-50 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/95 p-2 shadow-lg backdrop-blur">
      <select value={current} onChange={(event) => setCurrent(event.target.value as ScreenId)} aria-label="Ekranni tanlash" className="max-w-40 rounded-lg bg-[var(--cream)] px-2 py-1.5 text-xs font-semibold outline-none">
        {SCREEN_GROUPS.map((group) => <optgroup key={group.section} label={group.section}>{group.screens.map((screen) => <option key={screen.id} value={screen.id}>{screen.label}</option>)}</optgroup>)}
      </select>
      <select value={deviceOverride ?? "auto"} onChange={(event) => handleDeviceOverride(event.target.value === "auto" ? null : (event.target.value as DeviceType))} aria-label="Qurilma turini tanlash" className="rounded-lg bg-[var(--cream)] px-2 py-1.5 text-xs font-semibold outline-none">
        <option value="auto">Avto ({DEVICE_LABELS[deviceType]})</option>
        <option value="desktop">{DEVICE_LABELS.desktop}</option>
        <option value="android">{DEVICE_LABELS.android}</option>
        <option value="ios">{DEVICE_LABELS.ios}</option>
      </select>
      <button onClick={handleLogout} className="rounded-lg bg-[var(--danger)] px-3 py-1.5 text-xs font-bold text-white">Chiqish</button>
    </div>
  );

  const roleDashboardButton = ROLE_DASHBOARD_LABELS[user.role] && (
    <button onClick={switchToRole} className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[var(--green)] px-4 py-3 text-xs font-bold text-white shadow-xl">
      {ROLE_DASHBOARD_LABELS[user.role]}
    </button>
  );

  if (isDesktopHome) {
    return (
      <div className="relative h-dvh w-full overflow-hidden">
        {devToolbar}
        {roleDashboardButton}
        <HomeDesktop />
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-[#EDEAE5]">
      {devToolbar}
      {roleDashboardButton}
      <main className="mx-auto h-dvh w-full max-w-[390px] overflow-hidden bg-[var(--cream)]">
        <CustomerScreen id={current} deviceType={effectiveDevice} onTabChange={handleTabChange} onLogout={handleLogout} onNavigate={navigate} />
      </main>
    </div>
  );
}
