import React, { useCallback, useEffect, useMemo, useState } from "react";
import { A, AdminTable, Btn, Card, Column, FilterChips, KPICard, Modal, PageHeader, Pagination, SearchBar, Toast } from "./AdminShared";
import { adminApi, fetchProtectedImage, type AdminCertification, type AdminIngredient, type AdminPlace, type AdminProduct, type AdminProductDetail, type AdminRule, type AdminSource, type AdminStats, type AdminSubmission, type Verification } from "@/api/admin";
import type { Analysis, IngredientResult, ProductStatus } from "@/api/products";
import { STATUS_STYLE } from "../screens/scanner/AnalysisView";

// ── shared bits ───────────────────────────────────────────────────────────────
type ToastState = { msg: string; type: "success" | "error" | "info" } | null;

const useToast = () => {
  const [toast, setToast] = useState<ToastState>(null);
  const node = toast ? <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} /> : null;
  return { node, ok: (msg: string) => setToast({ msg, type: "success" }), fail: (error: unknown) => setToast({ msg: (error as Error).message || "요청 실패", type: "error" }) };
};

const useLoad = <T,>(loader: () => Promise<T>, deps: unknown[]) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loader().then((value) => { if (!cancelled) { setData(value); setError(null); } }).catch((e: Error) => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, loading, error, reload: useCallback(() => setTick((n) => n + 1), []) };
};

const inputStyle: React.CSSProperties = { border: `1px solid ${A.border}`, backgroundColor: A.surface, color: A.text };
const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold" style={{ color: A.muted }}>{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px]" style={{ color: A.dim }}>{hint}</span>}
  </label>
);
const TextInput = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`w-full rounded-lg px-3 py-2 text-sm outline-none ${className}`} style={inputStyle} />;
const TextArea = ({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} className={`w-full rounded-lg px-3 py-2 text-sm outline-none ${className}`} style={inputStyle} />;
const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle}>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Pill = ({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) => (
  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: bg, color }}>{children}</span>
);

const VERIFICATION_LABEL: Record<Verification, string> = { unverified: "미검증", verified: "검증됨", needs_review: "검토 필요", rejected: "거부됨" };
const VerificationPill = ({ status }: { status: Verification }) => {
  const cfg = { unverified: [A.borderLight, A.muted], verified: [A.greenLight, A.greenText], needs_review: [A.warningLight, A.warningText], rejected: [A.dangerLight, A.dangerText] }[status];
  return <Pill bg={cfg[0]} color={cfg[1]}>{VERIFICATION_LABEL[status]}</Pill>;
};
const AnalysisPill = ({ status }: { status?: ProductStatus | string }) => {
  const style = STATUS_STYLE[status as ProductStatus];
  if (!style) return <span style={{ color: A.dim }}>—</span>;
  return <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap" style={{ backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}` }}>{style.token}</span>;
};
const RULE_STATUS_LABEL: Record<string, string> = { FLAGGED_INGREDIENT: "표시(FLAGGED)", CHECK_REQUIRED: "확인 필요", NO_FLAGGED_INGREDIENTS: "표시 없음", UNKNOWN: "미분류" };
const RuleStatusPill = ({ status }: { status: string }) => {
  const cfg: Record<string, [string, string]> = { FLAGGED_INGREDIENT: [A.dangerLight, A.dangerText], CHECK_REQUIRED: [A.warningLight, A.warningText], NO_FLAGGED_INGREDIENTS: [A.greenLight, A.greenText], UNKNOWN: [A.borderLight, A.muted] };
  const [bg, color] = cfg[status] ?? cfg.UNKNOWN;
  return <Pill bg={bg} color={color}>{RULE_STATUS_LABEL[status] ?? status}</Pill>;
};

const withId = <T extends { id: number | string }>(rows: T[]) => rows.map((row) => ({ ...row, id: String(row.id) }));
const Loading = ({ error }: { error: string | null }) => <p className="px-5 py-10 text-center text-sm" style={{ color: error ? A.dangerText : A.muted }}>{error ?? "불러오는 중…"}</p>;
const date = (v: string | null | undefined) => (v ? v.slice(0, 10) : "—");
const Row2 = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex gap-3 py-1.5 text-sm" style={{ borderBottom: `1px solid ${A.borderLight}` }}>
    <span className="w-28 flex-shrink-0 text-xs" style={{ color: A.muted }}>{k}</span><span className="min-w-0 flex-1 break-words" style={{ color: A.text }}>{v}</span>
  </div>
);

const flatten = (items: IngredientResult[]): IngredientResult[] => items.flatMap((item) => [item, ...flatten(item.children)]);

// ── Overview ──────────────────────────────────────────────────────────────────
export const ScannerOverview = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  const { data, loading, error } = useLoad<AdminStats>(() => adminApi.stats(), []);
  if (!data) return <Loading error={loading ? null : error} />;
  const pending = data.submissions.byStatus.pending ?? 0;
  const realPlaces = Object.entries(data.places.byOrigin).filter(([k]) => k !== "demo").reduce((sum, [, n]) => sum + n, 0);
  return (
    <div>
      <PageHeader breadcrumb={["HalalMap Admin", "제품 스캐너", "개요"]} title="제품 스캐너 데이터" subtitle="제품 · 성분 · 규칙 · 인증 · 제보 · 출처를 한곳에서 관리합니다" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label="제품" value={String(data.products.total)} icon="📦" iconBg={A.infoLight} iconColor={A.info} />
        <KPICard label="검토 대기 제보" value={String(pending)} icon="📝" iconBg={A.goldLight} iconColor={A.gold} />
        <KPICard label="성분 / 별칭" value={`${data.ingredients.total} / ${data.ingredients.aliases}`} icon="🧪" iconBg={A.greenLight} iconColor={A.green} />
        <KPICard label="활성 규칙" value={String(data.rules.total)} icon="⚖️" iconBg={A.purpleLight} iconColor={A.purple} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold" style={{ color: A.text }}>제품 검증 상태</p>
          {Object.entries(data.products.byStatus).length === 0 && <p className="text-sm" style={{ color: A.muted }}>아직 제품이 없습니다. 스캔하면 외부 소스에서 가져와 캐시됩니다.</p>}
          {Object.entries(data.products.byStatus).map(([k, n]) => <Row2 key={k} k={VERIFICATION_LABEL[k as Verification] ?? k} v={n} />)}
        </Card>
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold" style={{ color: A.text }}>장소 데이터 (식당·모스크·기도실·마트)</p>
          <Row2 k="실제 데이터(가져옴)" v={realPlaces} />
          <Row2 k="데모(가상)" v={data.places.byOrigin.demo ?? 0} />
          {Object.entries(data.places.byKind).map(([k, n]) => <Row2 key={k} k={k} v={n} />)}
          {realPlaces === 0 && <p className="mt-3 rounded-lg p-3 text-xs" style={{ backgroundColor: A.warningLight, color: A.warningText }}>실제 장소 데이터가 아직 없습니다. <b>pnpm import:places -- --source osm --snapshot</b> 를 실행하거나 아래 「장소」에서 CSV/JSON을 가져오세요.</p>}
        </Card>
      </div>
      <div className="mt-4 flex gap-2">
        <Btn variant="primary" size="md" onClick={() => onNavigate("scanner-submissions")}>제보 검토하기 ({pending})</Btn>
        <Btn size="md" onClick={() => onNavigate("scanner-sources")}>데이터 출처 · 라이선스</Btn>
      </div>
    </div>
  );
};

// ── Products ──────────────────────────────────────────────────────────────────
const statusOptions = ["전체", "unverified", "verified", "needs_review", "rejected"];

