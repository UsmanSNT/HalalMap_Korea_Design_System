import React, { useState } from "react";
import { GeometricPattern, StatusBar, BottomNav, BackButton, Toggle, HalalBadge, StarRating, TabId } from "../components/Shared";
import { useLanguage, useT, LanguageSwitcherFull, LANGUAGES, type Lang } from "../components/LanguageSwitcher";

// ── 28. Profile Screen ─────────────────────────────────────────────────────────
const TR1 = {
  orderHistory: { ko: "주문 내역", en: "Order History", uz: "Buyurtmalar tarixi", ru: "История заказов" },
  recentOrders: { ko: "최근 주문 12개", en: "12 recent orders", uz: "So'nggi 12 ta buyurtma", ru: "12 недавних заказов" },
  addressMgmt: { ko: "배달 주소 관리", en: "Delivery Addresses", uz: "Yetkazib berish manzillari", ru: "Адреса доставки" },
  savedCount3: { ko: "3개 저장됨", en: "3 saved", uz: "3 ta saqlangan", ru: "3 сохранено" },
  paymentMethod: { ko: "결제 수단", en: "Payment Methods", uz: "To'lov usullari", ru: "Способы оплаты" },
  cardNumber: { ko: "신한카드 ····4521", en: "Shinhan Card ····4521", uz: "Shinhan karta ····4521", ru: "Карта Shinhan ····4521" },
  savedPlaces: { ko: "저장된 식당 · 모스크", en: "Saved Restaurants & Mosques", uz: "Saqlangan restoranlar va masjidlar", ru: "Сохранённые рестораны и мечети" },
  savedCount5: { ko: "5개 저장됨", en: "5 saved", uz: "5 ta saqlangan", ru: "5 сохранено" },
  notifSettings: { ko: "알림 설정", en: "Notification Settings", uz: "Bildirishnoma sozlamalari", ru: "Настройки уведомлений" },
  languageSettings: { ko: "언어 설정", en: "Language", uz: "Til", ru: "Язык" },
  couponPoints: { ko: "쿠폰 · 포인트", en: "Coupons & Points", uz: "Kupon va ballar", ru: "Купоны и баллы" },
  points: { ko: "3,200포인트", en: "3,200 points", uz: "3,200 ball", ru: "3 200 баллов" },
  support: { ko: "고객센터", en: "Support", uz: "Mijozlarni qo'llab-quvvatlash", ru: "Служба поддержки" },
  settings: { ko: "설정", en: "Settings", uz: "Sozlamalar", ru: "Настройки" },
  regularMember: { ko: "일반 회원", en: "Standard Member", uz: "Oddiy a'zo", ru: "Обычный участник" },
  pointsSuffix: { ko: "· 3,200 포인트", en: "· 3,200 points", uz: "· 3,200 ball", ru: "· 3 200 баллов" },
  totalOrders: { ko: "총 주문", en: "Total Orders", uz: "Jami buyurtmalar", ru: "Всего заказов" },
  reviews: { ko: "리뷰", en: "Reviews", uz: "Sharhlar", ru: "Отзывы" },
  saved: { ko: "저장", en: "Saved", uz: "Saqlangan", ru: "Сохранено" },
  ordersCount: { ko: "12회", en: "12", uz: "12", ru: "12" },
  reviewsCount: { ko: "8개", en: "8", uz: "8", ru: "8" },
  savedCount: { ko: "5개", en: "5", uz: "5", ru: "5" },
  logout: { ko: "Chiqish", en: "Log Out", uz: "Chiqish", ru: "Выйти" },
} satisfies Record<string, Record<Lang, string>>;

