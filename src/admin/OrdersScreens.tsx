import React, { useState } from "react";
import {
  A, AdminTable, Column, StatusChip, SearchBar, FilterChips, Card, PageHeader,
  Btn, Modal, Toast, Pagination,
} from "./AdminShared";

type Order = {
  id: string; customer: string; restaurant: string; courier: string;
  area: string; total: number; items: number;
  status: "new" | "preparing" | "delivering" | "delivered" | "cancelled" | "refunded";
  date: string; payMethod: string;
};

const ORDERS: Order[] = [
  { id: "HMK-8901", customer: "Muhammad Al-Rashid", restaurant: "신당 할랄 키친", courier: "김민준", area: "이태원동", total: 34500, items: 3, status: "delivered", date: "2024.11.24 15:42", payMethod: "카카오페이" },
  { id: "HMK-8900", customer: "Park Min-jun", restaurant: "이스탄불 케밥 하우스", courier: "이동현", area: "홍대", total: 22000, items: 2, status: "delivering", date: "2024.11.24 16:10", payMethod: "신한카드" },
  { id: "HMK-8899", customer: "Siti Fatimah", restaurant: "마스지드 서울 카페", courier: "Wang Fang", area: "이태원동", total: 9500, items: 1, status: "preparing", date: "2024.11.24 16:22", payMethod: "토스" },
  { id: "HMK-8898", customer: "Kim Jae-won", restaurant: "우즈베키스탄 플로프", courier: "-", area: "용산동", total: 27000, items: 2, status: "new", date: "2024.11.24 16:30", payMethod: "카카오페이" },
  { id: "HMK-8897", customer: "Lee Soo-yeon", restaurant: "신당 할랄 키친", courier: "김민준", area: "한남동", total: 18000, items: 2, status: "cancelled", date: "2024.11.24 14:55", payMethod: "삼성페이" },
  { id: "HMK-8896", customer: "Ahmed Hassan", restaurant: "델리 스파이스", courier: "박성민", area: "마포구", total: 42000, items: 4, status: "refunded", date: "2024.11.23 20:14", payMethod: "신한카드" },
  { id: "HMK-8895", customer: "Choi Dong-wook", restaurant: "자카르타 나시고렝", courier: "이동현", area: "광진구", total: 15500, items: 2, status: "delivered", date: "2024.11.23 19:30", payMethod: "네이버페이" },
];

const STATUS_LABEL: Record<Order["status"], string> = {
  new: "신규접수", preparing: "조리중", delivering: "배달중",
  delivered: "배달완료", cancelled: "취소됨", refunded: "환불됨",
};

