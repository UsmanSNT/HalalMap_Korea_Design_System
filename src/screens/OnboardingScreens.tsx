import React, { useState } from "react";
import { GeometricPattern, StatusBar } from "../components/Shared";
import { useLanguage, type Lang } from "../components/LanguageSwitcher";

const TR_SPLASH = {
  tagline: { ko: "한국의 할랄 라이프스타일 앱", en: "Korea's Halal Lifestyle App", uz: "Koreyadagi halol turmush tarzi ilovasi", ru: "Приложение халяльного образа жизни в Корее" },
  version: { ko: "버전 1.0.0", en: "Version 1.0.0", uz: "Versiya 1.0.0", ru: "Версия 1.0.0" },
} satisfies Record<string, Record<Lang, string>>;

// ── 1. Splash Screen ──────────────────────────────────────────────────────────
export const SplashScreen = () => {
  const { lang } = useLanguage();
  const t = (k: keyof typeof TR_SPLASH) => TR_SPLASH[k][lang];
  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ backgroundColor: "var(--green)" }}>
      <GeometricPattern color="white" opacity={0.06} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
        {/* Logo mark */}
        <div className="animate-fade-scale flex flex-col items-center gap-4">
          <div className="relative">
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
              {/* Map pin shape */}
              <circle cx="44" cy="44" r="40" fill="rgba(255,255,255,0.12)" />
              <path
                d="M44 16C34 16 26 24 26 34.5C26 48 38 56 44 68C50 56 62 48 62 34.5C62 24 54 16 44 16Z"
                fill="white"
              />
              {/* Crescent inside */}
              <path
                d="M50 30C46 27.5 41.5 28 38.5 31C41 30.5 44 31.5 46 34C48 36.5 48 40 46 42.5C43.5 45.5 40 46 37 44.5C39.5 47 43.5 48 47.5 46C52 43.5 53.5 38 51.5 33.5C51 32 50.5 31 50 30Z"
                fill="var(--gold)"
              />
            </svg>
          </div>
          {/* Arabic accent */}
          <p
            className="font-arabic text-5xl font-bold leading-none"
            style={{ color: "var(--gold)" }}
            dir="rtl"
          >
            حلال
          </p>
          <div className="text-center">
            <p className="text-white font-bold text-2xl tracking-tight">HalalMap Korea</p>
            <p className="text-white/70 text-sm mt-1 font-medium">{t("tagline")}</p>
          </div>
        </div>
      </div>
      {/* Loading bar */}
      <div className="relative z-10 pb-16 px-12">
        <div className="h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full animate-loader-bar rounded-full"
            style={{ backgroundColor: "var(--gold)" }}
          />
        </div>
        <p className="text-white/50 text-xs text-center mt-3 font-medium">{t("version")}</p>
      </div>
    </div>
  );
};

