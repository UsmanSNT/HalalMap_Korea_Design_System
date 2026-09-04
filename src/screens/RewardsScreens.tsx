import React, { useState } from "react";
import { GeometricPattern, StatusBar, BackButton } from "../components/Shared";
import type { ScreenId } from "../App";
import { LocalizedText as T } from "../i18n";

// Tier config
const tiers = [
  {
    id: "bronze",
    name: "브론즈",
    nameEn: "Bronze",
    min: 0,
    max: 2999,
    color: "#A0704E",
    light: "#F5EDE7",
    perk: "주문 1% 포인트 적립",
    badge: (
      <svg viewBox="0 0 64 64" width="64" height="64">
        {/* 8-point star */}
        <polygon points="32,4 37,20 53,14 44,28 60,32 44,36 53,50 37,44 32,60 27,44 11,50 20,36 4,32 20,28 11,14 27,20"
          fill="#A0704E" opacity="0.15" />
        <polygon points="32,4 37,20 53,14 44,28 60,32 44,36 53,50 37,44 32,60 27,44 11,50 20,36 4,32 20,28 11,14 27,20"
          fill="none" stroke="#A0704E" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="10" fill="#A0704E" opacity="0.15" />
        <circle cx="32" cy="32" r="10" fill="none" stroke="#A0704E" strokeWidth="1.5" />
        <text x="32" y="37" textAnchor="middle" fill="#A0704E" fontSize="12" fontWeight="700">B</text>
      </svg>
    ),
  },
  {
    id: "silver",
    name: "실버",
    nameEn: "Silver",
    min: 3000,
    max: 9999,
    color: "#7C8EA0",
    light: "#EEF1F5",
    perk: "주문 2% + 무료 배달 쿠폰 월 2장",
    badge: (
      <svg viewBox="0 0 64 64" width="64" height="64">
        <polygon points="32,4 37,20 53,14 44,28 60,32 44,36 53,50 37,44 32,60 27,44 11,50 20,36 4,32 20,28 11,14 27,20"
          fill="#7C8EA0" opacity="0.15" />
        <polygon points="32,4 37,20 53,14 44,28 60,32 44,36 53,50 37,44 32,60 27,44 11,50 20,36 4,32 20,28 11,14 27,20"
          fill="none" stroke="#7C8EA0" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="10" fill="#7C8EA0" opacity="0.15" />
        <circle cx="32" cy="32" r="10" fill="none" stroke="#7C8EA0" strokeWidth="1.5" />
        <text x="32" y="37" textAnchor="middle" fill="#7C8EA0" fontSize="12" fontWeight="700">S</text>
      </svg>
    ),
  },
  {
    id: "gold",
    name: "골드",
    nameEn: "Gold",
    min: 10000,
    max: 29999,
    color: "#C4883A",
    light: "#FDF3E4",
    perk: "주문 3% + 무료 배달 무제한 + 우선 지원",
    badge: (
      <svg viewBox="0 0 64 64" width="64" height="64">
        <polygon points="32,4 37,20 53,14 44,28 60,32 44,36 53,50 37,44 32,60 27,44 11,50 20,36 4,32 20,28 11,14 27,20"
          fill="#C4883A" opacity="0.2" />
        <polygon points="32,4 37,20 53,14 44,28 60,32 44,36 53,50 37,44 32,60 27,44 11,50 20,36 4,32 20,28 11,14 27,20"
          fill="none" stroke="#C4883A" strokeWidth="2" />
        <circle cx="32" cy="32" r="10" fill="#C4883A" opacity="0.2" />
        <circle cx="32" cy="32" r="10" fill="none" stroke="#C4883A" strokeWidth="2" />
        <text x="32" y="37" textAnchor="middle" fill="#C4883A" fontSize="12" fontWeight="700">G</text>
      </svg>
    ),
  },
  {
    id: "platinum",
    name: "플래티넘",
    nameEn: "Platinum",
    min: 30000,
    max: Infinity,
    color: "var(--green)",
    light: "var(--green-light)",
    perk: "주문 5% + 모든 혜택 + 전담 CS + 신규 식당 얼리 액세스",
    badge: (
      <svg viewBox="0 0 64 64" width="64" height="64">
        {/* Double ring star for platinum */}
        <polygon points="32,4 37,20 53,14 44,28 60,32 44,36 53,50 37,44 32,60 27,44 11,50 20,36 4,32 20,28 11,14 27,20"
          fill="#1B6B4A" opacity="0.15" />
        <polygon points="32,4 37,20 53,14 44,28 60,32 44,36 53,50 37,44 32,60 27,44 11,50 20,36 4,32 20,28 11,14 27,20"
          fill="none" stroke="#1B6B4A" strokeWidth="1.5" />
        <polygon points="32,8 36,21 49,16 41,27 56,32 41,37 49,48 36,43 32,56 28,43 15,48 23,37 8,32 23,27 15,16 28,21"
          fill="none" stroke="#C4883A" strokeWidth="0.8" strokeDasharray="2 2" />
        <circle cx="32" cy="32" r="10" fill="#1B6B4A" opacity="0.15" />
        <circle cx="32" cy="32" r="10" fill="none" stroke="#1B6B4A" strokeWidth="1.5" />
        <text x="32" y="37" textAnchor="middle" fill="#1B6B4A" fontSize="10" fontWeight="700">PL</text>
      </svg>
    ),
  },
];

