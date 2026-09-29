import React from "react";
import { BackButton, HalalBadge, StatusBar } from "../components/Shared";
import type { PlaceMeta, Restaurant } from "@/api/restaurants";
import { useLanguage } from "../i18n/LanguageContext";
import { formatDate, halalBadgeMap, mapsUrl } from "@/services/placeUi";

type PlaceLike = PlaceMeta & { nameKo: string; name: string; address: string; phone: string | null; distance: string };

/** "Demo" / "community reported" / "verified" chip that tells the user how far to trust a record. */
export const TrustChip = ({ place }: { place: PlaceMeta }) => {
  const { t } = useLanguage();
  if (place.dataOrigin === "demo") return <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">{t("place.demo_tag")}</span>;
  if (place.verificationStatus === "verified") return <span className="rounded-full bg-[var(--green-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--green)]">✓ {t("place.verified")}</span>;
  if (place.verificationStatus === "needs_review") return <span className="rounded-full bg-[var(--gold-light)] px-2 py-0.5 text-[10px] font-bold text-[#8A5E1A]">{t("place.needs_review")}</span>;
  return <span className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-bold text-[#2C5ECC]">{t("place.community_reported")}</span>;
};

/** Where the record came from: source, licence, retrieval date — the provenance stored with every place. */
export const ProvenanceCard = ({ place }: { place: PlaceMeta }) => {
  const { t } = useLanguage();
  const p = place.provenance;
  if (place.dataOrigin === "demo") {
    return <div className="rounded-2xl bg-[var(--gold-light)] px-4 py-3 text-xs text-[#8A5E1A]">{t("place.demo_notice")}</div>;
  }
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm space-y-1">
      <p className="text-xs text-[var(--muted)]">{t("place.data_source")}</p>
      <p className="text-sm font-semibold text-[#1A1A18]">{p.attribution ?? p.source ?? "—"}</p>
      <p className="text-xs text-[var(--muted)]">{t("place.license")}: {p.license ?? "—"}</p>
      <p className="text-xs text-[var(--muted)]">{t("place.last_checked")}: {formatDate(p.retrievedAt)}</p>
      {p.sourceUrl && <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="inline-block pt-1 text-xs font-semibold text-[var(--green)]">{t("place.view_source")} ↗</a>}
    </div>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
    <span className="w-20 flex-shrink-0 text-xs text-[var(--muted)]">{label}</span>
    <span className="flex-1 text-sm text-[#1A1A18] break-words">{children}</span>
  </div>
);

/** Detail view for restaurants/markets that have no menu or delivery data (real imported places). */
export const PlaceDetailView = ({ place, onBack }: { place: Restaurant; onBack: () => void }) => {
  const { t } = useLanguage();
  const badge = halalBadgeMap(place.halalStatus);
  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={onBack} />
          <h1 className="font-bold text-lg flex-1 truncate">{place.nameKo}</h1>
        </div>
      </div>
      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-bold text-xl leading-tight text-[#1A1A18]">{place.nameKo}</h2>
              {place.name !== place.nameKo && <p className="text-sm text-[var(--muted)]">{place.name}</p>}
            </div>
            <span className="text-3xl" aria-hidden>{place.kind === "market" ? "🛒" : "🍽️"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {badge && <HalalBadge variant={badge} />}
            <TrustChip place={place} />
            <span className="rounded-full bg-[#F5F3EF] px-2 py-0.5 text-[10px] text-[var(--muted)]">{place.kind === "market" ? t("place.kind_market") : t("place.kind_restaurant")}{place.category && place.category !== "other" && place.kind === "restaurant" ? ` · ${place.category}` : ""}</span>
          </div>
          {place.halalEvidence && (
            <p className="text-xs text-[var(--muted)]"><span className="font-semibold">{t("place.halal_basis")}:</span> {place.halalEvidence}</p>
          )}
          {place.halalStatus !== "certified" && <p className="text-xs text-[#8A5E1A]">{t("place.not_certified_note")}</p>}
          {place.description && <p className="text-sm text-[#1A1A18]">{place.description}</p>}
        </div>

        <div className="rounded-2xl bg-white px-4 py-1 shadow-sm">
          <Row label={t("place.address")}>{place.address || t("place.location_unknown")}</Row>
          {place.distance && <Row label="📍">{place.distance}</Row>}
          {place.phone && <Row label={t("place.phone")}><a href={`tel:${place.phone.replace(/[^\d+]/g, "")}`} className="text-[var(--green)] font-semibold">{place.phone}</a></Row>}
          {place.hours && <Row label={t("place.hours")}>{place.hours}</Row>}
          {place.website && <Row label={t("place.website")}><a href={place.website} target="_blank" rel="noreferrer" className="text-[var(--green)] font-semibold break-all">{place.website.replace(/^https?:\/\//, "")}</a></Row>}
        </div>

        <a href={mapsUrl(place)} target="_blank" rel="noreferrer" className="block w-full rounded-2xl py-3.5 text-center text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("place.open_in_maps")}</a>
        <p className="text-xs text-[var(--muted)] px-1">{t("place.no_ordering")}</p>
        <ProvenanceCard place={place} />
        <div className="h-4" />
      </div>
    </div>
  );
};

export type { PlaceLike };