// ── 2. Onboarding Carousel ────────────────────────────────────────────────────
const slides = [
  {
    emoji: "🍽️",
    title: {
      ko: "주변 할랄 음식을\n찾아보세요",
      en: "Find Halal Food\nNear You",
      uz: "Yaqin atrofdagi halol\ntaomlarni toping",
      ru: "Найдите халяльную\nеду поблизости",
    },
    desc: {
      ko: "인증된 할랄 레스토랑, 메뉴 정보, 리뷰를 한 곳에서 확인하세요.",
      en: "Discover certified halal restaurants, menus, and reviews all in one place.",
      uz: "Sertifikatlangan halol restoranlar, menyular va sharhlarni bir joydan toping.",
      ru: "Находите сертифицированные халяльные рестораны, меню и отзывы в одном месте.",
    },
    color: "var(--green)",
    illustration: () => (
      <div className="w-56 h-56 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "var(--green-light)" }} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-4xl">🍖</div>
          <div className="flex gap-2">
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">🍛</div>
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">🥙</div>
          </div>
        </div>
        <div
          className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "var(--green)", color: "white" }}
        >
          ✓ HALAL
        </div>
      </div>
    ),
  },
  {
    emoji: "🕌",
    title: {
      ko: "근처 모스크와\n기도실을 찾으세요",
      en: "Locate Nearby\nMosques",
      uz: "Yaqin atrofdagi masjid\nva namozxonalarni toping",
      ru: "Найдите ближайшие\nмечети и молельни",
    },
    desc: {
      ko: "전국 모스크, 기도실, 기도 시간을 실시간으로 안내해 드립니다.",
      en: "Find mosques, prayer rooms, and prayer times across South Korea.",
      uz: "Butun Janubiy Koreya bo'ylab masjidlar, namozxonalar va namoz vaqtlarini toping.",
      ru: "Находите мечети, молельные комнаты и время намаза по всей Южной Корее.",
    },
    color: "var(--gold)",
    illustration: (lang: Lang) => (
      <div className="w-56 h-56 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "var(--gold-light)" }} />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="10" y="40" width="60" height="32" fill="var(--gold)" rx="2"/>
            <path d="M10 40L40 20L70 40" fill="var(--gold)" opacity="0.7"/>
            <rect x="30" y="50" width="20" height="22" fill="white" rx="2"/>
            <ellipse cx="40" cy="15" rx="6" ry="8" fill="var(--gold)" opacity="0.9"/>
            <path d="M34 15C34 11.5 36.7 8.5 40 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="8" y="38" width="4" height="4" rx="0.5" fill="var(--gold-light)"/>
            <rect x="68" y="38" width="4" height="4" rx="0.5" fill="var(--gold-light)"/>
          </svg>
          <div
            className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm"
          >
            <span className="text-sm">🕐</span>
            <div>
              <p className="text-xs font-bold text-[#1A1A18]">{{
                ko: "다음 기도: 아스르", en: "Next prayer: Asr", uz: "Keyingi namoz: Asr", ru: "Следующий намаз: Аср",
              }[lang]}</p>
              <p className="text-xs" style={{ color: "var(--green)" }}>14:32 · {{
                ko: "1시간 47분 후", en: "in 1h 47m", uz: "1 soat 47 daqiqadan so'ng", ru: "через 1ч 47м",
              }[lang]}</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    emoji: "🔍",
    title: {
      ko: "제품 할랄 성분을\n바로 확인하세요",
      en: "Scan Products for\nHalal Status",
      uz: "Mahsulotning halolligini\ndarhol tekshiring",
      ru: "Проверяйте халяльность\nпродуктов мгновенно",
    },
    desc: {
      ko: "바코드 스캔으로 식품의 할랄 여부를 즉시 확인하고, 성분을 분석하세요.",
      en: "Scan barcodes to instantly verify halal status and analyze ingredients.",
      uz: "Shtrix-kodni skanerlab, mahsulotning halolligini va tarkibini darhol tekshiring.",
      ru: "Сканируйте штрих-коды, чтобы мгновенно проверить халяльность и состав.",
    },
    color: "var(--green)",
    illustration: (lang: Lang) => (
      <div className="w-56 h-56 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "var(--green-light)" }} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          {/* Scanner frame */}
          <div className="w-32 h-32 relative border-2 border-[#1B6B4A] rounded-xl flex items-center justify-center">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-[#1B6B4A] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-[#1B6B4A] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-[#1B6B4A] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-[#1B6B4A] rounded-br-lg" />
            {/* Barcode lines */}
            <div className="flex gap-1 items-center">
              {[3,5,2,4,3,6,2,4,3].map((h, i) => (
                <div key={i} className="bg-[#1A1A18] w-1 rounded-full" style={{ height: `${h * 6}px` }} />
              ))}
            </div>
          </div>
          {/* Result */}
          <div
            className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: "var(--green)" }}>✓</div>
            <p className="text-xs font-bold text-[#1A1A18]">{{
              ko: "할랄 인증 확인됨", en: "Halal status confirmed", uz: "Halollik tasdiqlandi", ru: "Халяльность подтверждена",
            }[lang]}</p>
          </div>
        </div>
      </div>
    ),
  },
];

