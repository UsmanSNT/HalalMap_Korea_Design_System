import React, { useState } from "react";
import { GeometricPattern, StatusBar } from "../components/Shared";

// ── 1. Splash Screen ──────────────────────────────────────────────────────────
export const SplashScreen = () => (
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
          <p className="text-white/70 text-sm mt-1 font-medium">한국의 할랄 라이프스타일 앱</p>
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
      <p className="text-white/50 text-xs text-center mt-3 font-medium">버전 1.0.0</p>
    </div>
  </div>
);

// ── 2. Onboarding Carousel ────────────────────────────────────────────────────
const slides = [
  {
    emoji: "🍽️",
    title: "주변 할랄 음식을\n찾아보세요",
    titleEn: "Find Halal Food Near You",
    desc: "인증된 할랄 레스토랑, 메뉴 정보, 리뷰를 한 곳에서 확인하세요.",
    descEn: "Discover certified halal restaurants, menus, and reviews all in one place.",
    color: "var(--green)",
    illustration: (
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
    title: "근처 모스크와\n기도실을 찾으세요",
    titleEn: "Locate Nearby Mosques",
    desc: "전국 모스크, 기도실, 기도 시간을 실시간으로 안내해 드립니다.",
    descEn: "Find mosques, prayer rooms, and prayer times across South Korea.",
    color: "var(--gold)",
    illustration: (
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
              <p className="text-xs font-bold text-[#1A1A18]">다음 기도: 아스르</p>
              <p className="text-xs" style={{ color: "var(--green)" }}>14:32 · 1시간 47분 후</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    emoji: "🔍",
    title: "제품 할랄 성분을\n바로 확인하세요",
    titleEn: "Scan Products for Halal Status",
    desc: "바코드 스캔으로 식품의 할랄 여부를 즉시 확인하고, 성분을 분석하세요.",
    descEn: "Scan barcodes to instantly verify halal status and analyze ingredients.",
    color: "var(--green)",
    illustration: (
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
            <p className="text-xs font-bold text-[#1A1A18]">할랄 인증 확인됨</p>
          </div>
        </div>
      </div>
    ),
  },
];

export const OnboardingScreen = () => {
  const [slide, setSlide] = useState(0);
  const current = slides[slide];

  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      {/* Skip button */}
      <div className="flex justify-end px-5 pt-2">
        <button className="text-sm font-medium" style={{ color: "var(--muted)" }}>건너뛰기</button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <div className="flex items-center justify-center">
          {current.illustration}
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h1 className="font-bold text-2xl text-[#1A1A18] leading-tight whitespace-pre-line">
            {current.title}
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">{current.desc}</p>
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
            다음
          </button>
        ) : (
          <>
            <button
              className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm"
              style={{ backgroundColor: "var(--green)" }}
            >
              시작하기
            </button>
            <button
              className="w-full py-3 rounded-2xl font-semibold text-base border"
              style={{ color: "var(--green)", borderColor: "var(--green)" }}
            >
              로그인
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── 3. Sign Up ────────────────────────────────────────────────────────────────
export const SignUpScreen = () => {
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [name, setName] = useState("김무함마드");
  const [email, setEmail] = useState("muhammad@example.com");
  const [pw, setPw] = useState("••••••••");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="relative px-6 pt-12 pb-8 overflow-hidden" style={{ backgroundColor: "var(--green)" }}>
        <GeometricPattern color="white" opacity={0.06} />
        <div className="relative z-10 text-center">
          <p className="font-arabic text-3xl font-bold" style={{ color: "var(--gold)" }} dir="rtl">حلال</p>
          <p className="text-white font-bold text-lg mt-1">HalalMap Korea</p>
          <p className="text-white/70 text-sm mt-1">새 계정을 만들어 시작하세요</p>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-5 pt-5 pb-6 space-y-4">
        {/* Tab toggle */}
        <div className="flex bg-white rounded-xl p-1 border border-[var(--border)]">
          {(["email", "phone"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === t ? "var(--green)" : "transparent",
                color: tab === t ? "white" : "var(--muted)",
              }}
            >
              {t === "email" ? "이메일" : "전화번호"}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--border)] focus-within:border-[var(--green)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--green)]" style={{ top: 8 }}>이름</label>
            <input className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--border)] focus-within:border-[var(--green)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--green)]" style={{ top: 8 }}>{tab === "email" ? "이메일" : "전화번호"}</label>
            <input className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--border)] focus-within:border-[var(--green)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--green)]" style={{ top: 8 }}>비밀번호</label>
            <input type="password" className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
        </div>

        {/* Social */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted)]">또는 소셜로 시작</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="space-y-2.5">
          {/* KakaoTalk */}
          <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-bold text-sm" style={{ backgroundColor: "#FEE500", color: "#1A1A18" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#1A1A18">
              <path d="M10 2C5.8 2 2.5 4.7 2.5 8C2.5 10 3.6 11.7 5.4 12.8L4.7 15.7L7.9 13.7C8.6 13.9 9.3 14 10 14C14.2 14 17.5 11.3 17.5 8C17.5 4.7 14.2 2 10 2Z"/>
            </svg>
            카카오로 시작하기
          </button>
          {/* Google */}
          <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-semibold text-sm bg-white border border-[var(--border)] text-[#1A1A18]">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2a10 10 0 00-.16-1.7H9v3.22h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9A8.78 8.78 0 0017.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26A5.43 5.43 0 019 14.4a5.4 5.4 0 01-5.07-3.73H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
              <path d="M3.93 10.67A5.41 5.41 0 013.65 9a5.41 5.41 0 01.28-1.67V5H.96A9 9 0 000 9a9 9 0 00.96 4l2.97-2.33z" fill="#FBBC05"/>
              <path d="M9 3.58a4.86 4.86 0 013.44 1.35l2.58-2.58A8.64 8.64 0 009 0 9 9 0 00.96 5l2.97 2.33A5.4 5.4 0 019 3.58z" fill="#EA4335"/>
            </svg>
            Google로 시작하기
          </button>
          {/* Apple */}
          <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-semibold text-sm bg-[#1A1A18] text-white">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
              <path d="M12.5 0C10.5 0.1 8.1 1.4 7 3a4.9 4.9 0 00-1 2.9C8 6 10.4 4.8 11.5 3a4.7 4.7 0 001-3zm1.4 5.6c-1.7 0-3.2 1-4 1-1 0-2.4-1-3.9-1C3.5 5.6 1 7.7 1 11.2c0 3.4 3 7.8 5.2 7.8.9 0 1.6-.6 3.1-.6s2 .6 3.2.6C15 19 17 14.7 17 13.6a5.5 5.5 0 01-3.2-5.1c0-2 1.2-3 2.2-3.6a5.2 5.2 0 00-2.1-.3z"/>
            </svg>
            Apple로 시작하기
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
            <span className="text-[var(--green)] font-medium">이용약관</span> 및 <span className="text-[var(--green)] font-medium">개인정보처리방침</span>에 동의합니다
          </span>
        </button>

        {/* CTA */}
        <button
          className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm"
          style={{ backgroundColor: agreed ? "var(--green)" : "#9CA3AF" }}
        >
          회원가입
        </button>

        <p className="text-center text-sm text-[var(--muted)]">
          이미 계정이 있으신가요?{" "}
          <span className="font-semibold" style={{ color: "var(--green)" }}>로그인</span>
        </p>
      </div>
    </div>
  );
};

