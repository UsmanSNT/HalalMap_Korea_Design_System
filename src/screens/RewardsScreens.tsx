import React, { useState } from "react";
import { GeometricPattern, StatusBar, BackButton } from "../components/Shared";
import { useLanguage, type Lang } from "../components/LanguageSwitcher";

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

const TIER_TR: Record<string, { name: Record<Lang, string>; perk: Record<Lang, string> }> = {
  bronze: {
    name: { ko: "브론즈", en: "Bronze", uz: "Bronza", ru: "Бронза" },
    perk: { ko: "주문 1% 포인트 적립", en: "Earn 1% points on orders", uz: "Buyurtmalardan 1% ball to'planadi", ru: "1% баллов с заказов" },
  },
  silver: {
    name: { ko: "실버", en: "Silver", uz: "Kumush", ru: "Серебро" },
    perk: { ko: "주문 2% + 무료 배달 쿠폰 월 2장", en: "2% on orders + 2 free delivery coupons/month", uz: "Buyurtmadan 2% + oyiga 2 ta bepul yetkazib berish kuponi", ru: "2% с заказов + 2 купона бесплатной доставки в месяц" },
  },
  gold: {
    name: { ko: "골드", en: "Gold", uz: "Oltin", ru: "Золото" },
    perk: { ko: "주문 3% + 무료 배달 무제한 + 우선 지원", en: "3% on orders + unlimited free delivery + priority support", uz: "Buyurtmadan 3% + cheksiz bepul yetkazib berish + ustuvor yordam", ru: "3% с заказов + безлимитная бесплатная доставка + приоритетная поддержка" },
  },
  platinum: {
    name: { ko: "플래티넘", en: "Platinum", uz: "Platina", ru: "Платина" },
    perk: { ko: "주문 5% + 모든 혜택 + 전담 CS + 신규 식당 얼리 액세스", en: "5% on orders + all benefits + dedicated support + early access to new restaurants", uz: "Buyurtmadan 5% + barcha imtiyozlar + shaxsiy yordam + yangi restoranlarga erta kirish", ru: "5% с заказов + все преимущества + персональная поддержка + ранний доступ к новым ресторанам" },
  },
};