export const ProductsAdmin = () => {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("전체");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const { data, loading, error, reload } = useLoad(() => adminApi.products({ q, status: status === "전체" ? undefined : status, page }), [q, status, page]);
  const columns: Column<AdminProduct & { id: string }>[] = [
    { key: "name", header: "제품", render: (p) => <div><p className="font-medium text-sm" style={{ color: A.text }}>{p.nameKo ?? p.name}</p><p className="mt-0.5 font-mono text-xs" style={{ color: A.muted }}>{p.barcode}</p></div> },
    { key: "brand", header: "브랜드", render: (p) => <span className="text-sm">{p.brand ?? "—"}</span> },
    { key: "analysis", header: "분석 결과", render: (p) => <AnalysisPill status={p.analysisStatus} /> },
    { key: "verification", header: "검증", render: (p) => <VerificationPill status={p.verificationStatus} /> },
    { key: "source", header: "출처", render: (p) => <span className="text-xs" style={{ color: A.muted }}>{p.provenance.source} · {date(p.provenance.retrievedAt)}</span> },
    { key: "cert", header: "인증", render: (p) => <span className="text-xs" style={{ color: p.certificationState === "valid" ? A.greenText : A.muted }}>{p.certificationState === "valid" ? "✓ 유효" : p.certificationState === "unverified_claim" ? "미확인 표시" : "—"}</span> },
  ];
  return (
    <div>
      <PageHeader breadcrumb={["HalalMap Admin", "제품 스캐너", "제품"]} title="제품" subtitle={data ? `${data.total.toLocaleString()}개` : ""}
        actions={<Btn variant="primary" size="md" onClick={() => setCreating(true)}>+ 제품 추가</Btn>} />
      <Card>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <FilterChips options={statusOptions} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="제품명, 바코드, 브랜드…" width={260} />
        </div>
        {!data ? <Loading error={loading ? null : error} /> : data.products.length === 0 ? <p className="px-5 py-10 text-center text-sm" style={{ color: A.muted }}>제품이 없습니다.</p> : (
          <>
            <AdminTable columns={columns} data={withId(data.products)} selectable={false} onRowClick={(p) => setOpenId(Number(p.id))} />
            <Pagination page={page} total={data.total} perPage={data.perPage} onChange={setPage} />
          </>
        )}
      </Card>
      {openId !== null && <ProductDetailModal id={openId} onClose={() => { setOpenId(null); reload(); }} />}
      {creating && <ProductCreateModal onClose={(created) => { setCreating(false); if (created) reload(); }} />}
    </div>
  );
};

const ProductCreateModal = ({ onClose }: { onClose: (created: boolean) => void }) => {
  const toast = useToast();
  const [f, setF] = useState({ barcode: "", name: "", nameKo: "", brand: "", ingredientsRaw: "" });
  const save = async () => { try { await adminApi.createProduct(f); onClose(true); } catch (e) { toast.fail(e); } };
  return (
    <Modal open onClose={() => onClose(false)} title="제품 추가" width={560}>
      <div className="space-y-3 p-6">
        <Field label="바코드 (EAN-13/8, UPC)"><TextInput value={f.barcode} onChange={(e) => setF({ ...f, barcode: e.target.value })} className="font-mono" /></Field>
        <Field label="제품명"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="한국어 이름"><TextInput value={f.nameKo} onChange={(e) => setF({ ...f, nameKo: e.target.value })} /></Field><Field label="브랜드"><TextInput value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} /></Field></div>
        <Field label="원재료명"><TextArea rows={4} value={f.ingredientsRaw} onChange={(e) => setF({ ...f, ingredientsRaw: e.target.value })} /></Field>
        <div className="flex justify-end gap-2"><Btn onClick={() => onClose(false)}>취소</Btn><Btn variant="primary" onClick={save}>저장 (관리자 검증됨)</Btn></div>
      </div>
      {toast.node}
    </Modal>
  );
};

const ProductDetailModal = ({ id, onClose }: { id: number; onClose: () => void }) => {
  const toast = useToast();
  const { data, reload } = useLoad<AdminProductDetail>(() => adminApi.product(id), [id]);
  const [tab, setTab] = useState<"info" | "ingredients" | "analysis" | "cert" | "sources">("info");
  const [f, setF] = useState<Record<string, string>>({});
  const [certOpen, setCertOpen] = useState(false);
  useEffect(() => {
    if (!data) return;
    const p = data.product;
    setF({ name: p.name ?? "", nameKo: p.nameKo ?? "", nameEn: p.nameEn ?? "", brand: p.brand ?? "", manufacturer: p.manufacturer ?? "", category: p.category ?? "", imageUrl: p.imageUrl ?? "", ingredientsRaw: p.ingredientsRaw ?? "", adminNote: data.adminNote ?? "", verificationStatus: p.verificationStatus });
  }, [data]);

  const save = async (extra: Record<string, unknown> = {}) => {
    try {
      await adminApi.updateProduct(id, { ...f, ...extra });
      toast.ok("저장했습니다");
      reload();
    } catch (e) { toast.fail(e); }
  };

  if (!data) return <Modal open onClose={onClose} title="제품"><Loading error={null} /></Modal>;
  const { product, analysis } = data;
  const tabs: [typeof tab, string][] = [["info", "정보"], ["ingredients", `원재료 (${data.ingredients.length})`], ["analysis", "분석"], ["cert", `인증 (${data.certifications.length})`], ["sources", "출처"]];
  return (
    <Modal open onClose={onClose} title={`${product.nameKo ?? product.name}  ·  ${product.barcode}`} width={860}>
      <div className="px-6 pt-4">
        <div className="mb-4 flex flex-wrap items-center gap-2"><AnalysisPill status={analysis.status} /><VerificationPill status={product.verificationStatus} /><span className="text-xs" style={{ color: A.muted }}>{product.dataOrigin} · {product.provenance.source}</span></div>
        <div className="flex gap-1" style={{ borderBottom: `1px solid ${A.border}` }}>
          {tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className="relative px-4 py-2.5 text-sm font-medium" style={{ color: tab === key ? A.green : A.muted }}>{label}{tab === key && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: A.green }} />}</button>)}
        </div>
      </div>
      <div className="p-6">
        {tab === "info" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="제품명"><TextInput value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
              <Field label="한국어 이름"><TextInput value={f.nameKo ?? ""} onChange={(e) => setF({ ...f, nameKo: e.target.value })} /></Field>
              <Field label="영어 이름"><TextInput value={f.nameEn ?? ""} onChange={(e) => setF({ ...f, nameEn: e.target.value })} /></Field>
              <Field label="브랜드"><TextInput value={f.brand ?? ""} onChange={(e) => setF({ ...f, brand: e.target.value })} /></Field>
              <Field label="제조사"><TextInput value={f.manufacturer ?? ""} onChange={(e) => setF({ ...f, manufacturer: e.target.value })} /></Field>
              <Field label="카테고리"><TextInput value={f.category ?? ""} onChange={(e) => setF({ ...f, category: e.target.value })} /></Field>
            </div>
            <Field label="이미지 URL"><TextInput value={f.imageUrl ?? ""} onChange={(e) => setF({ ...f, imageUrl: e.target.value })} /></Field>
            <Field label="원재료명 (수정하면 관리자 검증 데이터로 표시됩니다)"><TextArea rows={5} value={f.ingredientsRaw ?? ""} onChange={(e) => setF({ ...f, ingredientsRaw: e.target.value })} /></Field>
            <Field label="관리자 메모"><TextInput value={f.adminNote ?? ""} onChange={(e) => setF({ ...f, adminNote: e.target.value })} /></Field>
            <div className="flex items-end gap-3">
              <div className="w-56"><Field label="검증 상태"><Select value={f.verificationStatus ?? "unverified"} onChange={(v) => setF({ ...f, verificationStatus: v })} options={(["unverified", "verified", "needs_review", "rejected"] as Verification[]).map((v) => ({ value: v, label: VERIFICATION_LABEL[v] }))} /></Field></div>
              <Btn variant="primary" size="md" onClick={() => save()}>저장</Btn>
              <span className="text-xs" style={{ color: A.muted }}>마지막 검증 {date(product.provenance.lastVerifiedAt)} · 마지막 확인 {date(product.provenance.lastCheckedAt)}</span>
            </div>
          </div>
        )}
        {tab === "ingredients" && <ProductIngredientsTab detail={data} onChanged={reload} toast={toast} id={id} />}
        {tab === "analysis" && <AnalysisSummary analysis={analysis} />}
        {tab === "cert" && (
          <div className="space-y-3">
            {data.certifications.length === 0 && <p className="text-sm" style={{ color: A.muted }}>등록된 인증 정보가 없습니다.</p>}
            {data.certifications.map((c) => <CertLine key={c.id} c={c} />)}
            <Btn variant="primary" onClick={() => setCertOpen(true)}>+ 인증 정보 추가</Btn>
          </div>
        )}
        {tab === "sources" && (
          <div>
            <Row2 k="주 출처" v={`${product.provenance.source} (${product.provenance.license ?? "라이선스 없음"})`} />
            <Row2 k="가져온 날짜" v={date(product.provenance.retrievedAt)} />
            {product.provenance.sourceUrl && <Row2 k="원본 URL" v={<a href={product.provenance.sourceUrl} target="_blank" rel="noreferrer" style={{ color: A.green }}>{product.provenance.sourceUrl}</a>} />}
            {product.provenance.sources.map((s) => <Row2 key={s.source} k={s.source} v={`${date(s.retrieved_at)} · ${s.license ?? "—"}`} />)}
          </div>
        )}
      </div>
      {certOpen && <CertificationModal productId={id} onClose={(changed) => { setCertOpen(false); if (changed) reload(); }} />}
      {toast.node}
    </Modal>
  );
};

