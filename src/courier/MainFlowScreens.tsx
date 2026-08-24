import React, { useState, useEffect } from "react";
import { C, CStatusBar, CBottomNav, SwipeConfirm, DarkRouteMap, EarningsChip } from "./CourierShared";

// ── 4. Go Online / Home ────────────────────────────────────────────────────────
export const GoOnlineScreen = ({ onGoOnline }: { onGoOnline?: () => void }) => {
  const [online, setOnline] = useState(false);
  const [seconds, setSeconds] = useState(7284); // 2:01:24

  useEffect(() => {
    if (!online) return;
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [online]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const toggle = () => {
    setOnline(o => !o);
    if (!online) onGoOnline?.();
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar online={online} />

      {/* Zone + date bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={online ? C.green : C.muted} strokeWidth="1.8" strokeLinecap="round">
            <path d="M7 1C4.8 1 3 2.8 3 5C3 8 7 12.5 7 12.5S11 8 11 5C11 2.8 9.2 1 7 1ZM7 6.5A1.5 1.5 0 117 3.5a1.5 1.5 0 010 3z"/>
          </svg>
          <span className="text-sm font-semibold" style={{ color: C.text }}>이태원 · 한남</span>
        </div>
        <span className="text-xs font-mono tabular-nums" style={{ color: C.muted }}>
          11월 24일 일요일
        </span>
      </div>

      {/* Main toggle area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Big toggle circle */}
        <div className="relative flex items-center justify-center" onClick={toggle}>
          {/* Outer pulse ring */}
          {online && (
            <>
              <div className="absolute w-56 h-56 rounded-full" style={{ backgroundColor: `${C.green}08` }} />
              <div className="absolute w-48 h-48 rounded-full animate-ping" style={{ backgroundColor: `${C.green}10` }} />
            </>
          )}
          {/* Main button */}
          <div className="w-44 h-44 rounded-full flex flex-col items-center justify-center gap-2 cursor-pointer select-none transition-all duration-300"
            style={{
              background: online
                ? `radial-gradient(circle, ${C.green} 0%, ${C.greenDark} 100%)`
                : `linear-gradient(145deg, ${C.card} 0%, ${C.surface} 100%)`,
              border: `3px solid ${online ? C.green : C.borderBright}`,
              boxShadow: online ? `0 0 40px ${C.green}40` : "none",
            }}>
            {online ? (
              <>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="10" y="10" width="16" height="16" rx="2" fill="white"/>
                </svg>
                <span className="font-bold text-lg text-white">배달 중</span>
                <span className="text-xs text-white/70">탭하여 종료</span>
              </>
            ) : (
              <>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="14" stroke={C.borderBright} strokeWidth="2"/>
                  <path d="M15 11v14l10-7z" fill={C.green}/>
                </svg>
                <span className="font-bold text-lg" style={{ color: C.text }}>시작하기</span>
                <span className="text-xs" style={{ color: C.muted }}>탭하여 시작</span>
              </>
            )}
          </div>
        </div>

        {/* Online timer */}
        {online && (
          <div className="font-mono text-3xl font-bold tabular-nums" style={{ color: C.green }}>
            {fmt(seconds)}
          </div>
        )}

        {/* Today stats */}
        <div className="w-full rounded-3xl p-5" style={{ backgroundColor: C.card }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.dim }}>오늘 현황</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-mono text-2xl font-bold tabular-nums" style={{ color: C.gold }}>₩47,500</p>
              <p className="text-xs mt-1" style={{ color: C.muted }}>오늘 수익</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold tabular-nums" style={{ color: C.text }}>8</p>
              <p className="text-xs mt-1" style={{ color: C.muted }}>완료 건수</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold tabular-nums" style={{ color: C.text }}>2:01</p>
              <p className="text-xs mt-1" style={{ color: C.muted }}>온라인 시간</p>
            </div>
          </div>
          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: online ? C.green : C.dim }} />
              <p className="text-sm font-semibold" style={{ color: online ? C.green : C.muted }}>
                {online ? "배달 가능" : "오프라인"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round">
                <path d="M7 1l1.5 3 3.5.5-2.5 2.5.6 3.5L7 9l-3.1 1.5.6-3.5L2 4.5l3.5-.5z"/>
              </svg>
              <p className="font-mono text-sm font-bold tabular-nums" style={{ color: C.gold }}>4.9</p>
            </div>
          </div>
        </div>
      </div>

      <CBottomNav active="home" />
    </div>
  );
};