const TR_ONBOARD = {
  skip: { ko: "건너뛰기", en: "Skip", uz: "O'tkazib yuborish", ru: "Пропустить" },
  next: { ko: "다음", en: "Next", uz: "Keyingisi", ru: "Далее" },
  getStarted: { ko: "시작하기", en: "Get Started", uz: "Boshlash", ru: "Начать" },
  login: { ko: "로그인", en: "Log In", uz: "Kirish", ru: "Войти" },
} satisfies Record<string, Record<Lang, string>>;

export const OnboardingScreen = ({ onSkip, onDone }: { onSkip?: () => void; onDone?: () => void } = {}) => {
  const [slide, setSlide] = useState(0);
  const current = slides[slide];
  const { lang } = useLanguage();
  const t = (k: keyof typeof TR_ONBOARD) => TR_ONBOARD[k][lang];

  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      {/* Skip button */}
      <div className="flex justify-end px-5 pt-2">
        <button onClick={onSkip} className="text-sm font-medium" style={{ color: "var(--muted)" }}>{t("skip")}</button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <div className="flex items-center justify-center">
          {current.illustration(lang)}
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h1 className="font-bold text-2xl text-[#1A1A18] leading-tight whitespace-pre-line">
            {current.title[lang]}
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">{current.desc[lang]}</p>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? "24px" : "8px",
                height: "8px",
                backgroundColor: i === slide ? "var(--green)" : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 space-y-3">
        {slide < slides.length - 1 ? (
          <button
            onClick={() => setSlide(slide + 1)}
            className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm"
            style={{ backgroundColor: "var(--green)" }}
          >
            {t("next")}
          </button>
        ) : (
          <>
            <button
              onClick={onDone}
              className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm"
              style={{ backgroundColor: "var(--green)" }}
            >
              {t("getStarted")}
            </button>
            <button
              onClick={onDone}
              className="w-full py-3 rounded-2xl font-semibold text-base border"
              style={{ color: "var(--green)", borderColor: "var(--green)" }}
            >
              {t("login")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── 3. Sign Up ────────────────────────────────────────────────────────────────
const TR_SIGNUP = {
  subtitle: { ko: "새 계정을 만들어 시작하세요", en: "Create a new account to get started", uz: "Boshlash uchun yangi hisob yarating", ru: "Создайте аккаунт, чтобы начать" },
  email: { ko: "이메일", en: "Email", uz: "Email", ru: "Эл. почта" },
  phone: { ko: "전화번호", en: "Phone Number", uz: "Telefon raqami", ru: "Номер телефона" },
  name: { ko: "이름", en: "Name", uz: "Ism", ru: "Имя" },
  password: { ko: "비밀번호", en: "Password", uz: "Parol", ru: "Пароль" },
  orSocial: { ko: "또는 소셜로 시작", en: "Or continue with social", uz: "Yoki ijtimoiy tarmoq orqali", ru: "Или через соцсети" },
  kakaoStart: { ko: "카카오로 시작하기", en: "Continue with Kakao", uz: "Kakao orqali davom etish", ru: "Продолжить с Kakao" },
  googleStart: { ko: "Google로 시작하기", en: "Continue with Google", uz: "Google orqali davom etish", ru: "Продолжить с Google" },
  appleStart: { ko: "Apple로 시작하기", en: "Continue with Apple", uz: "Apple orqali davom etish", ru: "Продолжить с Apple" },
  terms: { ko: "이용약관", en: "Terms of Service", uz: "Foydalanish shartlari", ru: "Условия использования" },
  and: { ko: "및", en: "and", uz: "va", ru: "и" },
  privacy: { ko: "개인정보처리방침", en: "Privacy Policy", uz: "Maxfiylik siyosati", ru: "Политика конфиденциальности" },
  agreeSuffix: { ko: "에 동의합니다", en: "I agree to the", uz: "shartlariga roziman", ru: "Я согласен(на) с" },
  signUp: { ko: "회원가입", en: "Sign Up", uz: "Ro'yxatdan o'tish", ru: "Зарегистрироваться" },
  haveAccount: { ko: "이미 계정이 있으신가요?", en: "Already have an account?", uz: "Hisobingiz bormi?", ru: "Уже есть аккаунт?" },
  login: { ko: "로그인", en: "Log In", uz: "Kirish", ru: "Войти" },
} satisfies Record<string, Record<Lang, string>>;

export const SignUpScreen = () => {
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [name, setName] = useState("김무함마드");
  const [email, setEmail] = useState("muhammad@example.com");
  const [pw, setPw] = useState("••••••••");
  const [agreed, setAgreed] = useState(false);
  const { lang } = useLanguage();
  const t = (k: keyof typeof TR_SIGNUP) => TR_SIGNUP[k][lang];

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="relative px-6 pt-12 pb-8 overflow-hidden" style={{ backgroundColor: "var(--green)" }}>
        <GeometricPattern color="white" opacity={0.06} />
        <div className="relative z-10 text-center">
          <p className="font-arabic text-3xl font-bold" style={{ color: "var(--gold)" }} dir="rtl">حلال</p>
          <p className="text-white font-bold text-lg mt-1">HalalMap Korea</p>
          <p className="text-white/70 text-sm mt-1">{t("subtitle")}</p>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-5 pt-5 pb-6 space-y-4">
        {/* Tab toggle */}
        <div className="flex bg-white rounded-xl p-1 border border-[var(--border)]">
          {(["email", "phone"] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === tabId ? "var(--green)" : "transparent",
                color: tab === tabId ? "white" : "var(--muted)",
              }}
            >
              {tabId === "email" ? t("email") : t("phone")}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--border)] focus-within:border-[var(--green)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--green)]" style={{ top: 8 }}>{t("name")}</label>
            <input className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--border)] focus-within:border-[var(--green)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--green)]" style={{ top: 8 }}>{tab === "email" ? t("email") : t("phone")}</label>
            <input className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--border)] focus-within:border-[var(--green)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--green)]" style={{ top: 8 }}>{t("password")}</label>
            <input type="password" className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
        </div>

        {/* Social */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted)]">{t("orSocial")}</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="space-y-2.5">
          {/* KakaoTalk */}
          <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-bold text-sm" style={{ backgroundColor: "#FEE500", color: "#1A1A18" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#1A1A18">
              <path d="M10 2C5.8 2 2.5 4.7 2.5 8C2.5 10 3.6 11.7 5.4 12.8L4.7 15.7L7.9 13.7C8.6 13.9 9.3 14 10 14C14.2 14 17.5 11.3 17.5 8C17.5 4.7 14.2 2 10 2Z"/>
            </svg>
            {t("kakaoStart")}
          </button>
          {/* Google */}
          <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-semibold text-sm bg-white border border-[var(--border)] text-[#1A1A18]">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2a10 10 0 00-.16-1.7H9v3.22h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9A8.78 8.78 0 0017.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26A5.43 5.43 0 019 14.4a5.4 5.4 0 01-5.07-3.73H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
              <path d="M3.93 10.67A5.41 5.41 0 013.65 9a5.41 5.41 0 01.28-1.67V5H.96A9 9 0 000 9a9 9 0 00.96 4l2.97-2.33z" fill="#FBBC05"/>
              <path d="M9 3.58a4.86 4.86 0 013.44 1.35l2.58-2.58A8.64 8.64 0 009 0 9 9 0 00.96 5l2.97 2.33A5.4 5.4 0 019 3.58z" fill="#EA4335"/>
            </svg>
            {t("googleStart")}
          </button>
          {/* Apple */}
          <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-semibold text-sm bg-[#1A1A18] text-white">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
              <path d="M12.5 0C10.5 0.1 8.1 1.4 7 3a4.9 4.9 0 00-1 2.9C8 6 10.4 4.8 11.5 3a4.7 4.7 0 001-3zm1.4 5.6c-1.7 0-3.2 1-4 1-1 0-2.4-1-3.9-1C3.5 5.6 1 7.7 1 11.2c0 3.4 3 7.8 5.2 7.8.9 0 1.6-.6 3.1-.6s2 .6 3.2.6C15 19 17 14.7 17 13.6a5.5 5.5 0 01-3.2-5.1c0-2 1.2-3 2.2-3.6a5.2 5.2 0 00-2.1-.3z"/>
            </svg>
            {t("appleStart")}
          </button>
        </div>

        {/* Terms */}
        <button
          onClick={() => setAgreed(!agreed)}
          className="flex items-start gap-3 text-left"
        >
          <div
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors"
            style={{
              backgroundColor: agreed ? "var(--green)" : "white",
              borderColor: agreed ? "var(--green)" : "var(--border)",
            }}
          >
            {agreed && <svg width="12" height="10" viewBox="0 0 12 10" fill="white"><path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span className="text-xs text-[var(--muted)] leading-relaxed">
            {lang === "ko" ? (
              <><span className="text-[var(--green)] font-medium">{t("terms")}</span> {t("and")} <span className="text-[var(--green)] font-medium">{t("privacy")}</span>{t("agreeSuffix")}</>
            ) : (
              <>{t("agreeSuffix")} <span className="text-[var(--green)] font-medium">{t("terms")}</span> {t("and")} <span className="text-[var(--green)] font-medium">{t("privacy")}</span></>
            )}
          </span>
        </button>

        {/* CTA */}
        <button
          className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm"
          style={{ backgroundColor: agreed ? "var(--green)" : "#9CA3AF" }}
        >
          {t("signUp")}
        </button>

        <p className="text-center text-sm text-[var(--muted)]">
          {t("haveAccount")}{" "}
          <span className="font-semibold" style={{ color: "var(--green)" }}>{t("login")}</span>
        </p>
      </div>
    </div>
  );
};

// ── 4. Login Screen ────────────────────────────────────────────────────────────
const TR_LOGIN = {
  subtitle: { ko: "테스트 계정으로 로그인하세요", en: "Sign in with a test account", uz: "Test akkauntingiz bilan kiring", ru: "Войдите с помощью тестового аккаунта" },
  emailOrPhone: { ko: "이메일 또는 전화번호", en: "Email or phone number", uz: "Email yoki telefon raqami", ru: "Эл. почта или номер телефона" },
  password: { ko: "비밀번호", en: "Password", uz: "Parol", ru: "Пароль" },
  forgotPassword: { ko: "비밀번호를 잊으셨나요?", en: "Forgot your password?", uz: "Parolni unutdingizmi?", ru: "Забыли пароль?" },
  checking: { ko: "확인 중…", en: "Checking…", uz: "Tekshirilmoqda…", ru: "Проверка…" },
  login: { ko: "로그인", en: "Log In", uz: "Kirish", ru: "Войти" },
  wrongCreds: { ko: "이메일 또는 비밀번호가 올바르지 않습니다", en: "Incorrect email or password", uz: "Email yoki parol noto‘g‘ri", ru: "Неверный email или пароль" },
  testAccounts: { ko: "테스트 계정", en: "Test Accounts", uz: "Test akkauntlari", ru: "Тестовые аккаунты" },
  roleUser: { ko: "사용자", en: "User", uz: "Foydalanuvchi", ru: "Пользователь" },
  roleOwner: { ko: "사장님", en: "Restaurant Owner", uz: "Oshxona egasi", ru: "Владелец ресторана" },
  roleCourier: { ko: "배달 기사", en: "Courier", uz: "Kuryer", ru: "Курьер" },
  roleAdmin: { ko: "관리자", en: "Admin", uz: "Admin", ru: "Администратор" },
  or: { ko: "또는", en: "or", uz: "yoki", ru: "или" },
  kakaoLogin: { ko: "카카오로 로그인", en: "Log in with Kakao", uz: "Kakao orqali kirish", ru: "Войти через Kakao" },
  googleLogin: { ko: "Google로 로그인", en: "Log in with Google", uz: "Google orqali kirish", ru: "Войти через Google" },
  noAccount: { ko: "계정이 없으신가요?", en: "Don't have an account?", uz: "Hisobingiz yo'qmi?", ru: "Нет аккаунта?" },
  signUp: { ko: "회원가입", en: "Sign Up", uz: "Ro'yxatdan o'tish", ru: "Зарегистрироваться" },
} satisfies Record<string, Record<Lang, string>>;

export const LoginScreen = ({ onLogin }: { onLogin?: (email: string, password: string) => Promise<boolean> }) => {
  const [email, setEmail] = useState("user@halalmap.test");
  const [pw, setPw] = useState("User123!");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { lang } = useLanguage();
  const t = (k: keyof typeof TR_LOGIN) => TR_LOGIN[k][lang];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!onLogin || submitting) return;
    setSubmitting(true);
    setError("");
    const success = await onLogin(email.trim().toLowerCase(), pw);
    if (!success) setError(t("wrongCreds"));
    setSubmitting(false);
  };

  const testAccounts: [string, string, string][] = [
    [t("roleUser"), "user@halalmap.test", "User123!"],
    [t("roleOwner"), "owner@halalmap.test", "Owner123!"],
    [t("roleCourier"), "courier@halalmap.test", "Courier123!"],
    [t("roleAdmin"), "admin@halalmap.test", "Admin123!"],
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <StatusBar />
      <form onSubmit={submit} className="flex-1 phone-scroll px-6 pt-4 pb-8 space-y-5">
        {/* Logo */}
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md" style={{ backgroundColor: "var(--green)" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 4C13 4 9 8 9 13C9 20 16 25 18 32C20 25 27 20 27 13C27 8 23 4 18 4Z" fill="white"/>
              <path d="M22 11C19.5 9 16.5 9.5 14.5 11.5C16.5 11 19 12 20.5 14C22 16 21.5 19 19.5 21C22 19.5 23.5 16.5 22.5 13.5C22.3 12.5 22.2 11.7 22 11Z" fill="var(--gold)"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl text-[#1A1A18]">HalalMap Korea</p>
            <p className="text-sm text-[var(--muted)] mt-0.5">{t("subtitle")}</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--green)] shadow-[0_0_0_2px_rgba(27,107,74,0.15)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--green)]" style={{ top: 8 }}>{t("emailOrPhone")}</label>
            <input className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--border)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--muted)]" style={{ top: 8 }}>{t("password")}</label>
            <input type="password" className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" className="text-sm font-medium" style={{ color: "var(--green)" }}>{t("forgotPassword")}</button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm disabled:opacity-60"
          style={{ backgroundColor: "var(--green)" }}
        >
          {submitting ? t("checking") : t("login")}
        </button>

        {error && <p className="text-center text-sm font-semibold text-[var(--danger)]">{error}</p>}

        <div className="rounded-2xl border border-[var(--border)] bg-white p-3 space-y-2">
          <p className="text-xs font-bold text-[#1A1A18]">{t("testAccounts")}</p>
          {testAccounts.map(([role, accountEmail, password]) => (
            <button
              type="button"
              key={accountEmail}
              onClick={() => { setEmail(accountEmail); setPw(password); setError(""); }}
              className="w-full rounded-xl bg-[var(--cream)] px-3 py-2 text-left"
            >
              <span className="block text-xs font-bold text-[var(--green)]">{role}</span>
              <span className="block text-[11px] text-[var(--muted)]">{accountEmail} · {password}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted)]">{t("or")}</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="space-y-2.5">
          <button type="button" className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-bold text-sm" style={{ backgroundColor: "#FEE500", color: "#1A1A18" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#1A1A18"><path d="M10 2C5.8 2 2.5 4.7 2.5 8C2.5 10 3.6 11.7 5.4 12.8L4.7 15.7L7.9 13.7C8.6 13.9 9.3 14 10 14C14.2 14 17.5 11.3 17.5 8C17.5 4.7 14.2 2 10 2Z"/></svg>
            {t("kakaoLogin")}
          </button>
          <button type="button" className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-semibold text-sm bg-white border border-[var(--border)] text-[#1A1A18]">
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2a10 10 0 00-.16-1.7H9v3.22h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9A8.78 8.78 0 0017.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26A5.43 5.43 0 019 14.4a5.4 5.4 0 01-5.07-3.73H.96v2.33A9 9 0 009 18z" fill="#34A853"/><path d="M3.93 10.67A5.41 5.41 0 013.65 9a5.41 5.41 0 01.28-1.67V5H.96A9 9 0 000 9a9 9 0 00.96 4l2.97-2.33z" fill="#FBBC05"/><path d="M9 3.58a4.86 4.86 0 013.44 1.35l2.58-2.58A8.64 8.64 0 009 0 9 9 0 00.96 5l2.97 2.33A5.4 5.4 0 019 3.58z" fill="#EA4335"/></svg>
            {t("googleLogin")}
          </button>
        </div>

        <p className="text-center text-sm text-[var(--muted)]">
          {t("noAccount")}{" "}
          <span className="font-semibold" style={{ color: "var(--green)" }}>{t("signUp")}</span>
        </p>
      </form>
    </div>
  );
};

