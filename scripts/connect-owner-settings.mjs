import { edit, component, hook, wire } from './lib/tsx.mjs';
const file='src/dashboard/BusinessScreens.tsx';
edit(file,s=>'import { useLocalState } from "../services/localState";\n'+s.replace('import { explainUnavailable }','import { explainUnavailable, showNotice, editFields }'));
component(file,'RestaurantSettings',s=>{
 s=hook(s,`const [saved, setSaved] = useLocalState("owner-settings-draft", { info: {} as Record<string, string>, description: "", categories: ["한식", "퓨전"], hours: DAYS.map((_, i) => ({ open: i < 5, from: "09:00", to: "22:00" })), deliveryFee: "2000", minOrder: "10000", deliveryRadius: "5", notifications: {} as Record<string, boolean> });
 const [info, setInfo] = useState(saved.info);
 const [description, setDescription] = useState(saved.description);
 const [categories, setCategories] = useState(saved.categories);
 const [notifications, setNotifications] = useState(saved.notifications);`);
 s=s.replace('useState(DAYS.map((_, i) => ({ open: i < 5, from: "09:00", to: "22:00" })))','useState(saved.hours)').replace('useState("2000")','useState(saved.deliveryFee)').replace('useState("10000")','useState(saved.minOrder)').replace('useState("5")','useState(saved.deliveryRadius)');
 s=s.replace('defaultValue={field.value}', 'value={info[field.label] ?? field.value} onChange={event => setInfo(old => ({ ...old, [field.label]: event.target.value }))');
 s=s.replace(/defaultValue="이슬람[^"\n]+"/,'value={description} onChange={event => setDescription(event.target.value)}');
 s=s.replaceAll('["한식", "퓨전"].includes(c)','categories.includes(c)');
 s=s.replace('["한식", "중동", "인도", "터키", "퓨전"].map', '[...new Set(["한식", "중동", "인도", "터키", "퓨전", ...categories])].map');
 s=wire(s,[['변경','() => explainUnavailable("Restoran rasmini yuklash")'],['{c}','() => setCategories(old => old.includes(c) ? old.filter(value => value !== c) : [...old, c])'],['+ 추가','async () => { const value = await editFields("Kategoriya", [{ name: "category", label: "Nom" }]); if (value) setCategories(old => [...new Set([...old, value.category.trim()])]); }'],['저장하기','() => { setSaved({ info, description, categories, hours, deliveryFee, minOrder, deliveryRadius, notifications }); showNotice("Qoralama saqlandi", "Sozlamalar shu qurilmada saqlandi; serverga yuborilmadi."); }'],['변경 취소','() => { setInfo(saved.info); setDescription(saved.description); setCategories(saved.categories); setHours(saved.hours); setDeliveryFee(saved.deliveryFee); setMinOrder(saved.minOrder); setDeliveryRadius(saved.deliveryRadius); setNotifications(saved.notifications); }']]);
 s=s.replace('style={{ backgroundColor: setting.on ?','role="switch" tabIndex={0} aria-checked={notifications[setting.label] ?? setting.on} onClick={() => setNotifications(old => ({ ...old, [setting.label]: !(old[setting.label] ?? setting.on) }))} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setNotifications(old => ({ ...old, [setting.label]: !(old[setting.label] ?? setting.on) })); } }} style={{ backgroundColor: (notifications[setting.label] ?? setting.on) ?').replace('left: setting.on ?','left: (notifications[setting.label] ?? setting.on) ?');
 return s;
});
edit('src/dashboard/OrderScreens.tsx',s=>'import { editFields } from "../components/ActionDialog";\n'+s);
component('src/dashboard/OrderScreens.tsx','OrderBoard',s=>{
 s=hook(s,'const [query, setQuery] = useState("");');
 s=s.replace('orders.filter(o => o.status === status)', 'orders.filter(o => o.status === status && JSON.stringify(o).toLowerCase().includes(query.toLowerCase()))');
 return wire(s,[['필터','async () => { const value = await editFields("Buyurtma filtri", [{ name: "query", label: "Qidiruv matni", value: query, required: false }], "Bo‘sh qiymat barcha buyurtmalarni ko‘rsatadi."); if (value) setQuery(value.query); }']]);
});
