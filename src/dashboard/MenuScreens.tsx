import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface MenuItem {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  halal: boolean;
  image: string;
  prepTime: number;
  dietaryTags: string[];
}

const CATEGORIES = ["인기메뉴", "한식 메인", "세트", "사이드", "음료", "디저트"];

const MENU_ITEMS: MenuItem[] = [
  { id: "1", nameKo: "할랄 갈비탕", nameEn: "Halal Galbi-tang", description: "사골 육수와 소갈비로 만든 진한 탕", price: 13500, category: "한식 메인", available: true, halal: true, image: "1498654896293-37c98e7f5fe4", prepTime: 15, dietaryTags: ["글루텐프리"] },
  { id: "2", nameKo: "비빔밥 (할랄)", nameEn: "Bibimbap (Halal)", description: "신선한 채소와 할랄 불고기가 들어간 비빔밥", price: 11000, category: "인기메뉴", available: true, halal: true, image: "1569050467447-ce54b3bbc37d", prepTime: 10, dietaryTags: [] },
  { id: "3", nameKo: "된장찌개 세트", nameEn: "Doenjang Jjigae Set", description: "구수한 된장찌개 + 공기밥 + 반찬 3종", price: 12000, category: "세트", available: true, halal: true, image: "1414235077428-338989a2e8c0", prepTime: 12, dietaryTags: ["비건"] },
  { id: "4", nameKo: "할랄 삼계탕", nameEn: "Halal Samgyetang", description: "국내산 영계와 인삼이 들어간 삼계탕", price: 16500, category: "인기메뉴", available: true, halal: true, image: "1565557623262-b51ff2a27b73", prepTime: 20, dietaryTags: ["글루텐프리"] },
  { id: "5", nameKo: "파전", nameEn: "Pajeon (Green Onion Pancake)", description: "바삭한 할랄 파전 + 간장 소스", price: 9000, category: "사이드", available: true, halal: true, image: "1529042410759-befb1204b468", prepTime: 8, dietaryTags: [] },
  { id: "6", nameKo: "갈비찜 세트", nameEn: "Braised Short Rib Set", description: "달콤짭짤한 소갈비찜 + 공기밥 + 반찬", price: 26000, category: "한식 메인", available: false, halal: true, image: "1414235077428-338989a2e8c0", prepTime: 25, dietaryTags: [] },
  { id: "7", nameKo: "냉면", nameEn: "Naengmyeon (Cold Noodle)", description: "시원하고 새콤한 평양식 냉면", price: 11000, category: "한식 메인", available: true, halal: false, image: "1517248135467-4c7edcad34c4", prepTime: 10, dietaryTags: [] },
  { id: "8", nameKo: "식혜", nameEn: "Sikhye (Sweet Rice Drink)", description: "전통 한국 쌀 음료", price: 3500, category: "음료", available: true, halal: true, image: "1567620905572-d1d0d6ca9ea0", prepTime: 2, dietaryTags: ["비건", "글루텐프리"] },
  { id: "9", nameKo: "약식", nameEn: "Yaksik (Sweet Rice Cake)", description: "대추, 밤, 잣이 들어간 전통 약식", price: 6500, category: "디저트", available: true, halal: true, image: "1567620905572-d1d0d6ca9ea0", prepTime: 5, dietaryTags: ["비건"] },
];

