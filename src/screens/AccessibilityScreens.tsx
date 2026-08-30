import React, { useState } from "react";
import { StatusBar, BackButton } from "../components/Shared";
import { useLanguage, type Lang, LanguageSwitcherFull } from "../components/LanguageSwitcher";

// ── 15. Onboarding Tutorial Overlay ───────────────────────────────────────────
const STEP_TR: Record<string, { title: Record<Lang, string>; body: Record<Lang, string> }> = {
  search: {
    title: { ko: "할랄 식당 검색", en: "Search Halal Restaurants", uz: "Halol restoranlarni qidirish", ru: "Поиск халяль-ресторанов" },
    body: { ko: "검색창을 눌러 주변 할랄 인증 식당을 찾아보세요. 음식 종류, 거리, 인증 유형으로 필터링할 수 있어요.", en: "Tap the search bar to find certified halal restaurants nearby. Filter by cuisine, distance, or certification type.", uz: "Yaqin atrofdagi sertifikatlangan halol restoranlarni topish uchun qidiruv panelini bosing. Taom turi, masofa yoki sertifikat turi bo'yicha filtrlashingiz mumkin.", ru: "Нажмите на строку поиска, чтобы найти сертифицированные халяль-рестораны поблизости. Фильтруйте по кухне, расстоянию или типу сертификации." },
  },
  prayer: {
    title: { ko: "기도 시간 배너", en: "Prayer Time Banner", uz: "Namoz vaqti banneri", ru: "Баннер времени намаза" },
    body: { ko: "홈 화면 상단에서 다음 기도까지 남은 시간을 확인하세요. 알림 설정으로 기도 시간을 놓치지 마세요.", en: "Check the time remaining until the next prayer at the top of the home screen. Set up notifications so you never miss a prayer.", uz: "Bosh sahifa yuqorisida keyingi namozgacha qolgan vaqtni tekshiring. Namozni o'tkazib yubormaslik uchun bildirishnomalarni sozlang.", ru: "Проверяйте время до следующего намаза вверху главного экрана. Настройте уведомления, чтобы не пропустить намаз." },
  },
  bottomnav: {
    title: { ko: "하단 탭 바", en: "Bottom Tab Bar", uz: "Pastki tab paneli", ru: "Нижняя панель вкладок" },
    body: { ko: "홈, 검색, 주문, 기도, 프로필 5개 탭으로 앱의 모든 기능에 빠르게 접근할 수 있습니다.", en: "Quickly access every feature of the app through 5 tabs: Home, Search, Orders, Prayer, and Profile.", uz: "Ilovaning barcha funksiyalariga 5 ta tab orqali tezda kirishingiz mumkin: Bosh sahifa, Qidiruv, Buyurtmalar, Namoz va Profil.", ru: "Быстрый доступ ко всем функциям приложения через 5 вкладок: Главная, Поиск, Заказы, Намаз и Профиль." },
  },
  scan: {
    title: { ko: "할랄 스캐너", en: "Halal Scanner", uz: "Halol skaner", ru: "Халяль-сканер" },
    body: { ko: "제품 바코드를 스캔해 할랄 여부를 즉시 확인하세요. 포장 식품 쇼핑 시 꼭 활용해 보세요!", en: "Scan a product barcode to instantly check if it's halal. Be sure to use it while shopping for packaged foods!", uz: "Mahsulot shtrix-kodini skanerlab, halolligini darhol tekshiring. Qadoqlangan oziq-ovqat sotib olayotganda albatta foydalaning!", ru: "Отсканируйте штрих-код продукта, чтобы мгновенно узнать, халяль ли он. Обязательно используйте при покупке упакованных продуктов!" },
  },
};

const steps = [
  {
    id: "search",
    spotlight: { top: 160, left: 16, width: 358, height: 48, radius: 24 },
    callout: { top: 228, align: "center" as const },
    arrowDir: "up" as const,
  },
  {
    id: "prayer",
    spotlight: { top: 108, left: 16, width: 358, height: 56, radius: 16 },
    callout: { top: 188, align: "center" as const },
    arrowDir: "up" as const,
  },
  {
    id: "bottomnav",
    spotlight: { top: 760, left: 0, width: 390, height: 84, radius: 0 },
    callout: { top: 666, align: "center" as const },
    arrowDir: "down" as const,
  },
  {
    id: "scan",
    spotlight: { top: 300, left: 120, width: 150, height: 150, radius: 75 },
    callout: { top: 470, align: "center" as const },
    arrowDir: "up" as const,
  },
];