// ── 5. Available Orders Feed ───────────────────────────────────────────────────
const AVAILABLE_ORDERS = [
  { id: "HMK-8855", restaurant: "신당 할랄 키친", pickupDist: 0.8, delivDist: 2.1, items: 3, earnings: 4200, timeLimit: 15, cuisineEmoji: "🍲" },
  { id: "HMK-8856", restaurant: "이스탄불 케밥", pickupDist: 1.3, delivDist: 1.8, items: 2, earnings: 3800, timeLimit: 8, cuisineEmoji: "🥙" },
  { id: "HMK-8857", restaurant: "마스지드 서울 카페", pickupDist: 0.4, delivDist: 3.2, items: 4, earnings: 5100, timeLimit: 20, cuisineEmoji: "☕" },
  { id: "HMK-8858", restaurant: "우즈베키스탄 플로프", pickupDist: 2.2, delivDist: 1.5, items: 1, earnings: 3200, timeLimit: 18, cuisineEmoji: "🍛" },
];

export const OrderFeedScreen = ({ onAccept }: { onAccept?: () => void }) => {
  const [orders, setOrders] = useState(AVAILABLE_ORDERS);
  const [zone, setZone] = useState("이태원 · 한남");

  const accept = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    onAccept?.();
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar online />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div>
          <p className="font-bold text-base" style={{ color: C.text }}>근처 배달 요청</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
            <p className="text-xs font-medium" style={{ color: C.green }}>배달 가능 · {zone}</p>
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tabular-nums" style={{ color: C.gold }}>
          {orders.length}건
        </div>
      </div>

      {/* Order cards */}
      <div className="flex-1 phone-scroll px-4 py-3 space-y-3">
        {orders.map(order => (
          <div key={order.id} className="rounded-3xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.borderBright}` }}>
            {/* Time limit bar */}
            <div className="h-1 rounded-none" style={{ backgroundColor: C.border }}>
              <div className="h-full rounded-none transition-all" style={{
                width: `${(order.timeLimit / 20) * 100}%`,
                backgroundColor: order.timeLimit < 10 ? C.danger : C.gold,
              }} />
            </div>

            <div className="p-4 space-y-3">
              {/* Restaurant row */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: C.cardAlt }}>
                  {order.cuisineEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate" style={{ color: C.text }}>{order.restaurant}</p>
                  <p className="text-xs font-mono" style={{ color: C.muted }}>픽업 {order.pickupDist}km · 배달 {order.delivDist}km</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono font-bold text-xl tabular-nums" style={{ color: C.gold }}>
                    ₩{order.earnings.toLocaleString()}
                  </p>
                  <p className="text-[10px]" style={{ color: C.muted }}>예상 수익</p>
                </div>
              </div>

              {/* Details row */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: C.cardAlt }}>
                  <span className="text-xs font-semibold" style={{ color: C.muted }}>{order.items}개 항목</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: C.cardAlt }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="6" cy="6" r="4.5"/><path d="M6 3v3l2 1.5"/>
                  </svg>
                  <span className="text-xs font-semibold" style={{ color: order.timeLimit < 10 ? C.danger : C.muted }}>
                    {order.timeLimit}초 남음
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: C.blueGlow }}>
                  <span className="text-xs font-semibold" style={{ color: C.blue }}>
                    {Math.round(order.pickupDist / 15 * 60)}분 예상
                  </span>
                </div>
              </div>

              {/* Accept button */}
              <button onClick={() => accept(order.id)}
                className="w-full py-4 rounded-2xl font-bold text-base transition-opacity active:opacity-80"
                style={{ backgroundColor: C.green, color: "#0E1620" }}>
                수락하기 →
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: C.card }}>
              🔍
            </div>
            <p className="font-bold text-base" style={{ color: C.text }}>근처 주문 없음</p>
            <p className="text-sm text-center" style={{ color: C.muted }}>이태원/한남 지역에 새 주문이 들어오면<br/>알림을 보내드립니다</p>
          </div>
        )}
        <div className="h-2" />
      </div>

      <CBottomNav active="deliveries" />
    </div>
  );
};

