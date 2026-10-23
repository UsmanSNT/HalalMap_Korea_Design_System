import { useMemo, useState } from "react";
import { MOSQUES, type MosqueKind } from "@/data/mosques";
import { distanceKm, formatDistance, mapsDirectionsUrl } from "@/lib/geo";
import { useLocation } from "@/lib/location";
import { useLanguage } from "@/locale/LanguageContext";
import ActionButton from "@/ui/ActionButton";
import ExpandableCard from "@/ui/ExpandableCard";
import CopyButton from "@/ui/CopyButton";
import { NavigateIcon, PhoneIcon } from "@/ui/icons";
import Notice from "@/ui/Notice";
import PageHeader from "@/ui/PageHeader";
import Segmented from "@/ui/Segmented";

type Filter = "all" | MosqueKind;

export default function MosquesScreen() {
  const { t } = useLanguage();
  const { coords, isReal } = useLocation();
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(
    () =>
      MOSQUES.filter((m) => filter === "all" || m.kind === filter)
        .map((m) => ({ mosque: m, km: distanceKm(coords, m.coords) }))
        .sort((a, b) => a.km - b.km),
    [coords, filter],
  );

  return (
    <>
      <PageHeader title={t("mosques.title")} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <Segmented
          label={t("mosques.title")}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("mosques.all") },
            { value: "mosque", label: t("mosques.mosque") },
            { value: "prayer-room", label: t("mosques.prayerRoom") },
          ]}
        />

        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--muted)]">{t("mosques.empty")}</p>
        ) : (
          <ul className="space-y-3">
            {items.map(({ mosque, km }) => (
              <ExpandableCard
                key={mosque.id}
                summary={
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-bold leading-tight">{mosque.name}</h2>
                        <p className="text-sm text-[var(--muted)]">{mosque.nameKo}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[var(--green-light)] px-2.5 py-1 text-xs font-bold text-[var(--green)]">
                        {isReal ? formatDistance(km) : `~${formatDistance(km)}`}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--muted)]">{mosque.kind === "mosque" ? t("mosques.kindMosque") : t("mosques.kindRoom")}</p>
                  </>
                }
              >
                <p className="text-sm">{mosque.address}</p>
                {mosque.juma && (
                  <p className="text-sm">
                    <span className="text-[var(--muted)]">{t("mosques.juma")}: </span>
                    <span className="font-semibold">{mosque.juma}</span>
                  </p>
                )}
                <ul className="flex flex-wrap gap-1.5">
                  {mosque.facilities.map((f) => (
                    <li key={f} className="rounded-full bg-[var(--cream)] px-2.5 py-1 text-xs font-medium">
                      {t(`facility.${f}` as const)}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <ActionButton primary icon={<NavigateIcon />} href={mapsDirectionsUrl(mosque.coords)}>
                    {t("act.directions")}
                  </ActionButton>
                  {mosque.phone && (
                    <ActionButton icon={<PhoneIcon />} href={`tel:${mosque.phone}`}>
                      {t("act.call")}
                    </ActionButton>
                  )}
                </div>
                <div className="flex">
                  <CopyButton text={mosque.address} />
                </div>
              </ExpandableCard>
            ))}
          </ul>
        )}
        <Notice>{t("data.sample")}</Notice>
      </div>
    </>
  );
}