const TR_FAKEHOME = {
  nextPrayer: { ko: "다음 기도: 아스르 Asr", en: "Next Prayer: Asr", uz: "Keyingi namoz: Asr", ru: "Следующий намаз: Аср" },
  searchPlaceholder: { ko: "할랄 음식 검색...", en: "Search halal food...", uz: "Halol taom qidirish...", ru: "Поиск халяльной еды..." },
  koreanHalal: { ko: "한식 할랄", en: "Korean Halal", uz: "Koreys halol", ru: "Корейская халяль" },
  turkish: { ko: "터키", en: "Turkish", uz: "Turk", ru: "Турецкая" },
  uzbek: { ko: "우즈베크", en: "Uzbek", uz: "O'zbek", ru: "Узбекская" },
  indian: { ko: "인도", en: "Indian", uz: "Hind", ru: "Индийская" },
  popularRestaurants: { ko: "인기 할랄 식당", en: "Popular Halal Restaurants", uz: "Mashhur halol restoranlar", ru: "Популярные халяль-рестораны" },
  more: { ko: "더보기 ›", en: "More ›", uz: "Ko'proq ›", ru: "Еще ›" },
} satisfies Record<string, Record<Lang, string>>;

// Fake home screen to place spotlight over
const FakeHomePreview = () => {
  const { lang } = useLanguage();
  const tF = (k: keyof typeof TR_FAKEHOME) => TR_FAKEHOME[k][lang];
  return (
  <div className="w-full h-full bg-[var(--cream)] relative pointer-events-none select-none overflow-hidden">
    {/* Status bar */}
    <div className="h-12 bg-[var(--green)] flex items-center justify-between px-6">
      <span className="text-white text-xs font-bold">9:41</span>
      <div className="flex gap-1.5">
        <div className="w-4 h-2.5 bg-white/60 rounded-sm" />
        <div className="w-3 h-2.5 bg-white/60 rounded-sm" />
        <div className="w-6 h-2.5 bg-white/40 rounded-sm" />
      </div>
    </div>

    {/* Prayer banner */}
    <div className="mx-4 mt-3 rounded-xl p-3 flex items-center gap-2" style={{ background: "linear-gradient(90deg, var(--green-dark), var(--green))" }}>
      <span className="text-xl">🌙</span>
      <div className="flex-1">
        <p className="text-white text-xs font-semibold">{tF("nextPrayer")}</p>
        <div className="h-1.5 bg-white/20 rounded-full mt-1"><div className="h-full w-1/3 rounded-full bg-[var(--gold)]" /></div>
      </div>
      <p className="text-[var(--gold)] text-xs font-bold">2:14</p>
    </div>

    {/* Search bar */}
    <div className="mx-4 mt-3 bg-white rounded-2xl h-12 flex items-center gap-2 px-4 shadow-sm border border-[var(--border)]">
      <span className="text-[var(--muted)] text-base">🔍</span>
      <p className="text-[var(--muted)] text-sm">{tF("searchPlaceholder")}</p>
    </div>

    {/* Category chips */}
    <div className="flex gap-2 px-4 mt-3 overflow-hidden">
      {[tF("koreanHalal"), tF("turkish"), tF("uzbek"), tF("indian")].map((c) => (
        <div key={c} className="flex-shrink-0 bg-white rounded-full px-3 py-1.5 text-xs font-medium text-[#1A1A18] border border-[var(--border)]">{c}</div>
      ))}
    </div>

    {/* Section label */}
    <div className="flex justify-between items-center px-4 mt-4 mb-2">
      <p className="font-bold text-sm text-[#1A1A18]">{tF("popularRestaurants")}</p>
      <p className="text-xs" style={{ color: "var(--green)" }}>{tF("more")}</p>
    </div>

    {/* Restaurant card previews */}
    <div className="flex gap-3 px-4 overflow-hidden">
      {["#D8D4CC", "#C4C0B8"].map((bg, i) => (
        <div key={i} className="w-40 flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="h-24 rounded-t-xl" style={{ backgroundColor: bg }} />
          <div className="p-2 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-2.5 bg-gray-100 rounded w-14" />
          </div>
        </div>
      ))}
    </div>

    {/* Bottom nav */}
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-[var(--border)] flex items-center justify-around px-4">
      {["🏠", "🔍", "🛵", "🌙", "👤"].map((icon, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-xl" style={{ opacity: i === 0 ? 1 : 0.4 }}>{icon}</span>
          <div className="h-1 w-1 rounded-full" style={{ backgroundColor: i === 0 ? "var(--green)" : "transparent" }} />
        </div>
      ))}
    </div>
  </div>
  );
};

