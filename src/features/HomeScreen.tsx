import { useMemo, type ReactNode } from "react";
import { isOpenNow, type Restaurant } from "@/data/restaurants";
import type { Mosque } from "@/data/mosques";
import { distanceKm, formatDistance, mapsDirectionsUrl, type Coords } from "@/lib/geo";
import { useLocation } from "@/lib/location";
import { usePlaces } from "@/lib/PlacesContext";
import { useNow } from "@/lib/useNow";
import { useLanguage } from "@/locale/LanguageContext";
import { navigateTo } from "@/services/navigation";
import { ChevronIcon, FoodIcon, MosqueIcon, NavigateIcon } from "@/ui/icons";
import PageHeader from "@/ui/PageHeader";

const NEAR_RADIUS_KM = 10;
const PREVIEW_COUNT = 3;

type Nearby<T> = { item: T; km: number };

/** Items sorted by distance from `from`, plus how many lie within the near radius. */
function rankByDistance<T extends { coords: Coords }>(items: readonly T[], from: Coords) {
  const ranked: Nearby<T>[] = items.map((item) => ({ item, km: distanceKm(from, item.coords) })).sort((a, b) => a.km - b.km);
  return { top: ranked.slice(0, PREVIEW_COUNT), within: ranked.filter((r) => r.km <= NEAR_RADIUS_KM).length };
}

type SectionProps = {
  icon: ReactNode;
  title: string;
  count: number;
  onOpen: () => void;
  children: ReactNode;
};

function Section({ icon, title, count, onOpen, children }: SectionProps) {
  const { t } = useLanguage();
  return (
    <section aria-label={title} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
      <button type="button" onClick={onOpen} className="flex min-h-24 w-full items-center gap-4 bg-[var(--green)] p-4 text-left text-white">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 [&>svg]:h-8 [&>svg]:w-8">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold leading-tight">{title}</span>
          <span className="mt-1 block text-sm opacity-90">
            {count > 0 ? t("home.nearCount", { n: count, km: NEAR_RADIUS_KM }) : t("home.noneNear", { km: NEAR_RADIUS_KM })}
          </span>
        </span>
        <ChevronIcon className="h-6 w-6 shrink-0 -rotate-90" />
      </button>
      <div className="p-4">
        <p className="mb-2 text-xs font-bold uppercase text-[var(--muted)]">{t("home.nearest")}</p>
        <ul className="divide-y divide-[var(--border)]">{children}</ul>
        <button type="button" onClick={onOpen} className="mt-2 min-h-11 w-full rounded-xl text-sm font-semibold text-[var(--green)]">
          {t("home.seeAll")}
        </button>
      </div>
    </section>
  );
}

function Row({ name, detail, km, approx, to }: { name: string; detail?: ReactNode; km: number; approx: boolean; to: Coords }) {
  const { t } = useLanguage();
  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{name}</p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--muted)]">
          <span className="font-bold text-[var(--green)]">
            {approx ? "~" : ""}
            {formatDistance(km)}
          </span>
          {detail}
        </p>
      </div>
      <a
        href={mapsDirectionsUrl(to)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t("act.directions")}: ${name}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--green)]"
      >
        <NavigateIcon className="h-5 w-5" />
      </a>
    </li>
  );
}

/** Landing screen: locates the user, then offers the two core tasks with the nearest results of each. */
export default function HomeScreen() {
  const { t } = useLanguage();
  const { coords, isReal } = useLocation();
  const { mosques, restaurants } = usePlaces();
  const now = useNow(60_000);

  const food = useMemo(() => rankByDistance<Restaurant>(restaurants, coords), [restaurants, coords]);
  const prayer = useMemo(() => rankByDistance<Mosque>(mosques, coords), [mosques, coords]);

  return (
    <>
      <PageHeader title="HalalMap Korea" />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <p className="text-sm text-[var(--muted)]">{t("home.subtitle")}</p>
        {!isReal && <p className="rounded-xl bg-[var(--gold-light)] px-3 py-2.5 text-xs leading-relaxed text-[#7a5416]">{t("nearby.gpsNeeded")}</p>}

        <Section icon={<FoodIcon />} title={t("home.findFood")} count={food.within} onOpen={() => navigateTo("food")}>
          {food.top.map(({ item, km }) => {
            const open = isOpenNow(item, now);
            return (
              <Row
                key={item.id}
                name={item.name}
                km={km}
                approx={!isReal}
                to={item.coords}
                detail={
                  <>
                    <span>{t(`food.${item.halal}` as const)}</span>
                    {open !== null && <span className={`font-bold ${open ? "text-[var(--green)]" : "text-[var(--danger)]"}`}>{open ? t("food.open") : t("food.closed")}</span>}
                  </>
                }
              />
            );
          })}
        </Section>

        <Section icon={<MosqueIcon />} title={t("home.findPrayer")} count={prayer.within} onOpen={() => navigateTo("mosques")}>
          {prayer.top.map(({ item, km }) => (
            <Row key={item.id} name={item.name} km={km} approx={!isReal} to={item.coords} detail={<span>{item.kind === "mosque" ? t("mosques.kindMosque") : t("mosques.kindRoom")}</span>} />
          ))}
        </Section>
      </div>
    </>
  );
}