const TR_LOYALTY = {
  headerTitle: { ko: "할랄 포인트", en: "Halal Points", uz: "Halol ballar", ru: "Халяль-баллы" },
  currentPoints: { ko: "현재 포인트", en: "Current Points", uz: "Joriy ballar", ru: "Текущие баллы" },
  cashValue: { ko: "현금 가치", en: "cash value", uz: "naqd qiymati", ru: "денежный эквивалент" },
  untilTier: { ko: "까지", en: "until ", uz: "gacha", ru: "до " },
  moreNeeded: { ko: "P 더 필요", en: "P more needed", uz: "P kerak", ru: "P осталось" },
  tabEarn: { ko: "적립", en: "Earn", uz: "Yig'ish", ru: "Начисление" },
  tabRedeem: { ko: "사용", en: "Redeem", uz: "Sarflash", ru: "Списание" },
  tabTiers: { ko: "등급", en: "Tiers", uz: "Darajalar", ru: "Уровни" },
  earnMethods: { ko: "포인트 적립 방법", en: "Ways to earn points", uz: "Ball to'plash usullari", ru: "Способы заработать баллы" },
  redeemMethods: { ko: "포인트 사용", en: "Redeem Points", uz: "Ballarni sarflash", ru: "Использовать баллы" },
  useNow: { ko: "사용하기", en: "Use Now", uz: "Ishlatish", ru: "Использовать" },
  current: { ko: "현재", en: "Current", uz: "Joriy", ru: "Текущий" },
  orAbove: { ko: "이상", en: "+", uz: " va undan yuqori", ru: "+" },
  earnOrder: { ko: "주문 시 적립", en: "Earn on order", uz: "Buyurtma berganda", ru: "Начисление за заказ" },
  earnOrderDesc: { ko: "주문 금액의 2% 포인트 적립 (실버 등급)", en: "Earn 2% of order amount in points (Silver tier)", uz: "Buyurtma summasidan 2% ball (Kumush daraja)", ru: "2% от суммы заказа баллами (уровень Серебро)" },
  earnOrderPts: { ko: "최대 500P/주문", en: "Up to 500P/order", uz: "Buyurtmaga 500P gacha", ru: "До 500P за заказ" },
  earnReview: { ko: "리뷰 작성", en: "Write a review", uz: "Sharh yozish", ru: "Написать отзыв" },
  earnReviewDesc: { ko: "식당 이용 후 리뷰 작성 시", en: "When you write a review after your order", uz: "Restorandan foydalangandan so'ng sharh yozganda", ru: "После написания отзыва о заказе" },
  earnPhoto: { ko: "포토 리뷰", en: "Photo review", uz: "Foto sharh", ru: "Фотоотзыв" },
  earnPhotoDesc: { ko: "사진 포함 리뷰 작성 시 추가", en: "Extra points for a review with photos", uz: "Rasm bilan sharh yozganda qo'shimcha", ru: "Дополнительно за отзыв с фото" },
  earnInvite: { ko: "친구 초대", en: "Invite friends", uz: "Do'stlarni taklif qilish", ru: "Пригласить друзей" },
  earnInviteDesc: { ko: "초대한 친구 첫 주문 완료 시", en: "When your invited friend completes their first order", uz: "Taklif qilingan do'stingiz birinchi buyurtmani yakunlaganda", ru: "Когда приглашённый друг завершит первый заказ" },
  earnStreak: { ko: "연속 주문", en: "Order streak", uz: "Ketma-ket buyurtma", ru: "Серия заказов" },
  earnStreakDesc: { ko: "7일 연속 주문 달성 시", en: "Achieve a 7-day ordering streak", uz: "7 kun ketma-ket buyurtma berganda", ru: "При заказах 7 дней подряд" },
  earnScan: { ko: "스캔 활동", en: "Scan activity", uz: "Skanerlash faoliyati", ru: "Активность сканирования" },
  earnScanDesc: { ko: "일별 첫 번째 제품 스캔 시", en: "For your first product scan each day", uz: "Har kuni birinchi mahsulotni skanerlaganda", ru: "За первое сканирование продукта в день" },
  redeemPay: { ko: "결제 시 사용", en: "Use at checkout", uz: "To'lovda ishlatish", ru: "Использовать при оплате" },
  redeemPayDesc: { ko: "주문 금액에서 포인트 차감 (100P = ₩100)", en: "Deduct points from order total (100P = ₩100)", uz: "Buyurtma summasidan ballar ayiriladi (100P = ₩100)", ru: "Списание баллов с суммы заказа (100P = ₩100)" },
  redeemPayMin: { ko: "1,000P부터", en: "From 1,000P", uz: "1,000P dan boshlab", ru: "От 1,000P" },
  redeemCoupon: { ko: "쿠폰으로 전환", en: "Convert to coupon", uz: "Kuponga aylantirish", ru: "Обменять на купон" },
  redeemCouponDesc: { ko: "1,000P → 배달비 무료 쿠폰 1장", en: "1,000P → 1 free delivery coupon", uz: "1,000P → 1 ta bepul yetkazib berish kuponi", ru: "1,000P → 1 купон бесплатной доставки" },
  redeemDonate: { ko: "기부", en: "Donate", uz: "Xayriya qilish", ru: "Пожертвовать" },
  redeemDonateDesc: { ko: "국내외 무슬림 NGO에 포인트 기부", en: "Donate points to Muslim NGOs at home and abroad", uz: "Ballarni mahalliy va xalqaro musulmon NGOlariga xayriya qilish", ru: "Пожертвовать баллы мусульманским НКО в стране и за рубежом" },
  redeemDonateMin: { ko: "100P부터", en: "From 100P", uz: "100P dan boshlab", ru: "От 100P" },
} satisfies Record<string, Record<Lang, string>>;