// ── 5. Language Selection ─────────────────────────────────────────────────────
const languages: { code: string; flag: string; name: string; sub: string; rtl?: boolean }[] = [
  { code: "ko", flag: "🇰🇷", name: "한국어", sub: "Korean" },
  { code: "en", flag: "🇺🇸", name: "English", sub: "English" },
  { code: "uz", flag: "🇺🇿", name: "O'zbek", sub: "Uzbek" },
  { code: "ru", flag: "🇷🇺", name: "Русский", sub: "Russian" },
  { code: "ar", flag: "🇸🇦", name: "العربية", sub: "Arabic", rtl: true },
  { code: "id", flag: "🇮🇩", name: "Bahasa Indonesia", sub: "Indonesian" },
  { code: "bn", flag: "🇧🇩", name: "বাংলা", sub: "Bengali" },
];

const SUPPORTED_LANGS: Lang[] = ["ko", "en", "uz", "ru"];
const isSupportedLang = (code: string): code is Lang => (SUPPORTED_LANGS as string[]).includes(code);

const TR_LANGUAGE = {
  title: { ko: "언어 선택", en: "Select Language", uz: "Tilni tanlang", ru: "Выберите язык" },
  subtitle: { ko: "언어 선택 · Select Language", en: "Select Language · 언어 선택", uz: "Tilni tanlang · Select Language", ru: "Выберите язык · Select Language" },
  continue: { ko: "계속하기", en: "Continue", uz: "Davom etish", ru: "Продолжить" },
} satisfies Record<string, Record<Lang, string>>;

