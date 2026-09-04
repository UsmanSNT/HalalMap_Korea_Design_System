import React, { useState } from "react";
import { GeometricPattern, StatusBar, BackButton } from "../components/Shared";
import type { ScreenId } from "../App";
import { useLanguage } from "../i18n/LanguageContext";

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
const earnItemKeys = [
  { icon: "🛵", labelKey: "earn_order_label", descKey: "earn_order_desc", ptsKey: "earn_order_pts" },
  { icon: "⭐", labelKey: "earn_review_label", descKey: "earn_review_desc", ptsKey: "earn_review_pts" },
  { icon: "📸", labelKey: "earn_photo_review_label", descKey: "earn_photo_review_desc", ptsKey: "earn_photo_review_pts" },
  { icon: "👥", labelKey: "earn_referral_label", descKey: "earn_referral_desc", ptsKey: "earn_referral_pts" },
  { icon: "📅", labelKey: "earn_streak_label", descKey: "earn_streak_desc", ptsKey: "earn_streak_pts" },
  { icon: "🔍", labelKey: "earn_scan_label", descKey: "earn_scan_desc", ptsKey: "earn_scan_pts" },
];

const redeemItemKeys = [
  { icon: "💳", labelKey: "redeem_payment_label", descKey: "redeem_payment_desc", minKey: "redeem_payment_min" },
  { icon: "🎟", labelKey: "redeem_coupon_label", descKey: "redeem_coupon_desc", minKey: "redeem_coupon_min" },
  { icon: "🎁", labelKey: "redeem_donate_label", descKey: "redeem_donate_desc", minKey: "redeem_donate_min" },
];