const CertLine = ({ c }: { c: AdminCertification }) => {
  const status = (c.verificationStatus ?? c.verification_status ?? "unverified") as Verification;
  return (
    <div className="rounded-lg p-3" style={{ border: `1px solid ${A.border}` }}>
      <div className="flex items-center gap-2"><span className="font-semibold text-sm">{c.organization}</span><VerificationPill status={status} /><span className="text-xs" style={{ color: A.muted }}>{c.status}</span></div>
      <p className="mt-1 text-xs" style={{ color: A.muted }}>번호 {c.certificateNo ?? c.certificate_no ?? "—"} · 유효기간 {c.validUntil ?? c.valid_until ?? "—"}</p>
      {(c.verificationUrl ?? c.verification_url) && <a className="text-xs" style={{ color: A.green }} href={(c.verificationUrl ?? c.verification_url) as string} target="_blank" rel="noreferrer">확인 URL ↗</a>}
    </div>
  );
};

const AnalysisSummary = ({ analysis }: { analysis: Analysis }) => (
  <div className="space-y-3 text-sm">
    <div className="flex items-center gap-2"><AnalysisPill status={analysis.status} /><span className="text-xs" style={{ color: A.muted }}>규칙셋 {analysis.rulesetVersion} · 입력 신뢰도 {analysis.inputTrust}</span></div>
    {analysis.reasons.map((r, i) => <p key={i} style={{ color: A.textMid }}>• {r.text.ko}</p>)}
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${A.border}` }}>
      {flatten(analysis.items).map((item, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-2" style={{ borderBottom: `1px solid ${A.borderLight}` }}>
          <RuleStatusPill status={item.status} />
          <div className="min-w-0 flex-1"><p className="font-medium">{item.name}{item.ingredient ? <span style={{ color: A.muted }}> → {item.ingredient.canonicalName} <span className="font-mono text-xs">({item.matchType})</span></span> : ""}</p>{item.reason && <p className="text-xs" style={{ color: A.muted }}>{item.reason.ko} {item.rule ? `[${item.rule.key}]` : ""}</p>}</div>
        </div>
      ))}
    </div>
  </div>
);

const ProductIngredientsTab = ({ detail, onChanged, toast, id }: { detail: AdminProductDetail; onChanged: () => void; toast: ReturnType<typeof useToast>; id: number }) => {
  const [mapText, setMapText] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const overrideSet = new Set(detail.overrides.map((o) => o.normalized_text));
  const apply = async (text: string, body: { ingredientKey?: string; ignore?: boolean }) => {
    try { await adminApi.overrideIngredient(id, { text, ...body }); toast.ok("보정했습니다"); setMapText(null); setKey(""); onChanged(); } catch (e) { toast.fail(e); }
  };
  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: A.muted }}>성분표를 분석한 결과입니다. 인식되지 않은 항목은 사전의 성분에 연결하거나 무시할 수 있으며, 이 보정은 이 제품에만 적용되고 다시 분석해도 유지됩니다.</p>
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${A.border}` }}>
        {detail.ingredients.map((row) => (
          <div key={row.id} className="flex items-center gap-3 px-3 py-2 text-sm" style={{ borderBottom: `1px solid ${A.borderLight}`, paddingLeft: row.parent_position === null ? 12 : 32 }}>
            <span className="min-w-0 flex-1 font-medium">{row.raw_text}</span>
            <span className="text-xs" style={{ color: A.muted }}>{row.canonical_name ?? "미인식"} · {row.match_type}</span>
            {row.analysis_status && <RuleStatusPill status={row.analysis_status} />}
            <Btn onClick={() => { setMapText(row.raw_text); setKey(row.ingredient_key ?? ""); }}>{overrideSet.has(row.normalized_text) ? "보정됨" : "연결"}</Btn>
          </div>
        ))}
      </div>
      {detail.overrides.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold" style={{ color: A.muted }}>이 제품의 보정</p>
          {detail.overrides.map((o) => (
            <div key={o.normalized_text} className="flex items-center gap-2 py-1 text-sm"><span className="font-mono">{o.normalized_text}</span><span>→ {o.canonical_name ?? "무시"}</span><Btn variant="ghost" onClick={async () => { try { await adminApi.removeOverride(id, o.normalized_text); onChanged(); } catch (e) { toast.fail(e); } }}>해제</Btn></div>
          ))}
        </div>
      )}
      {mapText !== null && (
        <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}>
          <p className="text-sm font-semibold">「{mapText}」 연결</p>
          <Field label="성분 키 (예: gelatin, fish_gelatin, pork)" hint="성분 탭에서 키를 확인하세요"><TextInput value={key} onChange={(e) => setKey(e.target.value)} className="font-mono" /></Field>
          <div className="flex gap-2"><Btn variant="primary" onClick={() => apply(mapText, { ingredientKey: key.trim() })}>연결</Btn><Btn variant="warning" onClick={() => apply(mapText, { ignore: true })}>성분이 아님(무시)</Btn><Btn onClick={() => setMapText(null)}>취소</Btn></div>
        </div>
      )}
    </div>
  );
};