// ── 13. Loyalty Program ────────────────────────────────────────────────────────
export const LoyaltyScreen = () => {
  const { lang } = useLanguage();
  const tL = (k: keyof typeof TR_LOYALTY) => TR_LOYALTY[k][lang];
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
            <BackButton dark />
            <h1 className="font-bold text-lg text-white flex-1">{tL("headerTitle")}</h1>
          </div>

          {/* Points balance card */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">{tL("currentPoints")}</p>
                <p className="text-white font-bold text-4xl tabular-nums">{currentPoints.toLocaleString()}</p>
                <p className="text-white/60 text-xs">≈ ₩{currentPoints.toLocaleString()} {tL("cashValue")}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                {currentTier.badge}
                <p className="text-white/80 text-xs font-bold">{TIER_TR[currentTier.id].name[lang]}</p>
              </div>
            </div>

            {/* Progress to next tier */}
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-1.5">
                <span>{TIER_TR[nextTier.id].name[lang]}{tL("untilTier")} {(nextTier.min - currentPoints).toLocaleString()}{tL("moreNeeded")}</span>
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
            {t === "earn" ? tL("tabEarn") : t === "redeem" ? tL("tabRedeem") : tL("tabTiers")}
          </button>
        ))}
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        {tab === "earn" && (
          <>
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">{tL("earnMethods")}</p>
            {[
              { icon: "🛵", label: tL("earnOrder"), desc: tL("earnOrderDesc"), pts: tL("earnOrderPts") },
              { icon: "⭐", label: tL("earnReview"), desc: tL("earnReviewDesc"), pts: "+50P" },
              { icon: "📸", label: tL("earnPhoto"), desc: tL("earnPhotoDesc"), pts: "+100P" },
              { icon: "👥", label: tL("earnInvite"), desc: tL("earnInviteDesc"), pts: "+500P" },
              { icon: "📅", label: tL("earnStreak"), desc: tL("earnStreakDesc"), pts: "+200P" },
              { icon: "🔍", label: tL("earnScan"), desc: tL("earnScanDesc"), pts: "+10P" },
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
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">{tL("redeemMethods")}</p>
            {[
              { icon: "💳", label: tL("redeemPay"), desc: tL("redeemPayDesc"), min: tL("redeemPayMin") },
              { icon: "🎟", label: tL("redeemCoupon"), desc: tL("redeemCouponDesc"), min: "1,000P" },
              { icon: "🎁", label: tL("redeemDonate"), desc: tL("redeemDonateDesc"), min: tL("redeemDonateMin") },
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
                  {tL("useNow")}
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
                    <p className="font-bold text-sm text-[#1A1A18]">{TIER_TR[tier.id].name[lang]}</p>
                    {tier.id === currentTier.id && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tier.color }}>{tL("current")}</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{tier.min.toLocaleString()}P{tier.max < Infinity ? ` – ${tier.max.toLocaleString()}P` : ` ${tL("orAbove")}`}</p>
                  <p className="text-xs mt-1" style={{ color: tier.color }}>{TIER_TR[tier.id].perk[lang]}</p>
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

const TR_REFERRAL = {
  headerTitle: { ko: "친구 초대", en: "Invite Friends", uz: "Do'stlarni taklif qilish", ru: "Пригласить друзей" },
  headline: { ko: "친구 초대하고", en: "Invite a friend and", uz: "Do'stingizni taklif qiling va", ru: "Пригласи друга —" },
  headlineBoth: { ko: "둘 다 ₩5,000!", en: "you both get ₩5,000!", uz: "ikkovingiz ham ₩5,000 olasiz!", ru: "получите оба по ₩5,000!" },
  subtitle: { ko: "친구가 첫 주문 완료 시 서로 ₩5,000 쿠폰 증정", en: "You'll both get a ₩5,000 coupon when your friend completes their first order", uz: "Do'stingiz birinchi buyurtmani yakunlaganda ikkalangiz ham ₩5,000 kupon olasiz", ru: "Вы оба получите купон на ₩5,000, когда друг завершит первый заказ" },
  myCode: { ko: "나의 초대 코드", en: "My invite code", uz: "Mening taklif kodim", ru: "Мой код приглашения" },
  copied: { ko: "복사됨!", en: "Copied!", uz: "Nusxalandi!", ru: "Скопировано!" },
  copy: { ko: "복사", en: "Copy", uz: "Nusxalash", ru: "Копировать" },
  share: { ko: "공유하기", en: "Share", uz: "Ulashish", ru: "Поделиться" },
  kakao: { ko: "카카오", en: "KakaoTalk", uz: "Kakao", ru: "Kakao" },
  sms: { ko: "문자", en: "SMS", uz: "SMS", ru: "СМС" },
  instagram: { ko: "인스타", en: "Instagram", uz: "Instagram", ru: "Instagram" },
  link: { ko: "링크", en: "Link", uz: "Havola", ru: "Ссылка" },
  howItWorks: { ko: "이용 방법", en: "How it works", uz: "Qanday ishlaydi", ru: "Как это работает" },
  step1: { ko: "초대 코드 또는 링크를 친구에게 공유하세요", en: "Share your invite code or link with a friend", uz: "Taklif kodi yoki havolangizni do'stingizga yuboring", ru: "Поделитесь кодом или ссылкой с другом" },
  step2: { ko: "친구가 코드로 가입하면 양쪽 모두 ₩5,000 쿠폰이 지급됩니다", en: "When your friend signs up with the code, you both receive a ₩5,000 coupon", uz: "Do'stingiz kod bilan ro'yxatdan o'tganda, ikkalangiz ham ₩5,000 kupon olasiz", ru: "Когда друг зарегистрируется по коду, вы оба получите купон на ₩5,000" },
  step3: { ko: "친구가 첫 주문 완료 시 500 할랄 포인트도 추가 지급됩니다", en: "When your friend completes their first order, you also get 500 extra Halal Points", uz: "Do'stingiz birinchi buyurtmani yakunlaganda, sizga qo'shimcha 500 Halol ball ham beriladi", ru: "Когда друг завершит первый заказ, вы дополнительно получите 500 Халяль-баллов" },
  totalInvites: { ko: "총 초대", en: "Total Invites", uz: "Jami takliflar", ru: "Всего приглашений" },
  completed: { ko: "완료", en: "Completed", uz: "Yakunlangan", ru: "Завершено" },
  earnedPoints: { ko: "적립 포인트", en: "Points Earned", uz: "To'plangan ballar", ru: "Начислено баллов" },
  people: { ko: "명", en: "", uz: " kishi", ru: "" },
  status: { ko: "초대 현황", en: "Invite Status", uz: "Taklif holati", ru: "Статус приглашений" },
  statusDone: { ko: "완료", en: "Completed", uz: "Yakunlandi", ru: "Завершено" },
  statusPending: { ko: "대기중", en: "Pending", uz: "Kutilmoqda", ru: "Ожидание" },
} satisfies Record<string, Record<Lang, string>>;

export const ReferralScreen = () => {
  const { lang } = useLanguage();
  const tRf = (k: keyof typeof TR_REFERRAL) => TR_REFERRAL[k][lang];
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
            <BackButton dark />
            <h1 className="font-bold text-lg text-white flex-1">{tRf("headerTitle")}</h1>
          </div>

          {/* Main headline */}
          <div className="text-center space-y-2 py-2">
            <p className="text-5xl">👥</p>
            <p className="text-white font-bold text-2xl">{tRf("headline")}<br />{tRf("headlineBoth")}</p>
            <p className="text-white/60 text-sm">{tRf("subtitle")}</p>
          </div>

          {/* Referral code */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4 space-y-3">
            <p className="text-white/60 text-xs text-center">{tRf("myCode")}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-center">
                <p className="font-bold text-xl tracking-widest text-white">{referralCode}</p>
              </div>
              <button onClick={handleCopy}
                className="px-4 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: copied ? "var(--green)" : "var(--gold)", color: "white" }}>
                {copied ? tRf("copied") : tRf("copy")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Share options */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold text-sm text-[#1A1A18]">{tRf("share")}</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: "💬", label: tRf("kakao"), bg: "#FEE500", fg: "#000" },
              { icon: "📱", label: tRf("sms"), bg: "#34C759", fg: "#fff" },
              { icon: "📷", label: tRf("instagram"), bg: "#E1306C", fg: "#fff" },
              { icon: "🔗", label: tRf("link"), bg: "var(--green)", fg: "#fff" },
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
          <p className="font-bold text-sm text-[#1A1A18]">{tRf("howItWorks")}</p>
          <div className="space-y-2.5">
            {[
              { step: "1", text: tRf("step1") },
              { step: "2", text: tRf("step2") },
              { step: "3", text: tRf("step3") },
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
            { label: tRf("totalInvites"), value: `3${tRf("people")}` },
            { label: tRf("completed"), value: `2${tRf("people")}` },
            { label: tRf("earnedPoints"), value: "1,000P" },
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
            <p className="font-bold text-sm text-[#1A1A18]">{tRf("status")}</p>
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
                  {r.status === "완료" ? tRf("statusDone") : tRf("statusPending")}
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