// ── 4. Menu Editor ─────────────────────────────────────────────────────────────
export const MenuEditor = ({ onAddItem }: { onAddItem: () => void }) => {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [items, setItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "available" | "unavailable">("all");
  const [search, setSearch] = useState("");

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, available: !item.available } : item));
  };

  const allCategories = ["전체", ...CATEGORIES];
  const filtered = items.filter(item => {
    const matchCat = activeCategory === "전체" || item.category === activeCategory;
    const matchFilter = filter === "all" || (filter === "available" ? item.available : !item.available);
    const matchSearch = item.nameKo.includes(search) || item.nameEn.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchFilter && matchSearch;
  });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Category sidebar */}
      <div className="w-48 flex-shrink-0 bg-white border-r border-[var(--border)] flex flex-col">
        <div className="px-4 py-4 border-b border-[var(--border)]">
          <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest">카테고리</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {allCategories.map(cat => {
            const count = cat === "전체" ? items.length : items.filter(i => i.category === cat).length;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[var(--cream)]"
                style={{
                  color: activeCategory === cat ? "var(--green)" : "#1A1A18",
                  backgroundColor: activeCategory === cat ? "var(--green-light)" : "transparent",
                  borderLeft: activeCategory === cat ? "3px solid var(--green)" : "3px solid transparent",
                }}>
                <span>{cat}</span>
                <span className="font-mono text-xs tabular-nums" style={{ color: "var(--muted)" }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="p-3 border-t border-[var(--border)]">
          <button onClick={onAddItem}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--green)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M7 2v10M2 7h10"/>
            </svg>
            메뉴 추가
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] bg-white">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[var(--cream)] rounded-xl px-3 py-2 w-64 border border-[var(--border)]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="6" cy="6" r="4"/><path d="M10 10l2.5 2.5"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="메뉴 검색..." className="bg-transparent text-sm outline-none w-full text-[#1A1A18] placeholder:text-[var(--muted)]" />
          </div>

          {/* Filter */}
          <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
            {(["all", "available", "unavailable"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-2 text-xs font-semibold transition-colors"
                style={{ backgroundColor: filter === f ? "var(--green)" : "white", color: filter === f ? "white" : "var(--muted)" }}>
                {f === "all" ? "전체" : f === "available" ? "판매중" : "품절"}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* View toggle */}
            {(["grid", "list"] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: viewMode === v ? "var(--green-light)" : "transparent", color: viewMode === v ? "var(--green)" : "var(--muted)" }}>
                {v === "grid"
                  ? <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="0.5"/><rect x="8" y="1" width="5" height="5" rx="0.5"/><rect x="1" y="8" width="5" height="5" rx="0.5"/><rect x="8" y="8" width="5" height="5" rx="0.5"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 3h12M1 7h12M1 11h12"/></svg>
                }
              </button>
            ))}
            <button onClick={onAddItem}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: "var(--green)" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
              메뉴 추가
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[var(--border)] group hover:shadow-md transition-all">
                  <div className="relative h-40 bg-[#D8D4CC]">
                    <img src={`https://images.unsplash.com/photo-${item.image}?w=280&h=160&fit=crop&auto=format&q=80`}
                      alt={item.nameKo} className="w-full h-full object-cover" style={{ opacity: item.available ? 1 : 0.45 }} />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      {item.halal && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--green)" }}>HALAL</span>
                      )}
                    </div>
                    <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--charcoal)" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M1.5 9.5L4 7 8.5 2.5a1 1 0 011.4 1.4L5.5 8.5 2 10.5z"/>
                        </svg>
                      </button>
                    </div>
                    {!item.available && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[var(--danger)]">품절</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="font-bold text-sm text-[#1A1A18]">{item.nameKo}</p>
                      <p className="text-[11px] text-[var(--muted)]">{item.nameEn}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-bold text-sm tabular-nums text-[#1A1A18]">₩{item.price.toLocaleString()}</p>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <div onClick={() => toggleItem(item.id)}
                          className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                          style={{ backgroundColor: item.available ? "var(--green)" : "#D1D5DB" }}>
                          <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                            style={{ left: item.available ? "calc(100% - 18px)" : "2px" }} />
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: item.available ? "var(--green)" : "var(--muted)" }}>
                          {item.available ? "판매중" : "품절"}
                        </span>
                      </label>
                    </div>
                    {item.dietaryTags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.dietaryTags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]" style={{ backgroundColor: "var(--cream)" }}>
                    {["메뉴", "카테고리", "가격", "준비시간", "상태", "편집"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map(item => (
                    <tr key={item.id} className="hover:bg-[var(--cream)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#D8D4CC] overflow-hidden flex-shrink-0">
                            <img src={`https://images.unsplash.com/photo-${item.image}?w=40&h=40&fit=crop&auto=format&q=80`} alt={item.nameKo} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-sm text-[#1A1A18]">{item.nameKo}</p>
                              {item.halal && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: "var(--green)" }}>H</span>}
                            </div>
                            <p className="text-xs text-[var(--muted)]">{item.nameEn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">{item.category}</td>
                      <td className="px-4 py-3 font-mono text-sm font-bold tabular-nums text-[#1A1A18]">₩{item.price.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-sm tabular-nums text-[var(--muted)]">{item.prepTime}분</td>
                      <td className="px-4 py-3">
                        <div onClick={() => toggleItem(item.id)}
                          className="w-10 h-5 rounded-full cursor-pointer transition-all relative"
                          style={{ backgroundColor: item.available ? "var(--green)" : "#D1D5DB" }}>
                          <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                            style={{ left: item.available ? "calc(100% - 18px)" : "2px" }} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--cream)] transition-colors text-[#1A1A18]">편집</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── 5. Add / Edit Menu Item ────────────────────────────────────────────────────
export const MenuItemForm = ({ onBack }: { onBack: () => void }) => {
  const [form, setForm] = useState({
    nameKo: "", nameEn: "", nameUz: "",
    description: "", category: "한식 메인",
    price: "", prepTime: "15",
    halalNotes: "",
    dietaryTags: [] as string[],
    availableDays: [true, true, true, true, true, true, true],
    availableFrom: "09:00", availableTo: "22:00",
    photo: null as File | null,
  });
  const [dragOver, setDragOver] = useState(false);

  const toggleDietTag = (tag: string) => {
    setForm(f => ({
      ...f,
      dietaryTags: f.dietaryTags.includes(tag) ? f.dietaryTags.filter(t => t !== tag) : [...f.dietaryTags, tag],
    }));
  };
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  const dietTags = ["할랄 인증", "글루텐프리", "비건", "유제품 없음", "견과류 없음", "저칼로리"];

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back */}
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[#1A1A18] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M10 12L6 8l4-4"/>
              </svg>
              메뉴 목록으로
            </button>
            <h1 className="font-bold text-lg text-[#1A1A18]">새 메뉴 추가</h1>
          </div>

          {/* Photo upload */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-3">
            <p className="font-bold text-sm text-[#1A1A18]">메뉴 사진</p>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); }}
              className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 gap-3 transition-all cursor-pointer"
              style={{ borderColor: dragOver ? "var(--green)" : "var(--border)", backgroundColor: dragOver ? "var(--green-light)" : "var(--cream)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--green-light)" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="2" y="3" width="18" height="16" rx="2"/>
                  <circle cx="8" cy="9" r="2"/>
                  <path d="M2 16l5-5 4 4 3-3 6 4"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-[#1A1A18]">사진을 드래그하거나 클릭하여 업로드</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">JPG, PNG · 최대 5MB · 권장 크기 800×600px</p>
              </div>
              <button className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border)] bg-white hover:bg-[var(--cream)]">
                파일 선택
              </button>
            </div>
          </div>

          {/* Names (multilingual) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
            <p className="font-bold text-sm text-[#1A1A18]">메뉴 이름</p>
            {[
              { label: "한국어 *", key: "nameKo", flag: "🇰🇷", placeholder: "예: 할랄 갈비탕" },
              { label: "영어", key: "nameEn", flag: "🇺🇸", placeholder: "예: Halal Galbi-tang" },
              { label: "우즈베크어 (선택)", key: "nameUz", flag: "🇺🇿", placeholder: "예: Halol Galbi-tang" },
            ].map(field => (
              <div key={field.key} className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
                  <span>{field.flag}</span> {field.label}
                </label>
                <input
                  value={form[field.key as keyof typeof form] as string}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[#1A1A18] outline-none focus:border-[var(--green)] transition-colors placeholder:text-[var(--muted)]"
                />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted)]">설명</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="고객에게 보여질 메뉴 설명을 입력하세요..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[#1A1A18] outline-none resize-none focus:border-[var(--green)] transition-colors placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          {/* Price & Category */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
            <p className="font-bold text-sm text-[#1A1A18]">가격 및 카테고리</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--muted)]">가격 (₩) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)] font-mono">₩</span>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="12000"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[var(--border)] text-sm font-mono font-bold text-[#1A1A18] outline-none focus:border-[var(--green)] transition-colors" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--muted)]">카테고리 *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[#1A1A18] outline-none focus:border-[var(--green)] bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--muted)]">준비 시간 (분)</label>
                <input type="number" value={form.prepTime} onChange={e => setForm(f => ({ ...f, prepTime: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm font-mono font-bold text-[#1A1A18] outline-none focus:border-[var(--green)] transition-colors" />
              </div>
            </div>
          </div>

          {/* Dietary & Halal */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
            <p className="font-bold text-sm text-[#1A1A18]">식품 정보</p>
            <div>
              <p className="text-xs font-semibold text-[var(--muted)] mb-2">식품 태그</p>
              <div className="flex flex-wrap gap-2">
                {dietTags.map(tag => (
                  <button key={tag} onClick={() => toggleDietTag(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: form.dietaryTags.includes(tag) ? "var(--green)" : "var(--cream)",
                      color: form.dietaryTags.includes(tag) ? "white" : "#1A1A18",
                      border: form.dietaryTags.includes(tag) ? "none" : "1px solid var(--border)",
                    }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted)]">할랄 성분 메모</label>
              <textarea
                value={form.halalNotes}
                onChange={e => setForm(f => ({ ...f, halalNotes: e.target.value }))}
                placeholder="돼지고기, 알코올 완전 배제. 사용 조미료 및 소스 모두 KMF 인증..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none resize-none focus:border-[var(--green)] placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          {/* Available hours/days */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
            <p className="font-bold text-sm text-[#1A1A18]">판매 시간</p>
            <div>
              <p className="text-xs font-semibold text-[var(--muted)] mb-2">판매 요일</p>
              <div className="flex gap-2">
                {days.map((day, i) => (
                  <button key={day} onClick={() => setForm(f => { const d = [...f.availableDays]; d[i] = !d[i]; return { ...f, availableDays: d }; })}
                    className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
                    style={{
                      backgroundColor: form.availableDays[i] ? "var(--green)" : "var(--cream)",
                      color: form.availableDays[i] ? "white" : "var(--muted)",
                      border: form.availableDays[i] ? "none" : "1px solid var(--border)",
                    }}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-semibold text-[var(--muted)]">시작 시간</label>
                <input type="time" value={form.availableFrom} onChange={e => setForm(f => ({ ...f, availableFrom: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm font-mono text-[#1A1A18] outline-none focus:border-[var(--green)]" />
              </div>
              <div className="pt-5 text-[var(--muted)] text-sm">—</div>
              <div className="space-y-1 flex-1">
                <label className="text-xs font-semibold text-[var(--muted)]">종료 시간</label>
                <input type="time" value={form.availableTo} onChange={e => setForm(f => ({ ...f, availableTo: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm font-mono text-[#1A1A18] outline-none focus:border-[var(--green)]" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pb-4">
            <button onClick={onBack} className="px-5 py-3 rounded-xl text-sm font-semibold border border-[var(--border)] bg-white hover:bg-[var(--cream)] transition-colors">
              취소
            </button>
            <button className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--green)" }}>
              메뉴 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 6. Menu Availability (Quick Toggle) ───────────────────────────────────────
export const MenuAvailability = () => {
  const [items, setItems] = useState(MENU_ITEMS.map(i => ({ ...i, soldOutReason: "" })));
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  };
  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setSelected(prev => prev.length === items.length ? [] : items.map(i => i.id));
  };
  const bulkToggle = (available: boolean) => {
    setItems(prev => prev.map(i => selected.includes(i.id) ? { ...i, available } : i));
    setSelected([]);
  };

  const filtered = items.filter(i => i.nameKo.includes(search) || i.nameEn.toLowerCase().includes(search.toLowerCase()));
  const availableCount = items.filter(i => i.available).length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border)] bg-white flex-shrink-0">
        <div className="flex items-center gap-2 bg-[var(--cream)] rounded-xl px-3 py-2 w-60 border border-[var(--border)]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="6" cy="6" r="4"/><path d="M10 10l2.5 2.5"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="메뉴 검색..." className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--muted)]" />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--green-light)]">
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color: "var(--green)" }}>{availableCount}/{items.length}</span>
          <span className="text-xs text-[var(--muted)]">메뉴 판매중</span>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs font-semibold text-[var(--muted)]">{selected.length}개 선택됨</span>
            <button onClick={() => bulkToggle(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: "var(--green)" }}>
              일괄 판매 시작
            </button>
            <button onClick={() => bulkToggle(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: "var(--danger)" }}>
              일괄 품절
            </button>
          </div>
        )}

        <div className="ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold hover:bg-[var(--cream)] transition-colors text-[#1A1A18]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 2"/>
            </svg>
            특별 영업시간 설정
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--cream)", borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={selected.length === items.length} onChange={toggleAll}
                    className="rounded w-4 h-4 cursor-pointer accent-[var(--green)]" />
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">메뉴</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">카테고리</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">가격</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">상태</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">판매 여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-[var(--cream)] transition-colors"
                  style={{ opacity: item.available ? 1 : 0.65 }}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)}
                      className="rounded w-4 h-4 cursor-pointer accent-[var(--green)]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#D8D4CC] overflow-hidden flex-shrink-0">
                        <img src={`https://images.unsplash.com/photo-${item.image}?w=44&h=44&fit=crop&auto=format&q=80`} alt={item.nameKo} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-[#1A1A18]">{item.nameKo}</p>
                          {item.halal && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: "var(--green)" }}>HALAL</span>}
                        </div>
                        <p className="text-xs text-[var(--muted)]">{item.nameEn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted)]">{item.category}</td>
                  <td className="px-4 py-3 font-mono text-sm font-bold tabular-nums text-[#1A1A18]">₩{item.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: item.available ? "var(--green-light)" : "#FEF2F2",
                        color: item.available ? "var(--green)" : "var(--danger)",
                      }}>
                      {item.available ? "● 판매중" : "● 품절"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div onClick={() => toggleItem(item.id)}
                      className="w-12 h-6 rounded-full cursor-pointer transition-all relative inline-block"
                      style={{ backgroundColor: item.available ? "var(--green)" : "#D1D5DB" }}>
                      <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                        style={{ left: item.available ? "calc(100% - 22px)" : "2px" }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