// ── Certification modal / list ────────────────────────────────────────────────
const CertificationModal = ({ productId, cert, onClose }: { productId?: number; cert?: AdminCertification; onClose: (changed: boolean) => void }) => {
  const toast = useToast();
  const status = (cert?.verificationStatus ?? cert?.verification_status ?? "unverified") as Verification;
  const [f, setF] = useState({
    barcode: "", organization: cert?.organization ?? "", certificateNo: cert?.certificateNo ?? cert?.certificate_no ?? "", verificationUrl: cert?.verificationUrl ?? cert?.verification_url ?? "",
    validUntil: cert?.validUntil ?? cert?.valid_until ?? "", status: cert?.status ?? "valid", verificationStatus: status, note: cert?.note ?? "",
  });
  const save = async () => {
    try {
      const body = { ...f, validUntil: f.validUntil || null, certificateNo: f.certificateNo || null, verificationUrl: f.verificationUrl || null };
      if (cert) await adminApi.updateCertification(cert.id, body);
      else await adminApi.createCertification({ ...body, ...(productId ? { productId } : { barcode: f.barcode }) });
      onClose(true);
    } catch (e) { toast.fail(e); }
  };
  return (
    <Modal open onClose={() => onClose(false)} title={cert ? "인증 정보 수정" : "인증 정보 추가"} width={560}>
      <div className="space-y-3 p-6">
        {!cert && !productId && <Field label="제품 바코드"><TextInput value={f.barcode} onChange={(e) => setF({ ...f, barcode: e.target.value })} /></Field>}
        <Field label="인증 기관"><TextInput value={f.organization} onChange={(e) => setF({ ...f, organization: e.target.value })} placeholder="예: KMF" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="인증 번호"><TextInput value={f.certificateNo} onChange={(e) => setF({ ...f, certificateNo: e.target.value })} /></Field>
          <Field label="유효기간 (YYYY-MM-DD)"><TextInput value={f.validUntil} onChange={(e) => setF({ ...f, validUntil: e.target.value })} /></Field>
        </div>
        <Field label="인증 확인 URL" hint="‘검증됨’으로 표시하려면 확인 URL 또는 인증 번호가 필요합니다"><TextInput value={f.verificationUrl} onChange={(e) => setF({ ...f, verificationUrl: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="검증 상태"><Select value={f.verificationStatus} onChange={(v) => setF({ ...f, verificationStatus: v as Verification })} options={(["unverified", "verified", "needs_review", "rejected"] as Verification[]).map((v) => ({ value: v, label: VERIFICATION_LABEL[v] }))} /></Field>
          <Field label="인증서 상태"><Select value={f.status} onChange={(v) => setF({ ...f, status: v })} options={[{ value: "valid", label: "유효" }, { value: "expired", label: "만료" }, { value: "revoked", label: "취소" }, { value: "suspended", label: "정지" }]} /></Field>
        </div>
        <Field label="메모"><TextInput value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
        <div className="flex justify-end gap-2">{cert && <Btn variant="danger" onClick={async () => { try { await adminApi.deleteCertification(cert.id); onClose(true); } catch (e) { toast.fail(e); } }}>삭제</Btn>}<Btn onClick={() => onClose(false)}>취소</Btn><Btn variant="primary" onClick={save}>저장</Btn></div>
      </div>
      {toast.node}
    </Modal>
  );
};

export const CertificationsAdmin = () => {
  const [status, setStatus] = useState("전체");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<AdminCertification | "new" | null>(null);
  const { data, loading, error, reload } = useLoad(() => adminApi.certifications({ q, status: status === "전체" ? undefined : status, page }), [q, status, page]);
  const columns: Column<AdminCertification & { id: string }>[] = [
    { key: "product", header: "제품", render: (c) => <div><p className="text-sm font-medium">{c.productName}</p><p className="font-mono text-xs" style={{ color: A.muted }}>{c.barcode}</p></div> },
    { key: "org", header: "인증 기관", render: (c) => <span className="text-sm">{c.organization}</span> },
    { key: "no", header: "번호", render: (c) => <span className="font-mono text-xs">{c.certificateNo ?? "—"}</span> },
    { key: "until", header: "유효기간", render: (c) => <span className="text-xs">{c.validUntil ?? "—"}</span> },
    { key: "v", header: "검증", render: (c) => <VerificationPill status={(c.verificationStatus ?? "unverified") as Verification} /> },
    { key: "by", header: "검증자", render: (c) => <span className="text-xs" style={{ color: A.muted }}>{c.verifiedBy ?? "—"} {date(c.verifiedAt)}</span> },
  ];
  return (
    <div>
      <PageHeader breadcrumb={["HalalMap Admin", "제품 스캐너", "인증"]} title="할랄 인증" subtitle="검증됨 + 유효 + 만료 전 인증만 「HALAL CERTIFIED」 결과를 만듭니다" actions={<Btn variant="primary" size="md" onClick={() => setEdit("new")}>+ 인증 추가</Btn>} />
      <Card>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <FilterChips options={statusOptions} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="바코드, 제품명, 기관…" width={240} />
        </div>
        {!data ? <Loading error={loading ? null : error} /> : data.certifications.length === 0 ? <p className="px-5 py-10 text-center text-sm" style={{ color: A.muted }}>등록된 인증이 없습니다. 「OFF 포장 표시」는 미확인 표시로만 저장됩니다.</p> : (
          <><AdminTable columns={columns} data={withId(data.certifications)} selectable={false} onRowClick={(c) => setEdit(data.certifications.find((x) => String(x.id) === c.id) ?? null)} /><Pagination page={page} total={data.total} perPage={data.perPage} onChange={setPage} /></>
        )}
      </Card>
      {edit && <CertificationModal cert={edit === "new" ? undefined : edit} onClose={(changed) => { setEdit(null); if (changed) reload(); }} />}
    </div>
  );
};

// ── Ingredients & aliases ─────────────────────────────────────────────────────
export const IngredientsAdmin = () => {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("전체");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const { data, loading, error, reload } = useLoad(() => adminApi.ingredients({ q, category, status: status === "전체" ? undefined : status, page }), [q, status, category, page]);
  const categories = useLoad(() => adminApi.categories(), []);
  const columns: Column<AdminIngredient & { id: string }>[] = [
    { key: "name", header: "성분", render: (i) => <div><p className="text-sm font-medium">{i.nameKo ?? i.canonicalName}</p><p className="text-xs" style={{ color: A.muted }}>{i.nameEn ?? ""} · <span className="font-mono">{i.key}</span></p></div> },
    { key: "cat", header: "분류", render: (i) => <span className="text-xs">{i.category}{i.isClass ? " · 포괄명칭" : ""}</span> },
    { key: "status", header: "규칙 결과", render: (i) => <RuleStatusPill status={i.analysisStatus} /> },
    { key: "rule", header: "적용 규칙", render: (i) => <span className="font-mono text-xs" style={{ color: A.muted }}>{i.analysisRuleKey ?? "—"}</span> },
    { key: "alias", header: "별칭", render: (i) => <span className="text-sm">{i.aliasCount}</span> },
    { key: "mfds", header: "MFDS 코드", render: (i) => <span className="font-mono text-xs">{i.mfdsCode ?? "—"}</span> },
  ];
  return (
    <div>
      <PageHeader breadcrumb={["HalalMap Admin", "제품 스캐너", "성분"]} title="성분 사전" subtitle={data ? `${data.total}개 · 같은 성분의 이름(젤라틴/gelatin/gelatine)은 하나로 연결됩니다` : ""} actions={<Btn variant="primary" size="md" onClick={() => setCreating(true)}>+ 성분 추가</Btn>} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <FilterChips options={["전체", "FLAGGED_INGREDIENT", "CHECK_REQUIRED", "NO_FLAGGED_INGREDIENTS", "UNKNOWN"]} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          <div className="flex items-center gap-2">
            <div className="w-44"><Select value={category} onChange={(v) => { setCategory(v); setPage(1); }} options={[{ value: "", label: "모든 분류" }, ...(categories.data?.categories ?? []).map((c) => ({ value: c.category, label: `${c.category} (${c.n})` }))]} /></div>
            <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="이름, 별칭, 키…" width={220} />
          </div>
        </div>
        {!data ? <Loading error={loading ? null : error} /> : (
          <><AdminTable columns={columns} data={withId(data.ingredients)} selectable={false} onRowClick={(i) => setOpenId(Number(i.id))} /><Pagination page={page} total={data.total} perPage={data.perPage} onChange={setPage} /></>
        )}
      </Card>
      {openId !== null && <IngredientModal id={openId} onClose={() => { setOpenId(null); reload(); }} />}
      {creating && <IngredientCreateModal onClose={(changed) => { setCreating(false); if (changed) reload(); }} />}
    </div>
  );
};

const IngredientCreateModal = ({ onClose }: { onClose: (changed: boolean) => void }) => {
  const toast = useToast();
  const [f, setF] = useState({ nameKo: "", nameEn: "", category: "unclassified", aliases: "", isClass: false, mfdsCode: "" });
  const save = async () => { try { await adminApi.createIngredient({ ...f, aliases: f.aliases.split(",").map((a) => a.trim()).filter(Boolean) }); onClose(true); } catch (e) { toast.fail(e); } };
  return (
    <Modal open onClose={() => onClose(false)} title="성분 추가" width={520}>
      <div className="space-y-3 p-6">
        <div className="grid grid-cols-2 gap-3"><Field label="한국어 이름"><TextInput value={f.nameKo} onChange={(e) => setF({ ...f, nameKo: e.target.value })} /></Field><Field label="영어 이름"><TextInput value={f.nameEn} onChange={(e) => setF({ ...f, nameEn: e.target.value })} /></Field></div>
        <Field label="분류 (규칙이 분류 기준으로 사용)" hint="예: grain, meat_pork, gelling_animal, unclassified"><TextInput value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></Field>
        <Field label="별칭 (쉼표로 구분)"><TextInput value={f.aliases} onChange={(e) => setF({ ...f, aliases: e.target.value })} placeholder="gelatine, 젤라친" /></Field>
        <Field label="MFDS 원재료 코드"><TextInput value={f.mfdsCode} onChange={(e) => setF({ ...f, mfdsCode: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isClass} onChange={(e) => setF({ ...f, isClass: e.target.checked })} /> 포괄 명칭 (예: 유화제, 향료 — 괄호 안 세부 원료로 판단)</label>
        <div className="flex justify-end gap-2"><Btn onClick={() => onClose(false)}>취소</Btn><Btn variant="primary" onClick={save}>추가</Btn></div>
      </div>
      {toast.node}
    </Modal>
  );
};

const IngredientModal = ({ id, onClose }: { id: number; onClose: () => void }) => {
  const toast = useToast();
  const { data, reload } = useLoad(() => adminApi.ingredient(id), [id]);
  const [alias, setAlias] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  useEffect(() => { if (data) { const i = data.ingredient; setF({ nameKo: i.nameKo ?? "", nameEn: i.nameEn ?? "", canonicalName: i.canonicalName, category: i.category, mfdsCode: i.mfdsCode ?? "", note: i.note ?? "" }); } }, [data]);
  if (!data) return <Modal open onClose={onClose} title="성분"><Loading error={null} /></Modal>;
  const ing = data.ingredient;
  const save = async () => { try { await adminApi.updateIngredient(id, f); toast.ok("저장했습니다"); reload(); } catch (e) { toast.fail(e); } };
  const addAlias = async () => { try { await adminApi.addAlias(id, alias); setAlias(""); toast.ok("별칭을 추가했습니다"); reload(); } catch (e) { toast.fail(e); } };
  return (
    <Modal open onClose={onClose} title={`${ing.nameKo ?? ing.canonicalName} · ${ing.key}`} width={720}>
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-2"><RuleStatusPill status={ing.analysisStatus} /><span className="font-mono text-xs" style={{ color: A.muted }}>{ing.analysisRuleKey ?? "규칙 없음"}</span><span className="text-xs" style={{ color: A.muted }}>· 제품 {data.productCount}개에서 사용 · {ing.source}</span></div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="한국어 이름"><TextInput value={f.nameKo ?? ""} onChange={(e) => setF({ ...f, nameKo: e.target.value })} /></Field>
          <Field label="영어 이름"><TextInput value={f.nameEn ?? ""} onChange={(e) => setF({ ...f, nameEn: e.target.value })} /></Field>
          <Field label="대표 이름"><TextInput value={f.canonicalName ?? ""} onChange={(e) => setF({ ...f, canonicalName: e.target.value })} /></Field>
          <Field label="분류"><TextInput value={f.category ?? ""} onChange={(e) => setF({ ...f, category: e.target.value })} /></Field>
          <Field label="MFDS 코드"><TextInput value={f.mfdsCode ?? ""} onChange={(e) => setF({ ...f, mfdsCode: e.target.value })} /></Field>
          <Field label="메모"><TextInput value={f.note ?? ""} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
        </div>
        <Btn variant="primary" onClick={save}>저장</Btn>
        <div>
          <p className="mb-2 text-sm font-semibold">별칭 ({data.aliases.length})</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {data.aliases.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}>
                {a.alias}<span style={{ color: A.dim }}>{a.lang}</span>
                <button title="삭제" style={{ color: A.dangerText }} onClick={async () => { try { await adminApi.removeAlias(a.id); reload(); } catch (e) { toast.fail(e); } }}>×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2"><div className="flex-1"><TextInput value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="새 별칭 (예: gelatine)" onKeyDown={(e) => e.key === "Enter" && alias.trim() && addAlias()} /></div><Btn variant="primary" onClick={addAlias}>추가</Btn></div>
          <p className="mt-1 text-[11px]" style={{ color: A.dim }}>같은 별칭이 다른 성분에 이미 있으면 거부됩니다(하나의 표기는 하나의 성분에만 연결).</p>
        </div>
      </div>
      {toast.node}
    </Modal>
  );
};

// ── Rules ─────────────────────────────────────────────────────────────────────
const emptyRule = { key: "", title: "", matchType: "term", matchValue: "", status: "CHECK_REQUIRED", priority: "200", reasonCode: "CUSTOM", ko: "", en: "", uz: "", evidence: "", evidenceUrl: "" };

export const RulesAdmin = () => {
  const [status, setStatus] = useState("전체");
  const [type, setType] = useState("전체");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<AdminRule | "new" | null>(null);
  const [testText, setTestText] = useState("젤라틴(돈피), 유화제(대두레시틴), 설탕");
  const [tested, setTested] = useState<Analysis | null>(null);
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => adminApi.rules({ q, status: status === "전체" ? undefined : status, type: type === "전체" ? undefined : type, active: "all" }), [q, status, type]);
  const columns: Column<AdminRule & { id: string }>[] = [
    { key: "rule", header: "규칙", render: (r) => <div><p className="text-sm font-medium" style={{ opacity: r.isActive ? 1 : 0.45 }}>{r.title}</p><p className="font-mono text-xs" style={{ color: A.muted }}>{r.key}</p></div> },
    { key: "match", header: "조건", render: (r) => <span className="text-xs"><b>{r.matchType}</b> · <span className="font-mono">{r.matchValue.length > 40 ? `${r.matchValue.slice(0, 40)}…` : r.matchValue}</span></span> },
    { key: "status", header: "결과", render: (r) => <RuleStatusPill status={r.status} /> },
    { key: "priority", header: "우선순위", render: (r) => <span className="font-mono text-sm">{r.priority}</span> },
    { key: "source", header: "출처", render: (r) => <span className="text-xs" style={{ color: A.muted }}>{r.source}{r.updatedBy ? ` · ${r.updatedBy}` : ""}</span> },
    { key: "active", header: "", render: (r) => <span className="text-xs" style={{ color: r.isActive ? A.greenText : A.dim }}>{r.isActive ? "활성" : "비활성"}</span> },
  ];
  const runTest = async () => { try { setTested((await adminApi.testRules(testText)).analysis); } catch (e) { toast.fail(e); } };
  return (
    <div>
      <PageHeader breadcrumb={["HalalMap Admin", "제품 스캐너", "규칙"]} title="성분 규칙" subtitle="판정은 이 규칙 표(DB)에서만 나옵니다. 코드에는 성분별 if/else가 없습니다." actions={<Btn variant="primary" size="md" onClick={() => setEdit("new")}>+ 규칙 추가</Btn>} />
      <Card className="mb-4">
        <div className="space-y-2 p-5">
          <p className="text-sm font-semibold">규칙 테스트</p>
          <TextArea rows={2} value={testText} onChange={(e) => setTestText(e.target.value)} />
          <Btn variant="primary" onClick={runTest}>분석</Btn>
          {tested && <div className="mt-2"><AnalysisSummary analysis={tested} /></div>}
        </div>
      </Card>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <div className="flex flex-col gap-2"><FilterChips options={["전체", "FLAGGED_INGREDIENT", "CHECK_REQUIRED", "NO_FLAGGED_INGREDIENTS"]} value={status} onChange={setStatus} /><FilterChips options={["전체", "ingredient", "term", "category"]} value={type} onChange={setType} /></div>
          <SearchBar value={q} onChange={setQ} placeholder="규칙 이름, 값, 키…" width={240} />
        </div>
        {!data ? <Loading error={loading ? null : error} /> : <AdminTable columns={columns} data={withId(data.rules)} selectable={false} onRowClick={(r) => setEdit(data.rules.find((x) => String(x.id) === r.id) ?? null)} />}
      </Card>
      {edit && <RuleModal rule={edit === "new" ? undefined : edit} onClose={(changed) => { setEdit(null); if (changed) reload(); }} />}
      {toast.node}
    </div>
  );
};

const RuleModal = ({ rule, onClose }: { rule?: AdminRule; onClose: (changed: boolean) => void }) => {
  const toast = useToast();
  const [f, setF] = useState(rule ? { key: rule.key, title: rule.title, matchType: rule.matchType as string, matchValue: rule.matchValue, status: rule.status as string, priority: String(rule.priority), reasonCode: rule.reasonCode, ko: rule.reason.ko, en: rule.reason.en, uz: rule.reason.uz, evidence: rule.evidence ?? "", evidenceUrl: rule.evidenceUrl ?? "" } : emptyRule);
  const body = () => ({ key: f.key || undefined, title: f.title, matchType: f.matchType, matchValue: f.matchValue, status: f.status, priority: Number(f.priority), reasonCode: f.reasonCode, reason: { ko: f.ko, en: f.en, uz: f.uz }, evidence: f.evidence || null, evidenceUrl: f.evidenceUrl || null });
  const save = async () => { try { if (rule) await adminApi.updateRule(rule.id, body()); else await adminApi.createRule(body()); onClose(true); } catch (e) { toast.fail(e); } };
  const set = (k: string) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open onClose={() => onClose(false)} title={rule ? `규칙 수정 · ${rule.key}` : "규칙 추가"} width={720}>
      <div className="space-y-3 p-6">
        <Field label="이름"><TextInput value={f.title} onChange={set("title")} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="조건 종류"><Select value={f.matchType} onChange={(v) => setF({ ...f, matchType: v })} options={[{ value: "ingredient", label: "ingredient (성분 키)" }, { value: "term", label: "term (이름 포함 단어)" }, { value: "category", label: "category (분류)" }]} /></Field>
          <Field label="결과"><Select value={f.status} onChange={(v) => setF({ ...f, status: v })} options={[{ value: "FLAGGED_INGREDIENT", label: "FLAGGED_INGREDIENT" }, { value: "CHECK_REQUIRED", label: "CHECK_REQUIRED" }, { value: "NO_FLAGGED_INGREDIENTS", label: "NO_FLAGGED_INGREDIENTS" }]} /></Field>
          <Field label="우선순위 (높을수록 우선)" hint="분류 100 · 단어 200 · 성분 300"><TextInput value={f.priority} onChange={set("priority")} inputMode="numeric" /></Field>
        </div>
        <Field label="값" hint={f.matchType === "term" ? "여러 단어는 | 로 구분 (예: 돼지|돈육|pork)" : f.matchType === "ingredient" ? "성분 키 (예: gelatin)" : "분류 이름 (예: meat_pork)"}><TextInput value={f.matchValue} onChange={set("matchValue")} className="font-mono" /></Field>
        <Field label="사유 — 한국어"><TextInput value={f.ko} onChange={set("ko")} /></Field>
        <Field label="사유 — English"><TextInput value={f.en} onChange={set("en")} /></Field>
        <Field label="사유 — O'zbek"><TextInput value={f.uz} onChange={set("uz")} /></Field>
        <Field label="근거 / 출처"><TextArea rows={2} value={f.evidence} onChange={set("evidence")} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="근거 URL"><TextInput value={f.evidenceUrl} onChange={set("evidenceUrl")} /></Field><Field label="사유 코드"><TextInput value={f.reasonCode} onChange={set("reasonCode")} /></Field></div>
        <div className="flex justify-end gap-2">
          {rule && rule.isActive && <Btn variant="danger" onClick={async () => { try { await adminApi.deactivateRule(rule.id); onClose(true); } catch (e) { toast.fail(e); } }}>비활성화</Btn>}
          {rule && !rule.isActive && <Btn variant="warning" onClick={async () => { try { await adminApi.updateRule(rule.id, { isActive: true }); onClose(true); } catch (e) { toast.fail(e); } }}>다시 활성화</Btn>}
          <Btn onClick={() => onClose(false)}>취소</Btn><Btn variant="primary" onClick={save}>저장</Btn>
        </div>
      </div>
      {toast.node}
    </Modal>
  );
};

// ── Submissions (user contributions) ──────────────────────────────────────────
const SUBMISSION_LABEL: Record<string, string> = { pending: "대기", verified: "승인됨", rejected: "거부됨", needs_review: "검토 필요" };
const SubmissionPill = ({ status }: { status: string }) => {
  const cfg: Record<string, [string, string]> = { pending: [A.goldLight, A.goldText], verified: [A.greenLight, A.greenText], rejected: [A.dangerLight, A.dangerText], needs_review: [A.warningLight, A.warningText] };
  const [bg, color] = cfg[status] ?? [A.borderLight, A.muted];
  return <Pill bg={bg} color={color}>{SUBMISSION_LABEL[status] ?? status}</Pill>;
};

export const SubmissionsAdmin = () => {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);
  const { data, loading, error, reload } = useLoad(() => adminApi.submissions({ status: status === "all" ? undefined : status, page }), [status, page]);
  const columns: Column<AdminSubmission & { id: string }>[] = [
    { key: "p", header: "제보", render: (s) => <div><p className="text-sm font-medium">{s.nameKo ?? s.name ?? "(이름 없음)"}</p><p className="font-mono text-xs" style={{ color: A.muted }}>{s.barcode}</p></div> },
    { key: "i", header: "원재료", render: (s) => <span className="text-xs" style={{ color: A.muted }}>{s.ingredientsText ? `${s.ingredientsText.slice(0, 40)}… (${s.ingredientsInput}${s.ocrConfidence != null ? ` ${Math.round(s.ocrConfidence * 100)}%` : ""})` : "—"}</span> },
    { key: "ph", header: "사진", render: (s) => <span className="text-xs">{[s.productImageUrl && "제품", s.ingredientsImageUrl && "원재료"].filter(Boolean).join(" · ") || "—"}</span> },
    { key: "s", header: "상태", render: (s) => <SubmissionPill status={s.status} /> },
    { key: "d", header: "접수일", render: (s) => <span className="text-xs">{date(s.createdAt)}</span> },
  ];
  return (
    <div>
      <PageHeader breadcrumb={["HalalMap Admin", "제품 스캐너", "사용자 제보"]} title="사용자 제보 검토" subtitle="제보는 승인 전까지 검증된 데이터가 아닙니다" />
      <Card>
        <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}><FilterChips options={["pending", "needs_review", "verified", "rejected", "all"]} value={status} onChange={(v) => { setStatus(v); setPage(1); }} /></div>
        {!data ? <Loading error={loading ? null : error} /> : data.submissions.length === 0 ? <p className="px-5 py-10 text-center text-sm" style={{ color: A.muted }}>해당 상태의 제보가 없습니다.</p> : (
          <><AdminTable columns={columns} data={withId(data.submissions)} selectable={false} onRowClick={(s) => setOpenId(Number(s.id))} /><Pagination page={page} total={data.total} perPage={data.perPage} onChange={setPage} /></>
        )}
      </Card>
      {openId !== null && <SubmissionModal id={openId} onClose={(changed) => { setOpenId(null); if (changed) reload(); }} />}
    </div>
  );
};

const PrivateImage = ({ path, label }: { path: string | null; label: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let revoked: string | null = null;
    if (path) fetchProtectedImage(path).then((u) => { revoked = u; setUrl(u); }).catch(() => undefined);
    return () => { if (revoked) URL.revokeObjectURL(revoked); };
  }, [path]);
  if (!path) return null;
  return <div><p className="mb-1 text-xs font-semibold" style={{ color: A.muted }}>{label}</p>{url ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={label} className="max-h-64 rounded-lg" style={{ border: `1px solid ${A.border}` }} /></a> : <p className="text-xs" style={{ color: A.dim }}>불러오는 중…</p>}</div>;
};

