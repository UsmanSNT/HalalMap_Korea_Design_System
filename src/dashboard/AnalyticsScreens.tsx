import React, { useState } from "react";

// ── Revenue chart data ─────────────────────────────────────────────────────────
const WEEKLY_REVENUE = [
  { day: "월", amount: 890000, orders: 32 },
  { day: "화", amount: 1120000, orders: 41 },
  { day: "수", amount: 980000, orders: 36 },
  { day: "목", amount: 1340000, orders: 49 },
  { day: "금", amount: 1580000, orders: 58 },
  { day: "토", amount: 1820000, orders: 67 },
  { day: "일", amount: 1284500, orders: 47 },
];

const MONTHLY_REVENUE = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}일`,
  amount: 600000 + Math.floor(Math.sin(i / 3) * 400000 + Math.random() * 300000),
  orders: 20 + Math.floor(Math.sin(i / 3) * 15 + Math.random() * 10),
}));

const POPULAR_ITEMS = [
  { name: "할랄 갈비탕", orders: 142, revenue: 1917000, pct: 100 },
  { name: "비빔밥 (할랄)", orders: 118, revenue: 1298000, pct: 83 },
  { name: "할랄 삼계탕", orders: 89, revenue: 1468500, pct: 63 },
  { name: "된장찌개 세트", orders: 76, revenue: 912000, pct: 54 },
  { name: "파전", orders: 64, revenue: 576000, pct: 45 },
];

// Hourly order heatmap: 7 days × 18 hours (6am–11pm)
const HEATMAP_DATA: number[][] = [
  [0,0,2,3,8,12,10,5,4,6,14,18,8,3,2,1,0,0], // 월
  [0,0,1,4,9,14,11,6,5,7,15,19,9,4,3,2,1,0], // 화
  [0,0,2,3,7,11,9,5,4,5,12,16,7,3,2,1,0,0], // 수
  [0,1,3,5,10,16,13,7,6,8,17,22,10,5,3,2,1,0], // 목
  [0,1,4,7,13,19,16,9,7,9,20,26,12,7,5,3,2,1], // 금
  [0,2,5,8,14,20,18,10,8,10,18,24,14,9,7,5,3,1], // 토
  [0,1,3,6,11,14,12,7,5,7,16,20,10,6,4,3,2,0], // 일
];
const HOURS = ["6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
const DAYS_ABBR = ["월","화","수","목","금","토","일"];

// ── 9. Sales Analytics ────────────────────────────────────────────────────────
export const SalesAnalytics = () => {
  const [range, setRange] = useState<"week" | "month">("week");
  const data = range === "week" ? WEEKLY_REVENUE : MONTHLY_REVENUE;
  const maxAmount = Math.max(...data.map(d => d.amount));
  const maxHeat = Math.max(...HEATMAP_DATA.flat());

  const totalRevenue = data.reduce((s, d) => s + d.amount, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const avgOrder = Math.round(totalRevenue / totalOrders);

  // SVG bar chart dimensions
  const chartW = 560, chartH = 160, barGap = 6;
  const barW = range === "week" ? (chartW / 7) - barGap : (chartW / 30) - barGap * 0.3;
  const maxY = maxAmount * 1.1;

  const heatCell = 28, heatGap = 3;

  const heatColor = (val: number) => {
    const t = val / maxHeat;
    if (t === 0) return "#F0EDE8";
    if (t < 0.2) return "#C8E6D8";
    if (t < 0.4) return "#8BC9AA";
    if (t < 0.6) return "#4FA07C";
    if (t < 0.8) return "#2A8060";
    return "var(--green)";
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base text-[#1A1A18]">매출 분석</h2>
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
          {(["week","month"] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-4 py-2 text-xs font-semibold transition-colors"
              style={{ backgroundColor: range === r ? "var(--green)" : "white", color: range === r ? "white" : "var(--muted)" }}>
              {r === "week" ? "이번 주" : "이번 달"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "총 매출", value: `₩${(totalRevenue / 10000).toFixed(0)}만`, sub: `₩${totalRevenue.toLocaleString()}` },
          { label: "총 주문", value: `${totalOrders}건`, sub: `일 평균 ${Math.round(totalOrders / data.length)}건` },
          { label: "평균 주문액", value: `₩${avgOrder.toLocaleString()}`, sub: "건당 평균" },
          { label: "고객 만족도", value: "4.7★", sub: "리뷰 284개 평균" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--border)]">
            <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">{kpi.label}</p>
            <p className="font-mono font-bold text-2xl tabular-nums text-[#1A1A18] mt-1">{kpi.value}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-sm text-[#1A1A18]">매출 추이</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--green)" }} />
              <span className="text-xs text-[var(--muted)]">매출 (₩)</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <svg width={chartW + 50} height={chartH + 48} viewBox={`0 0 ${chartW + 50} ${chartH + 48}`} style={{ display: "block" }}>
            {/* Y-axis gridlines */}
            {[0,1,2,3,4].map(i => {
              const y = 8 + (chartH - 8) * (1 - i / 4);
              const val = Math.round(maxY * (i / 4));
              return (
                <g key={i}>
                  <line x1="44" x2={chartW + 44} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 3"/>
                  <text x="40" y={y + 4} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="'JetBrains Mono',monospace">
                    {val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}K` : val}
                  </text>
                </g>
              );
            })}
            {/* Bars */}
            {data.map((d, i) => {
              const x = 44 + i * (barW + barGap);
              const barH = ((d.amount / maxY)) * (chartH - 8);
              const y = 8 + (chartH - 8) - barH;
              const isLast = i === data.length - 1;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barW} height={barH} rx="4"
                    fill={isLast ? "var(--gold)" : "var(--green)"} opacity={isLast ? 1 : 0.75}/>
                  <text x={x + barW / 2} y={chartH + 24} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="'Noto Sans KR',sans-serif">{d.day}</text>
                  {isLast && (
                    <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill="var(--gold)" fontSize="9" fontWeight="700" fontFamily="'JetBrains Mono',monospace">
                      오늘
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Heatmap + Popular items */}
      <div className="grid grid-cols-5 gap-4">
        {/* Hourly heatmap */}
        <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)]">
          <p className="font-bold text-sm text-[#1A1A18] mb-4">시간대별 주문량</p>
          <div className="overflow-x-auto">
            <svg width={(heatCell + heatGap) * 18 + 28} height={(heatCell + heatGap) * 7 + 22}
              viewBox={`0 0 ${(heatCell + heatGap) * 18 + 28} ${(heatCell + heatGap) * 7 + 22}`} style={{ display: "block" }}>
              {/* Hour labels */}
              {HOURS.map((h, i) => (
                <text key={h} x={28 + i * (heatCell + heatGap) + heatCell / 2} y="12" textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="'JetBrains Mono',monospace">
                  {i % 2 === 0 ? h : ""}
                </text>
              ))}
              {/* Day labels + cells */}
              {DAYS_ABBR.map((day, di) => (
                <g key={day}>
                  <text x="20" y={20 + di * (heatCell + heatGap) + heatCell / 2} textAnchor="middle" dominantBaseline="middle" fill="var(--muted)" fontSize="10" fontFamily="'Noto Sans KR',sans-serif">{day}</text>
                  {HOURS.map((_, hi) => (
                    <rect key={hi}
                      x={28 + hi * (heatCell + heatGap)} y={18 + di * (heatCell + heatGap)}
                      width={heatCell} height={heatCell} rx="4"
                      fill={heatColor(HEATMAP_DATA[di][hi])}
                    />
                  ))}
                </g>
              ))}
            </svg>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-[var(--muted)]">적음</span>
            {["#F0EDE8","#C8E6D8","#8BC9AA","#4FA07C","#2A8060","var(--green)"].map(c => (
              <div key={c} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-[10px] text-[var(--muted)]">많음</span>
          </div>
        </div>

        {/* Popular items */}
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)]">
          <p className="font-bold text-sm text-[#1A1A18] mb-4">인기 메뉴 TOP 5</p>
          <div className="space-y-4">
            {POPULAR_ITEMS.map((item, i) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold tabular-nums w-4" style={{ color: i < 3 ? "var(--gold)" : "var(--muted)" }}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-[#1A1A18]">{item.name}</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-[var(--muted)]">{item.orders}건</span>
                </div>
                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${item.pct}%`, backgroundColor: i === 0 ? "var(--gold)" : "var(--green)", opacity: 1 - i * 0.12 }} />
                </div>
                <p className="font-mono text-[11px] tabular-nums text-[var(--muted)]">₩{item.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 10. Reviews Management ─────────────────────────────────────────────────────
const REVIEWS = [
  { id: 1, customer: "김*수", rating: 5, date: "2024.11.24", text: "정말 맛있어요! 할랄 인증이 되어 있어서 안심하고 먹을 수 있었습니다. 갈비탕 국물이 진하고 고기도 부드러워요. 다음에 또 주문할게요!", photos: ["1498654896293-37c98e7f5fe4"], reply: "" },
  { id: 2, customer: "Ahmed K.", rating: 5, date: "2024.11.23", text: "Excellent halal food! I was worried about finding halal Korean food in Seoul but this place is amazing. The bibimbap was very authentic and the service was fast.", photos: [], reply: "Thank you for your kind review! We're so happy you enjoyed our halal Korean food 😊" },
  { id: 3, customer: "나*희", rating: 4, date: "2024.11.22", text: "전반적으로 맛있었지만 배달이 30분 이상 걸렸어요. 음식 맛은 훌륭한데 배달 속도 개선이 필요할 것 같아요.", photos: [], reply: "" },
  { id: 4, customer: "Siti R.", rating: 3, date: "2024.11.21", text: "음식은 괜찮았지만 포장이 아쉬웠습니다. 국물이 약간 새서 왔어요.", photos: [], reply: "" },
  { id: 5, customer: "이*영", rating: 5, date: "2024.11.20", text: "무슬림 친구와 함께 주문했는데 둘 다 너무 만족했어요. 할랄 갈비탕이 특히 맛있었고 직원분들도 친절하셨어요.", photos: ["1569050467447-ce54b3bbc37d"], reply: "감사합니다! 또 방문해주세요 🙏" },
];

const starCounts = [0, 0, 1, 1, 1, 3]; // 1★ to 5★

export const ReviewsManagement = () => {
  const [filter, setFilter] = useState<"all" | "unread" | "no-reply">("all");
  const [replyOpen, setReplyOpen] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = REVIEWS.filter(r => {
    if (filter === "no-reply") return !r.reply;
    return true;
  });

  const totalRatings = REVIEWS.length;
  const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / totalRatings;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)]">
            <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide mb-3">평점 요약</p>
            <div className="flex items-end gap-4">
              <div className="text-center">
                <p className="font-mono font-bold text-5xl tabular-nums" style={{ color: "var(--gold)" }}>{avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill={s <= Math.round(avgRating) ? "var(--gold)" : "var(--border)"}>
                      <path d="M7 1l1.5 3.2 3.5.5-2.5 2.4.6 3.4L7 9l-3.1 1.5.6-3.4L2 4.7l3.5-.5z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">{totalRatings}개 리뷰</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="font-mono text-xs tabular-nums w-3 text-[var(--muted)]">{star}</span>
                    <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(starCounts[star] / totalRatings) * 100}%`, backgroundColor: "var(--gold)" }} />
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-[var(--muted)] w-3">{starCounts[star]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {[
            { label: "미답변 리뷰", value: `${REVIEWS.filter(r => !r.reply).length}개`, color: "var(--danger)" },
            { label: "이번 주 리뷰", value: "8개", color: "var(--green)" },
            { label: "응답률", value: "68%", color: "var(--info)" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--border)] flex flex-col justify-center">
              <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">{stat.label}</p>
              <p className="font-mono font-bold text-3xl tabular-nums mt-1" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter + list */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)]">
            {(["all","unread","no-reply"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ backgroundColor: filter === f ? "var(--green-light)" : "transparent", color: filter === f ? "var(--green)" : "var(--muted)" }}>
                {f === "all" ? "전체" : f === "unread" ? "안 읽음" : "미답변"}
                {f === "no-reply" && <span className="ml-1 font-mono tabular-nums">({REVIEWS.filter(r => !r.reply).length})</span>}
              </button>
            ))}
          </div>

          {/* Review list */}
          <div className="divide-y divide-[var(--border)]">
            {filtered.map(review => (
              <div key={review.id} className="p-5 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>
                      {review.customer[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A18]">{review.customer}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} width="12" height="12" viewBox="0 0 14 14" fill={s <= review.rating ? "var(--gold)" : "var(--border)"}>
                              <path d="M7 1l1.5 3.2 3.5.5-2.5 2.4.6 3.4L7 9l-3.1 1.5.6-3.4L2 4.7l3.5-.5z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-[var(--muted)]">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!review.reply && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF2F2", color: "var(--danger)" }}>미답변</span>
                    )}
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--cream)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="7" cy="7" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="3" cy="7" r="1"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Review text */}
                <p className="text-sm text-[#1A1A18] leading-relaxed">{review.text}</p>

                {/* Photos */}
                {review.photos.length > 0 && (
                  <div className="flex gap-2">
                    {review.photos.map(photo => (
                      <div key={photo} className="w-20 h-20 rounded-xl overflow-hidden bg-[#D8D4CC]">
                        <img src={`https://images.unsplash.com/photo-${photo}?w=80&h=80&fit=crop&auto=format&q=80`} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing reply */}
                {review.reply && (
                  <div className="ml-4 pl-4 border-l-2 border-[var(--green-light)]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: "var(--green)" }}>사</div>
                      <span className="text-xs font-bold" style={{ color: "var(--green)" }}>사장님 답변</span>
                    </div>
                    <p className="text-sm text-[#1A1A18] leading-relaxed">{review.reply}</p>
                  </div>
                )}

                {/* Reply actions */}
                {!review.reply && (
                  <div>
                    {replyOpen === review.id ? (
                      <div className="space-y-2">
                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                          placeholder="리뷰에 답변을 작성하세요..."
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[#1A1A18] outline-none resize-none focus:border-[var(--green)] transition-colors placeholder:text-[var(--muted)]"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => { setReplyOpen(null); setReplyText(""); }}
                            className="px-3 py-2 rounded-lg text-xs font-semibold border border-[var(--border)] hover:bg-[var(--cream)] transition-colors">취소</button>
                          <button className="px-3 py-2 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: "var(--green)" }}>답변 등록</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setReplyOpen(review.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] hover:bg-[var(--cream)] transition-colors text-[#1A1A18]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M1 8.5L5 5l3 3 4-5"/>
                          </svg>
                          답변하기
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#FECACA] hover:bg-[#FEF2F2] transition-colors" style={{ color: "var(--danger)" }}>
                          신고하기
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
