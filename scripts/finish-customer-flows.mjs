import { read, edit, component, hook, wire } from './lib/tsx.mjs';
import { writeFileSync } from 'node:fs';
edit('src/App.tsx', s => {
  s='import RouteError from "./components/RouteError";\n'+s;
  s=s.replace('(localStorage.getItem("halalmap-language") as Lang) || "uz"','(["ko", "en", "uz", "ru"].includes(localStorage.getItem("halalmap-language") ?? "") ? localStorage.getItem("halalmap-language") as Lang : "uz")');
  s=s.replace('  if (!user) return <main', '  if (!route.valid) return <section className="p-8"><h1 className="text-xl font-bold">Sahifa topilmadi</h1><button className="mt-4" onClick={() => navigateRoute("/customer/home", undefined, true)}>Bosh sahifa</button></section>;\n  if (!user) return <main');
  s=s.replace('  if (workspace === "owner")', '  if (workspace === "admin" && user.role !== "admin") return <section className="p-8"><h1>Admin huquqi talab qilinadi</h1><button onClick={() => navigateRoute("/customer/home")}>Bosh sahifa</button></section>;\n  if (workspace === "owner")');
  s=s.replace('<CustomerScreen id={current}', '<CustomerScreen key={current + route.params.toString()} id={current}');
  s=s.replace('>{customerScreen}</DesktopCustomerShell>', '><RouteError key={current + route.params.toString()}>{customerScreen}</RouteError></DesktopCustomerShell>');
  s=s.replace('<ProfileScreen onTabChange={onTabChange} onLogout={onLogout} />', '<ProfileScreen onTabChange={onTabChange} onLogout={onLogout} />');
  // Keep test access available inside the section menu, away from mobile page controls.
  const start=s.indexOf('      {!partnerRole && <div className="fixed bottom-24');
  if(start>=0) { const end=s.indexOf('      </div>}',start); s=s.slice(0,start)+s.slice(end+'      </div>}'.length); }
  s=s.replace('    setWorkspace("customer");\n    setPartnerRole(null);','    setPartnerRole(null);');
  return s;
});
edit('src/components/FeatureNavigation.tsx',s=>s.replace('    </nav>', '      <section className="lg:hidden"><h2 className="mb-2 font-bold">Vaqtinchalik test panellari</h2><button className="block py-3" onClick={() => navigate("/courier/go-online")}>TEST · Kuryer</button><button className="block py-3" onClick={() => navigate("/owner/main-dashboard")}>TEST · Restoran egasi</button></section>\n    </nav>'));
edit('src/admin/AdminShared.tsx', s => {
  const labels=['home','restaurants','users','couriers','orders','analytics','settings','restaurant-approval','promotions','users']; let i=0;
  s=s.replace(/(const PALETTE_ITEMS = \[)([\s\S]*?)(\n\];)/,(_a,start,body,end)=>start+body.replace(/\{ icon:/g,()=>`{ route: "${labels[i++]}", icon:`)+end).replace('onNavigate(item.label)','onNavigate(item.route)').replace('w-[560px] rounded-2xl','w-[560px] max-w-[calc(100vw-32px)] rounded-2xl');
  return s;
});
// Shared navigation back actions honor browser history, with parent-route fallback on direct URLs.
for(const file of ['HomeScreens','OnboardingScreens']) edit(`src/screens/${file}.tsx`,s=>s.replace(/onBack=\{\(\) => onNavigate\?\.\("([^"]+)"\)\}/g,'onBack={() => goBack("/customer/$1")}'));
const home='src/screens/HomeScreens.tsx';
edit(home,s=>s.replace('useCart, addToCart, cartTotals','useCart, addToCart, cartTotals, changeMenuQuantity'));
component(home,'MenuScreen',s=>{
  const start=s.indexOf('  const [items, setItems] = useCart();'), end=s.indexOf('\n  return (',start);
  s=s.slice(0,start)+`  const [items] = useCart();
  const restaurant = readRoute().params.get("place") ?? restaurants[0].name;
  const cart = Object.fromEntries(menuItems.map(item => [item.name, items.filter(row => row.name === item.name && row.option === "보통" && row.restaurant === restaurant).reduce((sum,row) => sum+row.qty,0)]));
  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const update = (item: typeof menuItems[number], delta: number) => changeMenuQuantity({ name: item.name, price: item.price, option: "보통", restaurant }, delta);
  const visibleItems = activeTab === "인기메뉴" ? menuItems.filter(item => item.popular) : activeTab === "음료" || activeTab === "사이드" ? [] : activeTab === "세트메뉴" ? menuItems.filter(item => item.name.includes("세트")) : menuItems;
`+s.slice(end);
  s=s.replace(/setCart\(c => \(\{ \.\.\.c, \[item.name\]: Math.max\(0, \(c\[item.name\] \|\| 0\) - 1\) \}\)\)/g,'update(item, -1)').replace(/setCart\(c => \(\{ \.\.\.c, \[item.name\]: \(c\[item.name\] \|\| 0\) \+ 1 \}\)\)/g,'update(item, 1)').replace('setCart(c => ({ ...c, [item.name]: 1 }))','update(item, 1)');
  s=s.replace('{menuItems.map((item) => (', '{visibleItems.length === 0 && <p>Bu bo‘limda hozircha taomlar yo‘q.</p>}\n        {visibleItems.map((item) => (').replace('>신당 할랄 키친</h1>', '>{restaurant}</h1>');
  return s;
});
component(home,'CheckoutScreen',s=>s.replace('useState("문 앞에 놓아주세요")','useState("최대한 빨리 (30-40분)")').replace('color: i === 0 ?', 'color: delivery === opt ?').replace('<div className="flex flex-col h-full bg-[var(--cream)]">','<div className="flex flex-col h-full bg-[var(--cream)]"><p className="shrink-0 bg-[var(--gold-light)] px-4 py-2 text-xs">Sinov ko‘rinishi: to‘lov olinmaydi va buyurtma yuborilmaydi.</p>').replace(' 결제하기</span>', ' · Sinov ko‘rinishini ochish</span>'));
component(home,'OrderConfirmationScreen',s=>s.replace('<div className="flex flex-col h-full', '<div className="flex flex-col h-full').replace('<StatusBar', '<p className="shrink-0 bg-[var(--gold-light)] p-3 text-center text-xs">Sinov buyurtmasi. To‘lov olinmadi; buyurtma restoranga yuborilmadi.</p><StatusBar'));
component(home,'RestaurantDetailScreen',s=>s.replace('<HalalBadge variant="certified" />','<HalalBadge variant={selected.badge} />').replace('>이슬람 식품청 인증 할랄 한식 전문점. 돼지고기 및 알코올 완전 배제.</p>', '>{selected.cuisine} · Figma namuna ma’lumoti</p>'));
component(home,'ItemDetailScreen',s=>s.replace('src="https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=390&h=260&fit=crop&auto=format&q=80" alt="할랄 갈비탕"','src={`https://images.unsplash.com/photo-${item.imageId}?w=780&h=400&fit=crop&auto=format&q=80`} alt={item.name}').replace('>사골 육수를 12시간 우린 진한 국물에 소갈비를 듬뿍 넣은 한국 전통 보양식. 돼지고기·알코올 완전 배제.</p>','>{item.desc}</p>'));

const mosque='src/screens/MosqueScreens.tsx';
edit(mosque,s=>'import FavoriteButton from "../components/FavoriteButton";\n'+s);
component(mosque,'MosqueListScreen',s=>s.replace('<h3 className="font-bold text-base text-[#1A1A18] lg:text-sm">{m.name}</h3>','<h3><button onClick={() => navigate("mosque-detail", { place: m.name })} className="text-left font-bold text-base lg:text-sm">{m.name} →</button></h3>'));
component(mosque,'MosqueDetailScreen',s=>{
  s=hook(s,'const selected = mosques.find(item => item.name === readRoute().params.get("place")) ?? mosques[0];');
  s=s.replace('>서울중앙성원</h1>', '>{selected.name}</h1>').replace('>Seoul Central Mosque · 이슬람 서울 센터</p>', '>{selected.nameEn}</p>').replace('📍 서울특별시 용산구 우사단로10길 39','📍 {selected.address}').replace('<span className="text-2xl">🕌</span>', '<FavoriteButton name={selected.name} kind="mosque" />');
  return wire(s,[["", '() => navigate("share", { target: `/customer/mosque-detail?place=${encodeURIComponent(selected.name)}` })'],["공유하기", '() => navigate("share", { target: `/customer/mosque-detail?place=${encodeURIComponent(selected.name)}` })'],["🗺️ 길 찾기", '() => showNotice("Manzil", selected.address + " · Xarita provayderi hali ulanmagan.")']]);
});

const profile='src/screens/ProfileScreens.tsx';
edit(profile,s=>'import { useAddresses } from "../services/addressService";\n'+s.replace('explainUnavailable, showNotice','explainUnavailable, showNotice, editFields'));
component(profile,'AddressScreen',s=>{
  s=hook(s,`const [addresses, setAddresses] = useAddresses();
  const editAddress = async (index?: number) => {
    const old = index === undefined ? undefined : addresses[index];
    const values = await editFields(old ? "Manzilni tahrirlash" : "Yangi manzil", [{ name: "label", label: "Nomi", value: old?.label }, { name: "addr", label: "To‘liq manzil", value: old?.addr }]);
    if (!values) return;
    const address = { icon: old?.icon ?? "🏠", label: values.label.trim(), addr: values.addr.trim(), default: old?.default ?? addresses.length === 0 };
    setAddresses(list => index === undefined ? [...list, address] : list.map((item,i) => i === index ? address : item));
  };`);
  s=s.replace('{addresses.map((addr) => (', '{addresses.length === 0 && <p className="p-4 text-center">Hali manzil saqlanmagan.</p>}\n      {addresses.map((addr, index) => (').replace('key={addr.label}', 'key={index}');
  let empty=0;
  s=s.replace(/<button className="w-8 h-8 rounded-lg/g,()=>empty++===0 ? '<button aria-label="Manzilni tahrirlash" onClick={() => editAddress(index)} className="w-8 h-8 rounded-lg' : '<button aria-label="Manzilni o‘chirish" onClick={() => setAddresses(list => list.filter((_,i) => i !== index))} className="w-8 h-8 rounded-lg');
  return wire(s,[["새 주소 추가", '() => editAddress()'],["기본 주소로 설정", '() => setAddresses(list => list.map((item,i) => ({ ...item, default: i === index })))']]);
});
edit(home,s=>'import { useAddresses } from "../services/addressService";\n'+s);
component(home,'CheckoutScreen',s=>hook(s,'const [addresses] = useAddresses();\nconst selectedAddress = addresses.find(item => item.default);').replace('>집</p>', '>{selectedAddress?.label ?? "Manzil tanlang"}</p>').replace('>서울특별시 용산구 이태원로 123, 501호</p>', '>{selectedAddress?.addr ?? "Profil → Manzillar orqali qo‘shing"}</p>'));
component(profile,'SettingsScreen',s=>s.replace('useState(true)','useLocalState("notify-order", true)').replace('useState(true)','useLocalState("notify-prayer", true)').replace('useState(false)','useLocalState("notify-promo", false)'));

component('src/screens/OnboardingScreens.tsx','LoginScreen',s=>s.replace('<button className="w-full flex items-center gap-3 py-3.5', '<button type="button" onClick={() => explainUnavailable("Google OAuth kirish")} className="w-full flex items-center gap-3 py-3.5'));
edit('src/screens/OnboardingScreens.tsx',s=>s.replace('{ code: "uz", flag:', '{ code: "ru", flag: "🇷🇺", name: "Русский", sub: "Russian" },\n  { code: "uz", flag:'));
component('src/screens/OnboardingScreens.tsx','LanguageScreen',s=>s.replace('useState("ko")','useState(localStorage.getItem("halalmap-language") ?? "uz")').replace('onClick={() => setSelected(lang.code)}','onClick={() => ["ko", "en", "uz", "ru"].includes(lang.code) ? setSelected(lang.code) : showNotice("Til", "Bu tilning tarjimasi hali tayyor emas.")}'));

const community='src/screens/CommunityScreens.tsx';
component(community,'CommunityScreen',s=>{
  s=s.replace('useState<Record<number, boolean>>({})', 'useLocalState<Record<number, boolean>>("community-likes", {})').replace('{posts.map((post, i) => (', '{posts.filter(post => activeCategory === "전체" || post.category === activeCategory).map((post) => { const i = posts.indexOf(post); return (');
  s=s.replace('        ))}\n        <div className="h-4 lg:hidden"', '        ); })}\n        <div className="h-4 lg:hidden"');
  return wire(s,[["글쓰기", '() => explainUnavailable("Hamjamiyatga post yuborish")'],["{post.comments}", '() => showNotice(post.title, post.body + " · Izohlar API xizmati hali ulanmagan.")'],["공유", '() => navigate("share", { target: "/customer/community" })']]);
});
component(community,'ShareScreen',s=>{
  const start=s.indexOf('  const handleCopy = () => {'), end=s.indexOf('\n\n  return (',start);
  s=s.slice(0,start)+`  const target = readRoute().params.get("target") ?? "/customer/home";
  const safeTarget = target.startsWith("/customer/") ? target : "/customer/home";
  const link = new URL(window.location.href); link.hash = safeTarget;
  const handleCopy = async () => { try { await navigator.clipboard.writeText(link.href); setCopied(true); } catch { showNotice("Ulashish", "Havola: " + link.href); } };
  const handleShare = () => shareLink("HalalMap Korea", link.href).then(message => showNotice("Ulashish", message)).catch(() => showNotice("Ulashish", "Havola: " + link.href));`+s.slice(end);
  s=s.replace('onClick={t.label === "링크 복사" ? handleCopy : undefined}', 'onClick={t.label === "링크 복사" ? handleCopy : handleShare}').replace('halalmap.kr/r/sindang-halal','{link.href}').replace('halalmap.kr/restaurant/sindang','{link.href}'); return s;
});
component(home,'RestaurantDetailScreen',s=>s.replace('navigate("share")', 'navigate("share", { target: `/customer/restaurant-detail?place=${encodeURIComponent(selected.name)}` })'));

const engagement='src/screens/EngagementScreens.tsx';
component(engagement,'NotificationsScreen',s=>{
  s=s.replace('useState<number[]>([])','useLocalState<number[]>("read-notifications", [])');
  s=s.replace('onDismiss={() => setDismissed(d => [...d, i])}', 'onDismiss={() => setDismissed(d => [...d, notifications.indexOf(n)])}').replace('notifications.filter(n => !n.unread)', 'notifications.filter(n => !n.unread || dismissed.includes(notifications.indexOf(n)))');
  s=hook(s,'const [preferences, setPreferences] = useLocalState<Record<string, boolean>>("notification-preferences", {});');
  s=s.replace('<Toggle on={s.on} />','<Toggle on={preferences[s.label] ?? s.on} onToggle={() => setPreferences(old => ({ ...old, [s.label]: !(old[s.label] ?? s.on) }))} />');
  return wire(s,[["모두 읽음", '() => setDismissed(notifications.map((_,i) => i))']]);
});
edit(engagement,s=>s.replace('<button className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: notif.ctaColor }}>', '<button onClick={() => navigate(({ order: "order-tracking", prayer: "qibla", restaurant: "restaurant-list", promo: "loyalty", ramadan: "ramadan" } as Record<string,string>)[notif.type])} className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: notif.ctaColor }}>'));

const travel='src/screens/TravelScreens.tsx';
component(travel,'TravelPlannerScreen',s=>{
  s=hook(s,'const [savedTrips, setSavedTrips] = useLocalState<{ city: string; dates: string; spots: number; imageId: string }[]>("trips", []);');
  s=s.replace('<div key={i} className="relative w-36 h-24', '<button onClick={() => { setCity(trip.city); setDates(trip.dates); }} key={i} className="relative w-36 h-24').replace('              </div>\n            ))}\n          </div>\n        </div>\n\n        {/* Map', '              </button>\n            ))}\n          </div>\n        </div>\n\n        {/* Map');
  return wire(s,[["+ 새 여행", '() => { setCity(""); setDates(""); }'],["여행 저장", '() => { if (!city.trim() || !dates.trim()) { showNotice("Sayohat", "Shahar va sanalarni kiriting."); return; } setSavedTrips(old => [...old, { city: city.trim(), dates: dates.trim(), spots: 0, imageId: "1614854262318-831574f15f1f" }]); showNotice("Sayohat", "Reja shu qurilmada saqlandi."); }'],["", '() => showNotice(spot.name, spot.dist + " · Figma namuna joyi, jonli xarita ulanmagan.")']]);
});

// The scanner keeps design examples reachable without claiming a real scan took place.
component('src/screens/ScannerScreens.tsx','ScannerScreen',s=>s.replace('        {/* Recent scan */}', '        <div className="flex flex-wrap gap-3 text-sm text-white"><button onClick={() => navigate("scan-history")}>Skan tarixi</button><button onClick={() => navigate("scan-result")}>Namuna natijasi</button></div>\n        {/* Recent scan */}'));
component('src/screens/ScannerScreens.tsx','ScanResultScreen',s=>s.replace('      <div className="bg-white border-b', '      <p className="shrink-0 bg-[var(--gold-light)] p-3 text-xs">Figma namuna natijasi — haqiqiy mahsulot tekshiruvi emas.</p>\n      <div className="bg-white border-b'));
component('src/screens/ScannerScreens.tsx','ScanHistoryScreen',s=>{
  s=hook(s,'const [cleared, setCleared] = useLocalState("scan-history-cleared", false);');
  s=s.replace('{scanHistory.map', '{cleared && <p className="p-4">Skan tarixi bo‘sh.</p>}\n      {(cleared ? [] : scanHistory).map');
  s=s.replace('<p className="font-semibold text-sm text-[#1A1A18] truncate">{item.name}</p>', '<button onClick={() => navigate("scan-result", { verdict: item.verdict })} className="text-left font-semibold text-sm">{item.name}</button>');
  return wire(s,[["전체 삭제", '() => setCleared(true)']]);
});
edit('src/App.tsx',s=>s.replace('<ScanResultScreen verdict="halal" />','<ScanResultScreen verdict={(["halal", "haram", "mashbooh"].includes(new URLSearchParams(window.location.hash.split("?")[1]).get("verdict") ?? "") ? new URLSearchParams(window.location.hash.split("?")[1]).get("verdict") : "halal") as "halal" | "haram" | "mashbooh"} />'));