const SubmissionModal = ({ id, onClose }: { id: number; onClose: (changed: boolean) => void }) => {
  const toast = useToast();
  const { data } = useLoad(() => adminApi.submission(id), [id]);
  const [f, setF] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  useEffect(() => { if (data) { const s = data.submission; setF({ name: s.name ?? "", nameKo: s.nameKo ?? "", brand: s.brand ?? "", manufacturer: s.manufacturer ?? "", category: s.category ?? "", ingredientsText: s.ingredientsText ?? "" }); } }, [data]);
  const analysisFor = useMemo(() => data?.analysis ?? null, [data]);
  if (!data) return <Modal open onClose={() => onClose(false)} title="제보"><Loading error={null} /></Modal>;
  const s = data.submission;
  const decide = async (action: "approve" | "reject" | "needs_review" | "reopen") => {
    try { await adminApi.reviewSubmission(id, { action, note: note || undefined, edits: action === "approve" ? f : undefined }); onClose(true); } catch (e) { toast.fail(e); }
  };
  return (
    <Modal open onClose={() => onClose(false)} title={`제보 #${s.id} · ${s.barcode}`} width={900}>
      <div className="grid grid-cols-2 gap-6 p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2"><SubmissionPill status={s.status} /><span className="text-xs" style={{ color: A.muted }}>{date(s.createdAt)} · 입력 방식 {s.ingredientsInput}{s.ocrConfidence != null ? ` (OCR ${Math.round(s.ocrConfidence * 100)}%)` : ""}</span></div>
          <Field label="제품명"><TextInput value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="한국어 이름"><TextInput value={f.nameKo ?? ""} onChange={(e) => setF({ ...f, nameKo: e.target.value })} /></Field><Field label="브랜드"><TextInput value={f.brand ?? ""} onChange={(e) => setF({ ...f, brand: e.target.value })} /></Field></div>
          <Field label="원재료명 (사진과 대조해 수정하세요)"><TextArea rows={6} value={f.ingredientsText ?? ""} onChange={(e) => setF({ ...f, ingredientsText: e.target.value })} /></Field>
          {s.note && <p className="rounded-lg p-2 text-xs" style={{ backgroundColor: A.bg }}>제보자 메모: {s.note}</p>}
          {data.existingProduct && <p className="rounded-lg p-2 text-xs" style={{ backgroundColor: A.infoLight, color: A.infoText }}>이 바코드에는 이미 제품이 있습니다: {data.existingProduct.nameKo ?? data.existingProduct.name} ({VERIFICATION_LABEL[data.existingProduct.verificationStatus]}). 승인하면 입력한 값으로 갱신되고 검증됨이 됩니다.</p>}
          <Field label="검토 메모"><TextInput value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <div className="flex flex-wrap gap-2">
            <Btn variant="primary" size="md" onClick={() => decide("approve")}>승인 (검증됨)</Btn>
            <Btn variant="warning" size="md" onClick={() => decide("needs_review")}>검토 필요</Btn>
            <Btn variant="danger" size="md" onClick={() => decide("reject")}>거부</Btn>
            {s.status !== "pending" && <Btn size="md" onClick={() => decide("reopen")}>대기로 되돌리기</Btn>}
          </div>
        </div>
        <div className="space-y-3">
          <PrivateImage path={s.productImageUrl} label="제품 사진" />
          <PrivateImage path={s.ingredientsImageUrl} label="원재료명 사진" />
          {analysisFor && <div><p className="mb-1 text-xs font-semibold" style={{ color: A.muted }}>참고용 분석 (미확인 텍스트 기준 — 승인 후 다시 계산)</p><AnalysisSummary analysis={analysisFor} /></div>}
        </div>
      </div>
      {toast.node}
    </Modal>
  );
};