// ── Screen 10: All Orders ──────────────────────────────────────────────────────
export const AllOrders = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [page, setPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const filtered = ORDERS.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.restaurant.toLowerCase().includes(q);
    const matchF = filter === "전체" || (filter === "신규" && o.status === "new") || (filter === "배달중" && o.status === "delivering") || (filter === "완료" && o.status === "delivered") || (filter === "취소/환불" && ["cancelled","refunded"].includes(o.status));
    return matchQ && matchF;
  });

  const columns: Column<Order>[] = [
    {
      key: "id", header: "주문번호", sortable: true,
      render: o => <span className="font-mono text-xs font-semibold" style={{ color: A.green }}>#{o.id}</span>,
    },
    {
      key: "customer", header: "고객",
      render: o => <span className="text-sm">{o.customer}</span>,
    },
    {
      key: "restaurant", header: "레스토랑",
      render: o => <span className="text-sm">{o.restaurant}</span>,
    },
    {
      key: "courier", header: "배달파트너",
      render: o => <span className="text-sm" style={{ color: o.courier === "-" ? A.dim : A.textMid }}>{o.courier}</span>,
    },
    {
      key: "area", header: "배달지",
      render: o => <span className="text-sm" style={{ color: A.muted }}>{o.area}</span>,
    },
    {
      key: "total", header: "금액", sortable: true,
      render: o => <span className="font-mono text-sm tabular-nums">₩{o.total.toLocaleString()}</span>,
    },
    {
      key: "payMethod", header: "결제수단",
      render: o => <span className="text-sm" style={{ color: A.muted }}>{o.payMethod}</span>,
    },
    {
      key: "date", header: "주문 시각", sortable: true,
      render: o => <span className="text-xs font-mono" style={{ color: A.muted }}>{o.date}</span>,
    },
    {
      key: "status", header: "상태",
      render: o => <StatusChip status={o.status} label={STATUS_LABEL[o.status]} />,
    },
    {
      key: "actions", header: "",
      render: o => (
        <div className="flex items-center gap-1">
          <Btn onClick={() => setDetailOrder(o)} variant="ghost">상세</Btn>
          {["delivered", "delivering"].includes(o.status) && (
            <Btn onClick={() => { setDetailOrder(o); setRefundOpen(true); }} variant="danger">환불</Btn>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "주문 & 운영", "전체 주문"]}
        title="전체 주문 관리"
        subtitle={`오늘 ${ORDERS.filter(o => o.date.startsWith("2024.11.24")).length}건 · 총 ${ORDERS.length}건 표시`}
        actions={
          <div className="flex gap-2">
            <Btn variant="secondary" size="md">날짜 범위 선택</Btn>
            <Btn variant="secondary" size="md">CSV 내보내기</Btn>
          </div>
        }
      />

      {/* Quick stat row */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { label: "신규 접수", count: ORDERS.filter(o => o.status === "new").length, color: A.infoText, bg: A.infoLight },
          { label: "조리중", count: ORDERS.filter(o => o.status === "preparing").length, color: A.purpleText, bg: A.purpleLight },
          { label: "배달중", count: ORDERS.filter(o => o.status === "delivering").length, color: A.warningText, bg: A.warningLight },
          { label: "완료", count: ORDERS.filter(o => o.status === "delivered").length, color: A.greenText, bg: A.greenLight },
          { label: "취소/환불", count: ORDERS.filter(o => ["cancelled","refunded"].includes(o.status)).length, color: A.dangerText, bg: A.dangerLight },
        ].map(s => (
          <button key={s.label} onClick={() => setFilter(s.label === "완료" ? "완료" : s.label === "배달중" ? "배달중" : s.label === "신규 접수" ? "신규" : s.label === "취소/환불" ? "취소/환불" : "전체")}
            className="rounded-xl p-3.5 text-left transition-all"
            style={{ backgroundColor: A.surface, border: `1px solid ${A.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p className="font-mono font-bold text-2xl tabular-nums" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-1" style={{ color: A.muted }}>{s.label}</p>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <FilterChips options={["전체", "신규", "배달중", "완료", "취소/환불"]} value={filter} onChange={setFilter} />
          <SearchBar value={search} onChange={setSearch} placeholder="주문번호, 고객, 레스토랑 검색..." width={260} />
        </div>
        <AdminTable columns={columns} data={filtered} onRowClick={o => setDetailOrder(o)} />
        <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
      </Card>

      {/* Order detail modal */}
      <Modal open={!!detailOrder && !refundOpen} onClose={() => setDetailOrder(null)} title={`주문 상세 #${detailOrder?.id}`} width={600}>
        {detailOrder && (
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center justify-between">
              <StatusChip status={detailOrder.status} label={STATUS_LABEL[detailOrder.status]} />
              <span className="text-xs font-mono" style={{ color: A.muted }}>{detailOrder.date}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: "고객", v: detailOrder.customer },
                { l: "레스토랑", v: detailOrder.restaurant },
                { l: "배달파트너", v: detailOrder.courier },
                { l: "배달지", v: detailOrder.area },
                { l: "결제수단", v: detailOrder.payMethod },
                { l: "메뉴 수", v: `${detailOrder.items}개` },
              ].map(item => (
                <div key={item.l}>
                  <p className="text-xs" style={{ color: A.muted }}>{item.l}</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: A.text }}>{item.v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: A.bg }}>
              <p className="text-xs font-medium mb-2" style={{ color: A.muted }}>금액 내역</p>
              {[
                { l: "소계", v: `₩${(detailOrder.total - 2000).toLocaleString()}` },
                { l: "배달비", v: "₩2,000" },
                { l: "할인", v: "₩0" },
              ].map(item => (
                <div key={item.l} className="flex justify-between py-1.5 text-sm" style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                  <span style={{ color: A.muted }}>{item.l}</span>
                  <span style={{ color: A.text }}>{item.v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span style={{ color: A.text }}>합계</span>
                <span style={{ color: A.green }}>₩{detailOrder.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {["delivered","delivering"].includes(detailOrder.status) && (
                <Btn variant="danger" size="md" onClick={() => setRefundOpen(true)}>환불 처리</Btn>
              )}
              <Btn variant="secondary" size="md">배달파트너 재배정</Btn>
              <Btn variant="ghost" onClick={() => setDetailOrder(null)}>닫기</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Refund modal */}
      <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="환불 처리" width={440}>
        <div className="px-6 py-5">
          <p className="text-sm mb-3" style={{ color: A.muted }}>환불 금액: <strong style={{ color: A.text }}>₩{detailOrder?.total.toLocaleString()}</strong></p>
          <div className="space-y-2 mb-4">
            {["고객 요청", "음식 품질 문제", "배달 지연 (60분 초과)", "잘못된 주문 전달", "기타"].map(r => (
              <label key={r} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: A.textMid }}>
                <input type="radio" name="refundReason" className="accent-green-700"/> {r}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Btn onClick={() => setRefundOpen(false)}>취소</Btn>
            <Btn variant="danger" size="md" onClick={() => { setRefundOpen(false); setDetailOrder(null); setToast({ msg: "환불 처리 완료", type: "info" }); }}>
              환불 확정
            </Btn>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ── Screen 11: Live Operations Map ────────────────────────────────────────────
const MAP_PINS = [
  { type: "order", x: 340, y: 195, label: "#8900", status: "delivering" as const },
  { type: "order", x: 460, y: 140, label: "#8899", status: "preparing" as const },
  { type: "order", x: 510, y: 260, label: "#8898", status: "new" as const },
  { type: "restaurant", x: 310, y: 180, label: "신당 할랄" },
  { type: "restaurant", x: 420, y: 120, label: "이스탄불 케밥" },
  { type: "restaurant", x: 520, y: 240, label: "마스지드 카페" },
  { type: "courier", x: 355, y: 205, label: "김민준" },
  { type: "courier", x: 480, y: 155, label: "이동현" },
  { type: "courier", x: 415, y: 220, label: "Wang Fang" },
];

export const LiveOperationsMap = () => {
  const [selectedPin, setSelectedPin] = useState<typeof MAP_PINS[0] | null>(null);
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [pinFilter, setPinFilter] = useState("전체");

  const pinColor = (type: string, status?: string) => {
    if (type === "restaurant") return A.gold;
    if (type === "courier") return A.green;
    if (status === "delivering") return A.info;
    if (status === "preparing") return A.purple;
    return A.warning;
  };

  const pinIcon = (type: string) => type === "restaurant" ? "🍽️" : type === "courier" ? "🏍️" : "📦";

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "주문 & 운영", "실시간 운영 현황"]}
        title="실시간 운영 지도"
        subtitle="서울 이태원/용산/홍대 권역"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: A.greenLight, color: A.greenText }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: A.green }} />
              Live · 30초 갱신
            </div>
            <button onClick={() => setHeatmapOn(!heatmapOn)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ backgroundColor: heatmapOn ? A.info : A.bg, color: heatmapOn ? "#fff" : A.muted, border: `1px solid ${heatmapOn ? A.info : A.border}` }}>
              🔥 수요 히트맵
            </button>
          </div>
        }
      />

      <div className="flex gap-4">
        {/* Map */}
        <div className="flex-1">
          <Card>
            {/* Filter row */}
            <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: `1px solid ${A.border}` }}>
              <FilterChips options={["전체", "주문", "배달파트너", "레스토랑"]} value={pinFilter} onChange={setPinFilter} />
              <div className="ml-auto flex items-center gap-4 text-xs" style={{ color: A.muted }}>
                {[
                  { dot: A.gold, label: "레스토랑" },
                  { dot: A.green, label: "배달파트너" },
                  { dot: A.info, label: "배달중 주문" },
                  { dot: A.purple, label: "조리중 주문" },
                  { dot: A.warning, label: "신규 주문" },
                ].map(leg => (
                  <span key={leg.label} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: leg.dot }} />
                    {leg.label}
                  </span>
                ))}
              </div>
            </div>

            {/* SVG map */}
            <div className="relative overflow-hidden" style={{ height: 520 }}>
              <svg width="100%" height="520" viewBox="0 0 840 520" preserveAspectRatio="xMidYMid slice">
                {/* Ground */}
                <rect width="840" height="520" fill="#EEF2EC"/>

                {/* Heatmap overlay */}
                {heatmapOn && (
                  <>
                    <circle cx="340" cy="200" r="80" fill="rgba(220,38,38,0.15)"/>
                    <circle cx="340" cy="200" r="50" fill="rgba(220,38,38,0.12)"/>
                    <circle cx="430" cy="150" r="70" fill="rgba(245,166,35,0.12)"/>
                  </>
                )}

                {/* City blocks */}
                {[
                  [50,40,120,80],[220,40,100,60],[380,20,80,70],[520,40,100,60],[680,30,120,90],
                  [60,160,80,120],[200,140,140,100],[400,130,100,80],[570,120,120,100],[740,140,80,120],
                  [30,320,100,80],[190,300,80,120],[360,280,120,80],[540,300,80,100],[700,280,100,120],
                  [80,430,120,60],[280,410,100,80],[450,420,80,60],[620,400,100,80],[760,430,60,70],
                ].map(([x,y,w,h],i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill="#D8E4D4" opacity="0.9"/>
                ))}

                {/* Roads */}
                <line x1="0" y1="260" x2="840" y2="260" stroke="#C4D4BE" strokeWidth="14"/>
                <line x1="0" y1="380" x2="840" y2="380" stroke="#C4D4BE" strokeWidth="10"/>
                <line x1="300" y1="0" x2="300" y2="520" stroke="#C4D4BE" strokeWidth="14"/>
                <line x1="480" y1="0" x2="480" y2="520" stroke="#C4D4BE" strokeWidth="10"/>
                <line x1="660" y1="0" x2="660" y2="520" stroke="#C4D4BE" strokeWidth="8"/>
                <line x1="140" y1="0" x2="140" y2="520" stroke="#C4D4BE" strokeWidth="8"/>

                {/* Road labels */}
                <text x="120" y="255" fill="#9DB49A" fontSize="10" fontFamily="sans-serif">이태원로</text>
                <text x="120" y="374" fill="#9DB49A" fontSize="10" fontFamily="sans-serif">한강대로</text>

                {/* Delivery routes */}
                <path d="M 310 180 Q 330 190 355 205" stroke={A.info} strokeWidth="2.5" strokeDasharray="6 3" fill="none" opacity="0.8"/>
                <path d="M 420 120 Q 450 135 480 155" stroke={A.green} strokeWidth="2.5" strokeDasharray="6 3" fill="none" opacity="0.8"/>

                {/* Pins */}
                {MAP_PINS
                  .filter(p => pinFilter === "전체" || (pinFilter === "주문" && p.type === "order") || (pinFilter === "배달파트너" && p.type === "courier") || (pinFilter === "레스토랑" && p.type === "restaurant"))
                  .map((pin, i) => {
                    const color = pinColor(pin.type, "status" in pin ? pin.status : undefined);
                    const isSelected = selectedPin === pin;
                    return (
                      <g key={i} onClick={() => setSelectedPin(isSelected ? null : pin)} style={{ cursor: "pointer" }}>
                        <circle cx={pin.x} cy={pin.y} r={isSelected ? 20 : 16} fill="white"
                          stroke={color} strokeWidth="2.5"
                          style={{ filter: isSelected ? `drop-shadow(0 0 8px ${color})` : "none" }}/>
                        <text x={pin.x} y={pin.y + 5} textAnchor="middle" fontSize="12">{pinIcon(pin.type)}</text>
                        {isSelected && (
                          <rect x={pin.x - 30} y={pin.y - 38} width="60" height="20" rx="4" fill={color} opacity="0.95"/>
                        )}
                        {isSelected && (
                          <text x={pin.x} y={pin.y - 24} textAnchor="middle" fontSize="9" fill="white" fontFamily="'Inter',sans-serif">
                            {pin.label}
                          </text>
                        )}
                      </g>
                    );
                  })
                }
              </svg>
            </div>
          </Card>
        </div>

        {/* Stats sidebar */}
        <div className="w-64 flex-shrink-0 space-y-3">
          {[
            { label: "활성 주문", value: ORDERS.filter(o => ["new","preparing","delivering"].includes(o.status)).length, icon: "📦", color: A.info },
            { label: "배달중 파트너", value: 3, icon: "🏍️", color: A.green },
            { label: "운영 레스토랑", value: 5, icon: "🍽️", color: A.gold },
            { label: "평균 배달 시간", value: "24분", icon: "⏱️", color: A.purple },
          ].map(s => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: A.bg }}>
                {s.icon}
              </div>
              <div>
                <p className="font-mono font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs" style={{ color: A.muted }}>{s.label}</p>
              </div>
            </Card>
          ))}

          {/* Active orders list */}
          <Card>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-xs" style={{ color: A.text }}>진행중 주문</p>
            </div>
            {ORDERS.filter(o => ["new","preparing","delivering"].includes(o.status)).map(o => (
              <div key={o.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold" style={{ color: A.green }}>#{o.id}</span>
                  <StatusChip status={o.status} label={STATUS_LABEL[o.status]} />
                </div>
                <p className="text-xs" style={{ color: A.muted }}>{o.restaurant}</p>
                <p className="text-xs" style={{ color: A.dim }}>→ {o.area} · {o.courier}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