export const LanguageScreen = () => {
  const { lang, setLang } = useLanguage();
  const [selected, setSelected] = useState<string>(lang);
  const t = (k: keyof typeof TR_LANGUAGE) => TR_LANGUAGE[k][lang];

  const handleSelect = (code: string) => {
    setSelected(code);
    if (isSupportedLang(code)) setLang(code);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <StatusBar />
      <div className="px-5 pt-4 pb-2">
        <h1 className="font-bold text-2xl text-[#1A1A18]">{t("title")}</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">{t("subtitle")}</p>
      </div>

      <div className="flex-1 phone-scroll px-5 py-3 space-y-2">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => handleSelect(l.code)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border transition-all text-left"
            style={{
              borderColor: selected === l.code ? "var(--green)" : "var(--border)",
              boxShadow: selected === l.code ? "0 0 0 2px rgba(27,107,74,0.15)" : "none",
            }}
          >
            <span className="text-2xl flex-shrink-0">{l.flag}</span>
            <div className="flex-1" dir={l.rtl ? "rtl" : "ltr"}>
              <p className={`font-semibold text-base text-[#1A1A18] ${l.rtl ? "font-arabic" : ""}`}>{l.name}</p>
              <p className="text-sm text-[var(--muted)]">{l.sub}</p>
            </div>
            {selected === l.code && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--green)" }}
              >
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 5l3 3 7-7"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="px-5 pb-10">
        <button
          className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm"
          style={{ backgroundColor: "var(--green)" }}
        >
          {t("continue")}
        </button>
      </div>
    </div>
  );
};