// ── Data sources & licences ───────────────────────────────────────────────────
const LICENSE_LABEL = { confirmed: "확인됨", unconfirmed: "미확인", rejected: "사용 불가" } as const;

export const SourcesAdmin = () => {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => adminApi.sources(), []);
  if (!data) return <Loading error={loading ? null : error} />;
  const update = async (s: AdminSource, body: Record<string, unknown>) => { try { await adminApi.updateSource(s.key, body); toast.ok("저장했습니다"); reload(); } catch (e) { toast.fail(e); } };
  return (
    <div>
      <PageHeader breadcrumb={["HalalMap Admin", "제품 스캐너", "데이터 출처"]} title="데이터 출처 · 라이선스" subtitle="가져오기는 라이선스가 ‘사용 불가’인 출처에서는 실행되지 않고, ‘미확인’ 출처는 운영자가 약관을 확인했다는 표시가 있어야 합니다" />
      <div className="space-y-3">
        {data.sources.map((s) => {
          const tone = s.licenseStatus === "confirmed" ? [A.greenLight, A.greenText] : s.licenseStatus === "unconfirmed" ? [A.warningLight, A.warningText] : [A.dangerLight, A.dangerText];
          return (
            <Card key={s.key} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: A.text }}>{s.name}</p>
                  <p className="mt-0.5 text-xs" style={{ color: A.muted }}>{s.kind} · <span className="font-mono">{s.key}</span>{s.homepageUrl && <> · <a href={s.homepageUrl} target="_blank" rel="noreferrer" style={{ color: A.green }}>사이트 ↗</a></>}</p>
                  <p className="mt-2 text-sm" style={{ color: A.textMid }}>라이선스: {s.license ?? "—"} {s.licenseUrl && <a href={s.licenseUrl} target="_blank" rel="noreferrer" style={{ color: A.green }}>↗</a>}</p>
                  {s.attribution && <p className="text-xs" style={{ color: A.muted }}>표기: {s.attribution}</p>}
                  {s.termsNote && <p className="mt-1 text-xs leading-relaxed" style={{ color: A.muted }}>{s.termsNote}</p>}
                  {s.reason && <p className="mt-1 rounded-lg p-2 text-xs leading-relaxed" style={{ backgroundColor: A.bg, color: A.textMid }}>사유: {s.reason}</p>}
                  {s.requiresApiKey && <p className="mt-1 text-xs" style={{ color: s.apiKeyConfigured ? A.greenText : A.warningText }}>API 키 <span className="font-mono">{s.apiKeyEnv}</span>: {s.apiKeyConfigured ? "설정됨" : "설정되지 않음"}</p>}
                  <p className="mt-1 text-xs" style={{ color: A.dim }}>마지막 가져오기 {date(s.lastImportAt)} · 레코드 {s.recordCount}</p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  <Pill bg={tone[0]} color={tone[1]}>라이선스 {LICENSE_LABEL[s.licenseStatus]}</Pill>
                  <Pill bg={s.usable ? A.greenLight : A.borderLight} color={s.usable ? A.greenText : A.muted}>{s.usable ? "사용 가능" : "사용 안 함"}</Pill>
                  <div className="w-36"><Select value={s.licenseStatus} onChange={(v) => update(s, { licenseStatus: v })} options={Object.entries(LICENSE_LABEL).map(([value, label]) => ({ value, label: `라이선스 ${label}` }))} /></div>
                  <div className="w-36"><Select value={s.usageStatus} onChange={(v) => update(s, { usageStatus: v })} options={[{ value: "active", label: "사용 중" }, { value: "planned", label: "계획" }, { value: "rejected", label: "사용 안 함" }]} /></div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card className="mt-6">
        <p className="px-5 pt-4 text-sm font-semibold">최근 가져오기 실행</p>
        {data.runs.length === 0 ? <p className="px-5 py-6 text-sm" style={{ color: A.muted }}>아직 가져오기 실행 기록이 없습니다.</p> : (
          <div className="p-5 pt-2">{data.runs.map((r) => <Row2 key={r.id} k={date(r.started_at)} v={`${r.source} · ${r.status} · +${r.inserted} / ~${r.updated} / skip ${r.skipped}${r.detail ? ` · ${r.detail.slice(0, 40)}` : ""}`} />)}</div>
        )}
      </Card>
      {toast.node}
    </div>
  );
};

// ── Places (restaurants, mosques, prayer rooms, halal markets) ────────────────
const KIND_LABEL: Record<string, string> = { restaurant: "식당", mosque: "모스크", prayer_room: "기도실", market: "할랄 마트" };

export const PlacesAdmin = ({ initialKind = "전체" }: { initialKind?: string }) => {
  const toast = useToast();
  const [kind, setKind] = useState(initialKind);
  const [status, setStatus] = useState("전체");
  const [origin, setOrigin] = useState("전체");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [importing, setImporting] = useState(false);
  const [adding, setAdding] = useState(false);
  const { data, loading, error, reload } = useLoad(() => adminApi.places({ q, kind: kind === "전체" ? undefined : kind, status: status === "전체" ? undefined : status, origin: origin === "전체" ? undefined : origin, page }), [q, kind, status, origin, page]);
  const set = async (p: AdminPlace, body: Record<string, unknown>) => { try { await adminApi.updatePlace(p.id, body); reload(); } catch (e) { toast.fail(e); } };
  const columns: Column<AdminPlace>[] = [
    { key: "name", header: "장소", render: (p) => <div><p className="text-sm font-medium" style={{ opacity: p.isActive ? 1 : 0.45 }}>{p.nameKo ?? p.name}</p><p className="text-xs" style={{ color: A.muted }}>{p.nameEn && p.nameEn !== p.nameKo ? `${p.nameEn} · ` : ""}{p.address || "주소 없음"}</p></div> },
    { key: "kind", header: "종류", render: (p) => <span className="text-xs">{KIND_LABEL[p.kind] ?? p.kind}{p.halalStatus ? ` · ${p.halalStatus}` : ""}</span> },
    { key: "origin", header: "데이터", render: (p) => <span className="text-xs" style={{ color: p.dataOrigin === "demo" ? A.warningText : A.muted }}>{p.dataOrigin === "demo" ? "데모(가상)" : `${p.provenance.source ?? p.dataOrigin} · ${p.provenance.license ?? "?"}`}</span> },
    { key: "v", header: "검증", render: (p) => <VerificationPill status={p.verificationStatus} /> },
    { key: "act", header: "", render: (p) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <Btn variant="primary" onClick={() => set(p, { verificationStatus: "verified" })}>검증</Btn>
        <Btn variant="warning" onClick={() => set(p, { verificationStatus: "needs_review" })}>검토</Btn>
        <Btn variant="danger" onClick={() => set(p, { verificationStatus: "rejected" })}>거부</Btn>
        <Btn onClick={() => set(p, { isActive: !p.isActive })}>{p.isActive ? "숨김" : "복원"}</Btn>
      </div>
    ) },
  ];
  return (
    <div>
      <PageHeader breadcrumb={["HalalMap Admin", "제품 스캐너", "장소"]} title="장소 데이터" subtitle="식당 · 모스크 · 기도실 · 할랄 마트 — 각 레코드의 출처와 라이선스가 함께 저장됩니다" actions={<div className="flex gap-2"><Btn size="md" onClick={() => setImporting(true)}>CSV/JSON 가져오기</Btn><Btn variant="primary" size="md" onClick={() => setAdding(true)}>+ 장소 추가</Btn></div>} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <div className="flex flex-col gap-2"><FilterChips options={["전체", "restaurant", "mosque", "prayer_room", "market"]} value={kind} onChange={(v) => { setKind(v); setPage(1); }} /><FilterChips options={["전체", "unverified", "verified", "needs_review", "rejected"]} value={status} onChange={(v) => { setStatus(v); setPage(1); }} /></div>
          <div className="flex flex-col items-end gap-2"><SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="이름, 주소…" width={240} /><FilterChips options={["전체", "imported", "demo", "admin"]} value={origin} onChange={(v) => { setOrigin(v); setPage(1); }} /></div>
        </div>
        {!data ? <Loading error={loading ? null : error} /> : data.places.length === 0 ? <p className="px-5 py-10 text-center text-sm" style={{ color: A.muted }}>장소가 없습니다.</p> : (
          <><AdminTable columns={columns} data={data.places} selectable={false} /><Pagination page={page} total={data.total} perPage={data.perPage} onChange={setPage} /></>
        )}
      </Card>
      {adding && <PlaceCreateModal onClose={(changed) => { setAdding(false); if (changed) reload(); }} />}
      {importing && <PlacesImportModal onClose={(changed) => { setImporting(false); if (changed) reload(); }} />}
      {toast.node}
    </div>
  );
};

