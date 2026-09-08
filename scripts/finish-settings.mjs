import { component, wire } from './lib/tsx.mjs';
component('src/screens/OnboardingScreens.tsx', 'SignUpScreen', s => wire(s, [
  [/카카오로/, '() => explainUnavailable("Kakao orqali ro‘yxatdan o‘tish")'],
  [/Google로/, '() => explainUnavailable("Google orqali ro‘yxatdan o‘tish")'],
  [/Apple로/, '() => explainUnavailable("Apple orqali ro‘yxatdan o‘tish")'],
  ['회원가입', '() => explainUnavailable("Yangi mijoz akkaunti yaratish")'],
]).replace('className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm"', 'disabled={!agreed || !name.trim() || !email.trim() || !pw} className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm"')
.replace('<span className="font-semibold" style={{ color: "var(--green)" }}>로그인</span>', '<button type="button" onClick={() => navigate("/customer/home")} className="font-semibold" style={{ color: "var(--green)" }}>로그인</button>'));
component('src/screens/ProfileScreens.tsx', 'SettingsScreen', s => wire(s, [
  [/할랄 인증 기관/, '() => showNotice("Halal sertifikatlari", "Bu katalogda KMF, JAKIM va IFANCA belgilari namuna sifatida ko‘rsatilgan. Amaldagi sertifikatni restoran bilan tekshiring.")'],
  ['{item}', '() => explainUnavailable(item)'],
  ['데이터 삭제 요청', '() => explainUnavailable("Hisob ma’lumotlarini o‘chirish so‘rovi")'],
]).replace('onClick={() => setTheme(t)}', 'onClick={() => t === "light" ? setTheme(t) : showNotice("Mavzu", "Hozircha ushbu dizaynda faqat yorug‘ mavzu tayyor.")}')
.replace('<p className="text-sm font-semibold text-[#1A1A18]">언어</p>', '<button type="button" onClick={() => navigate("/customer/language")} className="text-sm font-semibold text-[#1A1A18]">언어</button>'));
