import { edit, component, wire } from './lib/tsx.mjs';
const tasks=[
 ['ContentScreens','HalalDatabase', ['수정','삭제','CSV 일괄 가져오기','검토 후 수정','신고 기각']],
 ['ContentScreens','MosqueManagement',['수정','승인','삭제']],
 ['ContentScreens','PromotionsManagement',['수정','종료']],
 ['CourierAdminScreens','CourierList',['+ 파트너 초대']],
 ['CourierAdminScreens','CourierApproval',['열기','추가 서류 요청']],
 ['CourierAdminScreens','CourierDetail',['메시지 보내기','파트너 정지']],
 ['OrdersScreens','AllOrders',['배달파트너 재배정']],
 ['RestaurantScreens','RestaurantList',['+ 직접 등록']],
 ['RestaurantScreens','RestaurantApproval',['열기','ℹ 추가 정보 요청']],
 ['RestaurantScreens','RestaurantDetail',['수정','인증서 보기']],
 ['SettingsScreens','PlatformSettings',['+ 지역 추가','수정','비활성화','템플릿 저장','재발급','복사']],
 ['SettingsScreens','AdminUsers',['수정','비활성화']],
 ['UserScreens','UserList',['+ 관리자 초대']],
 ['UserScreens','UserDetail',['비밀번호 초기화']],
];
for(const file of new Set(tasks.map(t=>`src/admin/${t[0]}.tsx`))) edit(file,s=>'import { explainUnavailable } from "../components/ActionDialog";\n'+s);
for(const [file,name,labels] of tasks) component(`src/admin/${file}.tsx`,name,s=>wire(s,labels.map(label=>[label,`() => explainUnavailable(${JSON.stringify(label)})`]),['button','Btn']));
edit('src/admin/OverviewScreens.tsx',s=>'import { navigate } from "../services/navigation";\nimport { showNotice } from "../components/ActionDialog";\n'+s);
component('src/admin/OverviewScreens.tsx','AdminHome',s=>wire(s,[
 ['모두 보기','() => showNotice("So‘nggi faoliyat", RECENT_ACTIVITIES.map(item => item.msg).join("\\n"))'],
 ['{act.action}','() => navigate(({ restaurant: "/admin/restaurant-approval", order: "/admin/orders", user: "/admin/users", courier: "/admin/courier-approval", scan: "/admin/halal-db", cert: "/admin/restaurants" } as Record<string, string>)[act.type])'],
]));
