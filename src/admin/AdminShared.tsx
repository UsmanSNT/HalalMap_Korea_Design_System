import React, { useState, useEffect, useRef } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────────
export const A = {
  bg:           "#F7F8FA",
  surface:      "#FFFFFF",
  surfaceHover: "#F9FAFB",
  border:       "#E5E7EB",
  borderLight:  "#F3F4F6",
  text:         "#111827",
  textMid:      "#374151",
  muted:        "#6B7280",
  dim:          "#9CA3AF",
  green:        "#1B6B4A",
  greenMid:     "#22865E",
  greenLight:   "#ECFDF5",
  greenText:    "#065F46",
  greenBorder:  "#A7F3D0",
  gold:         "#C4883A",
  goldLight:    "#FFFBEB",
  goldText:     "#78350F",
  goldBorder:   "#FCD34D",
  danger:       "#DC2626",
  dangerLight:  "#FEF2F2",
  dangerText:   "#991B1B",
  dangerBorder: "#FECACA",
  warning:      "#D97706",
  warningLight: "#FFFBEB",
  warningText:  "#92400E",
  warningBorder:"#FDE68A",
  info:         "#2563EB",
  infoLight:    "#EFF6FF",
  infoText:     "#1E40AF",
  infoBorder:   "#BFDBFE",
  purple:       "#7C3AED",
  purpleLight:  "#F5F3FF",
  purpleText:   "#5B21B6",
  sidebar:      "#FFFFFF",
  sidebarW:     240,
  sidebarWCollapsed: 60,
  headerH:      56,
};

// ── Status chip ────────────────────────────────────────────────────────────────
type StatusVariant =
  | "active" | "verified" | "approved" | "delivered" | "online" | "success" | "halal"
  | "pending" | "reviewing" | "preparing" | "offline" | "delivering"
  | "suspended" | "rejected" | "expired" | "cancelled" | "haram" | "inactive"
  | "warning" | "refunded" | "mashbooh"
  | "info" | "new";

const STATUS_CFG: Record<StatusVariant, { bg: string; text: string; dot: string; label?: string }> = {
  active:     { bg: A.greenLight,   text: A.greenText,   dot: A.green },
  verified:   { bg: A.greenLight,   text: A.greenText,   dot: A.green },
  approved:   { bg: A.greenLight,   text: A.greenText,   dot: A.green },
  delivered:  { bg: A.greenLight,   text: A.greenText,   dot: A.green },
  online:     { bg: A.greenLight,   text: A.greenText,   dot: A.green },
  success:    { bg: A.greenLight,   text: A.greenText,   dot: A.green },
  pending:    { bg: A.goldLight,    text: A.goldText,    dot: A.gold },
  reviewing:  { bg: A.goldLight,    text: A.goldText,    dot: A.gold },
  preparing:  { bg: A.infoLight,    text: A.infoText,    dot: A.info },
  offline:    { bg: A.borderLight,  text: A.muted,       dot: A.dim },
  delivering: { bg: A.infoLight,    text: A.infoText,    dot: A.info },
  halal:      { bg: A.greenLight,   text: A.greenText,   dot: A.green },
  inactive:   { bg: A.borderLight,  text: A.muted,       dot: A.dim },
  suspended:  { bg: A.dangerLight,  text: A.dangerText,  dot: A.danger },
  rejected:   { bg: A.dangerLight,  text: A.dangerText,  dot: A.danger },
  expired:    { bg: A.dangerLight,  text: A.dangerText,  dot: A.danger },
  cancelled:  { bg: A.dangerLight,  text: A.dangerText,  dot: A.danger },
  haram:      { bg: A.dangerLight,  text: A.dangerText,  dot: A.danger },
  warning:    { bg: A.warningLight, text: A.warningText, dot: A.warning },
  refunded:   { bg: A.purpleLight,  text: A.purpleText,  dot: A.purple },
  mashbooh:   { bg: A.warningLight, text: A.warningText, dot: A.warning },
  info:       { bg: A.infoLight,    text: A.infoText,    dot: A.info },
  new:        { bg: A.infoLight,    text: A.infoText,    dot: A.info },
};

export const StatusChip = ({ status, label }: { status: StatusVariant; label?: string }) => {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.offline;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.dot }} />
      {label ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ── Breadcrumb ─────────────────────────────────────────────────────────────────
export const Breadcrumb = ({ items }: { items: string[] }) => (
  <nav className="flex items-center gap-1.5 text-sm">
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={{ color: A.dim }}>/</span>}
        <span style={{ color: i === items.length - 1 ? A.text : A.muted, fontWeight: i === items.length - 1 ? 500 : 400 }}>
          {item}
        </span>
      </React.Fragment>
    ))}
  </nav>
);

