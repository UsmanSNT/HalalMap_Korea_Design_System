import React, { useState } from "react";
import type { Analysis, CertificationView, IngredientResult, IngredientStatus, Product, ProductStatus } from "@/api/products";
import { useLanguage } from "../../i18n/LanguageContext";
import type { Lang } from "../../i18n";
import { formatDate } from "@/services/placeUi";

// ── Status presentation ───────────────────────────────────────────────────────
// HALAL CERTIFIED (solid green seal) and NO FLAGGED INGREDIENTS FOUND (outlined, "screened only") are deliberately
// different in colour, shape and wording: they never mean the same thing.
type StatusStyle = { token: string; color: string; bg: string; border: string; solid: boolean; icon: React.ReactNode };

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);

export const STATUS_STYLE: Record<ProductStatus, StatusStyle> = {
  HALAL_CERTIFIED: {
    token: "HALAL CERTIFIED", color: "#FFFFFF", bg: "#1B6B4A", border: "#14503A", solid: true,
    icon: <Icon><path d="M15 3l3 2.5 3.9-.4 1.2 3.7 3.4 2-1.4 3.7 1.4 3.7-3.4 2-1.2 3.7-3.9-.4L15 27l-3-2.5-3.9.4-1.2-3.7-3.4-2L4.9 15 3.5 11.3l3.4-2 1.2-3.7 3.9.4L15 3z" /><path d="M10 15l3.5 3.5L20 12" /></Icon>,
  },
  NO_FLAGGED_INGREDIENTS: {
    token: "NO FLAGGED INGREDIENTS FOUND", color: "#14503A", bg: "#F4FAF7", border: "#8CC5AA", solid: false,
    icon: <Icon><circle cx="15" cy="15" r="11" strokeDasharray="3 3" /><path d="M10.5 15.5l3 3 6-6.5" /></Icon>,
  },
  CHECK_REQUIRED: {
    token: "CHECK REQUIRED", color: "#92400E", bg: "#FEF3C7", border: "#F5C451", solid: false,
    icon: <Icon><path d="M15 4L27 25H3L15 4z" /><path d="M15 12v6" /><path d="M15 21.5v.1" /></Icon>,
  },
  FLAGGED_INGREDIENT: {
    token: "FLAGGED INGREDIENT", color: "#991B1B", bg: "#FEE2E2", border: "#F19A9A", solid: false,
    icon: <Icon><circle cx="15" cy="15" r="11" /><path d="M9.5 20.5l11-11" /></Icon>,
  },
  UNKNOWN: {
    token: "UNKNOWN", color: "#4B5563", bg: "#F3F4F6", border: "#D1D5DB", solid: false,
    icon: <Icon><circle cx="15" cy="15" r="11" /><path d="M11.5 12a3.5 3.5 0 116 2c-1.2 1-2.5 1.6-2.5 3.2" /><path d="M15 21.5v.1" /></Icon>,
  },
};

const ITEM_STYLE: Record<IngredientStatus, { color: string; bg: string; label: string }> = {
  FLAGGED_INGREDIENT: { color: "#991B1B", bg: "#FEE2E2", label: "FLAGGED" },
  CHECK_REQUIRED: { color: "#92400E", bg: "#FEF3C7", label: "CHECK" },
  UNKNOWN: { color: "#4B5563", bg: "#F3F4F6", label: "UNKNOWN" },
  NO_FLAGGED_INGREDIENTS: { color: "#14503A", bg: "#E8F3ED", label: "OK" },
};

const pick = <T extends { ko: string; en: string; uz: string }>(value: T | null | undefined, lang: Lang) => (value ? value[lang] || value.en : "");

