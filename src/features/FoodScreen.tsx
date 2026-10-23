import { useMemo, useState } from "react";
import { isOpenNow, type HalalStatus } from "@/data/restaurants";
import { distanceKm, formatDistance, mapsDirectionsUrl } from "@/lib/geo";
import { useLocation } from "@/lib/location";
import { usePlaces } from "@/lib/PlacesContext";
import { useNow } from "@/lib/useNow";
import { useLanguage } from "@/locale/LanguageContext";
import AddPlaceCta from "./AddPlaceCta";
import ActionButton from "@/ui/ActionButton";
import CopyButton from "@/ui/CopyButton";
import ExpandableCard from "@/ui/ExpandableCard";
import { NavigateIcon, PhoneIcon, SearchIcon } from "@/ui/icons";
import PlacePhoto from "@/ui/PlacePhoto";
import { Stars } from "@/ui/Stars";
import ReviewsPanel from "./ReviewsPanel";
import DataFooter from "@/ui/DataFooter";
import PageHeader from "@/ui/PageHeader";
import Segmented from "@/ui/Segmented";

type Filter = "all" | HalalStatus;

const STATUS_STYLE: Record<HalalStatus, string> = {
  certified: "bg-[var(--green-light)] text-[var(--green)]",
  "muslim-owned": "bg-[var(--gold-light)] text-[#7a5416]",
  "halal-friendly": "bg-[var(--cream)] text-[var(--muted)]",
  "self-certified": "bg-[var(--green-light)] text-[var(--green)]",
  "pork-free": "bg-[var(--cream)] text-[var(--muted)]",
  unverified: "bg-[var(--cream)] text-[var(--muted)]",
};

export default function FoodScreen() {
  const { t } = useLanguage();
  const { coords, isReal } = useLocation();
  const { restaurants, ratings } = usePlaces();
  const now = useNow(60_000);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter((r) => filter === "all" || r.halal === filter)
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.nameKo.includes(q) || t(`cuisine.${r.cuisine}` as const).toLowerCase().includes(q))
      .map((r) => ({ restaurant: r, km: distanceKm(coords, r.coords) }))
      .sort((a, b) => a.km - b.km);
  }, [restaurants, coords, filter, query, t]);

  return (
    <>
      <PageHeader title={t("food.title")} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <label className="relative block">
          <span className="sr-only">{t("food.search")}</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("food.search")}
            className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white pl-10 pr-3 text-base outline-none focus:border-[var(--green)]"
          />
        </label>

        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <div className="w-max min-w-full">
            <Segmented
              label={t("food.title")}
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: t("food.all") },
                { value: "certified", label: t("food.certified") },
                { value: "muslim-owned", label: t("food.muslim-owned") },
                { value: "halal-friendly", label: t("food.halal-friendly") },
              ]}
            />
          </div>
        </div>

        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--muted)]">{t("food.empty")}</p>
        ) : (
          <ul className="space-y-3">
            {items.map(({ restaurant: r, km }) => {
              const open = isOpenNow(r, now);
              return (
                <ExpandableCard
                  key={r.id}
                  summary={
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="font-bold leading-tight">{r.name}</h2>
                          {r.nameKo !== r.name && <p className="text-sm text-[var(--muted)]">{r.nameKo}</p>}
                        </div>
                        <span className="shrink-0 rounded-full bg-[var(--green-light)] px-2.5 py-1 text-xs font-bold text-[var(--green)]">
                          {isReal ? formatDistance(km) : `~${formatDistance(km)}`}
                        </span>
                      </div>
                      {ratings[r.id] && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold">
                          <Stars value={ratings[r.id].avg} size="h-3.5 w-3.5" />
                          {ratings[r.id].avg.toFixed(1)} <span className="font-normal text-[var(--muted)]">({ratings[r.id].count})</span>
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className={`rounded-full px-2.5 py-1 font-bold ${STATUS_STYLE[r.halal]}`}>{t(`food.${r.halal}` as const)}</span>
                        <span className="text-[var(--muted)]">{t(`cuisine.${r.cuisine}` as const)}</span>
                        {open !== null && (
                          <span className={`font-bold ${open ? "text-[var(--green)]" : "text-[var(--danger)]"}`}>· {open ? t("food.open") : t("food.closed")}</span>
                        )}
                      </div>
                    </>
                  }
                >
                  <PlacePhoto src={r.photoUrl} alt={r.name} />
                  {r.address && <p className="text-sm">{r.address}</p>}
                  {r.open && r.close && (
                    <p className="text-sm">
                      <span className="text-[var(--muted)]">{t("food.hours")}: </span>
                      <span className="font-semibold">
                        {r.open}–{r.close}
                      </span>
                    </p>
                  )}
                  {r.certBody && (
                    <p className="text-sm">
                      <span className="text-[var(--muted)]">{t("food.certBy")}: </span>
                      <span className="font-semibold">{r.certBody}</span>
                    </p>
                  )}
                  <div className="flex gap-2">
                    <ActionButton primary icon={<NavigateIcon />} href={mapsDirectionsUrl(r.coords)}>
                      {t("act.directions")}
                    </ActionButton>
                    {r.phone && (
                      <ActionButton icon={<PhoneIcon />} href={`tel:${r.phone}`}>
                        {t("act.call")}
                      </ActionButton>
                    )}
                  </div>
                  {r.address && (
                    <div className="flex">
                      <CopyButton text={r.address} />
                    </div>
                  )}
                  <ReviewsPanel placeId={r.id} />
                </ExpandableCard>
              );
            })}
          </ul>
        )}
        <AddPlaceCta defaultKind="restaurant" />
        <DataFooter />
      </div>
    </>
  );
}
