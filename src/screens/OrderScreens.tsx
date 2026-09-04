import React, { useState, useEffect } from "react";
import { StatusBar, BottomNav, BackButton, OrderStatusChip, TabId } from "../components/Shared";
import { getOrders, getOrder, type Order } from "../api/orders";
import type { ScreenId } from "../App";
import { LocalizedText as T } from "../i18n";

// ── 25. Active Order Tracking ──────────────────────────────────────────────────
// Fake route map
const RouteSVG = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 320" xmlns="http://www.w3.org/2000/svg">
    <rect width="390" height="320" fill="#E8E4DC"/>
    {/* Roads */}
    <rect x="0" y="100" width="390" height="12" fill="#F5F2EC"/>
    <rect x="0" y="220" width="390" height="12" fill="#F5F2EC"/>
    <rect x="120" y="0" width="12" height="320" fill="#F5F2EC"/>
    <rect x="280" y="0" width="12" height="320" fill="#F5F2EC"/>
    {/* Blocks */}
    {[[10,15,100,80],[10,120,100,90],[10,240,100,70],[140,15,130,80],[140,120,130,90],[140,240,130,70],[300,15,80,80],[300,120,80,90],[300,240,80,70]].map(([x,y,w,h],i)=>(
      <rect key={i} x={x} y={y} width={w} height={h} fill="#D8D4CC" rx="3" opacity="0.6"/>
    ))}
    {/* Route path */}
    <path d="M70 260 Q70 232 126 232 Q290 232 286 126 Q286 60 200 60" stroke="#1B6B4A" strokeWidth="4" fill="none" strokeDasharray="8 4" strokeLinecap="round" opacity="0.7"/>
    {/* Restaurant */}
    <g transform="translate(185,45)">
      <circle r="14" fill="var(--green)" stroke="white" strokeWidth="2"/>
      <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12">🍖</text>
    </g>
    {/* Courier (animated would require CSS, using static) */}
    <g transform="translate(175,160)">
      <circle r="12" fill="#5B21B6" stroke="white" strokeWidth="2"/>
      <text x="0" y="4" textAnchor="middle" fill="white" fontSize="11">🛵</text>
    </g>
    {/* User */}
    <g transform="translate(55,255)">
      <circle r="12" fill="var(--info)" stroke="white" strokeWidth="2"/>
      <circle r="18" fill="rgba(44,123,229,0.2)"/>
      <text x="0" y="4" textAnchor="middle" fill="white" fontSize="11">🏠</text>
    </g>
  </svg>
);

const trackSteps = [
  { label: "주문 접수", done: true },
  { label: "조리중", done: true, active: false },
  { label: "픽업 완료", done: false, active: false },
  { label: "배달중", done: false, active: true },
  { label: "배달 완료", done: false },
];