const PlaceCreateModal = ({ onClose }: { onClose: (changed: boolean) => void }) => {
  const toast = useToast();
  const [f, setF] = useState({ kind: "restaurant", name: "", nameKo: "", nameEn: "", category: "", halalStatus: "", certBody: "", address: "", lat: "", lng: "", phone: "", website: "", sourceUrl: "" });
  const save = async () => {
    try {
      const blank = (v: string) => (v.trim() === "" ? undefined : v.trim());
      await adminApi.createPlace({
        kind: f.kind, name: f.name, nameKo: blank(f.nameKo), nameEn: blank(f.nameEn), category: blank(f.category), halalStatus: blank(f.halalStatus), certBody: blank(f.certBody),
        address: blank(f.address), lat: blank(f.lat), lng: blank(f.lng), phone: blank(f.phone), website: blank(f.website), sourceUrl: blank(f.sourceUrl),
      });
      onClose(true);
    } catch (e) { toast.fail(e); }
  };
  return (
    <Modal open onClose={() => onClose(false)} title="장소 추가" width={620}>
      <div className="space-y-3 p-6">
        <p className="text-xs leading-relaxed" style={{ color: A.muted }}>직접 입력한 장소는 출처가 「관리자 입력」으로 기록되고 <b>미검증</b> 상태로 저장됩니다. 좌표는 대한민국 안이어야 합니다. 할랄 등급 「certified」는 인증서를 확인한 경우에만 선택하세요.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="종류"><Select value={f.kind} onChange={(v) => setF({ ...f, kind: v })} options={Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="할랄 등급"><Select value={f.halalStatus} onChange={(v) => setF({ ...f, halalStatus: v })} options={[{ value: "", label: "표시 안 함" }, { value: "certified", label: "certified (인증 확인됨)" }, { value: "muslim-owned", label: "muslim-owned" }, { value: "halal-friendly", label: "halal-friendly" }]} /></Field>
        </div>
        <Field label="이름"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="한국어 이름"><TextInput value={f.nameKo} onChange={(e) => setF({ ...f, nameKo: e.target.value })} /></Field>
          <Field label="영어 이름"><TextInput value={f.nameEn} onChange={(e) => setF({ ...f, nameEn: e.target.value })} /></Field>
        </div>
        <Field label="주소"><TextInput value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="위도 (lat)"><TextInput value={f.lat} onChange={(e) => setF({ ...f, lat: e.target.value })} placeholder="37.5345" /></Field>
          <Field label="경도 (lng)"><TextInput value={f.lng} onChange={(e) => setF({ ...f, lng: e.target.value })} placeholder="126.9946" /></Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="분류 (예: turkish)"><TextInput value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></Field>
          <Field label="전화"><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label="웹사이트"><TextInput value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="인증 기관"><TextInput value={f.certBody} onChange={(e) => setF({ ...f, certBody: e.target.value })} /></Field>
          <Field label="근거 URL"><TextInput value={f.sourceUrl} onChange={(e) => setF({ ...f, sourceUrl: e.target.value })} /></Field>
        </div>
        <div className="flex justify-end gap-2"><Btn onClick={() => onClose(false)}>취소</Btn><Btn variant="primary" onClick={save}>저장</Btn></div>
      </div>
      {toast.node}
    </Modal>
  );
};

const PlacesImportModal = ({ onClose }: { onClose: (changed: boolean) => void }) => {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [defaults, setDefaults] = useState({ source: "", license: "", attribution: "" });
  const [result, setResult] = useState<Awaited<ReturnType<typeof adminApi.importPlaces>> | null>(null);
  const run = async () => {
    if (!file) return;
    try { setResult(await adminApi.importPlaces({ filename: file.name, content: await file.text(), defaults })); } catch (e) { toast.fail(e); }
  };
  return (
    <Modal open onClose={() => onClose(Boolean(result))} title="장소 CSV/JSON 가져오기" width={620}>
      <div className="space-y-3 p-6">
        <p className="text-xs leading-relaxed" style={{ color: A.muted }}>열: kind(restaurant|mosque|prayer_room|market), name, name_ko, name_en, lat, lng, address, phone, website, halal_status, cert_body, <b>source, source_url, license</b>. 출처(source)와 라이선스(license)가 없는 행은 거부됩니다. 대한민국 밖의 좌표도 거부됩니다.</p>
        <input type="file" accept=".csv,.json" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="기본 source"><TextInput value={defaults.source} onChange={(e) => setDefaults({ ...defaults, source: e.target.value })} /></Field>
          <Field label="기본 license"><TextInput value={defaults.license} onChange={(e) => setDefaults({ ...defaults, license: e.target.value })} /></Field>
          <Field label="기본 attribution"><TextInput value={defaults.attribution} onChange={(e) => setDefaults({ ...defaults, attribution: e.target.value })} /></Field>
        </div>
        {result && <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: A.bg }}><p>가져옴 {result.imported} (신규 {result.inserted}, 갱신 {result.updated}, 병합 {result.merged}) · 거부 {result.rejected}</p>{result.errors.map((e) => <p key={e.row} className="text-xs" style={{ color: A.dangerText }}>행 {e.row}: {e.error}</p>)}</div>}
        <div className="flex justify-end gap-2"><Btn onClick={() => onClose(Boolean(result))}>닫기</Btn><Btn variant="primary" onClick={run}>가져오기</Btn></div>
      </div>
      {toast.node}
    </Modal>
  );
};
