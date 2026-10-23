import { LocationProvider } from "@/lib/location";
import { LanguageProvider } from "@/locale/LanguageContext";
import { useRouteScreen } from "@/services/navigation";
import FoodScreen from "@/features/FoodScreen";
import MosquesScreen from "@/features/MosquesScreen";
import PrayerScreen from "@/features/PrayerScreen";
import QiblaScreen from "@/features/QiblaScreen";
import TabBar, { TABS, type TabId } from "@/ui/TabBar";

const TAB_IDS = TABS.map((tab) => tab.id);

const SCREENS: Record<TabId, () => React.JSX.Element> = {
  prayer: PrayerScreen,
  qibla: QiblaScreen,
  mosques: MosquesScreen,
  food: FoodScreen,
};

function Shell() {
  const current = useRouteScreen<TabId>(TAB_IDS, "prayer");
  const Screen = SCREENS[current];
  return (
    // One layout for every device: a full-height column that is capped at a comfortable
    // reading width and centred on tablets/desktops, so nothing is "mobile-only" or "PC-only".
    <div className="h-dvh bg-[#EDEAE5]">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col bg-[var(--cream)] sm:shadow-xl">
        <Screen />
        <TabBar current={current} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <LocationProvider>
        <Shell />
      </LocationProvider>
    </LanguageProvider>
  );
}
