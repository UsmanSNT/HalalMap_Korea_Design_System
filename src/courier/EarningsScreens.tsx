import React, { useState } from "react";
import { C, CStatusBar, CBottomNav } from "./CourierShared";

// ── Earnings data ──────────────────────────────────────────────────────────────
const DAILY_DATA = [
  { day: "월", amount: 42000, orders: 11 },
  { day: "화", amount: 58500, orders: 15 },
  { day: "수", amount: 31000, orders: 8 },
  { day: "목", amount: 67200, orders: 17 },
  { day: "금", amount: 81000, orders: 21 },
  { day: "토", amount: 94500, orders: 24 },
  { day: "일", amount: 51700, orders: 13 },
];

const HISTORY = [
  { id: "HMK-8855", date: "오늘 15:42", restaurant: "신당 할랄 키친", area: "이태원동", earnings: 4200, rating: 5, mins: 18 },
  { id: "HMK-8848", date: "오늘 14:10", restaurant: "이스탄불 케밥", area: "한남동", earnings: 3800, rating: 5, mins: 22 },
  { id: "HMK-8840", date: "오늘 12:33", restaurant: "마스지드 서울 카페", area: "이태원동", earnings: 5100, rating: 4, mins: 28 },
  { id: "HMK-8831", date: "오늘 11:05", restaurant: "우즈베키스탄 플로프", area: "용산동", earnings: 3200, rating: 5, mins: 16 },
  { id: "HMK-8822", date: "어제 19:48", restaurant: "신당 할랄 키친", area: "이태원동", earnings: 4800, rating: 5, mins: 24 },
  { id: "HMK-8815", date: "어제 18:12", restaurant: "델리 스파이스", area: "마포구", earnings: 6200, rating: 4, mins: 35 },
  { id: "HMK-8808", date: "어제 16:40", restaurant: "이스탄불 케밥", area: "홍대", earnings: 5500, rating: 5, mins: 30 },
];

