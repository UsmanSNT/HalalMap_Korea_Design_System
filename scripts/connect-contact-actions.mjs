import { edit, component, wire } from './lib/tsx.mjs';
const tasks = [
 ['src/screens/CommunityScreens.tsx','ReviewsScreen', [['리뷰 쓰기','Sharh yuborish']]],
 ['src/screens/OrderScreens.tsx','OrderTrackingScreen', [['','Kuryer bilan bog‘lanish']]],
 ['src/courier/EarningsScreens.tsx','PayoutScreen', [['계좌 변경','To‘lov hisobini o‘zgartirish']]],
 ['src/courier/MainFlowScreens.tsx','OrderAcceptedScreen', [['','Restoranga qo‘ng‘iroq qilish']]],
 ['src/courier/MainFlowScreens.tsx','AtRestaurantScreen', [['','Restoranga qo‘ng‘iroq qilish']]],
 ['src/courier/MainFlowScreens.tsx','DeliveringScreen', [['전화','Mijozga qo‘ng‘iroq qilish'],['채팅','Mijoz bilan chat']]],
 ['src/courier/MainFlowScreens.tsx','DeliveryIssueScreen', [['신고 제출','Yetkazish muammosini yuborish'],['고객센터 연결','Yordam markazi bilan bog‘lanish']]],
 ['src/courier/OnboardingScreens.tsx','CourierRegistrationScreen', [['파일 선택','Hujjat yuklash'],['등록 신청 제출','Kuryer arizasini yuborish']]],
 ['src/courier/OnboardingScreens.tsx','CourierLoginScreen', [[/카카오로/,'Kakao orqali kirish'],['로그인','SMS orqali kirish']]],
 ['src/courier/OnboardingScreens.tsx','VerificationPendingScreen', [['카카오톡으로 알림 받기','Kakao bildirishnomasi']]],
 ['src/dashboard/AnalyticsScreens.tsx','ReviewsManagement', [['','Sharh menyusi'],['답변 등록','Sharhga javob yuborish'],['신고하기','Sharh haqida shikoyat yuborish']]],
 ['src/dashboard/BusinessScreens.tsx','HalalCertification', [['보기','Sertifikat faylini ochish'],['파일 선택','Sertifikat yuklash'],['검토 요청 제출','Sertifikat tekshiruvini so‘rash']]],
];
for (const file of new Set(tasks.map(t=>t[0]))) edit(file,s=>s.includes('import { explainUnavailable') ? s : 'import { explainUnavailable } from "../components/ActionDialog";\n'+s);
for (const [file,name,maps] of tasks) component(file,name,s=>wire(s,maps.map(([label,feature])=>[label,`() => explainUnavailable(${JSON.stringify(feature)})`])));
