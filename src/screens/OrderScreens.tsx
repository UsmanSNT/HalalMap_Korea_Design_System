import React from "react";
import { StatusBar, BottomNav, BackButton, OrderStatusChip, TabId } from "../components/Shared";
import { useLanguage, useT, type Lang } from "../components/LanguageSwitcher";

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

const TR1 = {
  orderReceived: { ko: "주문 접수", en: "Order Received", uz: "Buyurtma qabul qilindi", ru: "Заказ принят" },
  cooking: { ko: "조리중", en: "Cooking", uz: "Tayyorlanmoqda", ru: "Готовится" },
  pickedUp: { ko: "픽업 완료", en: "Picked Up", uz: "Olib ketildi", ru: "Забрано" },
  outForDelivery: { ko: "배달중", en: "Out for Delivery", uz: "Yetkazilmoqda", ru: "В пути" },
  delivered: { ko: "배달 완료", en: "Delivered", uz: "Yetkazildi", ru: "Доставлено" },
  orderTracking: { ko: "주문 추적", en: "Order Tracking", uz: "Buyurtmani kuzatish", ru: "Отслеживание заказа" },
  arrivingIn: { ko: "도착까지 약", en: "Arriving in about", uz: "Yetib kelishga taxminan", ru: "Прибытие примерно через" },
  minutes: { ko: "분", en: " min", uz: " daqiqa", ru: " мин" },
  etaAt: { ko: "오후 3:05 도착 예정", en: "Expected at 3:05 PM", uz: "Taxminan 15:05 da yetib keladi", ru: "Ожидается к 15:05" },
  courierInfo: { ko: "배달 기사 정보", en: "Courier Info", uz: "Kuryer haqida ma'lumot", ru: "Информация о курьере" },
  deliveries: { ko: "회 배달", en: " deliveries", uz: " ta yetkazib berish", ru: " доставок" },
} satisfies Record<string, Record<Lang, string>>;

export const OrderTrackingScreen = ({ onTabChange }: { onTabChange?: (t: TabId) => void }) => {
  const t = useT(TR1);
  const trackSteps = [
    { label: t("orderReceived"), done: true },
    { label: t("cooking"), done: true, active: false },
    { label: t("pickedUp"), done: false, active: false },
    { label: t("outForDelivery"), done: false, active: true },
    { label: t("delivered"), done: false },
  ];
  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    {/* Map */}
    <div className="relative h-72 flex-shrink-0">
      <RouteSVG />
      <div className="absolute top-0 left-0 right-0">
        <StatusBar dark />
        <div className="flex items-center px-4 gap-3">
          <BackButton dark onBack={() => onTabChange?.("home")} />
          <h1 className="font-bold text-white text-lg">{t("orderTracking")}</h1>
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
          <p className="text-xs font-medium text-[var(--muted)]">{t("arrivingIn")}</p>
          <p className="font-bold text-4xl text-[#1A1A18] mt-1">18{t("minutes")}</p>
          <p className="text-sm text-[var(--muted)] mt-0.5">{t("etaAt")}</p>
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
          <p className="text-xs font-medium text-[var(--muted)] mb-3">{t("courierInfo")}</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E8E6E1] flex items-center justify-center text-xl flex-shrink-0">
              👨‍🦱
            </div>
            <div className="flex-1">
              <p className="font-bold text-base text-[#1A1A18]">김민준</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#C4883A"><path d="M6 1l1.2 2.5 2.8.4-2 2 .5 2.7L6 7.3 3.5 8.6l.5-2.7-2-2 2.8-.4L6 1z"/></svg>
                <span className="text-xs font-semibold text-[#1A1A18]">4.9</span>
                <span className="text-xs text-[var(--muted)]">· 8,241{t("deliveries")}</span>
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
};

// ── 26. Order History ──────────────────────────────────────────────────────────
const orderHistory = [
  {
    restaurant: "신당 할랄 키친",
    date: "2024.11.20",
    total: 34500,
    items: "할랄 갈비탕 외 2개",
    status: "delivered" as const,
    rated: false,
  },
  {
    restaurant: "이스탄불 케밥 & 피데",
    date: "2024.11.15",
    total: 21000,
    items: "케밥 세트 외 1개",
    status: "delivered" as const,
    rated: true,
  },
  {
    restaurant: "우즈베키스탄 플로프 하우스",
    date: "2024.11.10",
    total: 18500,
    items: "플로프 + 라그만",
    status: "delivered" as const,
    rated: true,
  },
  {
    restaurant: "델리 스파이스 하우스",
    date: "2024.11.05",
    total: 27000,
    items: "버터 치킨 커리 외 2개",
    status: "cancelled" as const,
    rated: false,
  },
];