// ── 6. Order Accepted — Pickup Map ─────────────────────────────────────────────
export const OrderAcceptedScreen = ({ onArrive }: { onArrive?: () => void }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundColor: C.bg }}>
      <div className="absolute top-0 left-0 right-0 z-10">
        <CStatusBar online />
      </div>

      {/* Map fills top half */}
      <div className="flex-shrink-0" style={{ marginTop: "40px" }}>
        <DarkRouteMap mode="toRestaurant" height={340} />
      </div>

      {/* Bottom card */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-2 space-y-3" style={{ backgroundColor: C.bg }}>
        {/* Status pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: C.greenGlow }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
            <span className="text-xs font-bold" style={{ color: C.green }}>식당으로 이동 중</span>
          </div>
          <span className="font-mono text-xs font-bold tabular-nums" style={{ color: C.muted }}>도착 예정 6분</span>
        </div>

        {/* Restaurant info */}
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ backgroundColor: C.card }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: C.cardAlt }}>🍲</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate" style={{ color: C.text }}>신당 할랄 키친</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>서울 용산구 이태원로 23-4</p>
            <div className="flex items-center gap-2 mt-1">
              <EarningsChip amount={4200} />
              <span className="text-xs" style={{ color: C.muted }}>· 0.8km</span>
            </div>
          </div>
          <button className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.green }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0E1620" strokeWidth="2.2" strokeLinecap="round">
              <path d="M10 2C6 2 3 5 3 9C3 14 10 20 10 20S17 14 17 9C17 5 14 2 10 2Z"/>
              <circle cx="10" cy="9" r="2.5" fill="#0E1620" stroke="none"/>
            </svg>
          </button>
        </div>

        {/* Navigate button */}
        <button className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
          style={{ backgroundColor: C.blue, color: "white" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M3 17L17 3M17 3H9M17 3v8"/>
          </svg>
          Naver Map으로 길 안내
        </button>

        {/* Order summary pull */}
        <button onClick={() => setDetailsOpen(!detailsOpen)}
          className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          style={{ backgroundColor: C.card, color: C.text }}>
          주문 상세 {detailsOpen ? "▲" : "▼"}
        </button>

        {detailsOpen && (
          <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: C.card }}>
            <p className="font-mono text-xs font-bold tabular-nums" style={{ color: C.muted }}>#HMK-8855</p>
            {["할랄 갈비탕 ×1 · ₩13,500", "비빔밥 (할랄) ×2 · ₩22,000", "파전 ×1 · ₩9,000"].map(item => (
              <p key={item} className="text-sm" style={{ color: C.text }}>{item}</p>
            ))}
            <div className="pt-2 flex justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
              <p className="font-bold text-sm" style={{ color: C.text }}>합계</p>
              <p className="font-mono font-bold text-sm tabular-nums" style={{ color: C.text }}>₩49,500</p>
            </div>
            <div className="rounded-xl px-3 py-2.5 text-xs" style={{ backgroundColor: C.goldGlow, color: C.gold }}>
              📝 특별 요청: 갈비탕 국물 많이 주세요
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── 7. At Restaurant ───────────────────────────────────────────────────────────
export const AtRestaurantScreen = ({ onPickedUp }: { onPickedUp?: () => void }) => {
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const items = ["할랄 갈비탕 ×1", "비빔밥 (할랄) ×2", "파전 ×1"];
  const allChecked = checked.every(Boolean);

  const toggle = (i: number) => setChecked(prev => prev.map((v, j) => j === i ? !v : v));

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar online />

      {/* Header */}
      <div className="px-5 py-4 text-center" style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.green }} />
          <p className="font-bold text-lg" style={{ color: C.green }}>식당 도착!</p>
        </div>
        <p className="text-sm" style={{ color: C.muted }}>주문 항목을 확인하세요</p>
      </div>

      {/* Restaurant card */}
      <div className="mx-4 mt-4 rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: C.card }}>
        <div className="w-12 h-12 rounded-2xl text-2xl flex items-center justify-center" style={{ backgroundColor: C.cardAlt }}>🍲</div>
        <div>
          <p className="font-bold text-base" style={{ color: C.text }}>신당 할랄 키친</p>
          <p className="text-xs" style={{ color: C.muted }}>서울 용산구 이태원로 23-4</p>
        </div>
        <button className="ml-auto w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.greenGlow }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round">
            <path d="M2 18L4 2h10l2 16M6 6l-.5 8M12 6l.5 8M7.5 10h3"/>
          </svg>
        </button>
      </div>

      {/* Items checklist */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden" style={{ backgroundColor: C.card }}>
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <p className="font-bold text-sm" style={{ color: C.text }}>주문 항목 확인 ({checked.filter(Boolean).length}/{items.length})</p>
        </div>
        {items.map((item, i) => (
          <button key={i} onClick={() => toggle(i)}
            className="w-full flex items-center gap-4 px-4 py-4 transition-colors active:opacity-70"
            style={{ borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ backgroundColor: checked[i] ? C.green : C.cardAlt, border: `2px solid ${checked[i] ? C.green : C.borderBright}` }}>
              {checked[i] && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M2.5 7l3 3 6-5.5"/>
                </svg>
              )}
            </div>
            <p className="font-semibold text-base text-left" style={{ color: checked[i] ? C.muted : C.text,
              textDecoration: checked[i] ? "line-through" : "none" }}>
              {item}
            </p>
          </button>
        ))}
      </div>

      {/* Special instructions */}
      <div className="mx-4 mt-3 rounded-2xl px-4 py-3.5" style={{ backgroundColor: C.goldGlow, border: `1px solid ${C.goldDark}30` }}>
        <p className="text-xs font-bold mb-1" style={{ color: C.gold }}>📝 특별 요청</p>
        <p className="text-sm" style={{ color: C.text }}>갈비탕 국물 많이 주세요. 젓가락 대신 포크로 넣어주세요.</p>
      </div>

      <div className="flex-1" />

      {/* Swipe to confirm */}
      <div className="px-4 pb-6">
        <SwipeConfirm
          label="← 밀어서 픽업 완료"
          color={allChecked ? C.green : C.dim}
          disabled={!allChecked}
          onConfirm={onPickedUp}
        />
        {!allChecked && (
          <p className="text-center text-xs mt-2" style={{ color: C.muted }}>모든 항목을 확인한 후 완료할 수 있어요</p>
        )}
      </div>
    </div>
  );
};

