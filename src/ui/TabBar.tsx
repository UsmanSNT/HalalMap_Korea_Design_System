import type { ReactNode } from "react";
import type { TranslationKey } from "@/locale/dictionaries";
import { useLanguage } from "@/locale/LanguageContext";
import { navigateTo } from "@/services/navigation";
import { ClockIcon, CompassIcon, HomeIcon } from "./icons";

export type TabId = "home" | "prayer" | "qibla";

export const TABS: readonly { id: TabId; labelKey: TranslationKey; icon: ReactNode }[] = [
  { id: "home", labelKey: "tab.home", icon: <HomeIcon /> },
  { id: "prayer", labelKey: "tab.prayer", icon: <ClockIcon /> },
  { id: "qibla", labelKey: "tab.qibla", icon: <CompassIcon /> },
];

/** Bottom navigation: tab switches replace history so Back never walks through tab hops. */
export default function TabBar({ current }: { current: TabId }) {
  const { t } = useLanguage();
  return (
    <nav aria-label="Main" className="shrink-0 border-t border-[var(--border)] bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="flex">
        {TABS.map((tab) => {
          const active = tab.id === current;
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => navigateTo(tab.id, true)}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active ? "text-[var(--green)]" : "text-[var(--muted)]"}`}
              >
                {tab.icon}
                <span className="max-w-full truncate px-1">{t(tab.labelKey)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
