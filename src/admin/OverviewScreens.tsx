import React, { useState } from "react";
import { A, KPICard, Card, LineChart, StatusChip, PageHeader } from "./AdminShared";

// ── Mock data ──────────────────────────────────────────────────────────────────
const WEEK_ORDERS = [184, 217, 195, 243, 288, 341, 276];
const WEEK_REVENUE = [2840000, 3250000, 2990000, 3780000, 4420000, 5130000, 4280000];
const WEEK_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

const RECENT_ACTIVITIES = [
  { id: "1", time: "2분 전", type: "restaurant", icon: "🍽️", color: A.greenLight, msg: "이스탄불 케밥 하우스 승인 대기 등록", action: "검토하기" },
  { id: "2", time: "8분 전", type: "order", icon: "📦", color: A.infoLight, msg: "주문 #HMK-8901 환불 요청 접수", action: "처리하기" },
  { id: "3", time: "15분 전", type: "user", icon: "👤", color: A.purpleLight, msg: "사용자 Ahmed Hassan 계정 신고 접수 (3건)", action: "검토하기" },
  { id: "4", time: "32분 전", type: "cert", icon: "✅", color: A.greenLight, msg: "신당 할랄 키친 할랄 인증 갱신 승인", action: "" },
  { id: "5", time: "1시간 전", type: "courier", icon: "🏍️", color: A.goldLight, msg: "신규 배달 파트너 Abdul Karim 서류 심사 완료", action: "승인하기" },
  { id: "6", time: "2시간 전", type: "scan", icon: "🔍", color: A.infoLight, msg: "할랄 데이터베이스: 신규 바코드 47개 추가 요청", action: "검토하기" },
];

const HEALTH = [
  { label: "API 응답시간", value: "142ms", status: "good" as const, target: "< 200ms" },
  { label: "주문 처리율", value: "99.8%", status: "good" as const, target: "> 99%" },
  { label: "결제 성공률", value: "98.4%", status: "good" as const, target: "> 98%" },
  { label: "앱 충돌률", value: "0.12%", status: "warn" as const, target: "< 0.1%" },
  { label: "DB 응답시간", value: "28ms", status: "good" as const, target: "< 50ms" },
  { label: "CDN 가용성", value: "100%", status: "good" as const, target: "100%" },
];

const TOP_RESTAURANTS = [
  { name: "신당 할랄 키친", orders: 3241, revenue: 48_620_000, rating: 4.8 },
  { name: "이스탄불 케밥 하우스", orders: 2108, revenue: 31_620_000, rating: 4.5 },
  { name: "마스지드 서울 카페", orders: 1876, revenue: 22_512_000, rating: 4.9 },
  { name: "우즈베키스탄 플로프", orders: 892, revenue: 14_272_000, rating: 4.7 },
  { name: "델리 스파이스 코리아", orders: 567, revenue: 9_639_000, rating: 4.3 },
];

// ── Screen 1: Admin Home ───────────────────────────────────────────────────────
export const AdminHome = () => {
  const [chartMetric, setChartMetric] = useState<"orders" | "revenue">("orders");

  const chartData = chartMetric === "orders" ? WEEK_ORDERS : WEEK_REVENUE;

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "대시보드"]}
        title="플랫폼 개요"
        subtitle="2024년 11월 24일 (일) · 오늘 업데이트"
        actions={
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: A.greenLight, color: A.greenText }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: A.green }} />
            실시간 · Live
          </div>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <KPICard label="총 사용자" value="48,291" trend={12.4} icon="👥" iconBg={A.infoLight} iconColor={A.infoText} />
        <KPICard label="활성 레스토랑" value="284" trend={8.2} icon="🍽️" iconBg={A.greenLight} iconColor={A.greenText} />
        <KPICard label="오늘 주문" value="1,847" trend={5.6} icon="📦" iconBg={A.purpleLight} iconColor={A.purpleText} />
        <KPICard label="오늘 매출" value="₩27.4M" trend={18.3} icon="💰" iconBg={A.goldLight} iconColor={A.goldText} />
        <KPICard label="활성 배달파트너" value="142" trend={-3.1} icon="🏍️" iconBg={A.warningLight} iconColor={A.warningText} />
        <KPICard label="승인 대기" value="23" trend={0} icon="⏳" iconBg={A.dangerLight} iconColor={A.dangerText} />
      </div>

      {/* Charts + activity row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Main chart */}
        <div className="col-span-2">
          <Card>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: A.text }}>주간 트렌드</p>
                <p className="text-xs mt-0.5" style={{ color: A.muted }}>최근 7일</p>
              </div>
              <div className="flex gap-1">
                {(["orders", "revenue"] as const).map(m => (
                  <button key={m} onClick={() => setChartMetric(m)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: chartMetric === m ? A.green : A.bg,
                      color: chartMetric === m ? "#fff" : A.muted,
                    }}>
                    {m === "orders" ? "주문" : "매출"}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-4">
              <LineChart data={chartData} width={620} height={220} labels={WEEK_LABELS}
                color={chartMetric === "orders" ? A.green : A.gold} />
            </div>
          </Card>
        </div>

        {/* Activity feed */}
        <Card>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>최근 활동</p>
            <button className="text-xs font-medium" style={{ color: A.green }}>모두 보기</button>
          </div>
          <div className="divide-y" style={{ borderColor: A.borderLight }}>
            {RECENT_ACTIVITIES.map(act => (
              <div key={act.id} className="flex items-start gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: act.color }}>
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed" style={{ color: A.textMid }}>{act.msg}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px]" style={{ color: A.dim }}>{act.time}</span>
                    {act.action && (
                      <button className="text-[11px] font-semibold" style={{ color: A.green }}>{act.action}</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: health + top restaurants */}
      <div className="grid grid-cols-2 gap-4">
        {/* Platform health */}
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>플랫폼 헬스</p>
          </div>
          <div className="px-5 py-3 grid grid-cols-2 gap-x-6">
            {HEALTH.map(h => (
              <div key={h.label} className="flex items-center justify-between py-2.5"
                style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                <div>
                  <p className="text-xs font-medium" style={{ color: A.textMid }}>{h.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: A.dim }}>목표: {h.target}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: h.status === "good" ? A.green : A.warning }} />
                  <span className="font-mono text-sm font-bold tabular-nums"
                    style={{ color: h.status === "good" ? A.greenText : A.warningText }}>{h.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top restaurants */}
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>매출 TOP 레스토랑</p>
          </div>
          <div className="px-5 py-2">
            {TOP_RESTAURANTS.map((r, i) => {
              const maxRev = TOP_RESTAURANTS[0].revenue;
              return (
                <div key={r.name} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < TOP_RESTAURANTS.length - 1 ? `1px solid ${A.borderLight}` : "none" }}>
                  <span className="w-6 text-center text-xs font-bold" style={{ color: i === 0 ? A.gold : A.dim }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate" style={{ color: A.textMid }}>{r.name}</p>
                      <p className="font-mono text-xs tabular-nums ml-3 flex-shrink-0" style={{ color: A.text }}>
                        ₩{(r.revenue / 1_000_000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: A.borderLight }}>
                      <div className="h-full rounded-full" style={{ width: `${(r.revenue / maxRev) * 100}%`, backgroundColor: i === 0 ? A.gold : A.green }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
