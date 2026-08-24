import React, { useState } from "react";
import { A, Card, PageHeader, LineChart, BarChart, FilterChips } from "./AdminShared";

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
const REVENUE_DATA = [18.4, 21.2, 19.8, 24.3, 28.1, 34.1, 38.6, 41.2, 39.8, 44.7, 51.3, 58.2];
const ORDER_DATA = [1840, 2120, 1980, 2430, 2810, 3410, 3860, 4120, 3980, 4470, 5130, 5820];
const USER_GROWTH = [3200, 4100, 5800, 7200, 9400, 11200, 14500, 17800, 21200, 26500, 31200, 38400];
const CUISINE_DATA = [
  { name: "한식", pct: 35, color: A.green },
  { name: "터키식", pct: 22, color: A.gold },
  { name: "인도식", pct: 15, color: A.info },
  { name: "우즈벡", pct: 12, color: A.purple },
  { name: "아랍식", pct: 10, color: "#F97316" },
  { name: "기타", pct: 6, color: A.dim },
];

const PEAK_HOURS = [
  [0,0,0,0,0,0,0,1,2,3,5,8,12,15,10,9,14,18,22,25,20,14,8,3],
  [0,0,0,0,0,0,0,1,3,4,6,9,14,18,12,10,16,21,26,28,22,16,9,4],
  [0,0,0,0,0,0,0,0,2,3,5,7,11,14,10,8,13,17,20,23,18,12,7,2],
  [0,0,0,0,0,0,0,1,2,4,5,8,12,16,11,9,15,19,24,27,21,15,8,3],
  [0,0,0,0,0,0,0,2,4,5,7,10,15,20,13,11,18,24,30,34,27,19,11,5],
  [0,0,0,0,0,0,1,3,5,7,10,14,20,26,18,15,23,30,38,42,35,24,14,7],
  [0,0,0,0,0,0,0,2,4,6,9,13,18,22,15,13,19,25,32,36,28,20,12,5],
];
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const HOURS_24 = Array.from({ length: 24 }, (_, i) => `${i}`);
const heatColor = (v: number) => {
  if (v === 0) return A.borderLight;
  if (v < 5) return "#BBF7D0";
  if (v < 15) return "#4ADE80";
  if (v < 25) return "#16A34A";
  return A.green;
};

const TOP_AREAS = [
  { name: "이태원동", orders: 8420, pct: 32 },
  { name: "한남동", orders: 5210, pct: 20 },
  { name: "홍대", orders: 4110, pct: 16 },
  { name: "강남", orders: 3890, pct: 15 },
  { name: "용산동", orders: 2840, pct: 11 },
  { name: "마포구", orders: 1580, pct: 6 },
];