// ── KPI Card ───────────────────────────────────────────────────────────────────
export const KPICard = ({
  label, value, trend, trendLabel, icon, iconBg, iconColor,
}: {
  label: string; value: string; trend?: number; trendLabel?: string;
  icon: string; iconBg: string; iconColor: string;
}) => {
  const up = (trend ?? 0) >= 0;
  return (
    <div className="rounded-xl p-5 flex flex-col gap-4"
      style={{ backgroundColor: A.surface, border: `1px solid ${A.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium" style={{ color: A.muted }}>{label}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <div>
        <p className="font-bold tabular-nums" style={{ color: A.text, fontSize: "28px", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>
          {value}
        </p>
        {trend !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-semibold" style={{ color: up ? A.greenText : A.dangerText }}>
              {up ? "▲" : "▼"} {Math.abs(trend)}%
            </span>
            <span className="text-xs" style={{ color: A.dim }}>{trendLabel ?? "vs last month"}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Search bar ─────────────────────────────────────────────────────────────────
export const SearchBar = ({
  placeholder = "검색...", value, onChange, width = 280,
}: { placeholder?: string; value: string; onChange: (v: string) => void; width?: number }) => (
  <div className="relative" style={{ width }}>
    <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={A.dim} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="6" cy="6" r="4"/><path d="M10 10l2.5 2.5"/>
    </svg>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all"
      style={{
        backgroundColor: A.bg,
        border: `1px solid ${A.border}`,
        color: A.text,
      }}
    />
  </div>
);

// ── Table ──────────────────────────────────────────────────────────────────────
export type Column<T> = {
  key: string;
  header: string;
  width?: string | number;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
};

export function AdminTable<T extends { id: string }>({
  columns, data, onRowClick, selectable = true,
}: {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const allSelected = data.length > 0 && selected.size === data.length;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(data.map(r => r.id)));
  };
  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleSort = (key: string) => {
    if (sortCol === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(key); setSortDir("asc"); }
  };

  return (
    <div className="overflow-x-auto">
      {selectable && selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium"
          style={{ backgroundColor: A.greenLight, color: A.greenText, borderBottom: `1px solid ${A.greenBorder}` }}>
          <span>{selected.size}개 선택됨</span>
          <button className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: A.green, color: "#fff" }}>내보내기</button>
          <button className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: A.dangerLight, color: A.dangerText }}>삭제</button>
          <button className="ml-auto text-xs" style={{ color: A.greenText }} onClick={() => setSelected(new Set())}>선택 해제</button>
        </div>
      )}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ backgroundColor: A.bg, borderBottom: `1px solid ${A.border}` }}>
            {selectable && (
              <th className="w-10 px-4 py-3 text-left">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-4 h-4 rounded cursor-pointer accent-green-700" />
              </th>
            )}
            {columns.map(col => (
              <th key={col.key}
                className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider select-none"
                style={{ color: A.muted, width: col.width, cursor: col.sortable ? "pointer" : "default" }}
                onClick={() => col.sortable && handleSort(col.key)}>
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span style={{ color: sortCol === col.key ? A.green : A.dim, fontSize: "10px" }}>
                      {sortCol === col.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id}
              onClick={() => onRowClick?.(row)}
              className="transition-colors"
              style={{
                backgroundColor: selected.has(row.id) ? A.greenLight : "transparent",
                borderBottom: `1px solid ${A.borderLight}`,
                cursor: onRowClick ? "pointer" : "default",
              }}
              onMouseEnter={e => { if (!selected.has(row.id)) (e.currentTarget as HTMLElement).style.backgroundColor = A.surfaceHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = selected.has(row.id) ? A.greenLight : "transparent"; }}>
              {selectable && (
                <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleRow(row.id); }}>
                  <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)}
                    className="w-4 h-4 rounded cursor-pointer accent-green-700" />
                </td>
              )}
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3" style={{ color: A.textMid }}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
export const Pagination = ({
  page, total, perPage = 20, onChange,
}: { page: number; total: number; perPage?: number; onChange: (p: number) => void }) => {
  const pages = Math.ceil(total / perPage);
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm"
      style={{ borderTop: `1px solid ${A.border}` }}>
      <span style={{ color: A.muted }}>
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} / {total}건
      </span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, "...", pages].filter((v, i, a) => pages <= 5 || a.indexOf(v) === i).map((p, i) =>
          p === "..." ? (
            <span key={i} className="w-8 text-center" style={{ color: A.dim }}>…</span>
          ) : (
            <button key={i} onClick={() => typeof p === "number" && onChange(p)}
              className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: page === p ? A.green : "transparent",
                color: page === p ? "#fff" : A.muted,
              }}>
              {p}
            </button>
          )
        )}
      </div>
    </div>
  );
};

// ── Modal ──────────────────────────────────────────────────────────────────────
export const Modal = ({
  open, onClose, title, children, width = 560,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: A.surface, width, maxHeight: "85vh", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${A.border}` }}>
          <h3 className="font-semibold text-base" style={{ color: A.text }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors"
            style={{ color: A.muted }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = A.bg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>×</button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

// ── Confirm modal ──────────────────────────────────────────────────────────────
export const ConfirmModal = ({
  open, onClose, onConfirm, title, description, confirmLabel = "확인", variant = "danger",
}: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; description: string; confirmLabel?: string; variant?: "danger" | "primary";
}) => (
  <Modal open={open} onClose={onClose} title={title} width={440}>
    <div className="px-6 py-5">
      <p className="text-sm" style={{ color: A.muted }}>{description}</p>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: A.bg, color: A.textMid, border: `1px solid ${A.border}` }}>
          취소
        </button>
        <button onClick={() => { onConfirm(); onClose(); }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: variant === "danger" ? A.danger : A.green }}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

// ── Toast ──────────────────────────────────────────────────────────────────────
export const Toast = ({ message, type = "success", onClose }: {
  message: string; type?: "success" | "error" | "info"; onClose: () => void;
}) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success: { bg: A.greenLight, border: A.greenBorder, text: A.greenText, icon: "✓" },
    error:   { bg: A.dangerLight, border: A.dangerBorder, text: A.dangerText, icon: "✕" },
    info:    { bg: A.infoLight, border: A.infoBorder, text: A.infoText, icon: "ℹ" },
  }[type];
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, minWidth: 280 }}>
      <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
        style={{ backgroundColor: cfg.text, fontSize: "12px" }}>{cfg.icon}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} style={{ color: cfg.text, opacity: 0.6 }}>×</button>
    </div>
  );
};