// ── 8. Delivering ──────────────────────────────────────────────────────────────
export const DeliveringScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(720); // 12 min in seconds

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <CStatusBar online />
      </div>

      {/* Map - 50% */}
      <div style={{ marginTop: "40px" }}>
        <DarkRouteMap mode="toCustomer" height={280} />
      </div>

      {/* Delivery info panel */}
      <div className="flex-1 px-4 pt-3 pb-3 space-y-3 overflow-y-auto">
        {/* ETA countdown */}
        <div className="flex items-center justify-between rounded-2xl px-5 py-4" style={{ backgroundColor: C.card }}>
          <div>
            <p className="text-xs font-semibold" style={{ color: C.muted }}>도착까지</p>
            <p className="font-mono font-bold text-3xl tabular-nums" style={{ color: C.blue }}>
              {mins}:{String(secs).padStart(2, "0")}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: C.blueGlow }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.blue }} />
            <span className="text-xs font-bold" style={{ color: C.blue }}>배달 중</span>
          </div>
        </div>

        {/* Customer address */}
        <div className="rounded-2xl p-4 space-y-2.5" style={{ backgroundColor: C.card }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.blueGlow }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round">
                <path d="M9 2C6.2 2 4 4.2 4 7C4 10.8 9 16 9 16S14 10.8 14 7C14 4.2 11.8 2 9 2ZM9 9a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-base" style={{ color: C.text }}>서울 용산구 이태원로 123</p>
              <p className="text-sm" style={{ color: C.muted }}>501호 · 이태원 파크빌</p>
            </div>
          </div>
          {/* Delivery instruction */}
          <div className="rounded-xl px-3 py-2.5 text-sm" style={{ backgroundColor: C.cardAlt, color: C.text }}>
            📦 문 앞 두고 벨 눌러주세요
          </div>
        </div>

        {/* Customer actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
            style={{ backgroundColor: C.card, color: C.text, border: `1.5px solid ${C.borderBright}` }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round">
              <path d="M3 5.5h3l1.5 3.5-2 1.5A12 12 0 0010.5 14l1.5-2 3.5 1.5V17a1 1 0 01-1 1A15 15 0 012 4a1 1 0 011-1h.5z"/>
            </svg>
            전화
          </button>
          <button className="py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
            style={{ backgroundColor: C.card, color: C.text, border: `1.5px solid ${C.borderBright}` }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round">
              <path d="M2 2h16v12H2zM2 14l4-2h8l4 2"/>
            </svg>
            채팅
          </button>
        </div>

        {/* Swipe */}
        <SwipeConfirm label="← 밀어서 배달 완료" color={C.green} onConfirm={onComplete} />
      </div>
    </div>
  );
};

