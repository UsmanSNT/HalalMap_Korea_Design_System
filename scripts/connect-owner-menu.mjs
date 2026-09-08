import { edit, component, hook, wire } from './lib/tsx.mjs';
const file = 'src/dashboard/MenuScreens.tsx';
edit(file, s => 'import { useLocalState } from "../services/localState";\nimport { navigate, readRoute } from "../services/navigation";\nimport { showNotice, explainUnavailable } from "../components/ActionDialog";\n' + s.replace('  dietaryTags: string[];', '  dietaryTags: string[];\n  soldOutReason?: string;').replace('useState<MenuItem[]>(MENU_ITEMS)', 'useLocalState<MenuItem[]>("owner-menu-draft", MENU_ITEMS)').replace('useState(MENU_ITEMS.map(i => ({ ...i, soldOutReason: "" })))', 'useLocalState<MenuItem[]>("owner-menu-draft", MENU_ITEMS)'));
component(file, 'MenuEditor', s => wire(s, [
  ['편집', '() => navigate("/owner/menu-item-form", { id: item.id })'],
  ['', '() => navigate("/owner/menu-item-form", { id: item.id })'],
]).replace('className="flex h-full overflow-hidden"', 'className="owner-menu-editor flex h-full overflow-hidden"'));
component(file, 'MenuItemForm', s => {
  s = hook(s, 'const [items, setItems] = useLocalState<MenuItem[]>("owner-menu-draft", MENU_ITEMS);\nconst editing = items.find(item => item.id === readRoute().params.get("id"));');
  s = s.replace('nameKo: "", nameEn: "", nameUz: "",', 'nameKo: editing?.nameKo ?? "", nameEn: editing?.nameEn ?? "", nameUz: "",').replace('description: "", category: "한식 메인",', 'description: editing?.description ?? "", category: editing?.category ?? "한식 메인",').replace('price: "", prepTime: "15",', 'price: editing ? String(editing.price) : "", prepTime: String(editing?.prepTime ?? 15),').replace('dietaryTags: [] as string[],', 'dietaryTags: editing?.dietaryTags ?? [] as string[],');
  return wire(s, [
    ['파일 선택', '() => explainUnavailable("Menyu rasmini serverga yuklash")'],
    ['메뉴 저장', `() => { if (!form.nameKo.trim() || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) { showNotice("Menyu", "Nom va noldan katta narx kiriting."); return; } const item: MenuItem = { id: editing?.id ?? crypto.randomUUID(), nameKo: form.nameKo.trim(), nameEn: form.nameEn, description: form.description, category: form.category, price: Number(form.price), prepTime: Number(form.prepTime) || 15, available: editing?.available ?? true, halal: form.dietaryTags.includes("할랄 인증"), dietaryTags: form.dietaryTags, image: editing?.image ?? MENU_ITEMS[0].image }; setItems(old => editing ? old.map(value => value.id === item.id ? item : value) : [...old, item]); onBack(); showNotice("Mahalliy qoralama saqlandi", "Bu o‘zgarish faqat shu qurilmada saqlanadi. Restoran serveriga yuborilmadi."); }`],
  ]);
});
component(file, 'MenuAvailability', s => wire(s, [['특별 영업시간 설정', '() => navigate("/owner/restaurant-settings")']]));