// ── 11. Earnings Dashboard ─────────────────────────────────────────────────────
export const EarningsDashboard = () => {
  const [tab, setTab] = useState<"today" | "week" | "month">("week");

  const weekTotal = DAILY_DATA.reduce((s, d) => s + d.amount, 0);
  const weekOrders = DAILY_DATA.reduce((s, d) => s + d.orders, 0);
  const avgPerOrder = Math.round(weekTotal / weekOrders);
  const maxAmount = Math.max(...DAILY_DATA.map(d => d.amount));

  const displayData = {
    today: { total: 51700, orders: 13, avg: 3977 },
    week: { total: weekTotal, orders: weekOrders, avg: avgPerOrder },
    month: { total: 1284500, orders: 329, avg: 3904 },
  }[tab];

  // SVG chart dims
  const chartW = 330, chartH = 100, barW = 32, gap = 16;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <p className="font-bold text-lg" style={{ color: C.text }}>수익 현황</p>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: C.goldGlow }}>
          <span className="font-mono text-xs font-bold" style={{ color: C.gold }}>₩{displayData.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-4 gap-2 flex-shrink-0">
        {(["today", "week", "month"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
            style={{
              backgroundColor: tab === t ? C.green : C.card,
              color: tab === t ? "#0E1620" : C.muted,
            }}>
            {t === "today" ? "오늘" : t === "week" ? "이번 주" : "이번 달"}
          </button>
        ))}
      </div>

      <div className="flex-1 phone-scroll px-4 pt-4 space-y-4">
        {/* Big earnings number */}
        <div className="rounded-3xl p-5 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.goldDark}30` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.dim }}>
            {tab === "today" ? "오늘" : tab === "week" ? "이번 주" : "이번 달"} 총 수익
          </p>
          <p className="font-mono font-bold tabular-nums" style={{ color: C.gold, fontSize: "48px", lineHeight: 1 }}>
            ₩{(displayData.total / 10000).toFixed(1)}만
          </p>
          <p className="font-mono text-sm tabular-nums mt-1" style={{ color: C.muted }}>
            = ₩{displayData.total.toLocaleString()}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "총 배달", value: `${displayData.orders}건`, color: C.text },
            { label: "건당 평균", value: `₩${displayData.avg.toLocaleString()}`, color: C.gold },
            { label: "수락률", value: "94%", color: C.green },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-3.5 text-center" style={{ backgroundColor: C.card }}>
              <p className="font-mono font-bold text-lg tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] mt-1" style={{ color: C.dim }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        {tab !== "today" && (
          <div className="rounded-2xl p-4" style={{ backgroundColor: C.card }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.dim }}>일별 수익</p>
            <svg width={chartW + 10} height={chartH + 32} viewBox={`0 0 ${chartW + 10} ${chartH + 32}`} style={{ display: "block", margin: "0 auto" }}>
              {/* Gridlines */}
              {[0, 1, 2, 3].map(i => {
                const y = 4 + chartH * (1 - i / 3);
                return <line key={i} x1="0" x2={chartW + 10} y1={y} y2={y} stroke={C.border} strokeWidth="1"/>;
              })}
              {DAILY_DATA.map((d, i) => {
                const x = i * (barW + gap);
                const bh = (d.amount / maxAmount) * (chartH - 8);
                const y = 4 + chartH - bh;
                const isToday = i === 6;
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={barW} height={bh} rx="6"
                      fill={isToday ? C.gold : C.green} opacity={isToday ? 1 : 0.7}/>
                    <text x={x + barW / 2} y={chartH + 22} textAnchor="middle"
                      fill={C.muted} fontSize="10" fontFamily="'Noto Sans KR',sans-serif">
                      {d.day}
                    </text>
                    {isToday && (
                      <text x={x + barW / 2} y={y - 6} textAnchor="middle"
                        fill={C.gold} fontSize="9" fontFamily="'JetBrains Mono',monospace">
                        오늘
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Payout schedule */}
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ backgroundColor: C.cardAlt, border: `1px solid ${C.border}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl" style={{ backgroundColor: C.goldGlow }}>
            💳
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: C.text }}>다음 정산일</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>2024년 11월 27일 (수) · 카카오뱅크 ****4521</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-base tabular-nums" style={{ color: C.gold }}>₩{displayData.total.toLocaleString()}</p>
            <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>예상 입금</p>
          </div>
        </div>
        <div className="h-4" />
      </div>

      <CBottomNav active="earnings" />
    </div>
  );
};

// ── 12. Delivery History ───────────────────────────────────────────────────────
export const DeliveryHistory = () => {
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const filters = ["전체", "오늘", "이번 주"];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar />

      {/* Header */}
      <div className="px-5 py-4 flex-shrink-0" style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <p className="font-bold text-lg" style={{ color: C.text }}>배달 내역</p>
        <div className="flex gap-2 mt-3">
          {filters.map(f => (
            <button key={f} onClick={() => setSelectedFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                backgroundColor: selectedFilter === f ? C.green : C.card,
                color: selectedFilter === f ? "#0E1620" : C.muted,
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div className="flex px-4 py-3 gap-3 flex-shrink-0">
        {[
          { label: "건수", value: "109건", color: C.text },
          { label: "수익", value: "₩426,500", color: C.gold },
          { label: "평균 평점", value: "4.92★", color: C.gold },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-xl py-2.5 text-center" style={{ backgroundColor: C.card }}>
            <p className="font-mono font-bold text-sm tabular-nums" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 phone-scroll">
        {HISTORY.map((h, i) => (
          <div key={h.id} className="flex items-center gap-4 px-5 py-4"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            {/* Order number circle */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.cardAlt }}>
              <span className="font-mono text-xs font-bold" style={{ color: C.green }}>#{i + 1}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: C.text }}>{h.restaurant}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: C.muted }}>{h.area}</span>
                <span style={{ color: C.dim }}>·</span>
                <span className="font-mono text-xs tabular-nums" style={{ color: C.muted }}>{h.mins}분</span>
                <span style={{ color: C.dim }}>·</span>
                <span className="text-xs" style={{ color: C.muted }}>{h.date}</span>
              </div>
              {/* Stars */}
              <div className="flex gap-0.5 mt-1">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="10" height="10" viewBox="0 0 10 10" fill={s <= h.rating ? C.gold : C.dim}>
                    <path d="M5 1l.9 2 2.1.3-1.5 1.5.4 2.1L5 6l-1.9 1 .4-2.1L2 3.3l2.1-.3z"/>
                  </svg>
                ))}
              </div>
            </div>

            {/* Earnings */}
            <div className="text-right flex-shrink-0">
              <p className="font-mono font-bold tabular-nums" style={{ color: C.gold, fontSize: "16px" }}>
                +₩{h.earnings.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div className="h-4" />
      </div>

      <CBottomNav active="earnings" />
    </div>
  );
};

// ── 13. Payout Details ─────────────────────────────────────────────────────────
const PAYOUTS = [
  { date: "2024.11.20", amount: 426500, status: "입금완료", account: "카카오뱅크 ****4521" },
  { date: "2024.11.13", amount: 389200, status: "입금완료", account: "카카오뱅크 ****4521" },
  { date: "2024.11.06", amount: 412800, status: "입금완료", account: "카카오뱅크 ****4521" },
  { date: "2024.10.30", amount: 351000, status: "입금완료", account: "카카오뱅크 ****4521" },
];

export const PayoutScreen = () => {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar />

      <div className="px-5 py-4 flex-shrink-0" style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <p className="font-bold text-lg" style={{ color: C.text }}>정산 내역</p>
      </div>

      <div className="flex-1 phone-scroll px-4 pt-4 space-y-4">
        {/* Bank account card */}
        <div className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #1A3040 0%, #0F2030 100%)`, border: `1px solid ${C.borderBright}` }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5" style={{ backgroundColor: C.green, transform: "translate(20%,-20%)" }} />
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: C.dim }}>정산 계좌</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: "#FEE500" }}>
              💛
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.text }}>카카오뱅크</p>
              <p className="font-mono text-base font-bold tabular-nums" style={{ color: C.text }}>3333-**** - ****-4521</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: C.borderBright, color: C.muted }}>
            계좌 변경
          </button>
        </div>

        {/* Pending payout */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: C.goldGlow, border: `1.5px solid ${C.goldDark}50` }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.goldDark }}>미정산 금액</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: C.goldDark, color: "white" }}>
              정산 예정
            </span>
          </div>
          <p className="font-mono font-bold tabular-nums" style={{ color: C.gold, fontSize: "36px", lineHeight: 1 }}>
            ₩426,500
          </p>
          <p className="text-sm mt-2" style={{ color: C.gold, opacity: 0.8 }}>
            다음 정산일 · 2024년 11월 27일 (수)
          </p>
        </div>

        {/* Payout schedule info */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: C.card }}>
          <p className="font-bold text-sm mb-3" style={{ color: C.text }}>정산 안내</p>
          {[
            { label: "정산 주기", value: "주 1회 (매주 수요일)" },
            { label: "정산 시간", value: "오전 9시 ~ 오후 3시" },
            { label: "최소 정산 금액", value: "₩10,000" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-sm" style={{ color: C.muted }}>{item.label}</p>
              <p className="font-mono text-sm font-bold tabular-nums" style={{ color: C.text }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
            <p className="font-bold text-sm" style={{ color: C.text }}>정산 이력</p>
          </div>
          {PAYOUTS.map((p, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: i < PAYOUTS.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <p className="font-mono text-sm font-bold tabular-nums" style={{ color: C.text }}>{p.date}</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>{p.account}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold tabular-nums" style={{ color: C.gold }}>₩{p.amount.toLocaleString()}</p>
                <p className="text-xs mt-0.5" style={{ color: C.green }}>{p.status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="h-4" />
      </div>

      <CBottomNav active="earnings" />
    </div>
  );
};