// ── 4. Login Screen ────────────────────────────────────────────────────────────
export const LoginScreen = ({ onLogin }: { onLogin?: (email: string, password: string) => Promise<boolean> }) => {
  const [email, setEmail] = useState("user@halalmap.test");
  const [pw, setPw] = useState("User123!");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!onLogin || submitting) return;
    setSubmitting(true);
    setError("");
    const success = await onLogin(email.trim().toLowerCase(), pw);
    if (!success) setError("Email yoki parol noto‘g‘ri");
    setSubmitting(false);
  };

  const testAccounts = [
    ["User", "user@halalmap.test", "User123!"],
    ["Oshxona egasi", "owner@halalmap.test", "Owner123!"],
    ["Kuryer", "courier@halalmap.test", "Courier123!"],
    ["Admin", "admin@halalmap.test", "Admin123!"],
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
            <p className="text-sm text-[var(--muted)] mt-0.5">Test akkauntingiz bilan kiring</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--green)] shadow-[0_0_0_2px_rgba(27,107,74,0.15)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--green)]" style={{ top: 8 }}>이메일 또는 전화번호</label>
            <input className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative border rounded-xl px-4 pt-5 pb-2 bg-white border-[var(--border)]">
            <label className="absolute left-4 text-xs font-medium text-[var(--muted)]" style={{ top: 8 }}>비밀번호</label>
            <input type="password" className="w-full bg-transparent text-sm text-[#1A1A18] outline-none" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="text-sm font-medium" style={{ color: "var(--green)" }}>비밀번호를 잊으셨나요?</button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm disabled:opacity-60"
          style={{ backgroundColor: "var(--green)" }}
        >
          {submitting ? "Tekshirilmoqda…" : "Kirish"}
        </button>

        {error && <p className="text-center text-sm font-semibold text-[var(--danger)]">{error}</p>}

        <div className="rounded-2xl border border-[var(--border)] bg-white p-3 space-y-2">
          <p className="text-xs font-bold text-[#1A1A18]">Test akkauntlari</p>
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
          <span className="text-xs text-[var(--muted)]">또는</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="space-y-2.5">
          <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-bold text-sm" style={{ backgroundColor: "#FEE500", color: "#1A1A18" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#1A1A18"><path d="M10 2C5.8 2 2.5 4.7 2.5 8C2.5 10 3.6 11.7 5.4 12.8L4.7 15.7L7.9 13.7C8.6 13.9 9.3 14 10 14C14.2 14 17.5 11.3 17.5 8C17.5 4.7 14.2 2 10 2Z"/></svg>
            카카오로 로그인
          </button>
          <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl font-semibold text-sm bg-white border border-[var(--border)] text-[#1A1A18]">
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2a10 10 0 00-.16-1.7H9v3.22h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9A8.78 8.78 0 0017.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26A5.43 5.43 0 019 14.4a5.4 5.4 0 01-5.07-3.73H.96v2.33A9 9 0 009 18z" fill="#34A853"/><path d="M3.93 10.67A5.41 5.41 0 013.65 9a5.41 5.41 0 01.28-1.67V5H.96A9 9 0 000 9a9 9 0 00.96 4l2.97-2.33z" fill="#FBBC05"/><path d="M9 3.58a4.86 4.86 0 013.44 1.35l2.58-2.58A8.64 8.64 0 009 0 9 9 0 00.96 5l2.97 2.33A5.4 5.4 0 019 3.58z" fill="#EA4335"/></svg>
            Google로 로그인
          </button>
        </div>

        <p className="text-center text-sm text-[var(--muted)]">
          계정이 없으신가요?{" "}
          <span className="font-semibold" style={{ color: "var(--green)" }}>회원가입</span>
        </p>
      </form>
    </div>
  );
};