export const ProfileScreen = ({ onTabChange, onLogout }: { onTabChange?: (t: TabId) => void; onLogout?: () => void }) => {
  const t = useT(TR1);
  const { lang } = useLanguage();
  const currentLangNative = LANGUAGES.find((l) => l.id === lang)?.native ?? "";
  const profileMenu = [
    { icon: "📦", label: t("orderHistory"), sub: t("recentOrders") },
    { icon: "🏠", label: t("addressMgmt"), sub: t("savedCount3") },
    { icon: "💳", label: t("paymentMethod"), sub: t("cardNumber") },
    { icon: "❤️", label: t("savedPlaces"), sub: t("savedCount5") },
    { icon: "🔔", label: t("notifSettings"), sub: "" },
    { icon: "🌐", label: t("languageSettings"), sub: currentLangNative },
    { icon: "🎟", label: t("couponPoints"), sub: t("points") },
    { icon: "❓", label: t("support"), sub: "" },
    { icon: "⚙️", label: t("settings"), sub: "" },
  ];
  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    {/* Header */}
    <div className="relative overflow-hidden flex-shrink-0" style={{ backgroundColor: "var(--green)" }}>
      <GeometricPattern color="white" opacity={0.06} />
      <StatusBar dark />
      <div className="relative z-10 px-5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white">
            김
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-white">김무함마드</p>
            <p className="text-white/70 text-sm">muhammad@example.com</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{t("regularMember")}</span>
              <span className="text-xs text-white/60">{t("pointsSuffix")}</span>
            </div>
          </div>
          <button className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8"><path d="M2 12L5 11L13 3a1.4 1.4 0 00-2-2L3 10L2 13z"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div className="flex-1 phone-scroll">
      {/* Stats row */}
      <div className="bg-white px-4 py-4 flex divide-x divide-[var(--border)]">
        {[{ label: t("totalOrders"), val: t("ordersCount") }, { label: t("reviews"), val: t("reviewsCount") }, { label: t("saved"), val: t("savedCount") }].map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p className="font-bold text-xl text-[#1A1A18]">{s.val}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="bg-white mt-2 divide-y divide-[var(--border)]">
        {profileMenu.map((item) => (
          <button key={item.label} className="w-full flex items-center gap-3 px-5 py-4 text-left active:bg-[var(--cream)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--cream)] flex items-center justify-center text-lg flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A18]">{item.label}</p>
              {item.sub && <p className="text-xs text-[var(--muted)] mt-0.5">{item.sub}</p>}
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8">
              <path d="M6 4l4 4-4 4" strokeLinecap="round"/>
            </svg>
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="text-xs text-[var(--muted)] text-center">HalalMap Korea v1.0.0</p>
        <button onClick={onLogout} className="w-full py-3 rounded-2xl font-semibold text-sm border border-[var(--danger)] text-[var(--danger)]">
          {t("logout")}
        </button>
      </div>
    </div>

    <BottomNav active="profile" onTabChange={onTabChange} />
  </div>
  );
};

// ── 29. Saved Places ───────────────────────────────────────────────────────────
const savedRestaurants = [
  { name: "신당 할랄 키친", badge: "certified" as const, rating: 4.8, count: 3241, imageId: "1498654896293-37c98e7f5fe4" },
  { name: "이스탄불 케밥 & 피데", badge: "certified" as const, rating: 4.5, count: 2110, imageId: "1529042410759-befb1204b468" },
  { name: "마스지드 서울 카페", badge: "owned" as const, rating: 4.9, count: 940, imageId: "1414235077428-338989a2e8c0" },
];

const savedMosques = [
  { name: "서울중앙성원", nameEn: "Seoul Central Mosque", distance: "1.2km" },
  { name: "이태원 마스지드", nameEn: "Itaewon Masjid", distance: "0.3km" },
];

const TR2 = {
  savedPlaces: { ko: "저장된 장소", en: "Saved Places", uz: "Saqlangan joylar", ru: "Сохранённые места" },
  restaurantsTab: { ko: "❤️ 식당", en: "❤️ Restaurants", uz: "❤️ Restoranlar", ru: "❤️ Рестораны" },
  mosquesTab: { ko: "🕌 모스크", en: "🕌 Mosques", uz: "🕌 Masjidlar", ru: "🕌 Мечети" },
  orderNow: { ko: "주문하기", en: "Order Now", uz: "Buyurtma berish", ru: "Заказать" },
} satisfies Record<string, Record<Lang, string>>;

export const SavedPlacesScreen = () => {
  const [tab, setTab] = useState<"restaurants" | "mosques">("restaurants");
  const t = useT(TR2);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <h1 className="font-bold text-lg flex-1">{t("savedPlaces")}</h1>
        </div>
        <div className="flex bg-[var(--cream)] mx-4 mb-4 rounded-xl p-1">
          {(["restaurants", "mosques"] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === tabId ? "var(--green)" : "transparent",
                color: tab === tabId ? "white" : "var(--muted)",
              }}
            >
              {tabId === "restaurants" ? t("restaurantsTab") : t("mosquesTab")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        {tab === "restaurants" ? (
          savedRestaurants.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-stretch">
              <div className="w-24 h-24 flex-shrink-0 bg-[#E8E6E1]">
                <img src={`https://images.unsplash.com/photo-${r.imageId}?w=180&h=180&fit=crop&auto=format&q=80`} alt={r.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <HalalBadge variant={r.badge} />
                  <p className="font-bold text-sm text-[#1A1A18] mt-1">{r.name}</p>
                  <StarRating rating={r.rating} count={r.count} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--green)" }}>{t("orderNow")}</button>
                  <button className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--danger)"><path d="M7 12S1 8 1 4.5C1 2.5 2.7 1 4.5 1c.9 0 1.8.4 2.5 1C7.7 1.4 8.6 1 9.5 1 11.3 1 13 2.5 13 4.5 13 8 7 12 7 12Z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          savedMosques.map((m) => (
            <div key={m.name} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--gold-light)" }}>
                <span className="text-2xl">🕌</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-base text-[#1A1A18]">{m.name}</p>
                <p className="text-xs text-[var(--muted)]">{m.nameEn} · {m.distance}</p>
              </div>
              <button className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--gold)"><path d="M7 12S1 8 1 4.5C1 2.5 2.7 1 4.5 1c.9 0 1.8.4 2.5 1C7.7 1.4 8.6 1 9.5 1 11.3 1 13 2.5 13 4.5 13 8 7 12 7 12Z"/></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── 30. Address Management ─────────────────────────────────────────────────────
const ADDRESS_LABELS = {
  home: { ko: "집", en: "Home", uz: "Uy", ru: "Дом" },
  work: { ko: "회사", en: "Work", uz: "Ish", ru: "Работа" },
  nearMosque: { ko: "모스크 근처", en: "Near Mosque", uz: "Masjid yaqinida", ru: "Рядом с мечетью" },
} satisfies Record<string, Record<Lang, string>>;

const addresses = [
  { icon: "🏠", labelKey: "home" as const, addr: "서울특별시 용산구 이태원로 123, 501호", default: true },
  { icon: "🏢", labelKey: "work" as const, addr: "서울특별시 강남구 테헤란로 456, 12층", default: false },
  { icon: "🕌", labelKey: "nearMosque" as const, addr: "서울특별시 용산구 우사단로10길 39", default: false },
];

const TR3 = {
  addressMgmt: { ko: "배달 주소 관리", en: "Delivery Addresses", uz: "Yetkazib berish manzillari", ru: "Адреса доставки" },
  default: { ko: "기본", en: "Default", uz: "Asosiy", ru: "По умолчанию" },
  setAsDefault: { ko: "기본 주소로 설정", en: "Set as Default", uz: "Asosiy manzil qilib belgilash", ru: "Сделать основным" },
  addNewAddress: { ko: "새 주소 추가", en: "Add New Address", uz: "Yangi manzil qo'shish", ru: "Добавить новый адрес" },
  selectOnMap: { ko: "지도에서 선택", en: "Select on Map", uz: "Xaritadan tanlash", ru: "Выбрать на карте" },
} satisfies Record<string, Record<Lang, string>>;

export const AddressScreen = () => {
  const t = useT(TR3);
  const { lang } = useLanguage();
  return (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-3">
        <BackButton />
        <h1 className="font-bold text-lg flex-1">{t("addressMgmt")}</h1>
      </div>
    </div>

    <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
      {addresses.map((addr) => (
        <div key={addr.labelKey} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: addr.default ? "var(--green-light)" : "var(--cream)" }}
            >
              {addr.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-sm text-[#1A1A18]">{ADDRESS_LABELS[addr.labelKey][lang]}</p>
                {addr.default && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--green)", color: "white" }}>{t("default")}</span>
                )}
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{addr.addr}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--muted)" strokeWidth="1.5"><path d="M2 10L4.5 9.5L11 3a1 1 0 00-1.5-1.5L3 8L2 11z"/></svg>
              </button>
              {!addr.default && (
                <button className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--danger)" strokeWidth="1.5"><path d="M2 3.5h10M5.5 3.5V2h3v1.5M6 6v4.5M8 6v4.5M3.5 3.5l.5 8h6l.5-8" strokeLinecap="round"/></svg>
                </button>
              )}
            </div>
          </div>
          {!addr.default && (
            <button className="mt-2 text-xs font-medium ml-13 pl-13" style={{ color: "var(--green)", paddingLeft: "52px" }}>
              {t("setAsDefault")}
            </button>
          )}
        </div>
      ))}

      {/* Add new */}
      <button className="w-full py-4 rounded-2xl border-2 border-dashed border-[var(--border)] flex items-center justify-center gap-2 font-semibold text-sm" style={{ color: "var(--muted)" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
        {t("addNewAddress")}
      </button>

      {/* Map hint */}
      <div className="h-28 rounded-2xl overflow-hidden bg-[#E8E4DC] relative">
        <img src="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=390&h=130&fit=crop&auto=format&q=80" alt="map" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-md flex items-center gap-2">
            <span>📍</span>
            <p className="text-sm font-semibold text-[#1A1A18]">{t("selectOnMap")}</p>
          </div>
        </div>
      </div>
      <div className="h-4" />
    </div>
  </div>
  );
};

// ── 31. Settings ───────────────────────────────────────────────────────────────
const TR4 = {
  settings: { ko: "설정", en: "Settings", uz: "Sozlamalar", ru: "Настройки" },
  notifications: { ko: "알림", en: "Notifications", uz: "Bildirishnomalar", ru: "Уведомления" },
  orderUpdates: { ko: "주문 업데이트", en: "Order Updates", uz: "Buyurtma yangilanishlari", ru: "Обновления заказа" },
  orderUpdatesSub: { ko: "주문 상태 변경 시 알림", en: "Get notified when your order status changes", uz: "Buyurtma holati o'zgarganda bildirishnoma", ru: "Уведомление при изменении статуса заказа" },
  prayerAlerts: { ko: "기도 시간 알림", en: "Prayer Time Alerts", uz: "Namoz vaqti bildirishnomalari", ru: "Оповещения о времени намаза" },
  prayerAlertsSub: { ko: "각 기도 시간 전 알림", en: "Get notified before each prayer time", uz: "Har bir namoz vaqtidan oldin bildirishnoma", ru: "Уведомление перед каждым намазом" },
  promotions: { ko: "프로모션", en: "Promotions", uz: "Aksiyalar", ru: "Акции" },
  promotionsSub: { ko: "할인 및 쿠폰 알림", en: "Notifications about discounts and coupons", uz: "Chegirma va kuponlar haqida bildirishnoma", ru: "Уведомления о скидках и купонах" },
  app: { ko: "앱", en: "App", uz: "Ilova", ru: "Приложение" },
  language: { ko: "언어", en: "Language", uz: "Til", ru: "Язык" },
  theme: { ko: "테마", en: "Theme", uz: "Mavzu", ru: "Тема" },
  light: { ko: "라이트", en: "Light", uz: "Yorug'", ru: "Светлая" },
  dark: { ko: "다크", en: "Dark", uz: "Qorong'i", ru: "Тёмная" },
  auto: { ko: "자동", en: "Auto", uz: "Avtomatik", ru: "Авто" },
  halalCertBodies: { ko: "할랄 인증 기관", en: "Halal Certification Bodies", uz: "Halol sertifikatlash tashkilotlari", ru: "Органы сертификации халяль" },
  account: { ko: "계정", en: "Account", uz: "Hisob", ru: "Аккаунт" },
  editProfile: { ko: "개인정보 변경", en: "Edit Profile", uz: "Shaxsiy ma'lumotlarni tahrirlash", ru: "Изменить личные данные" },
  changePassword: { ko: "비밀번호 변경", en: "Change Password", uz: "Parolni o'zgartirish", ru: "Изменить пароль" },
  requestDataDeletion: { ko: "데이터 삭제 요청", en: "Request Data Deletion", uz: "Ma'lumotlarni o'chirishni so'rash", ru: "Запросить удаление данных" },
  info: { ko: "정보", en: "Info", uz: "Ma'lumot", ru: "Информация" },
  termsOfService: { ko: "이용약관", en: "Terms of Service", uz: "Foydalanish shartlari", ru: "Условия использования" },
  privacyPolicy: { ko: "개인정보처리방침", en: "Privacy Policy", uz: "Maxfiylik siyosati", ru: "Политика конфиденциальности" },
  appVersion: { ko: "앱 버전", en: "App Version", uz: "Ilova versiyasi", ru: "Версия приложения" },
} satisfies Record<string, Record<Lang, string>>;

export const SettingsScreen = () => {
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPrayer, setNotifPrayer] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const t = useT(TR4);
  const currentLangNative = LANGUAGES.find((l) => l.id === lang)?.native ?? "";

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <h1 className="font-bold text-lg">{t("settings")}</h1>
        </div>
      </div>

      <div className="flex-1 phone-scroll space-y-2 py-3">
        {/* Notifications */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2">{t("notifications")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {[
              { label: t("orderUpdates"), sub: t("orderUpdatesSub"), state: notifOrder, set: setNotifOrder },
              { label: t("prayerAlerts"), sub: t("prayerAlertsSub"), state: notifPrayer, set: setNotifPrayer },
              { label: t("promotions"), sub: t("promotionsSub"), state: notifPromo, set: setNotifPromo },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A18]">{n.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{n.sub}</p>
                </div>
                <Toggle on={n.state} onToggle={() => n.set(!n.state)} />
              </div>
            ))}
          </div>
        </div>

        {/* App */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">{t("app")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            <button
              className="w-full flex items-center justify-between px-5 py-4"
              onClick={() => setLangPickerOpen((o) => !o)}
            >
              <div>
                <p className="text-sm font-semibold text-[#1A1A18]">{t("language")}</p>
                <p className="text-xs text-[var(--muted)]">Language</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--muted)]">{currentLangNative}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"
                  style={{ transform: langPickerOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
                  <path d="M6 4l4 4-4 4" strokeLinecap="round"/>
                </svg>
              </div>
            </button>
            {langPickerOpen && (
              <div className="px-5 py-4">
                <LanguageSwitcherFull lang={lang} onChange={(l) => { setLang(l); setLangPickerOpen(false); }} />
              </div>
            )}

            {/* Theme */}
            <div className="px-5 py-4">
              <p className="text-sm font-semibold text-[#1A1A18] mb-3">{t("theme")}</p>
              <div className="flex gap-2">
                {(["light", "dark", "auto"] as const).map((th) => (
                  <button
                    key={th}
                    onClick={() => setTheme(th)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                    style={{
                      backgroundColor: theme === th ? "var(--green)" : "white",
                      color: theme === th ? "white" : "var(--muted)",
                      borderColor: theme === th ? "var(--green)" : "var(--border)",
                    }}
                  >
                    {th === "light" ? t("light") : th === "dark" ? t("dark") : t("auto")}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-[#1A1A18]">{t("halalCertBodies")}</p>
                <p className="text-xs text-[var(--muted)]">KMF, JAKIM, IFANCA</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">{t("account")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {[t("editProfile"), t("changePassword")].map((item) => (
              <button key={item} className="w-full flex items-center justify-between px-5 py-4">
                <p className="text-sm font-semibold text-[#1A1A18]">{item}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </button>
            ))}
            <button className="w-full flex items-center justify-between px-5 py-4">
              <p className="text-sm font-semibold" style={{ color: "var(--danger)" }}>{t("requestDataDeletion")}</p>
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-5 mb-2 mt-2">{t("info")}</p>
          <div className="bg-white divide-y divide-[var(--border)]">
            {[t("termsOfService"), t("privacyPolicy")].map((item) => (
              <button key={item} className="w-full flex items-center justify-between px-5 py-4">
                <p className="text-sm font-semibold text-[#1A1A18]">{item}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
              </button>
            ))}
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-sm font-semibold text-[#1A1A18]">{t("appVersion")}</p>
              <p className="text-sm text-[var(--muted)]">1.0.0</p>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
};