// ── Screen 15: Platform Analytics ─────────────────────────────────────────────
export const PlatformAnalytics = () => {
  const [range, setRange] = useState("12개월");

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "분석"]}
        title="플랫폼 분석"
        subtitle="HalalMap Korea 전체 운영 지표"
        actions={
          <FilterChips options={["7일", "30일", "12개월"]} value={range} onChange={setRange} />
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: "연간 총 매출", value: "₩419M", trend: "+124%", color: A.greenText, bg: A.greenLight },
          { label: "총 주문 수", value: "40,950건", trend: "+98%", color: A.infoText, bg: A.infoLight },
          { label: "신규 가입자", value: "38,400명", trend: "+185%", color: A.purpleText, bg: A.purpleLight },
          { label: "활성 레스토랑", value: "284개", trend: "+67%", color: A.goldText, bg: A.goldLight },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-xs font-medium" style={{ color: A.muted }}>{s.label}</p>
            <p className="font-mono font-bold text-2xl mt-2 tabular-nums" style={{ color: A.text }}>{s.value}</p>
            <p className="text-xs font-semibold mt-1.5" style={{ color: s.color }}>↑ {s.trend} 전년 대비</p>
          </Card>
        ))}
      </div>

      {/* Revenue + Orders trend */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>월별 매출 (₩M)</p>
          </div>
          <div className="px-4 py-4">
            <LineChart data={REVENUE_DATA} width={480} height={200} labels={MONTHS} color={A.green} />
          </div>
        </Card>
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>월별 주문 수</p>
          </div>
          <div className="px-4 py-4">
            <LineChart data={ORDER_DATA} width={480} height={200} labels={MONTHS} color={A.info} />
          </div>
        </Card>
      </div>

      {/* User growth + Cuisine dist */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>누적 가입자 수</p>
          </div>
          <div className="px-4 py-4">
            <LineChart data={USER_GROWTH} width={480} height={200} labels={MONTHS} color={A.purple} />
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>음식 종류 분포</p>
          </div>
          <div className="px-5 py-5 flex items-center gap-6">
            {/* Donut-style breakdown */}
            <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                {(() => {
                  let offset = 0;
                  const total = 100;
                  const r = 45, cx = 60, cy = 60;
                  const circ = 2 * Math.PI * r;
                  return CUISINE_DATA.map(c => {
                    const dash = (c.pct / total) * circ;
                    const gap = circ - dash;
                    const el = (
                      <circle key={c.name} cx={cx} cy={cy} r={r}
                        fill="none" stroke={c.color} strokeWidth="20"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 60 60)"/>
                    );
                    offset += dash;
                    return el;
                  });
                })()}
                <circle cx="60" cy="60" r="28" fill="white"/>
                <text x="60" y="65" textAnchor="middle" fontSize="11" fontWeight="700" fill={A.text}>주문 분포</text>
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              {CUISINE_DATA.map(c => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-xs" style={{ color: A.textMid }}>{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: A.borderLight }}>
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                    </div>
                    <span className="font-mono text-xs w-7 text-right" style={{ color: A.muted }}>{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Peak hours heatmap + Top areas */}
      <div className="grid grid-cols-3 gap-4">
        {/* Heatmap */}
        <div className="col-span-2">
          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>시간대별 주문 밀도 (피크 타임 히트맵)</p>
            </div>
            <div className="px-5 py-4 overflow-x-auto">
              <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-1" style={{ width: 20 }}>
                  <div style={{ height: 20 }} />
                  {DAYS.map(d => (
                    <div key={d} className="flex items-center justify-end" style={{ height: 20, fontSize: 10, color: A.dim }}>{d}</div>
                  ))}
                </div>
                {/* Grid */}
                <div>
                  {/* Hour labels */}
                  <div className="flex gap-0.5 mb-1">
                    {HOURS_24.filter((_, i) => i % 3 === 0).map(h => (
                      <div key={h} style={{ width: (HOURS_24.length * 28) / 8 / HOURS_24.length * 3 * 28 / 28, fontSize: 9, color: A.dim, textAlign: "center", marginRight: 2 * 28 }}>{h}시</div>
                    ))}
                  </div>
                  {PEAK_HOURS.map((row, di) => (
                    <div key={di} className="flex gap-0.5 mb-0.5">
                      {row.map((v, hi) => (
                        <div key={hi} title={`${DAYS[di]} ${hi}시: ${v}건`}
                          className="rounded-sm transition-colors cursor-pointer"
                          style={{ width: 24, height: 20, backgroundColor: heatColor(v) }} />
                      ))}
                    </div>
                  ))}
                  {/* Legend */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px]" style={{ color: A.dim }}>낮음</span>
                    {[0, 5, 15, 25, 35].map(v => (
                      <div key={v} className="w-4 h-3 rounded-sm" style={{ backgroundColor: heatColor(v) }} />
                    ))}
                    <span className="text-[10px]" style={{ color: A.dim }}>높음</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Top areas */}
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>인기 배달 구역</p>
          </div>
          <div className="px-5 py-3">
            {TOP_AREAS.map((a, i) => (
              <div key={a.name} className="py-3" style={{ borderBottom: i < TOP_AREAS.length - 1 ? `1px solid ${A.borderLight}` : "none" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-4" style={{ color: i === 0 ? A.gold : A.dim }}>{i+1}</span>
                    <span className="text-sm font-medium" style={{ color: A.textMid }}>{a.name}</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums" style={{ color: A.muted }}>{a.orders.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden ml-6" style={{ backgroundColor: A.borderLight }}>
                  <div className="h-full rounded-full" style={{ width: `${a.pct}%`, backgroundColor: i === 0 ? A.gold : A.green }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
