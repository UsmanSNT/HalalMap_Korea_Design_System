import React, { useState } from "react";
import { GeometricPattern, StatusBar, BackButton, Toggle } from "../components/Shared";
import type { ScreenId } from "../App";

// ── 10. Push Notification Designs ─────────────────────────────────────────────
const notifications = [
  {
    type: "order",
    icon: "🛵",
    iconBg: "#5B21B6",
    title: "배달 기사가 출발했습니다!",
    body: "신당 할랄 키친 · 예상 도착 18분 · 주문 #8847",
    time: "방금",
    cta: "주문 추적",
    ctaColor: "#5B21B6",
    unread: true,
  },
  {
    type: "prayer",
    icon: "🌙",
    iconBg: "var(--green)",
    title: "마그립 기도 시간 알림",
    body: "마그립 Maghrib · 17:48 · 지금부터 10분 후",
    time: "5분 전",
    cta: "기도 방향",
    ctaColor: "var(--green)",
    unread: true,
  },
  {
    type: "restaurant",
    icon: "🍽️",
    iconBg: "var(--gold)",
    title: "근처에 새 할랄 식당이 생겼어요!",
    body: "마포구 할랄 팔라펠 · 이태원에서 2.1km · 4.7★",
    time: "1시간 전",
    cta: "메뉴 보기",
    ctaColor: "var(--gold)",
    unread: false,
  },
  {
    type: "promo",
    icon: "🎁",
    iconBg: "var(--danger)",
    title: "오늘만! ₩3,000 추가 할인",
    body: "인증된 할랄 식당 최초 주문 시 코드: HALAL3K",
    time: "2시간 전",
    cta: "쿠폰 받기",
    ctaColor: "var(--danger)",
    unread: false,
  },
  {
    type: "ramadan",
    icon: "☪️",
    iconBg: "#1B3A6B",
    title: "라마단 무바락! 특별 이프타르 메뉴",
    body: "라마단 기간 파트너 식당 20곳의 특별 이프타르 세트",
    time: "어제",
    cta: "이프타르 보기",
    ctaColor: "#1B3A6B",
    unread: false,
  },
];

export const NotificationsScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [dismissed, setDismissed] = useState<number[]>([]);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg flex-1">알림</h1>
          <button className="text-sm font-medium" style={{ color: "var(--green)" }}>모두 읽음</button>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-3 space-y-2">
        {/* Unread section */}
        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">읽지 않음</p>
        {notifications.filter(n => n.unread && !dismissed.includes(notifications.indexOf(n))).map((n, i) => (
          <NotifCard key={i} notif={n} onDismiss={() => setDismissed(d => [...d, i])} />
        ))}

        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide pt-1">이전 알림</p>
        {notifications.filter(n => !n.unread).map((n, i) => (
          <NotifCard key={i + 100} notif={n} dim />
        ))}

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-4 space-y-3">
          <p className="font-bold text-sm text-[#1A1A18]">알림 설정</p>
          {[
            { label: "주문 업데이트", on: true },
            { label: "기도 시간 알림", on: true },
            { label: "신규 식당 알림", on: false },
            { label: "프로모션", on: false },
            { label: "라마단 특별 알림", on: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <p className="text-sm text-[#1A1A18]">{s.label}</p>
              <Toggle on={s.on} />
            </div>
          ))}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};

const NotifCard = ({ notif, dim, onDismiss }: { notif: typeof notifications[0]; dim?: boolean; onDismiss?: () => void }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 relative overflow-hidden" style={{ opacity: dim ? 0.65 : 1 }}>
    {notif.unread && !dim && (
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: notif.ctaColor }} />
    )}
    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
      style={{ backgroundColor: notif.iconBg }}>
      {notif.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-sm text-[#1A1A18] leading-tight">{notif.title}</p>
        <p className="text-[10px] text-[var(--muted)] flex-shrink-0">{notif.time}</p>
      </div>
      <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{notif.body}</p>
      <div className="flex items-center gap-2 mt-2">
        <button className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: notif.ctaColor }}>
          {notif.cta}
        </button>
        {onDismiss && (
          <button onClick={onDismiss} className="text-xs text-[var(--muted)]">닫기</button>
        )}
      </div>
    </div>
  </div>
);

// ── 11. Ramadan Mode ───────────────────────────────────────────────────────────
const iftarTime = "18:54";
const suhoorTime = "04:41";