export const LoyaltyScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
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
            <h1 className="font-bold text-lg text-white flex-1">{t("rewards.loyalty_title")}</h1>
          </div>

          {/* Points balance card */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">{t("rewards.current_points")}</p>
                <p className="text-white font-bold text-4xl tabular-nums">{currentPoints.toLocaleString()}</p>
                <p className="text-white/60 text-xs">{t("rewards.cash_value").replace("{value}", currentPoints.toLocaleString())}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                {currentTier.badge}
                <p className="text-white/80 text-xs font-bold">{t(`rewards.tier_${currentTier.id}`)}</p>
              </div>
            </div>

            {/* Progress to next tier */}
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-1.5">
                <span>{t("rewards.progress_to_gold").replace("{remaining}", (nextTier.min - currentPoints).toLocaleString())}</span>
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
        {(["earn", "redeem", "tiers"] as const).map((tabId) => (
          <button key={tabId} onClick={() => setTab(tabId)}
            className="flex-1 py-3 text-xs font-bold transition-colors border-b-2"
            style={{ borderColor: tab === tabId ? "var(--green)" : "transparent", color: tab === tabId ? "var(--green)" : "var(--muted)" }}>
            {tabId === "earn" ? t("rewards.tab_earn") : tabId === "redeem" ? t("rewards.tab_redeem") : t("rewards.tab_tiers")}
          </button>
        ))}
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        {tab === "earn" && (
          <>
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">{t("rewards.earn_section_title")}</p>
            {earnItemKeys.map((item) => (
              <div key={item.labelKey} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--green-light)" }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-[#1A1A18]">{t(`rewards.${item.labelKey}`)}</p>
                  <p className="text-xs text-[var(--muted)]">{t(`rewards.${item.descKey}`)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color: "var(--green)" }}>{t(`rewards.${item.ptsKey}`)}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "redeem" && (
          <>
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">{t("rewards.redeem_section_title")}</p>
            {redeemItemKeys.map((item) => (
              <div key={item.labelKey} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--gold-light)" }}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#1A1A18]">{t(`rewards.${item.labelKey}`)}</p>
                    <p className="text-xs text-[var(--muted)]">{t(`rewards.${item.descKey}`)}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: "var(--gold-light)", color: "var(--gold)" }}>{t(`rewards.${item.minKey}`)}</span>
                </div>
                <button className="w-full py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: "var(--gold)", color: "white" }}>
                  {t("rewards.use_button")}
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
                    <p className="font-bold text-sm text-[#1A1A18]">{t(`rewards.tier_${tier.id}`)}</p>
                    {tier.id === currentTier.id && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tier.color }}>{t("rewards.current")}</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{tier.min.toLocaleString()}P{tier.max < Infinity ? ` – ${tier.max.toLocaleString()}P` : ` ${t("rewards.and_above")}`}</p>
                  <p className="text-xs mt-1" style={{ color: tier.color }}>{t(`rewards.perk_${tier.id}`)}</p>
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
  { name: "Ahmed K.", avatar: "AK", joined: "2024.11.20", statusKey: "completed", earned: 500 },
  { name: "Lin W.", avatar: "LW", joined: "2024.11.18", statusKey: "completed", earned: 500 },
  { name: "Siti R.", avatar: "SR", joined: "2024.11.15", statusKey: "pending", earned: 0 },
];

const shareOptionKeys = [
  { icon: "💬", labelKey: "share_kakao", bg: "#FEE500", fg: "#000" },
  { icon: "📱", labelKey: "share_sms", bg: "#34C759", fg: "#fff" },
  { icon: "📷", labelKey: "share_instagram", bg: "#E1306C", fg: "#fff" },
  { icon: "🔗", labelKey: "share_link", bg: "var(--green)", fg: "#fff" },
];

const howItWorksKeys = ["step1", "step2", "step3"];

export const ReferralScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
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
            <h1 className="font-bold text-lg text-white flex-1">{t("rewards.referral_title")}</h1>
          </div>

          {/* Main headline */}
          <div className="text-center space-y-2 py-2">
            <p className="text-5xl">👥</p>
            <p className="text-white font-bold text-2xl">{t("rewards.refer_headline_line1")}<br />{t("rewards.refer_headline_line2")}</p>
            <p className="text-white/60 text-sm">{t("rewards.refer_desc")}</p>
          </div>

          {/* Referral code */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4 space-y-3">
            <p className="text-white/60 text-xs text-center">{t("rewards.my_referral_code")}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-center">
                <p className="font-bold text-xl tracking-widest text-white">{referralCode}</p>
              </div>
              <button onClick={handleCopy}
                className="px-4 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: copied ? "var(--green)" : "var(--gold)", color: "white" }}>
                {copied ? t("rewards.copied") : t("rewards.copy")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Share options */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold text-sm text-[#1A1A18]">{t("rewards.share_title")}</p>
          <div className="grid grid-cols-4 gap-2">
            {shareOptionKeys.map((s) => (
              <button key={s.labelKey} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: s.bg }}>
                  {s.icon}
                </div>
                <span className="text-[10px] text-[var(--muted)]">{t(`rewards.${s.labelKey}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold text-sm text-[#1A1A18]">{t("rewards.how_it_works")}</p>
          <div className="space-y-2.5">
            {howItWorksKeys.map((k, i) => (
              <div key={k} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: "var(--green)" }}>
                  {i + 1}
                </div>
                <p className="text-sm text-[#1A1A18] leading-relaxed">{t(`rewards.${k}`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { labelKey: "stat_total_invited", value: "3명" },
            { labelKey: "stat_completed", value: "2명" },
            { labelKey: "stat_points_earned", value: "1,000P" },
          ].map((s) => (
            <div key={s.labelKey} className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="font-bold text-base text-[#1A1A18]">{s.value}</p>
              <p className="text-[10px] text-[var(--muted)]">{t(`rewards.${s.labelKey}`)}</p>
            </div>
          ))}
        </div>

        {/* Referral list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="font-bold text-sm text-[#1A1A18]">{t("rewards.referral_status_title")}</p>
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
                    backgroundColor: r.statusKey === "completed" ? "var(--green-light)" : "var(--gold-light)",
                    color: r.statusKey === "completed" ? "var(--green)" : "var(--gold)",
                  }}>
                  {r.statusKey === "completed" ? t("rewards.status_completed") : t("rewards.status_pending")}
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
