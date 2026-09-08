import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const read = p => readFileSync(p, 'utf8');
const edit = (p, fn) => writeFileSync(p, fn(read(p)));
function component(file, name, fn) {
  const source = read(file), ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const st of ast.statements) {
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (d.name.getText(ast) === name) {
      const start = st.getStart(ast), end = st.end;
      writeFileSync(file, source.slice(0,start) + fn(source.slice(start,end)) + source.slice(end)); return;
    }
  }
  throw new Error(`Missing ${name}`);
}
function hook(source, code) {
  const ast = ts.createSourceFile('x.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const arrow = ast.statements[0].declarationList.declarations[0].initializer;
  if (ts.isBlock(arrow.body)) return source.slice(0,arrow.body.getStart(ast)+1) + '\n' + code + '\n' + source.slice(arrow.body.getStart(ast)+1);
  const start = arrow.body.getStart(ast), end = arrow.body.end;
  return source.slice(0,start) + '{\n' + code + '\nreturn ' + source.slice(start,end) + ';\n}' + source.slice(end);
}
function wire(source, mappings) {
  const ast = ts.createSourceFile('x.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), patches = [];
  const walk = n => {
    if (ts.isJsxOpeningElement(n) && n.tagName.getText(ast) === 'button' && !n.attributes.properties.some(p => p.name?.getText(ast) === 'onClick')) {
      const text = n.parent.getText(ast).replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g,' ').trim();
      const entry = mappings.find(([match]) => typeof match === 'string' ? text === match : match.test(text));
      if (entry) patches.push([n.tagName.end, ` type="button" onClick={${entry[1]}}`]);
    }
    ts.forEachChild(n, walk);
  }; walk(ast);
  for (const [pos,text] of patches.sort((a,b)=>b[0]-a[0])) source = source.slice(0,pos)+text+source.slice(pos);
  return source.replace(/type="button" onClick=(\{[^\n]*?\}) type="button"/g, 'type="button" onClick=$1');
}
const imports = 'import { navigate, readRoute, goBack } from "../services/navigation";\nimport { useLocalState, readLocal, writeLocal } from "../services/localState";\nimport { explainUnavailable, showNotice } from "../components/ActionDialog";\nimport { shareLink } from "../services/shareService";\n';
const screenFiles = ['HomeScreens','ProfileScreens','SearchScreens','OnboardingScreens','OrderScreens','ScannerScreens','MosqueScreens','CommunityScreens','EngagementScreens','SmartScreens','RewardsScreens','TravelScreens','AccessibilityScreens'];
for (const name of screenFiles) edit(`src/screens/${name}.tsx`, s => imports+s);
for (const [file,state] of [['src/dashboard/DashboardApp.tsx','screen'],['src/admin/AdminApp.tsx','current'],['src/courier/CourierApp.tsx','active']]) edit(file,s=>s.replace('  return (\n    <div className="workspace-shell', '  const [menuOpen, setMenuOpen] = useState(false);\n  React.useEffect(() => setMenuOpen(false), ['+state+']);\n  return (\n    <div className={`workspace-shell ${menuOpen ? "menu-open" : ""}').replace('flex h-dvh w-full overflow-hidden" style=', 'flex h-dvh w-full overflow-hidden`} style=').replace('      {/* Sidebar */}', '      <button className="workspace-menu-toggle" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰ {menuOpen ? "Menyuni yopish" : "Ish paneli menyusi"}</button>\n      {/* Sidebar */}').replace('      {/* ── Sidebar ── */}', '      <button className="workspace-menu-toggle" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰ {menuOpen ? "Menyuni yopish" : "Ish paneli menyusi"}</button>\n      {/* ── Sidebar ── */}'));

// Keep existing Figma fixture content behind one catalog boundary.
const home = 'src/screens/HomeScreens.tsx';
const original = read(home);
const restaurantBlock = original.match(/const restaurants = \[[\s\S]*?\n\];/)[0];
const menuBlock = original.match(/const menuItems = \[[\s\S]*?\n\];/)[0];
mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/catalog.ts', '// Preserved Figma fixtures. Replace the catalog service when backend endpoints are available.\n'+restaurantBlock.replace('const restaurants','export const restaurants')+'\n'+menuBlock.replace('const menuItems','export const menuItems')+'\n');
writeFileSync('src/services/catalogService.ts', 'import { restaurants, menuItems } from "../data/catalog";\nexport const catalogService = {\n  restaurants: () => restaurants,\n  menu: () => menuItems,\n  restaurant: (name: string) => restaurants.find(item => item.name === name),\n  menuItem: (name: string) => menuItems.find(item => item.name === name),\n  search: (query: string) => restaurants.filter(item => `${item.name} ${item.cuisine}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())),\n};\n');
edit(home,s=>'import { catalogService } from "../services/catalogService";\nimport { useCart, addToCart, cartTotals } from "../services/commerce";\nimport FavoriteButton from "../components/FavoriteButton";\n'+s.replace(restaurantBlock,'const restaurants = catalogService.restaurants();').replace(menuBlock,'const menuItems = catalogService.menu();'));
edit('src/App.tsx',s=>'import { setUserStorageScope } from "./services/localState";\n'+s.replace('if (live) setUser(value);', 'if (live) { setUserStorageScope(String(value?.id ?? "guest")); setUser(value); }').replace('      setUser(loggedInUser);','      setUserStorageScope(String(loggedInUser.id));\n      setUser(loggedInUser);').replace('    setUser(null);','    setUserStorageScope("guest");\n    setUser(null);'));

component(home,'HomeScreen',s=>wire(s,[[/c.icon/, '() => navigate(c.label.includes("스캐너") ? "scanner" : "restaurant-list")']]));
component(home,'RestaurantListScreen',s=>{
  s=hook(s,'const query = readRoute().params.get("q") ?? "";\nconst visible = catalogService.search(query).slice().sort((a,b) => activeFilter === "⭐ 평점" ? b.rating-a.rating : parseFloat(a.distance)-parseFloat(b.distance));');
  // Derived values follow their state declaration.
  s=s.replace('const visible = catalogService.search(query).slice().sort((a,b) => activeFilter === "⭐ 평점" ? b.rating-a.rating : parseFloat(a.distance)-parseFloat(b.distance));','').replace('const [activeFilter, setActiveFilter] = useState("거리순");','const [activeFilter, setActiveFilter] = useState("거리순");\nconst visible = catalogService.search(query).slice().sort((a,b) => activeFilter === "⭐ 평점" ? b.rating-a.rating : activeFilter === "배달비" ? (parseInt(a.fee.replace(/\\D/g,"")) || 0) - (parseInt(b.fee.replace(/\\D/g,"")) || 0) : parseFloat(a.distance)-parseFloat(b.distance));');
  s=s.replace('{restaurants.length}', '{visible.length}').replace('{restaurants.map', '{visible.map').replace('onClick={() => onNavigate?.("restaurant-detail")}', 'onClick={() => navigate("restaurant-detail", { place: r.name })}').replace('phone-scroll px-4 py-4 space-y-3','phone-scroll responsive-grid px-4 py-4');
  s=s.replace('{visible.map', '{visible.length === 0 && <p>Natija topilmadi. Boshqa nom bilan qidiring.</p>}\n        {visible.map');
  return wire(s,[["빠른배달순", '() => setActiveFilter("거리순")']]);
});
component(home,'RestaurantDetailScreen',s=>{
  s=hook(s,'const selected = catalogService.restaurant(readRoute().params.get("place") ?? "") ?? restaurants[0];');
  s=s.replace('>신당 할랄 키친</h1>', '>{selected.name}</h1>').replace('rating={4.8} count={3241}', 'rating={selected.rating} count={selected.count}').replace('📍 2.3km','📍 {selected.distance}').replace('⏱ 25-35분','⏱ {selected.eta}');
  s=s.replace(/<button className="w-9 h-9 rounded-full bg-white\/20[\s\S]*?<\/button>/, '<FavoriteButton name={selected.name} />');
  s=s.replace('<button className="w-9 h-9 rounded-full bg-white/20', '<button onClick={() => navigate("share")} aria-label="Ulashish" className="w-9 h-9 rounded-full bg-white/20');
  s=wire(s,[["+", '() => navigate("item-detail", { item: item.name, place: selected.name })']]);
  s=s.replace('onNavigate?.("menu")','navigate("menu", { place: selected.name })');
  return s;
});
component(home,'MenuScreen',s=>{
  s=s.replace('const [cart, setCart] = useState<Record<string, number>>({});','const [items, setItems] = useCart();\nconst cart: Record<string, number> = Object.fromEntries(menuItems.map(item => [item.name, items.filter(row => row.name === item.name).reduce((sum,row) => sum+row.qty,0)]));\nconst setCart = (update: (old: Record<string, number>) => Record<string, number>) => { const next = update(cart); setItems(menuItems.filter(item => next[item.name] > 0).map(item => ({ name: item.name, option: "보통", price: item.price, qty: next[item.name], restaurant: readRoute().params.get("place") ?? restaurants[0].name }))); };');
  s=s.replace('<p className="font-semibold text-sm text-[#1A1A18]">{item.name}</p>', '<button onClick={() => navigate("item-detail", { item: item.name, place: readRoute().params.get("place") ?? restaurants[0].name })} className="font-semibold text-sm text-left text-[#1A1A18]">{item.name}</button>');
  s=s.replace('phone-scroll px-4 pt-4 space-y-3','phone-scroll responsive-grid px-4 pt-4');
  return wire(s,[[/cartCount/, '() => navigate("cart")']]);
});
component(home,'ItemDetailScreen',s=>{
  s=hook(s,'const item = catalogService.menuItem(readRoute().params.get("item") ?? "") ?? menuItems[0];\nconst [note, setNote] = useState("");');
  s=s.replace('const basePrice = 13500;', 'const basePrice = item.price;').replace('>할랄 갈비탕</h1>', '>{item.name}</h1>').replace('defaultValue=""','value={note} onChange={event => setNote(event.target.value)}');
  s=s.replace('onClick={() => onNavigate?.("cart")}', 'onClick={() => { addToCart({ name: item.name, price: basePrice + sizeExtra, option: [size, spice, ...extras, note].filter(Boolean).join(" · "), restaurant: readRoute().params.get("place") ?? restaurants[0].name }, qty); navigate("cart"); }}');
  return s;
});
component(home,'CartScreen',s=>{
  s=s.replace(/const \[items, setItems\] = useState\(\[[\s\S]*?\]\);/, 'const [items, setItems] = useCart();\nconst [appliedCoupon, setAppliedCoupon] = useLocalState("coupon", "");');
  s=s.replace('const [note, setNote] = useState("");', 'const [note, setNote] = useLocalState("order-note", "");').replace('const deliveryFee = 2000;', 'const deliveryFee = items.length ? 2000 : 0;').replace('const discount = coupon ? 3000 : 0;', 'const discount = appliedCoupon === "HALAL3000" ? Math.min(subtotal, 3000) : 0;');
  s=s.replace('Math.max(1, item.qty + delta)', 'Math.max(0, item.qty + delta)').replace(': item));', ': item).filter(item => item.qty > 0));');
  s=s.replace('onClick={() => onNavigate?.("checkout")}', 'disabled={!items.length} onClick={() => onNavigate?.("checkout")}');
  s=s.replace('{items.map', '{!items.length && <p className="py-6 text-center">Savat bo‘sh. Menyudan taom qo‘shing.</p>}\n          {items.map');
  return wire(s,[["+ 다른 메뉴 추가", '() => navigate("menu")'],["적용", '() => { const valid = coupon.trim().toUpperCase() === "HALAL3000"; setAppliedCoupon(valid ? "HALAL3000" : ""); showNotice("Kupon", valid ? "Sinov chegirmasi qo‘llandi." : "Kupon kodi topilmadi."); }']]);
});
component(home,'CheckoutScreen',s=>{
  s=hook(s,'const [items] = useCart();\nconst [coupon] = useLocalState("coupon", "");\nconst [delivery, setDelivery] = useState("문 앞에 놓아주세요");');
  s=s.replace('const total = 34500 + tip;', 'const total = cartTotals(items, coupon, tip).total;');
  s=s.replace('onClick={() => onNavigate?.("order-confirmation")}', 'disabled={!items.length} onClick={() => { writeLocal("last-order-preview", { items, total }); navigate("order-confirmation"); }}');
  s=s.replace('      {/* Header */}', '      <p className="bg-[var(--gold-light)] p-3 text-center text-xs">Sinov buyurtmasi — to‘lov olinmaydi va restoranga yuborilmaydi.</p>\n      {/* Header */}');
  return wire(s,[["", '() => navigate("address")'],[/^\{opt\}/, '() => setDelivery(opt)'],["+ 결제수단 추가", '() => explainUnavailable("To‘lov usulini ulash")']]).replace('borderColor: i === 0', 'borderColor: delivery === opt').replace('backgroundColor: i === 0', 'backgroundColor: delivery === opt');
});
component(home,'OrderConfirmationScreen',s=>s.replace('      <StatusBar', '      <p className="p-3 text-center text-xs">Sinov ko‘rinishi: buyurtma yuborilmagan.</p>\n      <StatusBar'));

const profile='src/screens/ProfileScreens.tsx';
edit(profile,s=>'import FavoriteButton from "../components/FavoriteButton";\nimport { catalogService } from "../services/catalogService";\n'+s);
component(profile,'ProfileScreen',s=>wire(s,[["", '() => navigate("settings")'],[/item.icon/, '() => navigate((["order-history", "address", "checkout", "saved-places", "notifications", "language", "loyalty", "tutorial", "settings"])[profileMenu.indexOf(item)])']]));
component(profile,'SavedPlacesScreen',s=>{
  s=hook(s,'const [restaurantNames] = useLocalState<string[]>("favorites:restaurant", []);\nconst [mosqueNames] = useLocalState<string[]>("favorites:mosque", []);\nconst savedRestaurants = restaurantNames.map(name => catalogService.restaurant(name) ?? { name, badge: "certified" as const, rating: 0, count: 0, imageId: "1498654896293-37c98e7f5fe4" });\nconst savedMosques = mosqueNames.map(name => ({ name, nameEn: "", distance: "" }));');
  s=s.replace(/<button className="w-8 h-8 rounded-xl border[\s\S]*?<\/button>/, '<FavoriteButton name={r.name} />');
  s=s.replace(/<button className="w-8 h-8 rounded-xl border[\s\S]*?<\/button>/, '<FavoriteButton name={m.name} kind="mosque" />');
  s=s.replace('<p className="font-bold text-base text-[#1A1A18]">{m.name}</p>', '<button className="text-left font-bold" onClick={() => navigate("mosque-detail", { place: m.name })}>{m.name}</button>');
  s=s.replace('{tab === "restaurants" ? (', '{(tab === "restaurants" ? restaurantNames : mosqueNames).length === 0 && <p className="py-8 text-center">Saqlangan joylar yo‘q. Joy sahifasidagi ♡ tugmasini bosing.</p>}\n        {tab === "restaurants" ? (');
  return wire(s,[["주문하기", '() => navigate("restaurant-detail", { place: r.name })']]);
});
const search='src/screens/SearchScreens.tsx';
edit(search,s=>'import { catalogService } from "../services/catalogService";\nimport { RestaurantCardH } from "../components/Shared";\n'+s);
component(search,'SearchScreen',s=>{
  s=hook(s,'const [recent, setRecent] = useLocalState<string[]>("recent-searches", []);\nconst searchFor = (value: string) => { setRecent(old => [value, ...old.filter(item => item !== value)].slice(0,8)); navigate("restaurant-list", { q: value }); };');
  s=s.replace('value={query}', 'aria-label={copy.title} onKeyDown={event => { if (event.key === "Enter") searchFor(query); }} value={query}');
  s=s.replace('copy.recentItems.map', 'recent.map').replace('<span className="flex-1 text-sm text-[#1A1A18]">{s}</span>', '<button onClick={() => searchFor(s)} className="flex-1 text-left text-sm">{s}</button>').replace('<span className="flex-1 text-sm text-[#1A1A18]">{t}</span>', '<button onClick={() => searchFor(t)} className="flex-1 text-left text-sm">{t}</button>');
  s=s.replace('        {/* Voice search */}', '        {query.trim() && <div className="responsive-grid">{catalogService.search(query).map(item => <RestaurantCardH key={item.name} {...item} onClick={() => navigate("restaurant-detail", { place: item.name })} />)}{!catalogService.search(query).length && <p>Natija topilmadi.</p>}</div>}\n        {/* Voice search */}');
  return wire(s,[["{copy.clear}", '() => setRecent([])'],["", '() => setRecent(old => old.filter(item => item !== s))'],[/categoryIcons/, '() => navigate(index === 4 ? "mosque-list" : index === 5 ? "scanner" : "restaurant-list")'],["{copy.voice}", '() => explainUnavailable("Ovozli qidiruv")']]);
});
component(search,'MapViewScreen',s=>s.replace('{mapPins.map', '{mapPins.filter(pin => pin.type === "user" || pin.type === (activeFilter === "레스토랑" ? "restaurant" : "mosque")).map').replace('<div key={i} className="absolute" style={{ left: pin.x - 16, top: pin.y - 16 }}>', '<button key={i} aria-label={pin.label} onClick={() => pin.type !== "user" && navigate(pin.type === "mosque" ? "mosque-detail" : "restaurant-map-detail", { place: pin.label })} className="absolute" style={{ left: `${pin.x / 390 * 100}%`, top: `${pin.y / 500 * 65}%` }}>').replace('<MapPin type={pin.type} />\n          </div>', '<MapPin type={pin.type} />\n          </button>'));
component(search,'CitySelectorScreen',s=>wire(s.replace('{cities.map', '{cities.filter(city => `${city.name} ${city.nameEn}`.toLowerCase().includes(search.toLowerCase())).map'),[[/city.name/, '() => { writeLocal("city", city.nameEn); navigate("restaurant-list"); }'],["부산 할랄 보기 →", '() => { writeLocal("city", "Busan"); navigate("restaurant-list"); }']]));
component(search,'RestaurantMapDetailScreen',s=>wire(s,[["메뉴 보기", '() => navigate("menu", { place: readRoute().params.get("place") ?? "신당 할랄 키친" })'],["길 찾기", '() => explainUnavailable("Yo‘l ko‘rsatish: xarita provayderi")']]));

// Explicit product navigation, derived from the existing controls.
const mappings = {
  OnboardingScreens: { OnboardingScreen: [["건너뛰기", '() => navigate("home")'],["시작하기", '() => navigate("signup")'],["로그인", '() => navigate("home")']], LanguageScreen: [["계속하기 · Continue", '() => { localStorage.setItem("halalmap-language", selected); window.dispatchEvent(new CustomEvent("halalmap:language", { detail: selected })); goBack(); }']] },
  OrderScreens: { OrderHistoryScreen: [["재주문", '() => navigate("menu")'],["영수증", '() => navigate("order-detail")']], OrderDetailScreen: [["재주문", '() => navigate("menu")'],["리뷰 쓰기", '() => navigate("reviews")'],["영수증", '() => window.print()']] },
  ScannerScreens: { ScannerScreen: [["갤러리에서 선택", '() => explainUnavailable("Mahsulotni tanish xizmati")']], ScanResultScreen: [["공유", '() => navigate("share")'],["다시 스캔하기", '() => navigate("scanner")'],["오류 신고", '() => explainUnavailable("Skan xatosini yuborish")']] },
  EngagementScreens: { RamadanScreen: [["주문하기", '() => navigate("menu")'],["참여 신청", '() => explainUnavailable("Iftor tadbiriga yozilish")']], EidScreen: [["이드 특별 메뉴 보기", '() => navigate("menu")'],["이드 인사 공유하기", '() => navigate("share")']] },
  SmartScreens: { AIMealScreen: [["바로 주문", '() => navigate("menu")']], GroupOrderScreen: [["초대 링크", '() => navigate("share")'],["카카오페이 요청", '() => explainUnavailable("KakaoPay")'],["토스 정산", '() => explainUnavailable("Toss")']], MealPlansScreen: [["변경", '() => navigate("menu")'],["선택", '() => navigate("menu")']], GroceryScreen: [["제품 보기", '() => navigate("restaurant-list")']] },
  RewardsScreens: { LoyaltyScreen: [["사용하기", '() => navigate("cart")']], ReferralScreen: [[/s.icon/, '() => shareLink().then(message => showNotice("Ulashish", message)).catch(() => showNotice("Ulashish", "Havolani nusxalash imkoni bo‘lmadi."))']] },
  TravelScreens: { TravelPlannerScreen: [["공유하기", '() => navigate("share")']] },
  AccessibilityScreens: { TutorialScreen: [["건너뛰기", '() => navigate("home")']], MultilingualScreen: [["+", '() => navigate("menu")']] },
};
for (const [file,components] of Object.entries(mappings)) for (const [name,map] of Object.entries(components)) component(`src/screens/${file}.tsx`,name,s=>wire(s,map));

// Persist language changes in the shell without reloading or discarding the current route.
edit('src/App.tsx',s=>s.replace('  const current = route.screen as ScreenId;', '  useEffect(() => { const update = (event: Event) => { const value = (event as CustomEvent).detail; if (["ko", "en", "uz", "ru"].includes(value)) setLang(value); }; window.addEventListener("halalmap:language", update); return () => window.removeEventListener("halalmap:language", update); }, []);\n  const current = route.screen as ScreenId;'));
component('src/screens/OnboardingScreens.tsx','LoginScreen',s=>{
  s=s.replace('className="w-full flex items-center gap-3 py-3.5', 'type="button" onClick={() => explainUnavailable("OAuth kirish")} className="w-full flex items-center gap-3 py-3.5');
  s=s.replace('<span className="font-semibold" style={{ color: "var(--green)" }}>{copy.signup}</span>', '<button type="button" onClick={() => navigate("signup")} className="font-semibold" style={{ color: "var(--green)" }}>{copy.signup}</button>');
  s=s.replace('<button type="button" className="text-sm font-medium"', '<button type="button" onClick={() => explainUnavailable("Parolni tiklash")} className="text-sm font-medium"');
  return s;
});
// Keep helper exports available for subsequent audited patches.
export { component, hook, wire };
