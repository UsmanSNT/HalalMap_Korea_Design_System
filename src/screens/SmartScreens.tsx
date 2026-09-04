import React, { useState } from "react";
import { GeometricPattern, StatusBar, BackButton, HalalBadge, PriceTag, Toggle } from "../components/Shared";
import type { ScreenId } from "../App";
import { useLanguage } from "../i18n/LanguageContext";

// ── 4. AI Meal Recommendations ─────────────────────────────────────────────────
const mealCards = [
  {
    name: "할랄 삼계탕",
    restaurant: "신당 할랄 키친",
    price: 16500,
    imageId: "1498654896293-37c98e7f5fe4",
    badge: "certified" as const,
    reason: "오늘처럼 쌀쌀한 날씨엔 뜨끈한 삼계탕이 딱이에요 🌧️",
    eta: "30분",
    match: 97,
  },
  {
    name: "버터 치킨 커리",
    restaurant: "델리 스파이스",
    price: 14000,
    imageId: "1565557623262-b51ff2a27b73",
    badge: "friendly" as const,
    reason: "지난 주에 좋아하셨던 인도 음식! 평점 4.3★",
    eta: "40분",
    match: 91,
  },
  {
    name: "케밥 세트 플래터",
    restaurant: "이스탄불 케밥 & 피데",
    price: 21000,
    imageId: "1529042410759-befb1204b468",
    badge: "certified" as const,
    reason: "저녁 6시! 든든한 케밥 세트로 기운 충전 💪",
    eta: "20분",
    match: 88,
  },
];

const contextChipKeys = ["chip_rainy", "chip_dinner", "chip_within_2km", "chip_under_budget"];