// ── 5. Language Selection ─────────────────────────────────────────────────────
const languages = [
  { code: "ko", flag: "🇰🇷", name: "한국어", sub: "Korean" },
  { code: "en", flag: "🇺🇸", name: "English", sub: "English" },
  { code: "uz", flag: "🇺🇿", name: "O'zbek", sub: "Uzbek" },
  { code: "ar", flag: "🇸🇦", name: "العربية", sub: "Arabic", rtl: true },
  { code: "id", flag: "🇮🇩", name: "Bahasa Indonesia", sub: "Indonesian" },
  { code: "bn", flag: "🇧🇩", name: "বাংলা", sub: "Bengali" },
];

export const LanguageScreen = () => {
  const [selected, setSelected] = useState("ko");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <StatusBar />
      <div className="px-5 pt-4 pb-2">
        <h1 className="font-bold text-2xl text-[#1A1A18]">언어 선택</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Select Language · اختر اللغة</p>
      </div>

      <div className="flex-1 phone-scroll px-5 py-3 space-y-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelected(lang.code)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border transition-all text-left"
            style={{
              borderColor: selected === lang.code ? "var(--green)" : "var(--border)",
              boxShadow: selected === lang.code ? "0 0 0 2px rgba(27,107,74,0.15)" : "none",
            }}
          >
            <span className="text-2xl flex-shrink-0">{lang.flag}</span>
            <div className="flex-1" dir={lang.rtl ? "rtl" : "ltr"}>
              <p className={`font-semibold text-base text-[#1A1A18] ${lang.rtl ? "font-arabic" : ""}`}>{lang.name}</p>
              <p className="text-sm text-[var(--muted)]">{lang.sub}</p>
            </div>
            {selected === lang.code && (
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
          계속하기 · Continue
        </button>
      </div>
    </div>
  );
};