const currentPoints = 7840;
const currentTier = tiers[1]; // silver

// ── 13. Loyalty Program ────────────────────────────────────────────────────────
export const LoyaltyScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [tab, setTab] = useState<"earn" | "redeem" | "tiers">("earn");
  const nextTier = tiers[2];
  const progress = ((currentPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100;

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%)` }}>
        <GeometricPattern color="white" opacity={0.06} />
        <StatusBar dark />
        <div className="relative z-10 px-5 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <BackButton dark onBack={() => onNavigate?.("home")} />
            <h1 className="font-bold text-lg text-white flex-1"><T ko="할랄 포인트" en="Halal points" uz="Halol ballar" /></h1>
          </div>

          {/* Points balance card */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs"><T ko="현재 포인트" en="Current points" uz="Joriy ballar" /></p>
                <p className="text-white font-bold text-4xl tabular-nums">{currentPoints.toLocaleString()}</p>
                <p className="text-white/60 text-xs">≈ ₩{currentPoints.toLocaleString()} 현금 가치</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                {currentTier.badge}
                <p className="text-white/80 text-xs font-bold">{currentTier.name}</p>
              </div>
            </div>

            {/* Progress to next tier */}
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-1.5">
                <span>골드까지 {(nextTier.min - currentPoints).toLocaleString()}P 더 필요</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: "var(--gold)" }} />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                <span>{currentTier.min.toLocaleString()}P</span>
                <span>{nextTier.min.toLocaleString()}P</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] bg-white flex-shrink-0">
        {(["earn", "redeem", "tiers"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3 text-xs font-bold transition-colors border-b-2"
            style={{ borderColor: tab === t ? "var(--green)" : "transparent", color: tab === t ? "var(--green)" : "var(--muted)" }}>
            {t === "earn" ? "적립" : t === "redeem" ? "사용" : "등급"}
          </button>
        ))}
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        {tab === "earn" && (
          <>
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide"><T ko="포인트 적립 방법" en="How to earn points" uz="Ball to'plash usullari" /></p>
            {[
              { icon: "🛵", label: "주문 시 적립", desc: "주문 금액의 2% 포인트 적립 (실버 등급)", pts: "최대 500P/주문" },
              { icon: "⭐", label: "리뷰 작성", desc: "식당 이용 후 리뷰 작성 시", pts: "+50P" },
              { icon: "📸", label: "포토 리뷰", desc: "사진 포함 리뷰 작성 시 추가", pts: "+100P" },
              { icon: "👥", label: "친구 초대", desc: "초대한 친구 첫 주문 완료 시", pts: "+500P" },
              { icon: "📅", label: "연속 주문", desc: "7일 연속 주문 달성 시", pts: "+200P" },
              { icon: "🔍", label: "스캔 활동", desc: "일별 첫 번째 제품 스캔 시", pts: "+10P" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--green-light)" }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-[#1A1A18]">{item.label}</p>
                  <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color: "var(--green)" }}>{item.pts}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "redeem" && (
          <>
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide"><T ko="포인트 사용" en="Use points" uz="Ballardan foydalanish" /></p>
            {[
              { icon: "💳", label: "결제 시 사용", desc: "주문 금액에서 포인트 차감 (100P = ₩100)", min: "1,000P부터" },
              { icon: "🎟", label: "쿠폰으로 전환", desc: "1,000P → 배달비 무료 쿠폰 1장", min: "1,000P" },
              { icon: "🎁", label: "기부", desc: "국내외 무슬림 NGO에 포인트 기부", min: "100P부터" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--gold-light)" }}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#1A1A18]">{item.label}</p>
                    <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: "var(--gold-light)", color: "var(--gold)" }}>{item.min}</span>
                </div>
                <button className="w-full py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: "var(--gold)", color: "white" }}>
                  <T ko="사용하기" en="Use" uz="Foydalanish" />
                </button>
              </div>
            ))}
          </>
        )}

        {tab === "tiers" && (
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div key={tier.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 items-center"
                style={{ border: tier.id === currentTier.id ? `2px solid ${tier.color}` : "2px solid transparent" }}>
                <div className="flex-shrink-0">{tier.badge}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#1A1A18]">{tier.name}</p>
                    {tier.id === currentTier.id && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tier.color }}>현재</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{tier.min.toLocaleString()}P{tier.max < Infinity ? ` – ${tier.max.toLocaleString()}P` : " 이상"}</p>
                  <p className="text-xs mt-1" style={{ color: tier.color }}>{tier.perk}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
};

// ── 14. Referral Program ────────────────────────────────────────────────────────
const referrals = [
  { name: "Ahmed K.", avatar: "AK", joined: "2024.11.20", status: "완료", earned: 500 },
  { name: "Lin W.", avatar: "LW", joined: "2024.11.18", status: "완료", earned: 500 },
  { name: "Siti R.", avatar: "SR", joined: "2024.11.15", status: "대기중", earned: 0 },
];

export const ReferralScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = "HALAL-KIM7840";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #0D2137 100%)" }}>
        <GeometricPattern color="white" opacity={0.05} />
        <StatusBar dark />
        <div className="relative z-10 px-5 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <BackButton dark onBack={() => onNavigate?.("home")} />
            <h1 className="font-bold text-lg text-white flex-1"><T ko="친구 초대" en="Invite friends" uz="Do'stlarni taklif qilish" /></h1>
          </div>

          {/* Main headline */}
          <div className="text-center space-y-2 py-2">
            <p className="text-5xl">👥</p>
            <p className="text-white font-bold text-2xl"><T ko="친구 초대하고\n둘 다 ₩5,000!" en="Invite a friend\nand both get ₩5,000!" uz="Do'stingizni taklif qiling\nva ikkalangiz ₩5,000 oling!" /></p>
            <p className="text-white/60 text-sm"><T ko="친구가 첫 주문 완료 시 서로 ₩5,000 쿠폰 증정" en="You both receive a ₩5,000 coupon after their first order" uz="Do'stingizning ilk buyurtmasidan so'ng har ikkingiz ₩5,000 kupon olasiz" /></p>
          </div>

          {/* Referral code */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4 space-y-3">
            <p className="text-white/60 text-xs text-center">나의 초대 코드</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-center">
                <p className="font-bold text-xl tracking-widest text-white">{referralCode}</p>
              </div>
              <button onClick={handleCopy}
                className="px-4 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: copied ? "var(--green)" : "var(--gold)", color: "white" }}>
                {copied ? "복사됨!" : "복사"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Share options */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold text-sm text-[#1A1A18]"><T ko="공유하기" en="Share" uz="Ulashish" /></p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: "💬", label: "카카오", bg: "#FEE500", fg: "#000" },
              { icon: "📱", label: "문자", bg: "#34C759", fg: "#fff" },
              { icon: "📷", label: "인스타", bg: "#E1306C", fg: "#fff" },
              { icon: "🔗", label: "링크", bg: "var(--green)", fg: "#fff" },
            ].map((s) => (
              <button key={s.label} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: s.bg }}>
                  {s.icon}
                </div>
                <span className="text-[10px] text-[var(--muted)]">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold text-sm text-[#1A1A18]"><T ko="이용 방법" en="How it works" uz="Qanday ishlaydi" /></p>
          <div className="space-y-2.5">
            {[
              { step: "1", text: "초대 코드 또는 링크를 친구에게 공유하세요" },
              { step: "2", text: "친구가 코드로 가입하면 양쪽 모두 ₩5,000 쿠폰이 지급됩니다" },
              { step: "3", text: "친구가 첫 주문 완료 시 500 할랄 포인트도 추가 지급됩니다" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: "var(--green)" }}>
                  {s.step}
                </div>
                <p className="text-sm text-[#1A1A18] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "총 초대", value: "3명" },
            { label: "완료", value: "2명" },
            { label: "적립 포인트", value: "1,000P" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="font-bold text-base text-[#1A1A18]">{s.value}</p>
              <p className="text-[10px] text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Referral list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="font-bold text-sm text-[#1A1A18]"><T ko="초대 현황" en="Invitation status" uz="Takliflar holati" /></p>
          </div>
          {referrals.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-none">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: "var(--green)" }}>
                {r.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1A1A18]">{r.name}</p>
                <p className="text-xs text-[var(--muted)]">{r.joined}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: r.status === "완료" ? "var(--green-light)" : "var(--gold-light)",
                    color: r.status === "완료" ? "var(--green)" : "var(--gold)",
                  }}>
                  {r.status}
                </span>
                {r.earned > 0 && <p className="text-[10px] text-[var(--muted)] mt-0.5">+{r.earned}P</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};
