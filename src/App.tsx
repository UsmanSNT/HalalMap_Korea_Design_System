import { LocationProvider } from "@/lib/location";
import { PlacesProvider } from "@/lib/PlacesContext";
import { LanguageProvider } from "@/locale/LanguageContext";
import { useRouteScreen } from "@/services/navigation";
import AdminScreen from "@/features/AdminScreen";
import FoodScreen from "@/features/FoodScreen";
import HomeScreen from "@/features/HomeScreen";
import MosquesScreen from "@/features/MosquesScreen";
import PrayerScreen from "@/features/PrayerScreen";
import QiblaScreen from "@/features/QiblaScreen";
import TabBar, { TABS, type TabId } from "@/ui/TabBar";

type RouteId = TabId | "mosques" | "food" | "admin";
const ROUTE_IDS: readonly RouteId[] = [...TABS.map((tab) => tab.id), "mosques", "food", "admin"];

const SCREENS: Record<RouteId, () => React.JSX.Element> = {
  admin: AdminScreen,
  home: HomeScreen,
  prayer: PrayerScreen,
  qibla: QiblaScreen,
  mosques: MosquesScreen,
  food: FoodScreen,
};

function Shell() {
  const current = useRouteScreen<RouteId>(ROUTE_IDS, "home");
  const Screen = SCREENS[current];
  return (
    // One layout for every device: a full-height column that is capped at a comfortable
    // reading width and centred on tablets/desktops, so nothing is "mobile-only" or "PC-only".
    <div className="h-dvh bg-[#EDEAE5]">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col bg-[var(--cream)] sm:shadow-xl">
        <Screen />
        {current !== "admin" && <TabBar current={current === "mosques" || current === "food" ? "home" : current} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <LocationProvider>
        <PlacesProvider>
          <Shell />
        </PlacesProvider>
      </LocationProvider>
    </LanguageProvider>
  );
}
