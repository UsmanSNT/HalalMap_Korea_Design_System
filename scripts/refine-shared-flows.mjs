import { edit, component, hook, wire, read } from './lib/tsx.mjs';
import { writeFileSync } from 'node:fs';
// Preserve every unique desktop restaurant in the shared fixture catalog.
const desktopFile='src/screens/HomeDesktop.tsx';
const desktop=read(desktopFile), block=desktop.match(/const RESTAURANTS = \[[\s\S]*?\n\];/)[0];
const rows=Function(block+'; return RESTAURANTS;')();
const catalog=read('src/data/catalog.ts');
const extra=rows.filter(item=>!catalog.includes(`name: "${item.name}"`)).map(r=>({name:r.name,imageId:r.img,badge:r.badge==='HALAL CERTIFIED'?'certified':r.badge==='MUSLIM-OWNED'?'owned':'friendly',rating:r.rating,count:r.reviews,distance:r.dist,eta:r.time,fee:r.fee,cuisine:r.category}));
edit('src/data/catalog.ts',s=>s.replace(/(export const restaurants = \[[\s\S]*?)(\n\];)/,(_,a,b)=>a+'\n'+extra.map(r=>'  '+JSON.stringify(r).replace(/"badge":"([^"]+)"/,'"badge":"$1" as const')+',').join('\n')+b));
edit(desktopFile,s=>{
  s='import { catalogService } from "../services/catalogService";\nimport { navigate } from "../services/navigation";\nimport FavoriteButton from "../components/FavoriteButton";\n'+s;
  s=s.replace(block, 'const RESTAURANTS = catalogService.restaurants().map(r => ({ name: r.name, nameIntl: r.name, badge: r.badge === "certified" ? "HALAL CERTIFIED" : r.badge === "owned" ? "MUSLIM-OWNED" : "HALAL FRIENDLY", rating: r.rating, reviews: r.count, dist: r.distance, time: r.eta, fee: r.fee, img: r.imageId, category: r.cuisine, priceRange: "₩₩" }));');
  s=s.replace('const [activeCategory, setActiveCategory] = useState(0);', 'const [activeCategory, setActiveCategory] = useState(-1);\n  const [sort, setSort] = useState(0);\n  const visible = RESTAURANTS.filter(r => activeCategory < 0 || r.category === CATEGORIES[activeCategory]?.label.replace(" 할랄", "")).slice().sort((a,b) => sort === 1 ? b.rating-a.rating : sort === 2 ? (parseInt(a.fee.replace(/\\D/g,"")) || 0)-(parseInt(b.fee.replace(/\\D/g,"")) || 0) : parseFloat(a.dist)-parseFloat(b.dist));');
  s=s.replace('onClick={() => setActiveCategory(i)}','onClick={() => i === CATEGORIES.length - 1 ? navigate("/customer/scanner") : setActiveCategory(i === activeCategory ? -1 : i)}');
  s=s.replace('<button key={s} style=', '<button key={s} onClick={() => setSort(i)} style=').replace(/i === 0 \? G\./g,'i === sort ? G.').replace('i === 0 ? 700','i === sort ? 700');
  s=s.replace('{RESTAURANTS.map((r, i) => <RestaurantCard key={i} r={r} lang={lang} onOpen={() => onNavigate("restaurant-detail")} />)}','{visible.length === 0 && <p>Bu kategoriyada hozircha joylar yo‘q.</p>}{visible.map((r, i) => <RestaurantCard key={i} r={r} lang={lang} onOpen={() => navigate("/customer/restaurant-detail", { place: r.name })} />)}');
  s=s.replace('      onClick={onOpen}\n', '      role="link" tabIndex={0} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onOpen(); } }} onClick={onOpen}\n');
  s=s.replace(/<div style=\{\{ position: "absolute", top: 8, right: 8, width: 28[\s\S]*?<\/div>/, '<div style={{ position: "absolute", top: 8, right: 8 }}><FavoriteButton name={r.name} /></div>');
  s=s.replace('onContextMenu={(event) => { event.preventDefault(); void onLogout(); }} title="Profil (chiqish uchun o‘ng tugma)"', 'title="Profil"');
  return s;
});
// Store mock order previews without claiming a backend order was placed.
edit('src/services/commerce.ts',s=>s+'\nexport interface OrderPreview { items: CartItem[]; total: number; date?: string; payment?: string; tip?: number; coupon?: string }\nexport const useOrderPreview = () => useLocalState<OrderPreview | null>("last-order-preview", null);\n');
const home='src/screens/HomeScreens.tsx';
edit(home,s=>s.replace('cartTotals, changeMenuQuantity','cartTotals, changeMenuQuantity, useOrderPreview'));
component(home,'CheckoutScreen',s=>s.replace('writeLocal("last-order-preview", { items, total })','writeLocal("last-order-preview", { items, total, payment, tip, coupon, date: new Date().toISOString() })'));
component(home,'OrderConfirmationScreen',s=>{
  s=hook(s,'const [preview] = useOrderPreview();');
  s=s.replace('>신당 할랄 키친</p>', '>{preview?.items[0]?.restaurant ?? "Namuna restoran"}</p>');
  s=s.replace('onNavigate?.("order-tracking")','navigate("order-tracking", { order: "preview" })');
  return s;
});
const orders='src/screens/OrderScreens.tsx';
edit(orders,s=>'import { useOrderPreview } from "../services/commerce";\n'+s.replace('import React from "react"','import React, { useState } from "react"'));
component(orders,'OrderHistoryScreen',s=>{
  s=hook(s,'const [tabIndex, setTabIndex] = useState(1);\nconst [preview] = useOrderPreview();');
  s=s.replace('<button\n              key={tab}', '<button onClick={() => setTabIndex(i)}\n              key={tab}').replace('i === 1 ?', 'i === tabIndex ?');
  s=s.replace('{orderHistory.map((order, i) => (', '{tabIndex === 0 && <div className="rounded-2xl bg-white p-5"><p>Jonli buyurtmalar API xizmati ulanmagan.</p><button className="py-3 text-[var(--green)]" onClick={() => navigate("order-tracking", { order: "preview" })}>Kuzatuv namunasini ochish</button>{preview && <button className="block py-3 text-[var(--green)]" onClick={() => navigate("order-detail", { order: "preview" })}>Saqlangan sinov buyurtmasi · ₩{preview.total.toLocaleString()}</button>}</div>}\n      {(tabIndex === 1 ? orderHistory : []).map((order, i) => (');
  s=s.replace('navigate("order-detail")','navigate("order-detail", { order: String(i) })').replace('navigate("menu")','navigate("menu", { place: order.restaurant })');
  s=s.replace('<p className="font-bold text-base text-[#1A1A18]">{order.restaurant}</p>', '<button onClick={() => navigate("order-detail", { order: String(i) })} className="text-left font-bold text-base">{order.restaurant}</button>');
  s=s.replace('진행중 (1)', 'Sinov / Kuzatuv').replace('완료 (12)', 'Namuna tarixi');
  return s;
});
component(orders,'OrderDetailScreen',s=>{
  s=hook(s,'const [preview] = useOrderPreview();\nconst orderId = readRoute().params.get("order") ?? "0";\nconst selected = orderId === "preview" && preview ? { restaurant: preview.items[0]?.restaurant ?? "Namuna", date: preview.date ?? "", total: preview.total, items: preview.items.map(item => item.name).join(", ") } : orderHistory[Number(orderId)] ?? orderHistory[0];');
  s=s.replace('>신당 할랄 키친</p>', '>{selected.restaurant}</p>').replace('₩34,500', '₩{selected.total.toLocaleString()}').replace('navigate("menu")','navigate("menu", { place: selected.restaurant })').replace('>주문일시: 2024년 11월 20일 오후 2:15</p>', '>{selected.date} · Figma/sinov ma’lumoti</p>');
  const start=s.indexOf('          {[\n            { name: "할랄 갈비탕"'), end=s.indexOf('].map((item) => (',start);
  if(start>=0) s=s.slice(0,start)+'          {(orderId === "preview" && preview ? preview.items : [{ name: selected.items, option: "Namuna", price: selected.total, qty: 1 }]).map((item) => ('+s.slice(end+'].map((item) => ('.length);
  return s;
});

// Correct buttons that previously navigated to unrelated features.
const smart='src/screens/SmartScreens.tsx';
edit(smart,s=>'import { addToCart } from "../services/commerce";\n'+s.replace('explainUnavailable, showNotice','explainUnavailable, showNotice, editFields'));
component(smart,'MealPlansScreen',s=>{
  s=hook(s,'const [preferences, setPreferences] = useLocalState<Record<string, boolean>>("meal-preferences", {});\nconst [changes, setChanges] = useLocalState<Record<string, string>>("meal-plan-drafts", {});');
  s=s.replace('<Toggle on={pref.on} />','<Toggle on={preferences[pref.label] ?? pref.on} onToggle={() => setPreferences(old => ({ ...old, [pref.label]: !(old[pref.label] ?? pref.on) }))} />');
  s=s.replace('>{day.meal}</p>', '>{changes[`${activeWeek}:${i}`] ?? day.meal}</p>');
  s=s.replace('onClick={() => navigate("menu")} className="text-xs text-[var(--muted)] underline"', 'onClick={async () => { const values = await editFields("Taom rejasini tahrirlash", [{ name: "meal", label: "Taom", value: changes[`${activeWeek}:${i}`] ?? day.meal }]); if (values) setChanges(old => ({ ...old, [`${activeWeek}:${i}`]: values.meal })); }} className="text-xs text-[var(--muted)] underline"');
  s=s.replace('onClick={() => navigate("menu")} className="text-xs font-bold"', 'onClick={() => explainUnavailable("Obuna rejasini almashtirish")} className="text-xs font-bold"');
  return s;
});
component(smart,'GroceryScreen',s=>{
  s=s.replace('onClick={() => navigate("restaurant-list")}','onClick={() => document.getElementById("grocery-products")?.scrollIntoView({ behavior: "smooth", block: "start" })}');
  s=s.replace('{products.map', '{products.map');
  s=s.replace('        {/* Products */}', '        <div id="grocery-products" />\n        {/* Products */}');
  return wire(s,[["", '() => { addToCart({ name: p.name, price: p.price, option: "Grocery", restaurant: "Grocery" }); showNotice("Savat", "Mahsulot savatga qo‘shildi."); }']]);
});
component('src/screens/AccessibilityScreens.tsx','TutorialScreen',s=>s.replace('onClick={() => !isLast && setStep(s => s + 1)}','onClick={() => isLast ? navigate("home") : setStep(s => s + 1)}').replace('width="390" height="844" viewBox="0 0 390 844"','width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none"').replace('style={{ top: current.callout.top }}','style={{ top: `${Math.min(current.callout.top / 844 * 100, 55)}%` }}'));
