import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  customization?: string;
}

export interface DashOrder {
  id: string;
  customer: string;
  phone: string;
  items: OrderItem[];
  total: number;
  type: "delivery" | "pickup";
  status: "new" | "accepted" | "preparing" | "ready" | "completed";
  elapsed: number;
  special?: string;
  note?: string;
  address?: string;
  payment: "card" | "kakaopay" | "toss" | "cash";
  courier?: string;
}

type OrderStatus = DashOrder["status"];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  new:       { label: "신규",    color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" },
  accepted:  { label: "수락됨",  color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", dot: "#8B5CF6" },
  preparing: { label: "조리중",  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
  ready:     { label: "픽업대기", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", dot: "#22C55E" },
  completed: { label: "완료",    color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", dot: "#9CA3AF" },
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  new: "accepted", accepted: "preparing", preparing: "ready", ready: "completed", completed: null,
};
const NEXT_LABEL: Record<OrderStatus, string> = {
  new: "수락하기", accepted: "조리 시작", preparing: "준비 완료", ready: "배달 완료", completed: "",
};

// ── Sample Data ────────────────────────────────────────────────────────────────
const INITIAL_ORDERS: DashOrder[] = [
  { id: "HMK-8851", customer: "김민수", phone: "010-****-3842", items: [{ name: "할랄 갈비탕", qty: 1, price: 13500 }, { name: "비빔밥 (할랄)", qty: 2, price: 22000, customization: "맵기: 보통" }, { name: "파전", qty: 1, price: 9000 }], total: 49500, type: "delivery", status: "new", elapsed: 2, special: "갈비탕 국물 많이 주세요. 젓가락 대신 포크로 넣어주세요.", address: "서울 용산구 이태원로 123, 501호", payment: "kakaopay" },
  { id: "HMK-8850", customer: "Ahmed K.", phone: "010-****-7721", items: [{ name: "케밥 플래터", qty: 2, price: 38000 }], total: 38000, type: "delivery", status: "new", elapsed: 4, special: "", address: "서울 용산구 우사단로 45, 302호", payment: "card" },
  { id: "HMK-8849", customer: "Siti R.", phone: "010-****-2910", items: [{ name: "할랄 삼계탕", qty: 1, price: 16500 }, { name: "된장찌개 세트", qty: 1, price: 12000 }], total: 28500, type: "pickup", status: "accepted", elapsed: 9, special: "알레르기: 견과류", payment: "toss" },
  { id: "HMK-8848", customer: "Lin Wei", phone: "010-****-5503", items: [{ name: "할랄 삼계탕", qty: 2, price: 33000 }, { name: "음료 세트", qty: 1, price: 4500 }], total: 37500, type: "delivery", status: "preparing", elapsed: 18, address: "서울 마포구 신촌로 88, 701호", payment: "kakaopay" },
  { id: "HMK-8847", customer: "Farhan M.", phone: "010-****-8821", items: [{ name: "비빔밥 (할랄)", qty: 3, price: 33000 }, { name: "냉면", qty: 1, price: 11000 }], total: 44000, type: "delivery", status: "preparing", elapsed: 22, special: "냉면 면 따로 담아주세요.", address: "서울 서대문구 연세로 22", payment: "card" },
  { id: "HMK-8846", customer: "나영희", phone: "010-****-4412", items: [{ name: "갈비찜 세트", qty: 1, price: 26000 }], total: 26000, type: "pickup", status: "ready", elapsed: 31, special: "", payment: "card" },
  { id: "HMK-8844", customer: "Omar H.", phone: "010-****-1190", items: [{ name: "할랄 갈비탕", qty: 2, price: 27000 }, { name: "파전", qty: 2, price: 18000 }], total: 45000, type: "delivery", status: "completed", elapsed: 52, address: "서울 용산구 이태원로 77", payment: "kakaopay" },
  { id: "HMK-8843", customer: "박지훈", phone: "010-****-6633", items: [{ name: "비빔밥 (할랄)", qty: 1, price: 11000 }], total: 11000, type: "pickup", status: "completed", elapsed: 48, payment: "cash" },
];

const RECENT_ALL: DashOrder[] = [
  ...INITIAL_ORDERS.filter(o => o.status === "completed"),
  ...INITIAL_ORDERS.filter(o => o.status !== "completed"),
].slice(0, 8);

// ── Shared sub-components ──────────────────────────────────────────────────────
const StatusChip = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const TypeChip = ({ type }: { type: "delivery" | "pickup" }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
    style={{ backgroundColor: type === "delivery" ? "#EFF6FF" : "#FDF3E4", color: type === "delivery" ? "#1D4ED8" : "var(--gold)" }}>
    {type === "delivery" ? "🛵 배달" : "🥡 포장"}
  </span>
);

const ElapsedBadge = ({ minutes }: { minutes: number }) => {
  const color = minutes > 20 ? "var(--danger)" : minutes > 10 ? "#D97706" : "var(--muted)";
  return <span className="text-xs font-mono font-bold tabular-nums" style={{ color }}>{minutes}분</span>;
};

// ── 1. Main Dashboard ──────────────────────────────────────────────────────────
export const MainDashboard = ({ onNav }: { onNav: (s: string) => void }) => {
  const [orders, setOrders] = useState<DashOrder[]>(INITIAL_ORDERS);
  const newOrders = orders.filter(o => o.status === "new");
  const activeOrders = orders.filter(o => ["accepted", "preparing", "ready"].includes(o.status));
  const completedToday = orders.filter(o => o.status === "completed").length;
  const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const advanceOrder = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = NEXT_STATUS[o.status];
      return next ? { ...o, status: next } : o;
    }));
  };

  const rejectOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const kpis = [
    { label: "오늘 주문", value: `${orders.length}`, unit: "건", trend: 12, mono: true },
    { label: "오늘 매출", value: `₩${todayRevenue.toLocaleString()}`, trend: 8, mono: true },
    { label: "평균 주문액", value: `₩${Math.round(todayRevenue / orders.length).toLocaleString()}`, trend: -3, mono: true },
    { label: "새 리뷰", value: "8", unit: "개", trend: null, extra: "★ 4.7 평균", mono: false },
  ];

  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-2">
            <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest">{kpi.label}</p>
            <div className="flex items-baseline gap-1.5">
              <p className={`font-bold text-2xl text-[#1A1A18] leading-none tracking-tight ${kpi.mono ? "font-mono tabular-nums" : ""}`}>{kpi.value}</p>
              {kpi.unit && <p className="text-sm text-[var(--muted)]">{kpi.unit}</p>}
            </div>
            {kpi.trend !== null && kpi.trend !== undefined && (
              <p className={`text-xs font-semibold ${kpi.trend > 0 ? "text-[var(--green)]" : "text-[var(--danger)]"}`}>
                {kpi.trend > 0 ? "▲" : "▼"} {Math.abs(kpi.trend)}% 어제 대비
              </p>
            )}
            {kpi.extra && <p className="text-xs font-semibold" style={{ color: "#D97706" }}>{kpi.extra}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Live order feed — 3 cols */}
        <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
            <h2 className="font-bold text-sm text-[#1A1A18]">실시간 주문</h2>
            <button onClick={() => onNav("order-board")} className="text-xs font-semibold hover:underline" style={{ color: "var(--green)" }}>
              전체 보기 →
            </button>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {orders.slice(0, 7).map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAFAF8] transition-colors">
                <div className="w-24 flex-shrink-0">
                  <p className="font-mono text-xs font-bold text-[#1A1A18] tabular-nums">#{order.id.split("-")[1]}</p>
                  <ElapsedBadge minutes={order.elapsed} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1A1A18] truncate">{order.customer}</p>
                  <p className="text-xs text-[var(--muted)] truncate">{order.items.map(i => `${i.name} ×${i.qty}`).join(", ")}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <TypeChip type={order.type} />
                  <StatusChip status={order.status} />
                  <p className="font-mono text-sm font-bold tabular-nums text-[#1A1A18]">₩{order.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs action panel — 2 cols */}
        <div className="col-span-2 space-y-3">
          {/* New orders alert */}
          <div className="bg-white rounded-2xl shadow-sm border-2 overflow-hidden" style={{ borderColor: "#BFDBFE" }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: "#EFF6FF", borderBottom: "1px solid #BFDBFE" }}>
              <div className="relative flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
              </div>
              <p className="font-bold text-sm" style={{ color: "#1D4ED8" }}>신규 주문 {newOrders.length}건 대기 중</p>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#1D4ED8" }}>새 알림</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {newOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs font-bold tabular-nums text-[#1A1A18]">#{order.id.split("-")[1]}</p>
                    <div className="flex items-center gap-2">
                      <TypeChip type={order.type} />
                      <ElapsedBadge minutes={order.elapsed} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1A1A18]">{order.customer}</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed mt-0.5">{order.items.map(i => `${i.name} ×${i.qty}`).join(", ")}</p>
                  </div>
                  {order.special && (
                    <div className="rounded-lg px-2.5 py-1.5 text-xs" style={{ backgroundColor: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}>
                      📝 {order.special}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-bold text-sm tabular-nums text-[#1A1A18]">₩{order.total.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button onClick={() => rejectOrder(order.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors hover:bg-red-50"
                        style={{ borderColor: "#FECACA", color: "var(--danger)" }}>
                        거절
                      </button>
                      <button onClick={() => advanceOrder(order.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors"
                        style={{ backgroundColor: "var(--green)" }}>
                        수락하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {newOrders.length === 0 && (
                <div className="py-6 text-center text-sm text-[var(--muted)]">신규 주문 없음</div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--border)] text-center">
              <p className="font-mono text-2xl font-bold tabular-nums text-[#1A1A18]">{activeOrders.length}</p>
              <p className="text-[11px] text-[var(--muted)] font-medium mt-0.5">진행중 주문</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--border)] text-center">
              <p className="font-mono text-2xl font-bold tabular-nums text-[#1A1A18]">{completedToday}</p>
              <p className="text-[11px] text-[var(--muted)] font-medium mt-0.5">완료된 주문</p>
            </div>
          </div>

          {/* Avg prep time */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--border)] flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--green-light)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="9" cy="9" r="7"/>
                <path d="M9 5v4l2.5 2.5"/>
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-[var(--muted)] font-medium">평균 조리 시간</p>
              <p className="font-mono font-bold text-xl tabular-nums text-[#1A1A18]">22분</p>
            </div>
            <p className="ml-auto text-xs font-semibold" style={{ color: "var(--green)" }}>▼ 3분 단축</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 2. Order Board (Kanban) ────────────────────────────────────────────────────
export const OrderBoard = () => {
  const [orders, setOrders] = useState<DashOrder[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<DashOrder | null>(null);

  const advanceOrder = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = NEXT_STATUS[o.status];
      return next ? { ...o, status: next } : o;
    }));
  };

  const columns: OrderStatus[] = ["new", "accepted", "preparing", "ready", "completed"];

  return (
    <div className="h-full flex flex-col">
      {/* Board header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-white flex-shrink-0">
        <h2 className="font-bold text-base text-[#1A1A18]">실시간 주문 보드</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-xs font-medium text-[var(--muted)]">실시간 업데이트</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] hover:bg-[var(--green-light)] transition-colors" style={{ color: "var(--green)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 1h4v4H1zM9 1h4v4H9zM1 9h4v4H1zM9 9h4v4H9z"/>
            </svg>
            필터
          </button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-5 h-full min-w-max">
          {columns.map(status => {
            const cfg = STATUS_CONFIG[status];
            const col = orders.filter(o => o.status === status);
            return (
              <div key={status} className="w-72 flex flex-col rounded-2xl overflow-hidden" style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: cfg.border }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                    <span className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</span>
                    {status === "new" && col.length > 0 && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse" style={{ backgroundColor: cfg.dot }}>
                        {col.length}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums" style={{ color: cfg.color }}>{col.length}건</span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                  {col.map(order => (
                    <div key={order.id}
                      className="bg-white rounded-xl p-3.5 shadow-sm cursor-pointer hover:shadow-md transition-all space-y-2.5 group"
                      style={{ border: `1px solid ${cfg.border}` }}
                      onClick={() => setSelectedOrder(order)}>
                      {/* Order header */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#1A1A18] tabular-nums">#{order.id.split("-")[1]}</span>
                        <div className="flex items-center gap-2">
                          <TypeChip type={order.type} />
                          <ElapsedBadge minutes={order.elapsed} />
                        </div>
                      </div>

                      {/* Customer */}
                      <div>
                        <p className="font-semibold text-sm text-[#1A1A18]">{order.customer}</p>
                        <p className="text-xs text-[var(--muted)] leading-relaxed mt-0.5 line-clamp-2">
                          {order.items.map(i => `${i.name} ×${i.qty}`).join(", ")}
                        </p>
                      </div>

                      {/* Special instructions */}
                      {order.special && (
                        <div className="rounded-lg px-2 py-1.5 text-[11px] leading-relaxed" style={{ backgroundColor: "#FFFBEB", color: "#92400E" }}>
                          📝 {order.special}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: cfg.border }}>
                        <p className="font-mono text-sm font-bold tabular-nums text-[#1A1A18]">₩{order.total.toLocaleString()}</p>
                        {NEXT_STATUS[status] && (
                          <button
                            onClick={(e) => { e.stopPropagation(); advanceOrder(order.id); }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: cfg.dot }}>
                            {NEXT_LABEL[status]} →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {col.length === 0 && (
                    <div className="py-8 text-center text-xs text-[var(--muted)]">주문 없음</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)}
          onAdvance={() => { advanceOrder(selectedOrder.id); setSelectedOrder(null); }}
        />
      )}
    </div>
  );
};