const TR_TUTORIAL = {
  prev: { ko: "이전", en: "Previous", uz: "Orqaga", ru: "Назад" },
  next: { ko: "다음", en: "Next", uz: "Keyingi", ru: "Далее" },
  start: { ko: "시작하기 🎉", en: "Get Started 🎉", uz: "Boshlash 🎉", ru: "Начать 🎉" },
  skip: { ko: "건너뛰기", en: "Skip", uz: "O'tkazib yuborish", ru: "Пропустить" },
} satisfies Record<string, Record<Lang, string>>;

export const TutorialScreen = () => {
  const { lang } = useLanguage();
  const tT = (k: keyof typeof TR_TUTORIAL) => TR_TUTORIAL[k][lang];
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const sp = current.spotlight;

  return (
    <div className="flex flex-col h-full relative bg-black">
      {/* Base app preview */}
      <div className="absolute inset-0 z-0">
        <FakeHomePreview />
      </div>

      {/* Spotlight mask: dark overlay with hole cut out via SVG clip */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <svg width="390" height="844" viewBox="0 0 390 844">
          <defs>
            <mask id="spot-mask">
              <rect width="390" height="844" fill="white" />
              <rect
                x={sp.left} y={sp.top}
                width={sp.width} height={sp.height}
                rx={sp.radius} ry={sp.radius}
                fill="black"
              />
            </mask>
          </defs>
          <rect width="390" height="844" fill="rgba(0,0,0,0.72)" mask="url(#spot-mask)" />
          {/* Spotlight border glow */}
          <rect
            x={sp.left - 2} y={sp.top - 2}
            width={sp.width + 4} height={sp.height + 4}
            rx={sp.radius + 2} ry={sp.radius + 2}
            fill="none" stroke="#1B6B4A" strokeWidth="2.5" opacity="0.9"
          />
        </svg>
      </div>

      {/* Callout tooltip */}
      <div className="absolute z-20 left-4 right-4 pointer-events-none" style={{ top: current.callout.top }}>
        {/* Arrow */}
        {current.arrowDir === "up" && (
          <div className="flex justify-center mb-1.5">
            <svg width="20" height="14" viewBox="0 0 20 14">
              <polygon points="10,0 20,14 0,14" fill="white" />
            </svg>
          </div>
        )}
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <p className="font-bold text-sm text-[#1A1A18] mb-1">{STEP_TR[current.id].title[lang]}</p>
          <p className="text-xs text-[var(--muted)] leading-relaxed">{STEP_TR[current.id].body[lang]}</p>
        </div>
        {current.arrowDir === "down" && (
          <div className="flex justify-center mt-1.5">
            <svg width="20" height="14" viewBox="0 0 20 14">
              <polygon points="10,14 20,0 0,0" fill="white" />
            </svg>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-4 right-4 z-20 space-y-3">
        {/* Dots */}
        <div className="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className="h-2 rounded-full transition-all" style={{ backgroundColor: i === step ? "var(--green)" : "rgba(255,255,255,0.4)", width: i === step ? "20px" : "8px" }} />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-2xl font-bold text-sm bg-white/20 text-white backdrop-blur">
              {tT("prev")}
            </button>
          )}
          <button onClick={() => !isLast && setStep(s => s + 1)}
            className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
            style={{ backgroundColor: isLast ? "var(--gold)" : "var(--green)" }}>
            {isLast ? tT("start") : tT("next")}
          </button>
        </div>

        {!isLast && (
          <button className="w-full py-2 text-white/50 text-xs font-medium">{tT("skip")}</button>
        )}
      </div>
    </div>
  );
};

// ── 16. Multilingual Content Preview ─────────────────────────────────────────
const menuItems = [
  {
    ko: { name: "할랄 갈비탕", desc: "사골 육수와 소갈비로 만든 진한 탕", price: "₩13,500" },
    en: { name: "Halal Galbi-tang", desc: "Rich beef rib soup with bone broth", price: "₩13,500" },
    ar: { name: "حساء ضلوع البقر الحلال", desc: "حساء غني بضلوع البقر ومرق العظام", price: "₩13,500", rtl: true },
  },
  {
    ko: { name: "비빔밥 (할랄)", desc: "신선한 채소와 할랄 불고기가 들어간 비빔밥", price: "₩11,000" },
    en: { name: "Bibimbap (Halal)", desc: "Mixed rice with veggies & halal bulgogi", price: "₩11,000" },
    ar: { name: "بيبيمباب (حلال)", desc: "أرز مخلوط بالخضار ولحم البقر الحلال", price: "₩11,000", rtl: true },
  },
  {
    ko: { name: "된장찌개 세트", desc: "구수한 된장찌개 + 공기밥 + 반찬 3종", price: "₩12,000" },
    en: { name: "Doenjang-jjigae Set", desc: "Soybean paste stew + rice + 3 side dishes", price: "₩12,000" },
    ar: { name: "طقم حساء دوينجانج", desc: "حساء معجون فول الصويا + أرز + 3 أطباق جانبية", price: "₩12,000", rtl: true },
  },
];

const langs = [
  { code: "ko", label: "한국어", flag: "🇰🇷", dir: "ltr" as const },
  { code: "en", label: "English", flag: "🇺🇸", dir: "ltr" as const },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" as const },
];

const TR_MULTILINGUAL = {
  headerTitle: { ko: "다국어 콘텐츠 미리보기", en: "Multilingual Content Preview", uz: "Ko'p tilli kontent ko'rinishi", ru: "Предпросмотр многоязычного контента" },
  splitView: { ko: "분할 보기", en: "Split View", uz: "Bo'lingan ko'rinish", ru: "Раздельный вид" },
  appLanguage: { ko: "앱 표시 언어", en: "App Display Language", uz: "Ilova tili", ru: "Язык приложения" },
  appLanguageDesc: { ko: "앱 전체 화면에 표시되는 언어를 선택하세요.", en: "Choose the language shown throughout the app.", uz: "Ilovaning barcha ekranlarida ko'rsatiladigan tilni tanlang.", ru: "Выберите язык, отображаемый во всём приложении." },
  autoTranslateTitle: { ko: "다국어 자동 번역", en: "Automatic Translation", uz: "Avtomatik tarjima", ru: "Автоматический перевод" },
  autoTranslateDesc: { ko: "식당 메뉴가 한국어, 영어, 아랍어, 우즈베크어, 인도네시아어로 자동 번역됩니다. 식당 관리자가 직접 등록한 번역이 있으면 AI 번역보다 우선 표시됩니다.", en: "Restaurant menus are automatically translated into Korean, English, Arabic, Uzbek, and Indonesian. If a restaurant owner has provided their own translation, it takes priority over the AI translation.", uz: "Restoran menyulari koreys, ingliz, arab, o'zbek va indonez tillariga avtomatik tarjima qilinadi. Agar restoran egasi o'z tarjimasini kiritgan bo'lsa, u AI tarjimasidan ustun ko'rsatiladi.", ru: "Меню ресторанов автоматически переводится на корейский, английский, арабский, узбекский и индонезийский языки. Если владелец ресторана добавил собственный перевод, он отображается вместо перевода ИИ." },
  popularMenu: { ko: "🔥 인기메뉴", en: "🔥 Popular Menu", uz: "🔥 Mashhur menyu", ru: "🔥 Популярное меню" },
} satisfies Record<string, Record<Lang, string>>;

export const MultilingualScreen = () => {
  const { lang, setLang } = useLanguage();
  const tM = (k: keyof typeof TR_MULTILINGUAL) => TR_MULTILINGUAL[k][lang];
  const [activePreview, setActivePreview] = useState<"split" | "ko" | "en" | "ar">("split");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="font-bold text-base text-[#1A1A18]">{tM("headerTitle")}</h1>
            <p className="text-[11px] text-[var(--muted)]">한국어 · English · O'zbekcha · Русский</p>
          </div>
        </div>

        {/* View selector */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {[
            { id: "split", label: tM("splitView") },
            ...langs.map(l => ({ id: l.code, label: `${l.flag} ${l.label}` })),
          ].map((v) => (
            <button key={v.id} onClick={() => setActivePreview(v.id as typeof activePreview)}
              className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all"
              style={{
                backgroundColor: activePreview === v.id ? "var(--green)" : "transparent",
                color: activePreview === v.id ? "white" : "var(--muted)",
                border: activePreview === v.id ? "none" : "1px solid var(--border)",
              }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 phone-scroll">
        {/* Real app-wide language picker */}
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-bold text-sm text-[#1A1A18] mb-0.5">{tM("appLanguage")}</p>
            <p className="text-xs text-[var(--muted)] mb-3">{tM("appLanguageDesc")}</p>
            <LanguageSwitcherFull lang={lang} onChange={setLang} />
          </div>
        </div>

        {/* Restaurant header */}
        <div className="relative">
          <div className="h-32 bg-[#C4C0B8]" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=390&h=128&fit=crop&auto=format&q=80)`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-white font-bold text-base">
              {activePreview === "ar" ? "مطعم هالال سيندانغ الكوري" : activePreview === "en" ? "Sindang Halal Korean Kitchen" : "신당 할랄 키친"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>
                {activePreview === "ar" ? "حلال معتمد" : activePreview === "en" ? "HALAL CERTIFIED" : "HALAL 인증"}
              </span>
              <span className="text-white/70 text-xs">⭐ 4.8 · {activePreview === "ar" ? "2.3 كم" : "2.3km"}</span>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="px-4 pt-4 space-y-3">
          {/* Section label */}
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm text-[#1A1A18]">
              {activePreview === "ar" ? "🔥 القائمة الشعبية" : activePreview === "en" ? "🔥 Popular Menu" : activePreview === "ko" ? "🔥 인기메뉴" : tM("popularMenu")}
            </p>
          </div>

          {menuItems.map((item, i) => {
            if (activePreview === "split") {
              return (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
                    {langs.map((lang) => {
                      const content = item[lang.code as keyof typeof item] as { name: string; desc: string; price: string; rtl?: boolean };
                      return (
                        <div key={lang.code} className="p-2.5 min-h-[80px]" dir={content.rtl ? "rtl" : "ltr"}>
                          <div className="flex items-center gap-1 mb-1.5">
                            <span className="text-[10px]">{lang.flag}</span>
                            <span className="text-[9px] font-bold text-[var(--muted)] uppercase">{lang.label}</span>
                          </div>
                          <p className={`font-bold text-[11px] text-[#1A1A18] leading-tight mb-1 ${lang.code === "ar" ? "font-arabic" : ""}`}>
                            {content.name}
                          </p>
                          <p className={`text-[9px] text-[var(--muted)] leading-relaxed line-clamp-2 ${lang.code === "ar" ? "font-arabic" : ""}`}>
                            {content.desc}
                          </p>
                          <p className="font-bold text-[10px] text-[#1A1A18] mt-1">{content.price}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const lang = langs.find(l => l.code === activePreview)!;
            const content = item[lang.code as keyof typeof item] as { name: string; desc: string; price: string; rtl?: boolean };

            return (
              <div key={i} className="bg-white rounded-2xl p-3 shadow-sm flex gap-3" dir={content.rtl ? "rtl" : "ltr"}>
                <div className="w-16 h-16 rounded-xl bg-[#D8D4CC] flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-[#E8E4DC]" />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm text-[#1A1A18] ${lang.code === "ar" ? "font-arabic" : ""}`}>{content.name}</p>
                  <p className={`text-xs text-[var(--muted)] mt-0.5 leading-relaxed ${lang.code === "ar" ? "font-arabic" : ""}`}>{content.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-sm text-[#1A1A18]">{content.price}</p>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "var(--green)" }}>+</button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Language note */}
          <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: "var(--green-light)" }}>
            <span className="text-base mt-0.5">🌐</span>
            <div>
              <p className="font-bold text-xs text-[#1A1A18] mb-0.5">{tM("autoTranslateTitle")}</p>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                {tM("autoTranslateDesc")}
              </p>
            </div>
          </div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};
