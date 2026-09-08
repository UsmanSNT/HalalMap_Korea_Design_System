import { edit, component, hook, wire } from './lib/tsx.mjs';
for(const [file,name,label] of [['OrdersScreens','AllOrders','CSV 내보내기'],['UserScreens','UserList','CSV 내보내기'],['RestaurantScreens','RestaurantList','내보내기']]) {
 const path=`src/admin/${file}.tsx`; edit(path,s=>'import { exportCsv } from "../services/exportService";\n'+s);
 component(path,name,s=>wire(s,[[label,`() => exportCsv("halalmap-${file}.csv", filtered)`]],['Btn']));
}
component('src/admin/OrdersScreens.tsx','AllOrders',s=>{
 s=hook(s,'const [dateRange, setDateRange] = useState({ from: "", to: "" });');
 s=s.replace('return matchQ && matchF;', 'const date = o.date.slice(0,10).replaceAll(".", "-"); return matchQ && matchF && (!dateRange.from || date >= dateRange.from) && (!dateRange.to || date <= dateRange.to);');
 return wire(s,[['날짜 범위 선택','async () => { const result = await editFields("Sana oralig‘i", [{ name: "from", label: "Boshlanish", type: "date", value: dateRange.from, required: false }, { name: "to", label: "Tugash", type: "date", value: dateRange.to, required: false }], "Bo‘sh qiymat sana chegarasini olib tashlaydi."); if (result) setDateRange({ from: result.from, to: result.to }); }']],['Btn']);
});
edit('src/admin/OrdersScreens.tsx',s=>s.replace('import { explainUnavailable }','import { explainUnavailable, editFields }'));
component('src/screens/MosqueScreens.tsx','PrayerTimesScreen',s=>{
 s=hook(s,'const [monthOffset, setMonthOffset] = useState(0);');
 s=s.replace('const calendarYear = koreaDate.getFullYear(), calendarMonth = koreaDate.getMonth(), calendarToday = koreaDate.getDate();','const calendarDate = new Date(koreaDate.getFullYear(), koreaDate.getMonth() + monthOffset, 1);\n  const calendarYear = calendarDate.getFullYear(), calendarMonth = calendarDate.getMonth(), calendarToday = monthOffset === 0 ? koreaDate.getDate() : -1;');
 s=s.replace('<button className="w-7 h-7 rounded-lg bg-[var(--cream)] flex items-center justify-center">','<button type="button" aria-label="Oldingi oy" onClick={() => setMonthOffset(value => value - 1)} className="w-7 h-7 rounded-lg bg-[var(--cream)] flex items-center justify-center">');
 s=s.replace('<button className="w-7 h-7 rounded-lg bg-[var(--cream)] flex items-center justify-center">','<button type="button" aria-label="Keyingi oy" onClick={() => setMonthOffset(value => value + 1)} className="w-7 h-7 rounded-lg bg-[var(--cream)] flex items-center justify-center">');
 return wire(s,[['{d}','() => showNotice("Tanlangan sana", `${calendarYear}-${calendarMonth + 1}-${d}. Mavjud API faqat bugungi namoz vaqtlarini beradi.`)']]);
});