export const AIMealScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const [cardIdx, setCardIdx] = useState(0);
  const [swipeDir, setSwipeDir] = useState<null | "left" | "right">(null);
  const card = mealCards[cardIdx % mealCards.length];
  const next = mealCards[(cardIdx + 1) % mealCards.length];

  const swipe = (dir: "left" | "right") => {
    setSwipeDir(dir);
    setTimeout(() => {
      setCardIdx(i => i + 1);
      setSwipeDir(null);
    }, 250);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <div className="flex-1">
            <h1 className="font-bold text-lg">{t("smart.ai_meal_title")}</h1>
            <p className="text-xs text-[var(--muted)]">오늘 오후 5:47 · 이태원 · 🌧️ 12°C</p>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--green-light)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--green)">
              <path d="M13 8A5 5 0 013 8m10 0a5 5 0 00-5-5M8 3V1M3 8H1m14 0h-2M5.6 5.6L4.2 4.2M10.4 5.6l1.4-1.4M5.6 10.4l-1.4 1.4M10.4 10.4l1.4 1.4M8 13v2" stroke="var(--green)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 py-4 gap-4">
        {/* Context chips */}
        <div className="flex flex-wrap gap-2">
          {contextChipKeys.map((k) => (
            <span key={k} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[var(--border)] text-[#1A1A18]">{t(`smart.${k}`)}</span>
          ))}
        </div>

        {/* Tinder-style card stack */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Back card (next) */}
          <div className="absolute inset-x-4 top-4 bottom-0 bg-white rounded-3xl shadow-sm" style={{ transform: "scale(0.94)", opacity: 0.6 }} />

          {/* Main card */}
          <div
            className="absolute inset-0 bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-250"
            style={{
              transform: swipeDir === "left" ? "translateX(-120%) rotate(-15deg)" : swipeDir === "right" ? "translateX(120%) rotate(15deg)" : "none",
              opacity: swipeDir ? 0 : 1,
            }}
          >
            {/* Photo */}
            <div className="relative h-56 bg-[#D8D4CC]">
              <img src={`https://images.unsplash.com/photo-${card.imageId}?w=390&h=240&fit=crop&auto=format&q=80`} alt={card.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Match score */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--green)" }} />
                <span className="text-xs font-bold text-[#1A1A18]">{t("smart.ai_match_label").replace("{match}", String(card.match))}</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <HalalBadge variant={card.badge} />
                <h2 className="text-white font-bold text-xl mt-1 leading-tight">{card.name}</h2>
                <p className="text-white/80 text-sm">{card.restaurant}</p>
              </div>
            </div>

            {/* Info */}
            <div className="p-5 space-y-3">
              {/* AI reason */}
              <div className="flex gap-2.5 p-3 rounded-xl" style={{ backgroundColor: "var(--green-light)" }}>
                <span className="text-lg flex-shrink-0">🤖</span>
                <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--green)" }}>{card.reason}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <PriceTag amount={card.price} className="text-lg" />
                  <p className="text-xs text-[var(--muted)]">{t("smart.delivery_info").replace("{eta}", card.eta)}</p>
                </div>
                <button className="px-5 py-3 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: "var(--green)" }}>
                  {t("smart.order_now")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe buttons */}
        <div className="flex items-center justify-center gap-6 py-2">
          <button
            onClick={() => swipe("left")}
            className="w-14 h-14 rounded-full border-2 border-[#EF4444] flex items-center justify-center shadow-sm"
            style={{ backgroundColor: "white" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <button className="w-10 h-10 rounded-full border border-[var(--gold)] flex items-center justify-center" style={{ backgroundColor: "var(--gold-light)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="var(--gold)">
              <path d="M9 1.5L11 6H15.5L12 8.5L13.5 13L9 10.5L4.5 13L6 8.5L2.5 6H7L9 1.5Z"/>
            </svg>
          </button>

          <button
            onClick={() => swipe("right")}
            className="w-14 h-14 rounded-full border-2 border-[var(--green)] flex items-center justify-center shadow-sm"
            style={{ backgroundColor: "white" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 12H4M14 6l6 6-6 6"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-xs text-[var(--muted)]">{t("smart.swipe_hint")}</p>
      </div>
    </div>
  );
};

// ── 5. Group Order ─────────────────────────────────────────────────────────────
const groupMembers = [
  { name: "나 (김무함마드)", avatar: "👨", items: ["할랄 갈비탕", "오이무침"], total: 16500, ready: true },
  { name: "Ahmad", avatar: "👨‍🦱", items: ["비빔밥 (할랄) x2"], total: 22000, ready: true },
  { name: "Fatima", avatar: "👩‍🧕", items: ["된장찌개 세트"], total: 12000, ready: false },
  { name: "Yusuf", avatar: "🧔", items: [], total: 0, ready: false },
];

export const GroupOrderScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"order" | "split">("order");
  const readyCount = groupMembers.filter(m => m.ready).length;
  const grandTotal = groupMembers.reduce((acc, m) => acc + m.total, 0);
  const deliveryFee = 2000;

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <div className="flex-1">
            <h1 className="font-bold text-lg">{t("smart.group_order_title")}</h1>
            <p className="text-xs text-[var(--muted)]">신당 할랄 키친</p>
          </div>
          <button className="text-sm font-bold px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}>
            {t("smart.invite_link")}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[var(--cream)] mx-4 mb-3 rounded-xl p-1">
          {(["order", "split"] as const).map((tabId) => (
            <button key={tabId} onClick={() => setTab(tabId)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: tab === tabId ? "var(--green)" : "transparent", color: tab === tabId ? "white" : "var(--muted)" }}>
              {tabId === "order" ? t("smart.tab_order_status") : t("smart.tab_split_bill")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-3 space-y-3">
        {tab === "order" ? (
          <>
            {/* Progress */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-[#1A1A18]">{t("smart.participation_status")}</p>
                <p className="text-sm font-bold" style={{ color: "var(--green)" }}>{t("smart.members_done").replace("{ready}", String(readyCount)).replace("{total}", String(groupMembers.length))}</p>
              </div>
              <div className="h-2 bg-[var(--cream)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(readyCount / groupMembers.length) * 100}%`, backgroundColor: "var(--green)" }} />
              </div>
              <div className="flex gap-2 mt-3">
                {groupMembers.map((m, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[var(--cream)] flex items-center justify-center text-lg">{m.avatar}</div>
                      {m.ready && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--green)" }}>
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><path d="M1 3l2 2 4-4"/></svg>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-[var(--muted)] truncate w-10 text-center">{m.name.split(" ")[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Member orders */}
            {groupMembers.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[var(--cream)] flex items-center justify-center text-lg flex-shrink-0">{m.avatar}</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#1A1A18]">{m.name}</p>
                    {m.ready ? (
                      <span className="text-[10px] font-bold" style={{ color: "var(--green)" }}>{t("smart.order_done")}</span>
                    ) : m.items.length === 0 ? (
                      <span className="text-[10px] text-[var(--muted)]">{t("smart.still_choosing")}</span>
                    ) : (
                      <span className="text-[10px] text-[var(--gold)]">{t("smart.editing")}</span>
                    )}
                  </div>
                  {m.total > 0 && <PriceTag amount={m.total} className="text-sm font-bold" />}
                </div>
                {m.items.length > 0 && (
                  <div className="space-y-1 ml-12">
                    {m.items.map((item) => (
                      <p key={item} className="text-xs text-[var(--muted)]">· {item}</p>
                    ))}
                  </div>
                )}
                {m.items.length === 0 && !m.ready && (
                  <div className="ml-12 h-8 rounded-lg skeleton" />
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Split bill */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
              <p className="font-bold text-base text-[#1A1A18]">{t("smart.tab_split_bill")}</p>
              {groupMembers.filter(m => m.total > 0).map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--cream)] flex items-center justify-center text-base flex-shrink-0">{m.avatar}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-semibold text-[#1A1A18]">{m.name.split(" ")[0]}</p>
                      <PriceTag amount={m.total + Math.round((deliveryFee / groupMembers.filter(x => x.total > 0).length))} className="text-sm font-bold" />
                    </div>
                    <div className="h-1.5 bg-[var(--cream)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(m.total / grandTotal) * 100}%`, backgroundColor: "var(--green)" }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-[var(--border)] space-y-1.5 text-sm">
                <div className="flex justify-between text-[var(--muted)]"><span>{t("smart.subtotal")}</span><span>₩{grandTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-[var(--muted)]"><span>{t("smart.delivery_fee_split")}</span><span>₩{deliveryFee.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-base text-[#1A1A18]"><span>{t("smart.grand_total")}</span><span>₩{(grandTotal + deliveryFee).toLocaleString()}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 flex gap-3">
              <button className="flex-1 py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("smart.kakaopay_request")}</button>
              <button className="flex-1 py-3 rounded-xl text-sm font-semibold border" style={{ color: "var(--green)", borderColor: "var(--green)" }}>{t("smart.toss_settle")}</button>
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-8 pt-3 bg-white border-t border-[var(--border)] flex-shrink-0">
        <button className="w-full py-4 rounded-2xl font-bold text-white text-base" style={{ backgroundColor: readyCount === groupMembers.length ? "var(--green)" : "#9CA3AF" }}>
          {readyCount === groupMembers.length
            ? t("smart.group_order_complete").replace("{amount}", `₩${(grandTotal + deliveryFee).toLocaleString()}`)
            : t("smart.waiting_members").replace("{count}", String(groupMembers.length - readyCount))}
        </button>
      </div>
    </div>
  );
};

// ── 6. Meal Plans & Subscriptions ─────────────────────────────────────────────
const mealPlan = [
  { day: "월", meal: "할랄 갈비탕", rest: "신당 할랄 키친", delivered: true },
  { day: "화", meal: "비빔밥 세트", rest: "신당 할랄 키친", delivered: true },
  { day: "수", meal: "케밥 플레이트", rest: "이스탄불 케밥", delivered: false, today: true },
  { day: "목", meal: "나시고렝", rest: "자카르타 나시고렝", delivered: false },
  { day: "금", meal: "치킨 커리", rest: "델리 스파이스", delivered: false },
];

const weekKeys = ["week_this", "week_next", "week_after_next"];
const dietPrefKeys = ["pref_meat", "pref_vegetarian", "pref_korean_focus", "pref_no_spicy"];
const dietPrefOn = [true, false, true, false];
const mealSubPlans = [
  { id: "silver", meals: "주 3회", price: 45000 },
  { id: "gold", meals: "주 5회", price: 69000 },
  { id: "platinum", meals: "주 7회", price: 95000 },
];

export const MealPlansScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const [activeWeek, setActiveWeek] = useState(0);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="relative overflow-hidden flex-shrink-0" style={{ backgroundColor: "var(--green)" }}>
        <GeometricPattern color="white" opacity={0.05} />
        <StatusBar dark />
        <div className="relative z-10 px-5 pb-5">
          <div className="flex items-center gap-3 mb-3">
            <BackButton dark onBack={() => onNavigate?.("home")} />
            <h1 className="font-bold text-lg text-white">{t("smart.meal_plan_title")}</h1>
          </div>
          <div className="bg-white/15 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🍽️</div>
            <div className="flex-1">
              <p className="text-white font-bold">할랄 주간 구독 — 골드</p>
              <p className="text-white/70 text-xs mt-0.5">주 5회 배달 · ₩69,000/주</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: "var(--gold)", color: "white" }}>{t("smart.subscribed")}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Week selector */}
        <div className="flex gap-2">
          {weekKeys.map((wk, i) => (
            <button key={wk} onClick={() => setActiveWeek(i)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              style={{
                backgroundColor: activeWeek === i ? "var(--green)" : "white",
                color: activeWeek === i ? "white" : "var(--muted)",
                borderColor: activeWeek === i ? "var(--green)" : "var(--border)",
              }}>
              {t(`smart.${wk}`)}
            </button>
          ))}
        </div>

        {/* Week calendar */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {mealPlan.map((day, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3.5 ${i < mealPlan.length - 1 ? "border-b border-[var(--border)]" : ""}`}
              style={{ backgroundColor: day.today ? "var(--green-light)" : "white" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: day.delivered ? "var(--green)" : day.today ? "var(--green)" : "var(--cream)" }}>
                {day.delivered ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 8l4 4 8-8"/></svg>
                ) : (
                  <p className="text-sm font-bold" style={{ color: day.today ? "white" : "var(--muted)" }}>{day.day}</p>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${day.today ? "text-[var(--green)]" : "text-[#1A1A18]"}`}>{day.meal}</p>
                <p className="text-xs text-[var(--muted)] truncate">{day.rest}</p>
              </div>
              <div className="flex items-center gap-2">
                {day.today && <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>{t("smart.today")}</span>}
                {day.delivered && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}>{t("smart.delivered")}</span>}
                {!day.delivered && !day.today && (
                  <button className="text-xs text-[var(--muted)] underline">{t("smart.change")}</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dietary preferences */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold text-sm text-[#1A1A18]">{t("smart.diet_settings")}</p>
          {dietPrefKeys.map((k, i) => (
            <div key={k} className="flex items-center justify-between">
              <p className="text-sm text-[#1A1A18]">{t(`smart.${k}`)}</p>
              <Toggle on={dietPrefOn[i]} />
            </div>
          ))}
        </div>

        {/* Plan options */}
        <div className="space-y-2.5">
          <p className="font-bold text-sm text-[#1A1A18]">{t("smart.change_plan")}</p>
          {mealSubPlans.map((plan) => {
            const isCurrent = plan.id === "gold";
            return (
              <div key={plan.id} className="flex items-center gap-3 p-3.5 rounded-2xl border transition-all"
                style={{ borderColor: isCurrent ? "var(--green)" : "var(--border)", backgroundColor: isCurrent ? "var(--green-light)" : "white" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: plan.id === "silver" ? "#C0C0C0" : plan.id === "gold" ? "var(--gold)" : "#E8E0F0" }}>
                  {plan.id === "silver" ? "🥈" : plan.id === "gold" ? "🥇" : "💎"}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-[#1A1A18]">{t(`smart.tier_${plan.id}`)}</p>
                  <p className="text-xs text-[var(--muted)]">{plan.meals} · ₩{plan.price.toLocaleString()}/주</p>
                </div>
                {isCurrent ? (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>{t("smart.current")}</span>
                ) : (
                  <button className="text-xs font-bold" style={{ color: "var(--green)" }}>{t("smart.select")}</button>
                )}
              </div>
            );
          })}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};

// ── 7. Halal Grocery Finder ────────────────────────────────────────────────────
const groceryStores = [
  { name: "이마트 성수점", nameEn: "E-Mart Seongsu", distance: "1.4km", halalSection: true, products: 47, imageId: "1567620905572-d1d0d6ca9ea0" },
  { name: "코스트코 양평점", nameEn: "Costco Yangpyeong", distance: "4.2km", halalSection: true, products: 83, imageId: "1498654896293-37c98e7f5fe4" },
  { name: "할랄 마트 이태원", nameEn: "Halal Mart Itaewon", distance: "0.6km", halalSection: true, products: 210, imageId: "1414235077428-338989a2e8c0" },
];

const products = [
  { name: "인도미 할랄 라면", brand: "Indomie", price: 3200, available: true, image: "1567620905572-d1d0d6ca9ea0", stores: 3 },
  { name: "말레이시아 할랄 소시지", brand: "Farm's Best", price: 8900, available: true, image: "1498654896293-37c98e7f5fe4", stores: 2 },
  { name: "KMF 인증 닭고기", brand: "하림 할랄", price: 12500, available: false, image: "1617196034183-421b4040d6fd", stores: 1 },
];

export const GroceryScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"stores" | "products">("stores");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <BackButton onBack={() => onNavigate?.("home")} />
            <h1 className="font-bold text-lg flex-1">{t("smart.grocery_title")}</h1>
          </div>
          <div className="flex items-center gap-2 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><circle cx="7" cy="7" r="5"/><path d="M12 12L15 15" strokeLinecap="round"/></svg>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t("smart.search_placeholder")} className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="flex bg-[var(--cream)] rounded-xl p-1">
            {(["stores", "products"] as const).map((tabId) => (
              <button key={tabId} onClick={() => setActiveTab(tabId)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: activeTab === tabId ? "var(--green)" : "transparent", color: activeTab === tabId ? "white" : "var(--muted)" }}>
                {tabId === "stores" ? t("smart.tab_stores") : t("smart.tab_products")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        {activeTab === "stores" ? (
          <>
            {groceryStores.map((store, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-28 bg-[#E8E6E1] relative">
                  <img src={`https://images.unsplash.com/photo-${store.imageId}?w=390&h=130&fit=crop&auto=format&q=80`} alt={store.name} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>
                      {t("smart.halal_section_available")}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-[#1A1A18]">{store.name}</h3>
                      <p className="text-xs text-[var(--muted)]">{store.nameEn}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--muted)]">{store.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm font-medium" style={{ color: "var(--green)" }}>
                      {t("smart.halal_products_count").replace("{count}", String(store.products))}
                    </p>
                    <button className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}>
                      {t("smart.view_products")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="text-xs text-[var(--muted)]">{t("smart.nearby_products_count").replace("{count}", String(products.length))}</p>
            {products.map((prod, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-[#E8E6E1] flex-shrink-0 overflow-hidden">
                  <img src={`https://images.unsplash.com/photo-${prod.image}?w=100&h=100&fit=crop&auto=format&q=80`} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-sm text-[#1A1A18]">{prod.name}</p>
                  <p className="text-xs text-[var(--muted)]">{prod.brand}</p>
                  <div className="flex items-center gap-2">
                    <PriceTag amount={prod.price} className="text-sm" />
                    <span className="text-[10px] text-[var(--muted)]">· {t("smart.stores_count").replace("{count}", String(prod.stores))}</span>
                  </div>
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: prod.available ? "var(--green-light)" : "#FEE2E2",
                      color: prod.available ? "var(--green)" : "var(--danger)",
                    }}
                  >
                    {prod.available ? t("smart.in_stock") : t("smart.out_of_stock")}
                  </span>
                </div>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center self-end flex-shrink-0" style={{ backgroundColor: prod.available ? "var(--green)" : "#E5E7EB" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="7" y1="3" x2="7" y2="11"/><line x1="3" y1="7" x2="11" y2="7"/></svg>
                </button>
              </div>
            ))}
          </>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
};
