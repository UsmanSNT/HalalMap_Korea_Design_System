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

function CustomerScreen({ id, onTabChange, onLogout }: { id: ScreenId; onTabChange: (tab: TabId) => void; onLogout: () => void }) {
  switch (id) {
    case "splash": return <SplashScreen />;
    case "onboarding": return <OnboardingScreen />;
    case "signup": return <SignUpScreen />;
    case "language": return <LanguageScreen />;
    case "home": return <HomeScreen onTabChange={onTabChange} />;
    case "restaurant-list": return <RestaurantListScreen />;
    case "restaurant-detail": return <RestaurantDetailScreen />;
    case "menu": return <MenuScreen />;
    case "item-detail": return <ItemDetailScreen />;
    case "cart": return <CartScreen />;
    case "checkout": return <CheckoutScreen />;
    case "order-confirmation": return <OrderConfirmationScreen />;
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

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [current, setCurrent] = useState<ScreenId>("home");

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
  };

  if (restoringSession) return <main className="grid min-h-dvh place-items-center bg-[var(--cream)] text-sm font-semibold text-[var(--green)]">Session tekshirilmoqda…</main>;
  if (!user) return <main className="mx-auto h-dvh w-full max-w-[390px] overflow-hidden bg-[var(--cream)]"><LoginScreen onLogin={handleLogin} /></main>;
  if (user.role === "owner") return <DashboardApp onSwitch={handleLogout} />;
  if (user.role === "courier") return <CourierApp onSwitch={handleLogout} />;
  if (user.role === "admin") return <AdminApp onSwitch={handleLogout} />;

  const handleTabChange = (tab: TabId) => setCurrent(TAB_SCREENS[tab]);
  return (
    <div className="relative min-h-dvh bg-[#EDEAE5]">
      <div className="fixed right-3 top-3 z-50 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/95 p-2 shadow-lg backdrop-blur">
        <select value={current} onChange={(event) => setCurrent(event.target.value as ScreenId)} aria-label="Ekranni tanlash" className="max-w-40 rounded-lg bg-[var(--cream)] px-2 py-1.5 text-xs font-semibold outline-none">
          {SCREEN_GROUPS.map((group) => <optgroup key={group.section} label={group.section}>{group.screens.map((screen) => <option key={screen.id} value={screen.id}>{screen.label}</option>)}</optgroup>)}
        </select>
        <button onClick={handleLogout} className="rounded-lg bg-[var(--danger)] px-3 py-1.5 text-xs font-bold text-white">Chiqish</button>
      </div>
      <main className="mx-auto h-dvh w-full max-w-[390px] overflow-hidden bg-[var(--cream)]">
        <CustomerScreen id={current} onTabChange={handleTabChange} onLogout={handleLogout} />
      </main>
    </div>
  );
}