// ── Command palette ────────────────────────────────────────────────────────────
const PALETTE_ITEMS = [
  { icon: "📊", label: "대시보드 홈", section: "페이지" },
  { icon: "🍽️", label: "레스토랑 목록", section: "페이지" },
  { icon: "👥", label: "사용자 목록", section: "페이지" },
  { icon: "🏍️", label: "배달 파트너 목록", section: "페이지" },
  { icon: "📦", label: "전체 주문", section: "페이지" },
  { icon: "📈", label: "플랫폼 분석", section: "페이지" },
  { icon: "⚙️", label: "플랫폼 설정", section: "페이지" },
  { icon: "✅", label: "레스토랑 승인 대기", section: "빠른 작업" },
  { icon: "🆕", label: "프로모션 만들기", section: "빠른 작업" },
  { icon: "📤", label: "사용자 데이터 내보내기", section: "빠른 작업" },
];

export const CommandPalette = ({ open, onClose, onNavigate }: {
  open: boolean; onClose: () => void; onNavigate: (label: string) => void;
}) => {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  if (!open) return null;

  const filtered = PALETTE_ITEMS.filter(i => i.label.includes(q) || i.section.includes(q));
  const grouped: Record<string, typeof PALETTE_ITEMS> = {};
  filtered.forEach(i => { (grouped[i.section] ??= []).push(i); });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-[560px] rounded-2xl overflow-hidden"
        style={{ backgroundColor: A.surface, boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={A.muted} strokeWidth="1.8" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5"/><path d="M12 12l2.5 2.5"/>
          </svg>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="검색하거나 명령을 입력하세요..."
            className="flex-1 text-sm outline-none" style={{ color: A.text, backgroundColor: "transparent" }}/>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: A.bg, color: A.muted, border: `1px solid ${A.border}` }}>ESC</kbd>
        </div>
        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section}>
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: A.dim }}>{section}</p>
              {items.map(item => (
                <button key={item.label} onClick={() => { onNavigate(item.label); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                  style={{ color: A.textMid }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = A.bg)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm" style={{ color: A.dim }}>결과 없음</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page header ────────────────────────────────────────────────────────────────
export const PageHeader = ({
  title, subtitle, breadcrumb, actions,
}: { title: string; subtitle?: string; breadcrumb: string[]; actions?: React.ReactNode }) => (
  <div className="mb-6">
    <Breadcrumb items={breadcrumb} />
    <div className="flex items-start justify-between mt-2">
      <div>
        <h1 className="font-bold text-xl" style={{ color: A.text }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: A.muted }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 mt-0.5">{actions}</div>}
    </div>
  </div>
);

// ── Card wrapper ───────────────────────────────────────────────────────────────
export const Card = ({ children, className = "", style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) => (
  <div className={`rounded-xl ${className}`}
    style={{ backgroundColor: A.surface, border: `1px solid ${A.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", ...style }}>
    {children}
  </div>
);

// ── Btn variants ───────────────────────────────────────────────────────────────
export const Btn = ({
  children, onClick, variant = "secondary", size = "sm", icon,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "warning";
  size?: "sm" | "md"; icon?: React.ReactNode;
}) => {
  const cfg = {
    primary:   { bg: A.green,       color: "#fff",      border: A.green },
    secondary: { bg: A.surface,     color: A.textMid,   border: A.border },
    danger:    { bg: A.dangerLight, color: A.dangerText, border: A.dangerBorder },
    ghost:     { bg: "transparent", color: A.muted,     border: "transparent" },
    warning:   { bg: A.warningLight,color: A.warningText,border: A.warningBorder },
  }[variant];
  const pad = size === "md" ? "px-4 py-2.5" : "px-3 py-1.5";
  const fs = size === "md" ? "text-sm" : "text-xs";
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 ${pad} ${fs} font-semibold rounded-lg transition-all`}
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {icon}{children}
    </button>
  );
};

// ── SVG Line Chart ─────────────────────────────────────────────────────────────
export const LineChart = ({
  data, width = 600, height = 200, color = A.green, labels,
}: { data: number[]; width?: number; height?: number; color?: string; labels?: string[] }) => {
  const pad = { t: 12, r: 12, b: 28, l: 44 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = Math.max(...data) * 1.1;
  const min = 0;
  const pts = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * w,
    y: pad.t + (1 - (v - min) / (max - min)) * h,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${pad.t+h} L ${pts[0].x} ${pad.t+h} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ v: Math.round(min + t * (max - min)), y: pad.t + (1 - t) * h }));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`lg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {yTicks.map(t => (
        <g key={t.v}>
          <line x1={pad.l} y1={pad.t + t.y} x2={pad.l + w} y2={pad.t + t.y}
            stroke={A.border} strokeWidth="1" strokeDasharray="4 4"/>
          <text x={pad.l - 6} y={pad.t + t.y + 4} textAnchor="end"
            fill={A.dim} fontSize="10" fontFamily="'JetBrains Mono',monospace">
            {t.v >= 1000 ? `${(t.v/1000).toFixed(0)}k` : t.v}
          </text>
        </g>
      ))}
      <path d={areaD} fill={`url(#lg-${color.replace("#","")})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={A.surface} stroke={color} strokeWidth="2"/>
      ))}
      {labels && labels.map((l, i) => (
        <text key={i} x={pts[i].x} y={pad.t + h + 18} textAnchor="middle"
          fill={A.dim} fontSize="10" fontFamily="'Inter',sans-serif">{l}</text>
      ))}
    </svg>
  );
};

// ── SVG Bar Chart ──────────────────────────────────────────────────────────────
export const BarChart = ({
  data, width = 500, height = 180, color = A.green, labels,
}: { data: number[]; width?: number; height?: number; color?: string; labels?: string[] }) => {
  const pad = { t: 8, r: 8, b: 24, l: 36 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = Math.max(...data) * 1.1;
  const barW = (w / data.length) * 0.65;
  const gap = (w / data.length) * 0.35;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {[0, 0.5, 1].map(t => {
        const y = pad.t + (1 - t) * h;
        return (
          <g key={t}>
            <line x1={pad.l} y1={y} x2={pad.l + w} y2={y} stroke={A.border} strokeWidth="1"/>
            <text x={pad.l - 4} y={y + 4} textAnchor="end" fill={A.dim} fontSize="9" fontFamily="'JetBrains Mono',monospace">
              {Math.round(t * max)}
            </text>
          </g>
        );
      })}
      {data.map((v, i) => {
        const bh = (v / max) * h;
        const x = pad.l + i * (w / data.length) + gap / 2;
        const y = pad.t + h - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="4" fill={color} opacity="0.85"/>
            {labels && (
              <text x={x + barW / 2} y={pad.t + h + 16} textAnchor="middle"
                fill={A.dim} fontSize="9" fontFamily="'Inter',sans-serif">{labels[i]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ── Filter chip row ────────────────────────────────────────────────────────────
export const FilterChips = ({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex gap-1.5 flex-wrap">
    {options.map(opt => (
      <button key={opt} onClick={() => onChange(opt)}
        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          backgroundColor: value === opt ? A.green : A.bg,
          color: value === opt ? "#fff" : A.muted,
          border: `1px solid ${value === opt ? A.green : A.border}`,
        }}>
        {opt}
      </button>
    ))}
  </div>
);

// ── Star rating display ────────────────────────────────────────────────────────
export const StarDisplay = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-1">
    <span style={{ color: A.gold, fontSize: "12px" }}>★</span>
    <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: A.textMid }}>{rating.toFixed(1)}</span>
  </span>
);