// ── 9. Delivery Complete ───────────────────────────────────────────────────────
export const DeliveryCompleteScreen = ({ onNext }: { onNext?: () => void }) => {
  const [photoTaken, setPhotoTaken] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar online />

      {/* Header */}
      <div className="px-5 py-5 text-center flex-shrink-0">
        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ backgroundColor: C.greenGlow }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round">
            <path d="M6 16l7 7 13-13"/>
          </svg>
        </div>
        <p className="font-bold text-2xl" style={{ color: C.text }}>배달 완료!</p>
        <p className="text-sm mt-1" style={{ color: C.muted }}>수고하셨습니다 🎉</p>
      </div>

      {/* Earnings card */}
      <div className="mx-4 rounded-3xl p-5 text-center" style={{ backgroundColor: C.card, border: `2px solid ${C.goldDark}40` }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.dim }}>이번 배달 수익</p>
        <p className="font-mono font-bold tabular-nums" style={{ color: C.gold, fontSize: "44px", lineHeight: 1 }}>
          ₩4,200
        </p>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
          {[["거리", "2.1km"], ["시간", "18분"], ["평점", "⭐ 4.9"]].map(([l, v]) => (
            <div key={l} className="text-center">
              <p className="font-mono font-bold text-sm" style={{ color: C.text }}>{v}</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Photo proof */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{ backgroundColor: C.card }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
          <p className="font-bold text-sm" style={{ color: C.text }}>배달 인증 사진</p>
          {photoTaken && <span className="text-xs font-bold" style={{ color: C.green }}>✓ 완료</span>}
        </div>
        {!photoTaken ? (
          <button onClick={() => setPhotoTaken(true)}
            className="w-full flex flex-col items-center justify-center py-8 gap-3 active:opacity-70">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.cardAlt }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="5" width="22" height="17" rx="2"/>
                <circle cx="13" cy="14" r="5"/>
                <circle cx="13" cy="14" r="2.5" fill={C.blue}/>
                <path d="M9 5l1.5-3h5L17 5"/>
              </svg>
            </div>
            <p className="font-bold text-base" style={{ color: C.text }}>배달 완료 사진 촬영</p>
            <p className="text-xs" style={{ color: C.muted }}>문 앞에 놓인 음식 사진을 찍어주세요</p>
          </button>
        ) : (
          <div className="relative h-32 flex items-center justify-center" style={{ backgroundColor: "#1A3040" }}>
            <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">📦</div>
            <div className="flex items-center gap-2 z-10">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: C.green }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M2 6l2.5 2.5 5.5-5"/>
                </svg>
              </div>
              <p className="font-bold text-sm" style={{ color: C.green }}>사진 저장됨</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Today's running total */}
      <div className="mx-4 mb-3 rounded-2xl px-4 py-3 flex items-center justify-between" style={{ backgroundColor: C.cardAlt }}>
        <p className="text-sm" style={{ color: C.muted }}>오늘 누적 수익</p>
        <p className="font-mono font-bold text-xl tabular-nums" style={{ color: C.gold }}>₩51,700</p>
      </div>

      <div className="px-4 pb-6 space-y-3">
        <SwipeConfirm label="← 밀어서 완료 확인" color={C.green} onConfirm={() => setConfirmed(true)} />
        {confirmed && (
          <button onClick={onNext}
            className="w-full py-4 rounded-2xl font-bold text-base"
            style={{ backgroundColor: C.surface, color: C.text, border: `1.5px solid ${C.borderBright}` }}>
            다음 배달하기
          </button>
        )}
      </div>
    </div>
  );
};

// ── 10. Delivery Issue ─────────────────────────────────────────────────────────
export const DeliveryIssueScreen = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const issues = [
    { id: "address", emoji: "📍", label: "주소를 찾을 수 없음", desc: "GPS나 지도 앱으로도 위치를 확인할 수 없어요" },
    { id: "noResponse", emoji: "📞", label: "고객이 응답하지 않음", desc: "전화 및 채팅 메시지에 응답이 없어요" },
    { id: "delay", emoji: "🏪", label: "식당 조리 지연", desc: "식당에서 픽업 대기가 너무 길어요" },
    { id: "accident", emoji: "🚨", label: "배달 사고/분실", desc: "배달 중 사고가 발생했어요" },
    { id: "other", emoji: "💬", label: "기타 문제", desc: "위에 해당하지 않는 문제가 있어요" },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar online />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.dangerGlow }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.danger} strokeWidth="2" strokeLinecap="round">
            <path d="M9 1L17 16H1L9 1z"/><path d="M9 7v4M9 13v1"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-base" style={{ color: C.text }}>배달 문제 신고</p>
          <p className="text-xs" style={{ color: C.muted }}>주문 #HMK-8855</p>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>문제 유형을 선택하세요</p>

        {issues.map(issue => (
          <button key={issue.id} onClick={() => setSelected(issue.id)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all active:opacity-70"
            style={{
              backgroundColor: selected === issue.id ? C.dangerGlow : C.card,
              border: `2px solid ${selected === issue.id ? C.danger : C.borderBright}`,
            }}>
            <span className="text-3xl flex-shrink-0">{issue.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base" style={{ color: C.text }}>{issue.label}</p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>{issue.desc}</p>
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: selected === issue.id ? C.danger : C.cardAlt, border: `2px solid ${selected === issue.id ? C.danger : C.borderBright}` }}>
              {selected === issue.id && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </button>
        ))}

        {selected && (
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: C.muted }}>추가 설명 (선택)</p>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="문제 상황을 자세히 설명해주세요..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
              style={{ backgroundColor: C.card, color: C.text, border: `1.5px solid ${C.borderBright}` }}
            />
          </div>
        )}

        {selected && (
          <button className="w-full py-4 rounded-2xl font-bold text-base" style={{ backgroundColor: C.danger, color: "white" }}>
            신고 제출
          </button>
        )}

        <button className="w-full py-4 rounded-2xl font-bold text-base" style={{ backgroundColor: C.card, color: C.text, border: `1.5px solid ${C.borderBright}` }}>
          고객센터 연결
        </button>
        <div className="h-2" />
      </div>
    </div>
  );
};
