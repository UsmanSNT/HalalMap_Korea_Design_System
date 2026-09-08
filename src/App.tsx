import RouteError from "./components/RouteError";
import { setUserStorageScope } from "./services/localState";
import { navigate as navigateRoute, useRoute } from "./services/navigation";
import FeatureNavigation from "./components/FeatureNavigation";
import React, { useEffect, useState } from "react";
import { type AuthUser, login, logout, getCurrentUser } from "./api/auth";
import { type TabId } from "./components/Shared";
import { type Lang, LanguageAccordion } from "./components/LanguageSwitcher";
const DashboardApp = React.lazy(() => import("./dashboard/DashboardApp"));
const CourierApp = React.lazy(() => import("./courier/CourierApp"));
const AdminApp = React.lazy(() => import("./admin/AdminApp"));
import { SplashScreen, OnboardingScreen, SignUpScreen, LoginScreen, LanguageScreen } from "./screens/OnboardingScreens";
import { HomeScreen, RestaurantListScreen, RestaurantDetailScreen, MenuScreen, ItemDetailScreen, CartScreen, CheckoutScreen, OrderConfirmationScreen } from "./screens/HomeScreens";
import HomeDesktop from "./screens/HomeDesktop";
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
import PlaceSubmissionScreen from "./screens/PlaceSubmissionScreen";
import RoleApplicationScreen from "./screens/RoleApplicationScreen";

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
  | "tutorial" | "multilingual"
  | "submit-place" | "apply-courier" | "apply-owner";

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

type SidebarIconName = "home" | "search" | "restaurant" | "map" | "orders" | "scanner" | "mosque" | "prayer" | "community" | "travel" | "notifications" | "profile";

const DESKTOP_NAV: { id: ScreenId; label: string; icon: SidebarIconName }[] = [
  { id: "home", label: "Bosh sahifa", icon: "home" },
  { id: "search", label: "Qidiruv", icon: "search" },
  { id: "restaurant-list", label: "Restoranlar", icon: "restaurant" },
  { id: "map-view", label: "Xarita", icon: "map" },
  { id: "order-history", label: "Buyurtmalar", icon: "orders" },
  { id: "scanner", label: "Halal skaner", icon: "scanner" },
  { id: "mosque-list", label: "Masjidlar", icon: "mosque" },
  { id: "prayer-times", label: "Namoz vaqtlari", icon: "prayer" },
  { id: "community", label: "Hamjamiyat", icon: "community" },
  { id: "travel-planner", label: "Sayohat", icon: "travel" },
  { id: "notifications", label: "Bildirishnomalar", icon: "notifications" },
  { id: "profile", label: "Profil", icon: "profile" },
];

const SHELL_COPY: Record<Lang, { language: string; logout: string; nav: Record<string, string> }> = {
  ko: { language: "언어", logout: "로그아웃", nav: { home: "홈", search: "검색", "restaurant-list": "레스토랑", "map-view": "지도", "order-history": "주문", scanner: "할랄 스캐너", "mosque-list": "모스크", "prayer-times": "기도 시간", community: "커뮤니티", "travel-planner": "여행", notifications: "알림", profile: "프로필" } },
  en: { language: "Language", logout: "Log out", nav: { home: "Home", search: "Search", "restaurant-list": "Restaurants", "map-view": "Map", "order-history": "Orders", scanner: "Halal scanner", "mosque-list": "Mosques", "prayer-times": "Prayer times", community: "Community", "travel-planner": "Travel", notifications: "Notifications", profile: "Profile" } },
  uz: { language: "Til", logout: "Chiqish", nav: { home: "Bosh sahifa", search: "Qidiruv", "restaurant-list": "Restoranlar", "map-view": "Xarita", "order-history": "Buyurtmalar", scanner: "Halol skaner", "mosque-list": "Masjidlar", "prayer-times": "Namoz vaqtlari", community: "Hamjamiyat", "travel-planner": "Sayohat", notifications: "Bildirishnomalar", profile: "Profil" } },
  ru: { language: "Язык", logout: "Выйти", nav: { home: "Главная", search: "Поиск", "restaurant-list": "Рестораны", "map-view": "Карта", "order-history": "Заказы", scanner: "Халяль сканер", "mosque-list": "Мечети", "prayer-times": "Время намаза", community: "Сообщество", "travel-planner": "Путешествия", notifications: "Уведомления", profile: "Профиль" } },
};