// ── 3. Order Detail Modal ──────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onAdvance }: { order: DashOrder; onClose: () => void; onAdvance: () => void }) => {
  const cfg = STATUS_CONFIG[order.status];
  const nextLabel = NEXT_LABEL[order.status];
  const subtotal = order.items.reduce((s, i) => s + i.price, 0);
  const deliveryFee = order.type === "delivery" ? 2000 : 0;

  const paymentLabels: Record<string, string> = { card: "카드 결제", kakaopay: "카카오페이", toss: "토스", cash: "현금" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-[600px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-bold text-lg text-[#1A1A18] tabular-nums">주문 #{order.id}</h2>
                <StatusChip status={order.status} />
              </div>
              <p className="text-xs text-[var(--muted)]">{order.customer} · {order.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--border)] transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Special instructions — highlighted */}
            {order.special && (
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#92400E" }}>⚠️ 특별 요청사항</p>
                <p className="text-sm font-medium" style={{ color: "#78350F" }}>{order.special}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-3">주문 메뉴</p>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between py-2.5 border-b border-[var(--border)] last:border-none">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold w-6 h-6 rounded flex items-center justify-center text-white" style={{ backgroundColor: "var(--green)" }}>
                          {item.qty}
                        </span>
                        <p className="font-semibold text-sm text-[#1A1A18]">{item.name}</p>
                      </div>
                      {item.customization && (
                        <p className="text-xs text-[var(--muted)] ml-8 mt-0.5">{item.customization}</p>
                      )}
                    </div>
                    <p className="font-mono text-sm font-bold tabular-nums text-[#1A1A18]">₩{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer note */}
            {order.note && (
              <div className="rounded-xl p-3 bg-[var(--cream)] border border-[var(--border)]">
                <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-1">고객 메모</p>
                <p className="text-sm text-[#1A1A18]">{order.note}</p>
              </div>
            )}

            {/* Delivery address */}
            {order.type === "delivery" && order.address && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--green-light)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M7 1.5C5 1.5 3.5 3 3.5 5C3.5 8 7 12 7 12C7 12 10.5 8 10.5 5C10.5 3 9 1.5 7 1.5Z"/>
                    <circle cx="7" cy="5" r="1.5"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">배달 주소</p>
                  <p className="text-sm text-[#1A1A18] font-medium">{order.address}</p>
                </div>
              </div>
            )}

            {/* Courier */}
            {(order.status === "preparing" || order.status === "ready") && (
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: "#F5F3FF", border: "1px solid #DDD6FE" }}>
                <div className="w-9 h-9 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-sm">
                  배
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#1A1A18]">배달 기사 배정됨</p>
                  <p className="text-xs" style={{ color: "#7C3AED" }}>매칭 완료 · 픽업 대기 중</p>
                </div>
                <button className="text-xs font-bold px-3 py-1.5 rounded-lg border" style={{ borderColor: "#DDD6FE", color: "#7C3AED" }}>
                  연락하기
                </button>
              </div>
            )}

            {/* Payment breakdown */}
            <div className="rounded-xl overflow-hidden border border-[var(--border)]">
              <div className="px-4 py-3 bg-[var(--cream)] border-b border-[var(--border)]">
                <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest">결제 내역</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">소계</span>
                  <span className="font-mono font-semibold tabular-nums">₩{subtotal.toLocaleString()}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">배달비</span>
                    <span className="font-mono font-semibold tabular-nums">₩{deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-[var(--border)] pt-2">
                  <span className="text-[#1A1A18]">합계</span>
                  <span className="font-mono tabular-nums text-[#1A1A18]">₩{order.total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[var(--muted)]">결제 수단: {paymentLabels[order.payment]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--cream)]">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--border)] bg-white hover:bg-[var(--border)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="1" y="3" width="12" height="9" rx="1"/>
              <path d="M4 3V2a1 1 0 011-1h4a1 1 0 011 1v1M4 7h6M4 10h4"/>
            </svg>
            영수증 인쇄
          </button>
          <div className="flex-1" />
          {order.status !== "completed" && NEXT_STATUS[order.status] && (
            <button onClick={onAdvance}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: cfg.dot }}>
              {nextLabel} →
            </button>
          )}
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--muted)] hover:text-[#1A1A18] transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