// ── Status banner ─────────────────────────────────────────────────────────────
export const StatusBanner = ({ analysis }: { analysis: Analysis }) => {
  const { t, lang } = useLanguage();
  const style = STATUS_STYLE[analysis.status];
  return (
    <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: style.bg, color: style.color, border: `2px ${style.solid ? "solid" : "solid"} ${style.border}` }} role="status" data-testid="status-banner" data-status={analysis.status}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="min-w-0">
          <p className={lang === "en" ? "text-base font-extrabold tracking-[0.08em] leading-tight" : "text-[11px] font-extrabold tracking-[0.12em] leading-tight"} data-testid="status-token">{style.token}</p>
          {lang !== "en" && <p className="font-bold text-lg leading-tight mt-0.5">{t(`scanner.status_${analysis.status}`)}</p>}
        </div>
      </div>
      <p className="mt-2 text-xs font-medium opacity-90">{t(`scanner.substatus_${analysis.status}`)}</p>
      {analysis.reasons.length > 0 && (
        <div className="mt-3 rounded-xl px-3 py-2 text-xs space-y-1" style={{ backgroundColor: style.solid ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.7)" }}>
          <p className="font-bold uppercase tracking-wide opacity-80">{t("scanner.why_title")}</p>
          {analysis.reasons.map((reason, index) => (
            <p key={`${reason.code}-${index}`} className="leading-relaxed">• {reason.text[lang] || reason.text.en}</p>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Certification ─────────────────────────────────────────────────────────────
const CertRow = ({ cert }: { cert: CertificationView }) => {
  const { t } = useLanguage();
  return (
    <div className="text-xs space-y-0.5">
      <p><span className="text-[var(--muted)]">{t("scanner.cert_org")}: </span><span className="font-semibold">{cert.organization}</span></p>
      {cert.certificateNo && <p><span className="text-[var(--muted)]">{t("scanner.cert_no")}: </span>{cert.certificateNo}</p>}
      {cert.validUntil && <p><span className="text-[var(--muted)]">{t("scanner.cert_valid_until")}: </span>{cert.validUntil}</p>}
      {cert.verifiedAt && <p><span className="text-[var(--muted)]">{t("scanner.cert_verified_on")}: </span>{formatDate(cert.verifiedAt)}</p>}
      {cert.verificationUrl && <a href={cert.verificationUrl} target="_blank" rel="noreferrer" className="inline-block font-semibold text-[var(--green)]">{t("scanner.cert_verify_link")} ↗</a>}
    </div>
  );
};

export const CertificationCard = ({ analysis }: { analysis: Analysis }) => {
  const { t } = useLanguage();
  const { certification } = analysis;
  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm" data-testid="certification-card" data-state={certification.state}>
      <p className="font-semibold text-sm text-[#1A1A18]">{t("scanner.cert_title")}</p>
      {certification.state === "valid" ? (
        <div className="mt-2 space-y-2">{certification.valid.map((cert) => <CertRow key={cert.id} cert={cert} />)}</div>
      ) : (
        <p className="mt-1 text-xs text-[var(--muted)]">
          {certification.state === "unverified_claim" ? t("scanner.cert_unverified_claim") : certification.state === "expired" ? t("scanner.cert_expired") : t("scanner.cert_none")}
        </p>
      )}
    </div>
  );
};

// ── Ingredient analysis ───────────────────────────────────────────────────────
const displayNames = (item: IngredientResult) => {
  const en = item.ingredient?.nameEn ?? null;
  const ko = item.ingredient?.nameKo ?? null;
  const names = [en, ko].filter((n): n is string => Boolean(n));
  const unique = [...new Set(names.map((n) => n))];
  // "Gelatin / 젤라틴": the dictionary names next to what is printed on the label
  return unique.length ? unique.join(" / ") : item.name;
};

const ItemCard = ({ item, depth = 0 }: { item: IngredientResult; depth?: number }) => {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const style = ITEM_STYLE[item.status];
  const reason = pick(item.reason, lang);
  return (
    <div className={depth ? "ml-4 border-l-2 pl-3" : ""} style={depth ? { borderColor: style.bg } : undefined} data-testid="ingredient-item" data-status={item.status}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wide flex-shrink-0" style={{ color: style.color, backgroundColor: style.bg }}>{style.label}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1A1A18] leading-snug">{displayNames(item)}</p>
          {displayNames(item) !== item.name && <p className="text-xs text-[var(--muted)]">{item.name}{item.percent != null ? ` · ${item.percent}%` : ""}{item.origin ? ` · ${item.origin}` : ""}</p>}
          {reason && item.status !== "NO_FLAGGED_INGREDIENTS" && (
            <p className="mt-1 text-xs leading-relaxed" style={{ color: style.color }}><span className="font-bold">{t("scanner.reason_label")}:</span> {reason}</p>
          )}
          {item.derivedFromChildren && <p className="mt-0.5 text-[11px] text-[var(--muted)]">{t("scanner.via_children")}</p>}
          {item.matchType === "fuzzy" && <p className="mt-0.5 text-[11px] text-[var(--muted)]">⚠ {t("scanner.fuzzy_note")}</p>}
          {item.matchType === "contains" && <p className="mt-0.5 text-[11px] text-[var(--muted)]">⚠ {t("scanner.partial_note")}</p>}
          {(item.rule || item.reason) && (
            <button onClick={() => setOpen(!open)} className="mt-1 text-[11px] font-semibold text-[var(--green)]">{open ? t("scanner.hide_details") : t("scanner.show_details")}</button>
          )}
          {open && item.rule && (
            <div className="mt-1 rounded-lg bg-[var(--cream)] px-2.5 py-2 text-[11px] leading-relaxed text-[#374151] space-y-0.5">
              <p><span className="font-bold">{t("scanner.rule_label")}:</span> {item.rule.title} <span className="opacity-60">({item.rule.key})</span></p>
              {item.rule.evidence && <p><span className="font-bold">{t("scanner.evidence_label")}:</span> {item.rule.evidence}{item.rule.evidenceUrl && <> <a href={item.rule.evidenceUrl} target="_blank" rel="noreferrer" className="text-[var(--green)] font-semibold">↗</a></>}</p>}
            </div>
          )}
        </div>
      </div>
      {item.children.length > 0 && (
        <div className="mt-2 space-y-2">{item.children.map((child, index) => <ItemCard key={`${child.raw}-${index}`} item={child} depth={depth + 1} />)}</div>
      )}
    </div>
  );
};

const Section = ({ title, items, tone }: { title: string; items: IngredientResult[]; tone: IngredientStatus }) => {
  if (items.length === 0) return null;
  const style = ITEM_STYLE[tone];
  return (
    <div className="px-4 py-3" data-testid={`section-${tone}`}>
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wide" style={{ color: style.color }}>{title} ({items.length})</p>
      <div className="space-y-3">{items.map((item, index) => <ItemCard key={`${item.raw}-${index}`} item={item} />)}</div>
    </div>
  );
};

export const IngredientAnalysis = ({ analysis }: { analysis: Analysis }) => {
  const { t } = useLanguage();
  const [showOk, setShowOk] = useState(false);
  if (analysis.counts.total === 0) return null;
  const ok = analysis.cleared.filter((item) => !item.derivedFromChildren || item.children.length === 0);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-[var(--border)]" data-testid="ingredient-analysis">
      <div className="px-4 py-3">
        <p className="font-semibold text-sm text-[#1A1A18]">{t("scanner.analysis_title")}</p>
        <p className="text-xs text-[var(--muted)] mt-0.5">{t("scanner.ingredients_count").replace("{count}", String(analysis.counts.total))}</p>
      </div>
      <Section title={t("scanner.section_flagged")} items={analysis.flagged} tone="FLAGGED_INGREDIENT" />
      <Section title={t("scanner.section_check")} items={analysis.checkRequired} tone="CHECK_REQUIRED" />
      <Section title={t("scanner.section_unknown")} items={analysis.unknown} tone="UNKNOWN" />
      {ok.length > 0 && (
        <div className="px-4 py-3">
          <button onClick={() => setShowOk(!showOk)} className="flex w-full items-center justify-between text-xs font-extrabold uppercase tracking-wide" style={{ color: ITEM_STYLE.NO_FLAGGED_INGREDIENTS.color }}>
            <span>{t("scanner.section_ok")} ({ok.length})</span>
            <span>{showOk ? "▴" : "▾"}</span>
          </button>
          {showOk && <div className="mt-2 flex flex-wrap gap-1.5">{ok.map((item, i) => <span key={`${item.raw}-${i}`} className="rounded-full bg-[var(--green-light)] px-2.5 py-1 text-xs text-[var(--green-dark)]">{displayNames(item)}</span>)}</div>}
        </div>
      )}
    </div>
  );
};

export const DisclaimerNote = ({ analysis }: { analysis: Analysis }) => {
  const { lang } = useLanguage();
  return <p className="px-1 text-[11px] leading-relaxed text-[var(--muted)]">{analysis.disclaimer[lang] || analysis.disclaimer.en}</p>;
};

// ── Product source / provenance ───────────────────────────────────────────────
export const SourceCard = ({ product, analysis }: { product: Product; analysis: Analysis }) => {
  const { t } = useLanguage();
  const p = product.provenance;
  const sourceName = (key: string) => {
    const label = t(`scanner.source_${key === "mfds_foodsafetykorea" ? "mfds" : key}`);
    return label.startsWith("scanner.") ? key : label;
  };
  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm space-y-1.5" data-testid="source-card">
      <p className="text-xs text-[var(--muted)]">{t("scanner.data_source_label")}</p>
      <p className="text-sm font-semibold text-[#1A1A18]">{sourceName(p.source)}</p>
      {p.attribution && <p className="text-xs text-[var(--muted)]">{p.attribution}</p>}
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-[var(--muted)]">{t("scanner.license_label")}</dt><dd>{p.license ?? "—"}</dd>
        <dt className="text-[var(--muted)]">{t("scanner.retrieved_label")}</dt><dd>{formatDate(p.retrievedAt)}</dd>
        <dt className="text-[var(--muted)]">{t("scanner.last_checked_label")}</dt><dd>{formatDate(p.lastCheckedAt)}</dd>
        <dt className="text-[var(--muted)]">{t("scanner.last_verified_label")}</dt><dd>{formatDate(p.lastVerifiedAt)}</dd>
        <dt className="text-[var(--muted)]">{t("scanner.verification_label")}</dt><dd className="font-semibold">{t(`scanner.verification_${product.verificationStatus === "rejected" ? "unverified" : product.verificationStatus}`)}</dd>
      </dl>
      {p.sources.length > 1 && <p className="text-[11px] text-[var(--muted)]">+ {p.sources.filter((s) => s.source !== p.source).map((s) => sourceName(s.source)).join(", ")}</p>}
      {analysis.dataWarnings.map((code) => <p key={code} className="rounded-lg bg-[var(--gold-light)] px-2.5 py-1.5 text-[11px] text-[#7A5220]">{t(`scanner.warn_${code}`)}</p>)}
      {p.sourceUrl && <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="inline-block text-xs font-semibold text-[var(--green)]">{t("scanner.view_source")} ↗</a>}
    </div>
  );
};