function SidebarIcon({ name }: { name: SidebarIconName }) {
  const paths: Record<SidebarIconName, React.ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5M9 21v-7h6v7"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    restaurant: <><path d="M4 3v7a3 3 0 0 0 3 3V3M4 7h6M7 13v8"/><path d="M16 3v18M16 3c3 1 4 4 4 7h-4"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></>,
    orders: <><path d="M6 3h12l2 5H4zM5 8v13h14V8"/><path d="M9 12h6M9 16h4"/></>,
    scanner: <><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M8 12h8"/></>,
    mosque: <><path d="M5 21V10h14v11M3 21h18"/><path d="M8 10V7l4-4 4 4v3M10 21v-6a2 2 0 0 1 4 0v6"/></>,
    prayer: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M18 4l2-2"/></>,
    community: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 2.5-7 6-7s6 3 6 7M15 14c3 0 5 2.5 5 6"/></>,
    travel: <><path d="m2 16 20-8-8 14-2-8z"/><path d="m12 14 5-5"/></>,
    notifications: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M14 20a2 2 0 0 1-4 0"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3.5-8 8-8s8 3 8 8"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function DesktopCustomerShell({ current, onNavigate, onLogout, lang, onLanguageChange, user, partnerRole, onWorkspace, children }: { current: ScreenId; onNavigate: (screen: ScreenId) => void; onLogout: () => void; lang: Lang; onLanguageChange: (lang: Lang) => void; user: AuthUser; partnerRole: "courier" | "owner" | null; onWorkspace: (mode: "courier" | "owner" | "admin") => void; children: React.ReactNode }) {
  const copy = SHELL_COPY[lang];
  return (
    <div className="flex h-dvh w-full bg-[#EDEAE5]">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-[#E5E2DC] bg-white px-4 py-5 lg:flex">
        <button onClick={() => onNavigate("home")} className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--green)] text-white"><SidebarIcon name="map" /></span>
          <span><strong className="block text-sm text-[#1A1A18]">HalalMap</strong><small className="text-[#8A8A88]">Korea</small></span>
        </button>
        <div className="mb-4"><LanguageAccordion lang={lang} onChange={onLanguageChange} label={copy.language} /></div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {DESKTOP_NAV.map((item) => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${current === item.id ? "bg-[var(--green-light)] font-semibold text-[var(--green)]" : "text-[#4A4A48] hover:bg-[#F4F1EB]"}`}>
              <span className="flex w-5 justify-center"><SidebarIcon name={item.icon} /></span>{copy.nav[item.id] ?? item.label}
            </button>
          ))}
        </nav>
        <div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">
          <div className="rounded-xl border border-dashed border-[#D9A441] bg-[#FFF8E8] p-2">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#9A6500]">Vaqtinchalik test</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onWorkspace("courier")} className="rounded-lg bg-[#0F2030] px-2 py-2 text-xs font-semibold text-[#4ADE80]">Kuryer paneli</button>
              <button onClick={() => onWorkspace("owner")} className="rounded-lg bg-[#1A1A18] px-2 py-2 text-xs font-semibold text-white">Oshxona paneli</button>
            </div>
          </div>
          {partnerRole === "courier" && <button onClick={() => onWorkspace("courier")} className="w-full rounded-xl bg-[#0F2030] px-3 py-2.5 text-sm font-semibold text-[#4ADE80]">Kuryer ish paneli</button>}
          {partnerRole === "owner" && <button onClick={() => onWorkspace("owner")} className="w-full rounded-xl bg-[#1A1A18] px-3 py-2.5 text-sm font-semibold text-white">Oshxona boshqaruvi</button>}
          {user.role === "admin" && <button onClick={() => onWorkspace("admin")} className="w-full rounded-xl bg-[#1B6B4A] px-3 py-2.5 text-sm font-semibold text-white">Admin paneli</button>}
          {!partnerRole && <><button onClick={() => onNavigate("apply-courier")} className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold">Kuryer bo‘lish / kirish</button><button onClick={() => onNavigate("apply-owner")} className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold">Oshxona ochish / kirish</button></>}
        </div>
        <button onClick={onLogout} className="mt-4 rounded-xl border border-[#E5E2DC] px-4 py-2.5 text-sm font-semibold text-[#B42318]">{copy.logout}</button>
      </aside>
      <section className="min-w-0 flex-1 overflow-hidden lg:p-5">
        <div className="customer-content mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--cream)] lg:max-w-[1180px] lg:rounded-2xl lg:border lg:border-[#E5E2DC] lg:shadow-sm">
          <FeatureNavigation /><main className="min-h-0 flex-1">{children}</main>
        </div>
      </section>
      {partnerRole && <button onClick={() => onWorkspace(partnerRole)} className="fixed bottom-24 right-4 z-50 rounded-full bg-[#1A1A18] px-4 py-3 text-xs font-bold text-white shadow-lg lg:hidden">{partnerRole === "courier" ? "Kuryer paneli" : "Oshxona paneli"}</button>}

    </div>
  );
}

function CustomerScreen({ id, onTabChange, onNavigate, onLogout, lang, onLanguageChange, onWorkspace }: { id: ScreenId; onTabChange: (tab: TabId) => void; onNavigate: (screen: string) => void; onLogout: () => void; lang: Lang; onLanguageChange: (lang: Lang) => void; onWorkspace: (mode: "courier" | "owner") => void }) {
  switch (id) {
    case "splash": return <SplashScreen />;
    case "onboarding": return <OnboardingScreen />;
    case "signup": return <SignUpScreen />;
    case "language": return <LanguageScreen />;
    case "home": return <ResponsiveHome onTabChange={onTabChange} onNavigate={onNavigate} onLogout={onLogout} lang={lang} onLanguageChange={onLanguageChange} />;
    case "restaurant-list": return <RestaurantListScreen onNavigate={onNavigate} />;
    case "restaurant-detail": return <RestaurantDetailScreen onNavigate={onNavigate} />;
    case "menu": return <MenuScreen onNavigate={onNavigate} />;
    case "item-detail": return <ItemDetailScreen onNavigate={onNavigate} />;
    case "cart": return <CartScreen onNavigate={onNavigate} />;
    case "checkout": return <CheckoutScreen onNavigate={onNavigate} />;
    case "order-confirmation": return <OrderConfirmationScreen onNavigate={onNavigate} />;
    case "search": return <SearchScreen onTabChange={onTabChange} lang={lang} />;
    case "map-view": return <MapViewScreen onTabChange={onTabChange} />;
    case "city-selector": return <CitySelectorScreen />;
    case "restaurant-map-detail": return <RestaurantMapDetailScreen />;
    case "mosque-list": return <MosqueListScreen onTabChange={onTabChange} onNavigate={onNavigate} />;
    case "mosque-detail": return <MosqueDetailScreen />;
    case "prayer-times": return <PrayerTimesScreen onTabChange={onTabChange} />;
    case "qibla": return <QiblaScreen onTabChange={onTabChange} />;
    case "scanner": return <ScannerScreen />;
    case "scan-result": return <ScanResultScreen verdict={(["halal", "haram", "mashbooh"].includes(new URLSearchParams(window.location.hash.split("?")[1]).get("verdict") ?? "") ? new URLSearchParams(window.location.hash.split("?")[1]).get("verdict") : "halal") as "halal" | "haram" | "mashbooh"} />;
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
    case "submit-place": return <PlaceSubmissionScreen lang={lang} />;
    case "apply-courier": return <RoleApplicationScreen role="courier" onAuthenticated={onWorkspace} />;
    case "apply-owner": return <RoleApplicationScreen role="owner" onAuthenticated={onWorkspace} />;
    default: return <div className="p-8"><h1 className="text-xl font-bold">Sahifa topilmadi</h1><button className="mt-4 text-[var(--green)]" onClick={() => onNavigate("home")}>Bosh sahifaga qaytish</button></div>;
  }
}

function ResponsiveHome(props: React.ComponentProps<typeof HomeDesktop> & { onTabChange: (tab: TabId) => void }) {
  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => { const media = window.matchMedia("(min-width: 1024px)"); const update = () => setDesktop(media.matches); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  return desktop ? <HomeDesktop {...props} /> : <HomeScreen onTabChange={props.onTabChange} onNavigate={props.onNavigate} />;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const route = useRoute();
  const workspace = route.workspace;
  const setWorkspace = (mode: "customer" | "courier" | "owner" | "admin") => navigateRoute(`/${mode}/${mode === "owner" ? "main-dashboard" : mode === "courier" ? "go-online" : "home"}`);
  const [partnerRole, setPartnerRole] = useState<"courier" | "owner" | null>(null);
  const [lang, setLang] = useState<Lang>(() => (["ko", "en", "uz", "ru"].includes(localStorage.getItem("halalmap-language") ?? "") ? localStorage.getItem("halalmap-language") as Lang : "uz"));
  useEffect(() => { const update = (event: Event) => { const value = (event as CustomEvent).detail; if (["ko", "en", "uz", "ru"].includes(value)) setLang(value); }; window.addEventListener("halalmap:language", update); return () => window.removeEventListener("halalmap:language", update); }, []);
  const current = route.screen as ScreenId;
  const navigate = (screen: ScreenId) => navigateRoute(`/customer/${screen}`);
  const [restoring, setRestoring] = useState(true);
  useEffect(() => {
    let live = true;
    getCurrentUser().then(value => {
      if (!live) return;
      setUserStorageScope(String(value?.id ?? "guest"));
      setUser(value);
      try {
        const saved = JSON.parse(localStorage.getItem("halalmap_partner_access") ?? "null");
        if (value && saved?.userId === String(value.id) && (saved.role === "courier" || saved.role === "owner")) setPartnerRole(saved.role);
      } catch { /* An invalid local preference does not invalidate the API session. */ }
    }).finally(() => { if (live) setRestoring(false); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem("halalmap-language", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const loggedInUser = await login(email, password);
      setUserStorageScope(String(loggedInUser.id));
      setUser(loggedInUser);
      setPartnerRole(null);
      try {
        const saved = JSON.parse(localStorage.getItem("halalmap_partner_access") ?? "null") as { userId?: string; role?: string } | null;
        if (saved?.userId === String(loggedInUser.id) && (saved.role === "courier" || saved.role === "owner")) {
          setPartnerRole(saved.role);
        }
      } catch {
        localStorage.removeItem("halalmap_partner_access");
      }
      return null;
    } catch (error) {
      if (error instanceof TypeError) return "Backend bilan ulanish mavjud emas";
      return error instanceof Error ? error.message : "Login vaqtida xato yuz berdi";
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* Local session is cleared even when the API is offline. */ }
    setUserStorageScope("guest");
    setUser(null);
    setPartnerRole(null);
    localStorage.removeItem("halalmap_partner_access");
    localStorage.removeItem("halalmap_partner_role");
    navigateRoute("/customer/home", undefined, true);
  };

  if (restoring) return <div role="status" className="p-8">Yuklanmoqda…</div>;
  if (!route.valid) return <section className="p-8"><h1 className="text-xl font-bold">Sahifa topilmadi</h1><button className="mt-4" onClick={() => navigateRoute("/customer/home", undefined, true)}>Bosh sahifa</button></section>;
  if (!user) return <main className="auth-shell h-dvh w-full bg-[var(--cream)]">{current === "signup" ? <SignUpScreen /> : current === "onboarding" ? <OnboardingScreen /> : <LoginScreen onLogin={handleLogin} lang={lang} onLanguageChange={setLang} />}</main>;
  if (workspace === "admin" && user.role !== "admin") return <section className="p-8"><h1>Admin huquqi talab qilinadi</h1><button onClick={() => navigateRoute("/customer/home")}>Bosh sahifa</button></section>;
  if (workspace === "owner") return <DashboardApp onSwitch={() => setWorkspace("customer")} />;
  if (workspace === "courier") return <CourierApp onSwitch={() => setWorkspace("customer")} />;
  if (workspace === "admin" && user.role === "admin") return <AdminApp onSwitch={() => setWorkspace("customer")} />;

  const handleTabChange = (tab: TabId) => navigate(TAB_SCREENS[tab]);
  const activatePartner = (role: "courier" | "owner") => {
    localStorage.setItem("halalmap_partner_access", JSON.stringify({ userId: String(user.id), role }));
    setPartnerRole(role);
    setWorkspace(role);
  };
  const customerScreen = <CustomerScreen key={current + route.params.toString()} id={current} onTabChange={handleTabChange} onNavigate={(screen) => navigate(screen as ScreenId)} onLogout={handleLogout} lang={lang} onLanguageChange={setLang} onWorkspace={activatePartner} />;
  return (
    <div className="relative min-h-dvh bg-[#EDEAE5]">
      <DesktopCustomerShell current={current} onNavigate={navigate} onLogout={handleLogout} lang={lang} onLanguageChange={setLang} user={user} partnerRole={partnerRole} onWorkspace={setWorkspace}><RouteError key={current + route.params.toString()}>{customerScreen}</RouteError></DesktopCustomerShell>
    </div>
  );
}