export const OrderTrackingScreen = ({ onTabChange, onNavigate }: { onTabChange?: (t: TabId) => void; onNavigate?: (s: ScreenId) => void }) => (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    {/* Map */}
    <div className="relative h-72 flex-shrink-0">
      <RouteSVG />
      <div className="absolute top-0 left-0 right-0">
        <StatusBar dark />
        <div className="flex items-center px-4 gap-3">
          <BackButton dark onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-white text-lg"><T ko="주문 추적" en="Track order" uz="Buyurtmani kuzatish" /></h1>
        </div>
      </div>
    </div>

    {/* Bottom sheet */}
    <div className="flex-1 bg-white rounded-t-3xl -mt-4 shadow-lg phone-scroll">
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
      </div>

      <div className="px-5 pb-6 space-y-4">
        {/* ETA */}
        <div className="text-center pt-1">
          <p className="text-xs font-medium text-[var(--muted)]"><T ko="도착까지 약" en="Estimated arrival" uz="Taxminiy yetib kelish" /></p>
          <p className="font-bold text-4xl text-[#1A1A18] mt-1">18분</p>
          <p className="text-sm text-[var(--muted)] mt-0.5">오후 3:05 도착 예정</p>
        </div>

        {/* Status stepper */}
        <div className="flex items-center justify-between py-3">
          {trackSteps.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center gap-1.5 relative flex-1">
              {i < trackSteps.length - 1 && (
                <div
                  className="absolute top-3.5 left-1/2 w-full h-0.5"
                  style={{ backgroundColor: step.done ? "var(--green)" : "var(--border)" }}
                />
              )}
              <div
                className="w-7 h-7 rounded-full z-10 flex items-center justify-center border-2 transition-all"
                style={{
                  backgroundColor: step.active ? "var(--green)" : step.done ? "var(--green)" : "white",
                  borderColor: step.done || step.active ? "var(--green)" : "var(--border)",
                }}
              >
                {step.active ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                ) : step.done ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M1 5l3 3 7-7"/></svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[var(--border)]" />
                )}
              </div>
              <p className="text-[9px] font-medium text-center leading-tight text-[var(--muted)] whitespace-nowrap">{step.label}</p>
            </div>
          ))}
        </div>

        {/* Order info */}
        <div className="bg-[var(--cream)] rounded-2xl p-3 flex items-center gap-2">
          <span className="text-base">📦</span>
          <p className="text-sm text-[#1A1A18] flex-1">신당 할랄 키친 · <span className="font-semibold">할랄 갈비탕 외 2개</span></p>
        </div>

        {/* Courier card */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-4">
          <p className="text-xs font-medium text-[var(--muted)] mb-3"><T ko="배달 기사 정보" en="Courier information" uz="Kuryer ma'lumoti" /></p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E8E6E1] flex items-center justify-center text-xl flex-shrink-0">
              👨‍🦱
            </div>
            <div className="flex-1">
              <p className="font-bold text-base text-[#1A1A18]">김민준</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#C4883A"><path d="M6 1l1.2 2.5 2.8.4-2 2 .5 2.7L6 7.3 3.5 8.6l.5-2.7-2-2 2.8-.4L6 1z"/></svg>
                <span className="text-xs font-semibold text-[#1A1A18]">4.9</span>
                <span className="text-xs text-[var(--muted)]">· 8,241회 배달</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--green)" strokeWidth="1.6">
                  <path d="M5 3a2 2 0 012-2h.5l1 3-1.5 1.5A11 11 0 0013 11l1.5-1.5 3 1V11a2 2 0 01-2 2A13 13 0 013 5z"/>
                </svg>
              </button>
              <button className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--green)" strokeWidth="1.6">
                  <path d="M3 3h4l2 4-2.5 1.5A11 11 0 0011.5 12l1.5-2.5 4 2v3a1 1 0 01-1 1A16 16 0 012 4a1 1 0 011-1z" strokeWidth="0"/>
                  <rect x="2" y="12" width="14" height="3" rx="1" fill="none" stroke="var(--green)"/>
                  <path d="M5 9l2 3h6l2-3" strokeLinecap="round"/>
                  <circle cx="9" cy="5" r="3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomNav active="orders" onTabChange={onTabChange} />
  </div>
);

// ── 26. Order History ──────────────────────────────────────────────────────────
export const OrderHistoryScreen = ({ onTabChange, onNavigate }: { onTabChange?: (t: TabId) => void; onNavigate?: (s: ScreenId) => void }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const delivered = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");
  const active = orders.filter((o) => o.status === "preparing" || o.status === "delivering");

  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="px-5 pb-3">
        <h1 className="font-bold text-xl text-[#1A1A18]"><T ko="주문 내역" en="Order history" uz="Buyurtmalar tarixi" /></h1>
        <div className="flex gap-4 mt-3">
          {[`진행중 (${active.length})`, `완료 (${delivered.length})`].map((tab, i) => (
            <button
              key={tab}
              className="pb-2 text-sm font-semibold border-b-2 transition-all"
              style={{
                borderColor: i === 1 ? "var(--green)" : "transparent",
                color: i === 1 ? "var(--green)" : "var(--muted)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
      {loading ? (
        <p className="text-center text-sm text-[var(--muted)] py-8"><T ko="로딩중..." en="Loading..." uz="Yuklanmoqda..." /></p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-base text-[#1A1A18]">{order.restaurant}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{order.date} · {order.items}</p>
                </div>
                <OrderStatusChip status={order.status} />
              </div>
              <p className="font-bold text-lg text-[#1A1A18]">₩{order.total.toLocaleString()}</p>

              {!order.rated && order.status === "delivered" && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: "var(--gold-light)" }}>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} width="16" height="16" viewBox="0 0 16 16" fill="#C4883A">
                        <path d="M8 1.5l1.6 3.3 3.7.5-2.7 2.6.6 3.6L8 9.7l-3.2 1.8.6-3.6L2.7 5.3l3.7-.5L8 1.5z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs font-medium flex-1" style={{ color: "#7A5220" }}>이 주문 어떠셨나요? 리뷰 남기기</p>
                </div>
              )}
            </div>

            {order.status !== "cancelled" && (
              <div className="flex border-t border-[var(--border)] divide-x divide-[var(--border)]">
                <button className="flex-1 py-3 text-sm font-semibold" style={{ color: "var(--green)" }}>
                  <T ko="재주문" en="Order again" uz="Qayta buyurtma" />
                </button>
                <button className="flex-1 py-3 text-sm font-medium text-[var(--muted)]">
                  <T ko="영수증" en="Receipt" uz="Chek" />
                </button>
              </div>
            )}
          </div>
        ))
      )}
      <div className="h-4" />
    </div>

    <BottomNav active="orders" onTabChange={onTabChange} />
  </div>
  );
};

