import React, { useState } from "react";
import { GeometricPattern, StatusBar, BackButton, Toggle } from "../components/Shared";
import { useLanguage, type Lang } from "../components/LanguageSwitcher";

// ── 10. Push Notification Designs ─────────────────────────────────────────────
const notificationsKo = [
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

const NOTIF_TR = [
  { title: { ko: "배달 기사가 출발했습니다!", en: "Your delivery rider is on the way!", uz: "Kuryer yo'lga chiqdi!", ru: "Курьер выехал!" },
    body: { ko: "신당 할랄 키친 · 예상 도착 18분 · 주문 #8847", en: "Sindang Halal Kitchen · ETA 18 min · Order #8847", uz: "Sindang Halol Kuxna · Yetib kelish 18 daqiqa · Buyurtma #8847", ru: "Sindang Halal Kitchen · Прибытие через 18 мин · Заказ №8847" },
    time: { ko: "방금", en: "Just now", uz: "Hozirgina", ru: "Только что" },
    cta: { ko: "주문 추적", en: "Track Order", uz: "Buyurtmani kuzatish", ru: "Отследить заказ" } },
  { title: { ko: "마그립 기도 시간 알림", en: "Maghrib Prayer Reminder", uz: "Shom namozi eslatmasi", ru: "Напоминание о намазе Магриб" },
    body: { ko: "마그립 Maghrib · 17:48 · 지금부터 10분 후", en: "Maghrib · 17:48 · in 10 minutes", uz: "Shom · 17:48 · 10 daqiqadan keyin", ru: "Магриб · 17:48 · через 10 минут" },
    time: { ko: "5분 전", en: "5 min ago", uz: "5 daqiqa oldin", ru: "5 мин назад" },
    cta: { ko: "기도 방향", en: "Qibla Direction", uz: "Qibla yo'nalishi", ru: "Направление киблы" } },
  { title: { ko: "근처에 새 할랄 식당이 생겼어요!", en: "A new halal restaurant just opened nearby!", uz: "Yaqin atrofda yangi halol restoran ochildi!", ru: "Рядом открылся новый халяль-ресторан!" },
    body: { ko: "마포구 할랄 팔라펠 · 이태원에서 2.1km · 4.7★", en: "Mapo Halal Falafel · 2.1km from Itaewon · 4.7★", uz: "Mapo Halol Falafel · Itaewondan 2.1km · 4.7★", ru: "Mapo Halal Falafel · 2.1 км от Итэвона · 4.7★" },
    time: { ko: "1시간 전", en: "1 hour ago", uz: "1 soat oldin", ru: "1 час назад" },
    cta: { ko: "메뉴 보기", en: "View Menu", uz: "Menyuni ko'rish", ru: "Смотреть меню" } },
  { title: { ko: "오늘만! ₩3,000 추가 할인", en: "Today only! ₩3,000 extra off", uz: "Faqat bugun! ₩3,000 qo'shimcha chegirma", ru: "Только сегодня! Скидка ещё ₩3,000" },
    body: { ko: "인증된 할랄 식당 최초 주문 시 코드: HALAL3K", en: "Use code HALAL3K on your first order from a certified halal restaurant", uz: "Sertifikatlangan halol restorandan birinchi buyurtmada HALAL3K kodini kiriting", ru: "Используйте код HALAL3K при первом заказе в сертифицированном халяль-ресторане" },
    time: { ko: "2시간 전", en: "2 hours ago", uz: "2 soat oldin", ru: "2 часа назад" },
    cta: { ko: "쿠폰 받기", en: "Get Coupon", uz: "Kupon olish", ru: "Получить купон" } },
  { title: { ko: "라마단 무바락! 특별 이프타르 메뉴", en: "Ramadan Mubarak! Special Iftar Menu", uz: "Ramazon muborak! Maxsus Iftorlik menyu", ru: "Рамадан мубарак! Специальное меню ифтара" },
    body: { ko: "라마단 기간 파트너 식당 20곳의 특별 이프타르 세트", en: "Special iftar sets from 20 partner restaurants during Ramadan", uz: "Ramazon davomida 20 ta hamkor restorandan maxsus iftorlik to'plamlari", ru: "Специальные наборы ифтара от 20 ресторанов-партнёров на Рамадан" },
    time: { ko: "어제", en: "Yesterday", uz: "Kecha", ru: "Вчера" },
    cta: { ko: "이프타르 보기", en: "View Iftar Sets", uz: "Iftorlikni ko'rish", ru: "Смотреть наборы ифтара" } },
] as const;

const buildNotifications = (lang: Lang) => notificationsKo.map((n, i) => ({
  ...n,
  title: NOTIF_TR[i].title[lang],
  body: NOTIF_TR[i].body[lang],
  time: NOTIF_TR[i].time[lang],
  cta: NOTIF_TR[i].cta[lang],
}));

const TR_NOTIF = {
  header: { ko: "알림", en: "Notifications", uz: "Bildirishnomalar", ru: "Уведомления" },
  markAllRead: { ko: "모두 읽음", en: "Mark all read", uz: "Barchasini o'qilgan deb belgilash", ru: "Отметить всё прочитанным" },
  unreadSection: { ko: "읽지 않음", en: "Unread", uz: "O'qilmagan", ru: "Непрочитанные" },
  earlierSection: { ko: "이전 알림", en: "Earlier", uz: "Avvalgi bildirishnomalar", ru: "Ранее" },
  settingsTitle: { ko: "알림 설정", en: "Notification Settings", uz: "Bildirishnoma sozlamalari", ru: "Настройки уведомлений" },
  dismiss: { ko: "닫기", en: "Dismiss", uz: "Yopish", ru: "Закрыть" },
  orderUpdates: { ko: "주문 업데이트", en: "Order updates", uz: "Buyurtma yangilanishlari", ru: "Обновления заказа" },
  prayerReminders: { ko: "기도 시간 알림", en: "Prayer time reminders", uz: "Namoz vaqti eslatmalari", ru: "Напоминания о намазе" },
  newRestaurant: { ko: "신규 식당 알림", en: "New restaurant alerts", uz: "Yangi restoran haqida xabar", ru: "Уведомления о новых ресторанах" },
  promotions: { ko: "프로모션", en: "Promotions", uz: "Aksiyalar", ru: "Акции" },
  ramadanSpecial: { ko: "라마단 특별 알림", en: "Ramadan special alerts", uz: "Ramazon maxsus xabarlari", ru: "Особые уведомления Рамадана" },
} satisfies Record<string, Record<Lang, string>>;

export const NotificationsScreen = () => {
  const { lang } = useLanguage();
  const tN = (k: keyof typeof TR_NOTIF) => TR_NOTIF[k][lang];
  const notifications = buildNotifications(lang);
  const [dismissed, setDismissed] = useState<number[]>([]);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <h1 className="font-bold text-lg flex-1">{tN("header")}</h1>
          <button className="text-sm font-medium" style={{ color: "var(--green)" }}>{tN("markAllRead")}</button>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-3 space-y-2">
        {/* Unread section */}
        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">{tN("unreadSection")}</p>
        {notifications.filter(n => n.unread && !dismissed.includes(notifications.indexOf(n))).map((n, i) => (
          <NotifCard key={i} notif={n} onDismiss={() => setDismissed(d => [...d, i])} />
        ))}

        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide pt-1">{tN("earlierSection")}</p>
        {notifications.filter(n => !n.unread).map((n, i) => (
          <NotifCard key={i + 100} notif={n} dim />
        ))}

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-4 space-y-3">
          <p className="font-bold text-sm text-[#1A1A18]">{tN("settingsTitle")}</p>
          {[
            { label: tN("orderUpdates"), on: true },
            { label: tN("prayerReminders"), on: true },
            { label: tN("newRestaurant"), on: false },
            { label: tN("promotions"), on: false },
            { label: tN("ramadanSpecial"), on: true },
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

const NotifCard = ({ notif, dim, onDismiss }: { notif: ReturnType<typeof buildNotifications>[0]; dim?: boolean; onDismiss?: () => void }) => {
  const { lang } = useLanguage();
  const tN = (k: keyof typeof TR_NOTIF) => TR_NOTIF[k][lang];
  return (
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
          <button onClick={onDismiss} className="text-xs text-[var(--muted)]">{tN("dismiss")}</button>
        )}
      </div>
    </div>
  </div>
  );
};

// ── 11. Ramadan Mode ───────────────────────────────────────────────────────────
const iftarTime = "18:54";
const suhoorTime = "04:41";

const TR_RAMADAN = {
  ramadanMode: { ko: "라마단 모드", en: "Ramadan Mode", uz: "Ramazon rejimi", ru: "Режим Рамадана" },
  ramadanMubarak: { ko: "라마단 무바락!", en: "Ramadan Mubarak!", uz: "Ramazon muborak!", ru: "Рамадан мубарак!" },
  dayOf: { ko: "1446년 라마단 17일째", en: "Day 17 of Ramadan 1446", uz: "1446-yil Ramazon oyining 17-kuni", ru: "17-й день Рамадана 1446" },
  suhoor: { ko: "수후르 Suhoor", en: "Suhoor", uz: "Sahar (Suhur)", ru: "Сухур" },
  iftar: { ko: "이프타르 Iftar", en: "Iftar", uz: "Iftorlik", ru: "Ифтар" },
  untilIftar: { ko: "이프타르까지", en: "Until Iftar", uz: "Iftorlikkacha", ru: "До ифтара" },
  specialIftarSet: { ko: "🌙 이프타르 특별 세트", en: "🌙 Special Iftar Sets", uz: "🌙 Maxsus iftorlik to'plamlari", ru: "🌙 Специальные наборы ифтара" },
  order: { ko: "주문하기", en: "Order Now", uz: "Buyurtma berish", ru: "Заказать" },
  todayPrayerTimes: { ko: "오늘 기도 시간", en: "Today's Prayer Times", uz: "Bugungi namoz vaqtlari", ru: "Сегодняшнее время намаза" },
  suhoorFajr: { ko: "수후르 (파즈르)", en: "Suhoor (Fajr)", uz: "Sahar (Bomdod)", ru: "Сухур (Фаджр)" },
  iftarMaghrib: { ko: "이프타르 (마그립)", en: "Iftar (Maghrib)", uz: "Iftorlik (Shom)", ru: "Ифтар (Магриб)" },
  communityIftar: { ko: "커뮤니티 이프타르 🍽️", en: "Community Iftar 🍽️", uz: "Jamoaviy iftorlik 🍽️", ru: "Общинный ифтар 🍽️" },
  communityDesc: { ko: "오늘 서울 무슬림 커뮤니티에서 이프타르 모임이 있습니다. 장소: 서울중앙성원 · 18:50", en: "There's a community iftar gathering today with Seoul's Muslim community. Location: Seoul Central Mosque · 18:50", uz: "Bugun Seul musulmon jamoasi bilan iftorlik uchrashuvi bo'ladi. Manzil: Seul Markaziy masjidi · 18:50", ru: "Сегодня состоится общинный ифтар с мусульманской общиной Сеула. Место: Центральная мечеть Сеула · 18:50" },
  joinNow: { ko: "참여 신청", en: "Join Now", uz: "Ishtirok etish", ru: "Присоединиться" },
} satisfies Record<string, Record<Lang, string>>;

export const RamadanScreen = () => {
  const { lang } = useLanguage();
  const tR = (k: keyof typeof TR_RAMADAN) => TR_RAMADAN[k][lang];
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
            <BackButton dark />
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs">{tR("ramadanMode")}</span>
              <Toggle on={ramadanMode} onToggle={() => setRamadanMode(!ramadanMode)} />
            </div>
          </div>

          {/* Crescent + arabic greeting */}
          <div className="text-center space-y-2 py-2">
            <div className="text-5xl">☪️</div>
            <p className="font-arabic text-3xl font-bold" style={{ color: "var(--gold)" }}>رمضان مبارك</p>
            <p className="text-white/80 font-semibold">{tR("ramadanMubarak")}</p>
            <p className="text-white/50 text-xs">{tR("dayOf")}</p>
          </div>

          {/* Iftar countdown */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              {[
                { label: tR("suhoor"), time: suhoorTime, icon: "🌄" },
                { label: tR("iftar"), time: iftarTime, icon: "🌅" },
              ].map((t) => (
                <div key={t.label} className="flex-1 text-center">
                  <p className="text-white/60 text-xs">{t.icon} {t.label}</p>
                  <p className="text-white font-bold text-xl tabular-nums">{t.time}</p>
                </div>
              ))}
            </div>
            <div className="text-center pt-2 border-t border-white/10">
              <p className="text-white/60 text-xs mb-0.5">{tR("untilIftar")}</p>
              <p className="text-white font-bold text-2xl tabular-nums" style={{ color: "var(--gold)" }}>1:47:23</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Special menu section */}
        <div>
          <p className="font-bold text-sm mb-2" style={{ color: ramadanMode ? "white" : "#1A1A18" }}>{tR("specialIftarSet")}</p>
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
                  <button className="w-full py-2 rounded-xl text-xs font-bold text-white mt-1" style={{ backgroundColor: "var(--green)" }}>{tR("order")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prayer schedule */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: ramadanMode ? "rgba(255,255,255,0.06)" : "white", border: ramadanMode ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
          <p className="font-bold text-sm mb-3" style={{ color: ramadanMode ? "white" : "#1A1A18" }}>{tR("todayPrayerTimes")}</p>
          <div className="space-y-2">
            {[
              { name: tR("suhoorFajr"), time: "04:41", passed: true },
              { name: "두흐르 Dhuhr", time: "12:16", passed: true },
              { name: "아스르 Asr", time: "14:33", passed: false, next: true },
              { name: tR("iftarMaghrib"), time: iftarTime, passed: false },
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
          <p className="font-bold text-sm mb-2" style={{ color: ramadanMode ? "white" : "#1A1A18" }}>{tR("communityIftar")}</p>
          <p className="text-sm" style={{ color: ramadanMode ? "rgba(255,255,255,0.6)" : "var(--muted)" }}>
            {tR("communityDesc")}
          </p>
          <button className="mt-3 px-4 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: "var(--gold)", color: "white" }}>
            {tR("joinNow")}
          </button>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};

// ── 12. Eid Special ────────────────────────────────────────────────────────────
const TR_EID = {
  eidFitrTab: { ko: "이드 알피트르", en: "Eid al-Fitr", uz: "Ramazon hayiti", ru: "Ураза-байрам" },
  eidAdhaTab: { ko: "이드 알아드하", en: "Eid al-Adha", uz: "Qurbon hayiti", ru: "Курбан-байрам" },
  fitrGreeting: { ko: "이드 알피트르 무바락!", en: "Eid al-Fitr Mubarak!", uz: "Ramazon hayitingiz muborak bo'lsin!", ru: "С праздником Ураза-байрам!" },
  adhaGreeting: { ko: "이드 알아드하 무바락!", en: "Eid al-Adha Mubarak!", uz: "Qurbon hayitingiz muborak bo'lsin!", ru: "С праздником Курбан-байрам!" },
  fitrSubtitle: { ko: "라마단이 끝나고 찾아온 기쁜 이드!", en: "A joyful Eid after a month of Ramadan!", uz: "Ramazon oyidan so'ng keladigan quvonchli hayit!", ru: "Радостный праздник после месяца Рамадана!" },
  adhaSubtitle: { ko: "희생과 헌신의 이드!", en: "A celebration of sacrifice and devotion!", uz: "Qurbonlik va sadoqat bayrami!", ru: "Праздник жертвенности и преданности!" },
  specialDeals: { ko: "🎁 이드 특별 혜택", en: "🎁 Eid Special Deals", uz: "🎁 Hayit uchun maxsus takliflar", ru: "🎁 Особые предложения на праздник" },
  eidCoupon: { ko: "이드 쿠폰", en: "Eid Coupon", uz: "Hayit kuponi", ru: "Купон к празднику" },
  eidCouponDesc: { ko: "전 주문 10% 할인", en: "10% off all orders", uz: "Barcha buyurtmalarga 10% chegirma", ru: "Скидка 10% на все заказы" },
  mosqueEvents: { ko: "모스크 행사", en: "Mosque Events", uz: "Masjid tadbirlari", ru: "Мероприятия в мечети" },
  mosqueEventsDesc: { ko: "서울 이드 예배 안내", en: "Eid prayer info in Seoul", uz: "Seuldagi hayit namozi haqida ma'lumot", ru: "Информация о праздничном намазе в Сеуле" },
  specialMenu: { ko: "특별 메뉴", en: "Special Menu", uz: "Maxsus menyu", ru: "Особое меню" },
  specialMenuDesc: { ko: "파트너 식당 이드 세트", en: "Eid sets from partner restaurants", uz: "Hamkor restoranlarning hayit to'plamlari", ru: "Праздничные наборы от ресторанов-партнёров" },
  freeDelivery: { ko: "배달 무료", en: "Free Delivery", uz: "Bepul yetkazib berish", ru: "Бесплатная доставка" },
  freeDeliveryDesc: { ko: "이드 당일 전 주문", en: "All orders on Eid day", uz: "Hayit kuni barcha buyurtmalarga", ru: "На все заказы в день праздника" },
  todayOnly: { ko: "오늘만", en: "Today only", uz: "Faqat bugun", ru: "Только сегодня" },
  viewSpecialMenu: { ko: "이드 특별 메뉴 보기", en: "View Eid Special Menu", uz: "Hayit maxsus menyusini ko'rish", ru: "Смотреть праздничное меню" },
  shareGreeting: { ko: "이드 인사 공유하기", en: "Share Eid Greeting", uz: "Hayit tabrigini ulashish", ru: "Поделиться поздравлением" },
} satisfies Record<string, Record<Lang, string>>;

export const EidScreen = () => {
  const { lang } = useLanguage();
  const tE = (k: keyof typeof TR_EID) => TR_EID[k][lang];
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
            {e === "fitr" ? tE("eidFitrTab") : tE("eidAdhaTab")}
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
          <p className="text-white font-bold text-2xl">{greeting === "fitr" ? tE("fitrGreeting") : tE("adhaGreeting")}</p>
          <p className="text-white/60 text-sm">{greeting === "fitr" ? tE("fitrSubtitle") : tE("adhaSubtitle")}</p>
        </div>

        {/* Emoji decoration */}
        <div className="text-4xl space-x-2">
          {greeting === "fitr" ? "🌙✨🎉" : "🐑🤲🕌"}
        </div>
      </div>

      <div className="relative z-10 px-4 pb-6 space-y-3">
        {/* Deals section */}
        <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="font-bold text-white text-sm">{tE("specialDeals")}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: tE("eidCoupon"), value: "₩10,000", desc: tE("eidCouponDesc") },
              { label: tE("mosqueEvents"), value: "5개", desc: tE("mosqueEventsDesc") },
              { label: tE("specialMenu"), value: "30+", desc: tE("specialMenuDesc") },
              { label: tE("freeDelivery"), value: tE("todayOnly"), desc: tE("freeDeliveryDesc") },
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
          {tE("viewSpecialMenu")}
        </button>
        <button className="w-full py-3 rounded-2xl font-semibold text-sm border border-white/20 text-white">
          {tE("shareGreeting")}
        </button>
      </div>
    </div>
  );
};