export const RamadanScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [ramadanMode, setRamadanMode] = useState(true);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: ramadanMode ? "#0A1628" : "var(--cream)" }}>
      {/* Header */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(160deg, #0D2137 0%, #1B3A6B 50%, #0D2137 100%)" }}>
        <GeometricPattern color="white" opacity={0.04} />

        {/* Star pattern overlay */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full bg-white"
              style={{
                left: `${8 + i * 7.5}%`,
                top: `${15 + (i % 3) * 20}%`,
                opacity: 0.3 + (i % 3) * 0.2,
                transform: `scale(${0.5 + (i % 4) * 0.3})`,
              }}
            />
          ))}
        </div>

        <StatusBar dark />
        <div className="relative z-10 px-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <BackButton dark onBack={() => onNavigate?.("home")} />
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs">라마단 모드</span>
              <Toggle on={ramadanMode} onToggle={() => setRamadanMode(!ramadanMode)} />
            </div>
          </div>

          {/* Crescent + arabic greeting */}
          <div className="text-center space-y-2 py-2">
            <div className="text-5xl">☪️</div>
            <p className="font-arabic text-3xl font-bold" style={{ color: "var(--gold)" }}>رمضان مبارك</p>
            <p className="text-white/80 font-semibold">라마단 무바락!</p>
            <p className="text-white/50 text-xs">1446년 라마단 17일째</p>
          </div>

          {/* Iftar countdown */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              {[
                { label: "수후르 Suhoor", time: suhoorTime, icon: "🌄" },
                { label: "이프타르 Iftar", time: iftarTime, icon: "🌅" },
              ].map((t) => (
                <div key={t.label} className="flex-1 text-center">
                  <p className="text-white/60 text-xs">{t.icon} {t.label}</p>
                  <p className="text-white font-bold text-xl tabular-nums">{t.time}</p>
                </div>
              ))}
            </div>
            <div className="text-center pt-2 border-t border-white/10">
              <p className="text-white/60 text-xs mb-0.5">이프타르까지</p>
              <p className="text-white font-bold text-2xl tabular-nums" style={{ color: "var(--gold)" }}>1:47:23</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Special menu section */}
        <div>
          <p className="font-bold text-sm mb-2" style={{ color: ramadanMode ? "white" : "#1A1A18" }}>🌙 이프타르 특별 세트</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {[
              { name: "이프타르 한식 세트", rest: "신당 할랄 키친", price: 35000, imageId: "1498654896293-37c98e7f5fe4", saves: "₩8,000 할인" },
              { name: "라마단 케밥 플래터", rest: "이스탄불 케밥", price: 42000, imageId: "1529042410759-befb1204b468", saves: "₩10,000 할인" },
            ].map((item, i) => (
              <div key={i} className="w-52 flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="relative h-28 bg-[#D8D4CC]">
                  <img src={`https://images.unsplash.com/photo-${item.imageId}?w=240&h=130&fit=crop&auto=format&q=80`} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--gold)" }}>{item.saves}</div>
                </div>
                <div className="p-3 space-y-1">
                  <p className="font-bold text-sm text-[#1A1A18]">{item.name}</p>
                  <p className="text-xs text-[var(--muted)]">{item.rest}</p>
                  <p className="font-bold text-sm text-[#1A1A18]">₩{item.price.toLocaleString()}</p>
                  <button className="w-full py-2 rounded-xl text-xs font-bold text-white mt-1" style={{ backgroundColor: "var(--green)" }}>주문하기</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prayer schedule */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: ramadanMode ? "rgba(255,255,255,0.06)" : "white", border: ramadanMode ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
          <p className="font-bold text-sm mb-3" style={{ color: ramadanMode ? "white" : "#1A1A18" }}>오늘 기도 시간</p>
          <div className="space-y-2">
            {[
              { name: "수후르 (파즈르)", time: "04:41", passed: true },
              { name: "두흐르 Dhuhr", time: "12:16", passed: true },
              { name: "아스르 Asr", time: "14:33", passed: false, next: true },
              { name: "이프타르 (마그립)", time: iftarTime, passed: false },
              { name: "이샤 Isha", time: "19:22", passed: false },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between py-1.5"
                style={{ opacity: p.passed ? 0.4 : 1 }}>
                <p className="text-sm font-medium" style={{ color: p.next ? "var(--gold)" : ramadanMode ? "rgba(255,255,255,0.8)" : "#1A1A18" }}>{p.name}</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm tabular-nums" style={{ color: p.next ? "var(--gold)" : ramadanMode ? "white" : "#1A1A18" }}>{p.time}</p>
                  {p.next && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--gold)" }} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: ramadanMode ? "rgba(255,255,255,0.06)" : "white", border: ramadanMode ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
          <p className="font-bold text-sm mb-2" style={{ color: ramadanMode ? "white" : "#1A1A18" }}>커뮤니티 이프타르 🍽️</p>
          <p className="text-sm" style={{ color: ramadanMode ? "rgba(255,255,255,0.6)" : "var(--muted)" }}>
            오늘 서울 무슬림 커뮤니티에서 이프타르 모임이 있습니다. 장소: 서울중앙성원 · 18:50
          </p>
          <button className="mt-3 px-4 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: "var(--gold)", color: "white" }}>
            참여 신청
          </button>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};

// ── 12. Eid Special ────────────────────────────────────────────────────────────
export const EidScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [greeting, setGreeting] = useState<"fitr" | "adha">("fitr");

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg, #0D1F35 0%, #1B3A5B 40%, #0D2A1A 100%)" }}>
      {/* Star/geometric overlay */}
      <GeometricPattern color="white" opacity={0.04} />
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            width: i % 3 === 0 ? "2px" : "1px",
            height: i % 3 === 0 ? "2px" : "1px",
            left: `${5 + i * 4.7}%`,
            top: `${5 + (i * 13) % 70}%`,
            opacity: 0.2 + (i % 4) * 0.15,
          }}
        />
      ))}

      <StatusBar dark />

      {/* Toggle */}
      <div className="relative z-10 flex gap-2 px-5 pt-1">
        {(["fitr", "adha"] as const).map((e) => (
          <button key={e} onClick={() => setGreeting(e)}
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              backgroundColor: greeting === e ? "var(--gold)" : "rgba(255,255,255,0.1)",
              color: greeting === e ? "black" : "rgba(255,255,255,0.6)",
            }}>
            {e === "fitr" ? "이드 알피트르" : "이드 알아드하"}
          </button>
        ))}
      </div>

      {/* Main greeting */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-4">
        {/* Ornamental border */}
        <div className="relative">
          <svg width="280" height="80" viewBox="-140 -40 280 80">
            {/* Top/bottom ornament lines */}
            <line x1="-130" y1="-30" x2="-40" y2="-30" stroke="var(--gold)" strokeWidth="0.8" opacity="0.5"/>
            <line x1="40" y1="-30" x2="130" y2="-30" stroke="var(--gold)" strokeWidth="0.8" opacity="0.5"/>
            <line x1="-130" y1="30" x2="-40" y2="30" stroke="var(--gold)" strokeWidth="0.8" opacity="0.5"/>
            <line x1="40" y1="30" x2="130" y2="30" stroke="var(--gold)" strokeWidth="0.8" opacity="0.5"/>
            {/* Diamond accents */}
            <polygon points="-130,-30 -125,-25 -130,-20 -135,-25" fill="var(--gold)" opacity="0.7"/>
            <polygon points="130,-30 135,-25 130,-20 125,-25" fill="var(--gold)" opacity="0.7"/>
            <polygon points="-130,30 -125,35 -130,40 -135,35" fill="var(--gold)" opacity="0.7"/>
            <polygon points="130,30 135,35 130,40 125,35" fill="var(--gold)" opacity="0.7"/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-arabic text-4xl font-bold text-white" dir="rtl">عيد مبارك</p>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-white font-bold text-2xl">{greeting === "fitr" ? "이드 알피트르 무바락!" : "이드 알아드하 무바락!"}</p>
          <p className="text-white/60 text-sm">{greeting === "fitr" ? "라마단이 끝나고 찾아온 기쁜 이드!" : "희생과 헌신의 이드!"}</p>
        </div>

        {/* Emoji decoration */}
        <div className="text-4xl space-x-2">
          {greeting === "fitr" ? "🌙✨🎉" : "🐑🤲🕌"}
        </div>
      </div>

      <div className="relative z-10 px-4 pb-6 space-y-3">
        {/* Deals section */}
        <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="font-bold text-white text-sm">🎁 이드 특별 혜택</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "이드 쿠폰", value: "₩10,000", desc: "전 주문 10% 할인" },
              { label: "모스크 행사", value: "5개", desc: "서울 이드 예배 안내" },
              { label: "특별 메뉴", value: "30+", desc: "파트너 식당 이드 세트" },
              { label: "배달 무료", value: "오늘만", desc: "이드 당일 전 주문" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-white/50">{item.label}</p>
                <p className="font-bold text-white text-base">{item.value}</p>
                <p className="text-[10px] text-white/50 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-4 rounded-2xl font-bold text-black text-base" style={{ backgroundColor: "var(--gold)" }}>
          이드 특별 메뉴 보기
        </button>
        <button className="w-full py-3 rounded-2xl font-semibold text-sm border border-white/20 text-white">
          이드 인사 공유하기
        </button>
      </div>
    </div>
  );
};