const TR2 = {
  orderHistoryTitle: { ko: "주문 내역", en: "Order History", uz: "Buyurtmalar tarixi", ru: "История заказов" },
  inProgress: { ko: "진행중 (1)", en: "In Progress (1)", uz: "Jarayonda (1)", ru: "В процессе (1)" },
  completed: { ko: "완료 (12)", en: "Completed (12)", uz: "Tugallangan (12)", ru: "Завершено (12)" },
  ratePrompt: { ko: "이 주문 어떠셨나요? 리뷰 남기기", en: "How was your order? Leave a review", uz: "Buyurtma qanday bo'ldi? Sharh qoldiring", ru: "Как вам заказ? Оставьте отзыв" },
  reorder: { ko: "재주문", en: "Reorder", uz: "Qayta buyurtma berish", ru: "Повторить заказ" },
  receipt: { ko: "영수증", en: "Receipt", uz: "Chek", ru: "Чек" },
} satisfies Record<string, Record<Lang, string>>;

export const OrderHistoryScreen = ({ onTabChange }: { onTabChange?: (t: TabId) => void }) => {
  const t = useT(TR2);
  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="px-5 pb-3">
        <h1 className="font-bold text-xl text-[#1A1A18]">{t("orderHistoryTitle")}</h1>
        {/* Tabs */}
        <div className="flex gap-4 mt-3">
          {[t("inProgress"), t("completed")].map((tab, i) => (
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
      {orderHistory.map((order, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-bold text-base text-[#1A1A18]">{order.restaurant}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{order.date} · {order.items}</p>
              </div>
              <OrderStatusChip status={order.status} />
            </div>
            <p className="font-bold text-lg text-[#1A1A18]">₩{order.total.toLocaleString()}</p>

            {/* Rating prompt */}
            {!order.rated && order.status === "delivered" && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: "var(--gold-light)" }}>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="16" height="16" viewBox="0 0 16 16" fill="#C4883A">
                      <path d="M8 1.5l1.6 3.3 3.7.5-2.7 2.6.6 3.6L8 9.7l-3.2 1.8.6-3.6L2.7 5.3l3.7-.5L8 1.5z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-xs font-medium flex-1" style={{ color: "#7A5220" }}>{t("ratePrompt")}</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          {order.status !== "cancelled" && (
            <div className="flex border-t border-[var(--border)] divide-x divide-[var(--border)]">
              <button className="flex-1 py-3 text-sm font-semibold" style={{ color: "var(--green)" }}>
                {t("reorder")}
              </button>
              <button className="flex-1 py-3 text-sm font-medium text-[var(--muted)]">
                {t("receipt")}
              </button>
            </div>
          )}
        </div>
      ))}
      <div className="h-4" />
    </div>

    <BottomNav active="orders" onTabChange={onTabChange} />
  </div>
  );
};

// ── 27. Order Detail ───────────────────────────────────────────────────────────
const TR3 = {
  orderDetail: { ko: "주문 상세", en: "Order Detail", uz: "Buyurtma tafsilotlari", ru: "Детали заказа" },
  receipt: { ko: "영수증", en: "Receipt", uz: "Chek", ru: "Чек" },
  orderNumber: { ko: "주문번호", en: "Order Number", uz: "Buyurtma raqami", ru: "Номер заказа" },
  orderedAt: { ko: "주문일시: 2024년 11월 20일 오후 2:15", en: "Ordered: Nov 20, 2024, 2:15 PM", uz: "Buyurtma vaqti: 2024-yil 20-noyabr, 14:15", ru: "Время заказа: 20 ноября 2024, 14:15" },
  deliveredAt: { ko: "배달완료: 2024년 11월 20일 오후 3:02", en: "Delivered: Nov 20, 2024, 3:02 PM", uz: "Yetkazilgan vaqt: 2024-yil 20-noyabr, 15:02", ru: "Доставлено: 20 ноября 2024, 15:02" },
  islamicCertBadge: { ko: "이슬람 식품청 인증 · 한식 할랄", en: "Islamic Food Authority Certified · Korean Halal", uz: "Islom oziq-ovqat idorasi tasdiqlagan · Koreys halol taomi", ru: "Сертифицировано Исламским продовольственным управлением · Корейская халяльная кухня" },
  orderItems: { ko: "주문 항목", en: "Order Items", uz: "Buyurtma tarkibi", ru: "Позиции заказа" },
  qtyUnit: { ko: "개", en: "x", uz: " dona", ru: " шт" },
  paymentDetails: { ko: "결제 내역", en: "Payment Details", uz: "To'lov tafsilotlari", ru: "Детали оплаты" },
  subtotal: { ko: "소계", en: "Subtotal", uz: "Oraliq summa", ru: "Промежуточный итог" },
  deliveryFee: { ko: "배달비", en: "Delivery Fee", uz: "Yetkazib berish narxi", ru: "Стоимость доставки" },
  couponDiscount: { ko: "쿠폰 할인", en: "Coupon Discount", uz: "Kupon chegirmasi", ru: "Скидка по купону" },
  tip: { ko: "팁", en: "Tip", uz: "Choy puli", ru: "Чаевые" },
  total: { ko: "합계", en: "Total", uz: "Jami", ru: "Итого" },
  paymentMethod: { ko: "결제 수단: 신한카드 ····4521", en: "Payment: Shinhan Card ····4521", uz: "To'lov usuli: Shinhan karta ····4521", ru: "Способ оплаты: карта Shinhan ····4521" },
  deliveryInfo: { ko: "배달 정보", en: "Delivery Info", uz: "Yetkazib berish ma'lumoti", ru: "Информация о доставке" },
  deliveryAddress: { ko: "📍 서울특별시 용산구 이태원로 123, 501호", en: "📍 123 Itaewon-ro, Yongsan-gu, Seoul, Unit 501", uz: "📍 Seul, Yongsan-gu, Itaewon-ro 123, 501-xona", ru: "📍 Сеул, район Йонсан, Итэвон-ро 123, кв. 501" },
  courierNamePrefix: { ko: "🛵 배달 기사: 김민준 · ⭐ 4.9", en: "🛵 Courier: Minjun Kim · ⭐ 4.9", uz: "🛵 Kuryer: Kim Minjun · ⭐ 4.9", ru: "🛵 Курьер: Ким Минджун · ⭐ 4.9" },
  reorder: { ko: "재주문", en: "Reorder", uz: "Qayta buyurtma berish", ru: "Повторить заказ" },
  writeReview: { ko: "리뷰 쓰기", en: "Write a Review", uz: "Sharh yozish", ru: "Написать отзыв" },
} satisfies Record<string, Record<Lang, string>>;

export const OrderDetailScreen = () => {
  const t = useT(TR3);
  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-3">
        <BackButton />
        <h1 className="font-bold text-lg flex-1">{t("orderDetail")}</h1>
        <button className="text-sm font-medium" style={{ color: "var(--green)" }}>{t("receipt")}</button>
      </div>
    </div>

    <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
      {/* Status */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[var(--muted)]">{t("orderNumber")}</p>
            <p className="font-bold text-base text-[#1A1A18]">#HMK-20241120-7731</p>
          </div>
          <OrderStatusChip status="delivered" />
        </div>
        <div className="text-xs text-[var(--muted)] space-y-0.5">
          <p>{t("orderedAt")}</p>
          <p>{t("deliveredAt")}</p>
        </div>
      </div>

      {/* Restaurant */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--green-light)] flex items-center justify-center text-xl">🍖</div>
        <div>
          <p className="font-bold text-base text-[#1A1A18]">신당 할랄 키친</p>
          <p className="text-xs text-[var(--muted)]">{t("islamicCertBadge")}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <p className="font-semibold text-sm text-[#1A1A18]">{t("orderItems")}</p>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {[
            { name: "할랄 갈비탕", option: "보통", price: 13500, qty: 1 },
            { name: "비빔밥 (할랄)", option: "기본", price: 11000, qty: 2 },
            { name: "오이무침", option: "사이드", price: 3000, qty: 1 },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#1A1A18]">{item.name}</p>
                <p className="text-xs text-[var(--muted)]">{item.option} · {item.qty}{t("qtyUnit")}</p>
              </div>
              <p className="text-sm font-semibold text-[#1A1A18]">₩{(item.price * item.qty).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2.5">
        <p className="font-semibold text-sm text-[#1A1A18]">{t("paymentDetails")}</p>
        {[
          { label: t("subtotal"), val: "₩38,500" },
          { label: t("deliveryFee"), val: "₩2,000" },
          { label: t("couponDiscount"), val: "-₩6,000", accent: true },
          { label: t("tip"), val: "₩0" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span style={{ color: "var(--muted)" }}>{row.label}</span>
            <span className={row.accent ? "font-semibold" : ""} style={{ color: row.accent ? "var(--danger)" : "#1A1A18" }}>{row.val}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
          <span>{t("total")}</span>
          <span>₩34,500</span>
        </div>
        <p className="text-xs text-[var(--muted)]">{t("paymentMethod")}</p>
      </div>

      {/* Delivery info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
        <p className="font-semibold text-sm text-[#1A1A18]">{t("deliveryInfo")}</p>
        <p className="text-sm text-[var(--muted)]">{t("deliveryAddress")}</p>
        <p className="text-sm text-[var(--muted)]">{t("courierNamePrefix")}</p>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 py-4 rounded-2xl font-bold text-white text-base" style={{ backgroundColor: "var(--green)" }}>
          {t("reorder")}
        </button>
        <button className="flex-1 py-4 rounded-2xl font-semibold text-sm border" style={{ color: "var(--green)", borderColor: "var(--green)" }}>
          {t("writeReview")}
        </button>
      </div>
      <div className="h-4" />
    </div>
  </div>
  );
};