// ── 27. Order Detail ───────────────────────────────────────────────────────────
export const OrderDetailScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrder("order-1").then(setOrder).catch(() => {});
  }, []);

  if (!order) {
    return (
      <div className="flex flex-col h-full bg-[var(--cream)]">
        <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
          <StatusBar />
          <div className="flex items-center gap-3 px-4 pb-3">
            <BackButton onBack={() => onNavigate?.("home")} />
            <h1 className="font-bold text-lg flex-1"><T ko="주문 상세" en="Order details" uz="Buyurtma tafsilotlari" /></h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[var(--muted)]"><T ko="로딩중..." en="Loading..." uz="Yuklanmoqda..." /></p>
        </div>
      </div>
    );
  }

  const paymentRows = [
    { label: "소계", val: `₩${(order.subtotal ?? 0).toLocaleString()}` },
    { label: "배달비", val: `₩${(order.deliveryFee ?? 0).toLocaleString()}` },
    { label: "쿠폰 할인", val: `-₩${(order.couponDiscount ?? 0).toLocaleString()}`, accent: true },
    { label: "팁", val: `₩${(order.tip ?? 0).toLocaleString()}` },
  ];

  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-3">
        <BackButton onBack={() => onNavigate?.("home")} />
        <h1 className="font-bold text-lg flex-1"><T ko="주문 상세" en="Order details" uz="Buyurtma tafsilotlari" /></h1>
        <button className="text-sm font-medium" style={{ color: "var(--green)" }}><T ko="영수증" en="Receipt" uz="Chek" /></button>
      </div>
    </div>

    <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[var(--muted)]">주문번호</p>
            <p className="font-bold text-base text-[#1A1A18]">{order.orderNumber}</p>
          </div>
          <OrderStatusChip status={order.status} />
        </div>
        <div className="text-xs text-[var(--muted)] space-y-0.5">
          <p>주문일시: {order.orderDate}</p>
          {order.deliveredDate && <p>배달완료: {order.deliveredDate}</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--green-light)] flex items-center justify-center text-xl">🍖</div>
        <div>
          <p className="font-bold text-base text-[#1A1A18]">{order.restaurant}</p>
          <p className="text-xs text-[var(--muted)]">{order.items}</p>
        </div>
      </div>

      {order.orderItems && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="font-semibold text-sm text-[#1A1A18]"><T ko="주문 항목" en="Order items" uz="Buyurtma tarkibi" /></p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {order.orderItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#1A1A18]">{item.name}</p>
                  <p className="text-xs text-[var(--muted)]">{item.option} · {item.qty}개</p>
                </div>
                <p className="text-sm font-semibold text-[#1A1A18]">₩{(item.price * item.qty).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2.5">
        <p className="font-semibold text-sm text-[#1A1A18]"><T ko="결제 내역" en="Payment details" uz="To'lov tafsilotlari" /></p>
        {paymentRows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span style={{ color: "var(--muted)" }}>{row.label}</span>
            <span className={row.accent ? "font-semibold" : ""} style={{ color: row.accent ? "var(--danger)" : "#1A1A18" }}>{row.val}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
          <span>합계</span>
          <span>₩{order.total.toLocaleString()}</span>
        </div>
        {order.paymentMethod && <p className="text-xs text-[var(--muted)]">결제 수단: {order.paymentMethod}</p>}
      </div>

      {order.deliveryAddress && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <p className="font-semibold text-sm text-[#1A1A18]"><T ko="배달 정보" en="Delivery information" uz="Yetkazib berish ma'lumoti" /></p>
          <p className="text-sm text-[var(--muted)]">📍 {order.deliveryAddress}</p>
          {order.courier && <p className="text-sm text-[var(--muted)]">🛵 배달 기사: {order.courier.name} · ⭐ {order.courier.rating}</p>}
        </div>
      )}

      <div className="flex gap-3">
        <button className="flex-1 py-4 rounded-2xl font-bold text-white text-base" style={{ backgroundColor: "var(--green)" }}>
          <T ko="재주문" en="Order again" uz="Qayta buyurtma" />
        </button>
        <button className="flex-1 py-4 rounded-2xl font-semibold text-sm border" style={{ color: "var(--green)", borderColor: "var(--green)" }}>
          <T ko="리뷰 쓰기" en="Write a review" uz="Sharh yozish" />
        </button>
      </div>
      <div className="h-4" />
    </div>
  </div>
  );
};
