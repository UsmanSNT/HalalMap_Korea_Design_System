import React, { useState } from "react";
import {
  A, AdminTable, Column, StatusChip, SearchBar, FilterChips, Card, PageHeader,
  Btn, Modal, Toast, Pagination,
} from "./AdminShared";

// ── Screen 12: Halal Database ──────────────────────────────────────────────────
type HalalProduct = {
  id: string; name: string; barcode: string; brand: string;
  category: string; status: "halal" | "haram" | "mashbooh";
  certOrg: string; source: string; reports: number; updatedAt: string;
};

const PRODUCTS: HalalProduct[] = [
  { id: "h1", name: "오리온 초코파이 정", barcode: "8801117", brand: "오리온", category: "과자", status: "halal", certOrg: "KMF", source: "공식인증", reports: 0, updatedAt: "2024.10.15" },
  { id: "h2", name: "농심 새우깡", barcode: "8801234", brand: "농심", category: "스낵", status: "mashbooh", certOrg: "-", source: "성분분석", reports: 5, updatedAt: "2024.09.22" },
  { id: "h3", name: "CJ 스팸 클래식", barcode: "8801002", brand: "CJ", category: "가공육", status: "haram", certOrg: "-", source: "성분확인", reports: 12, updatedAt: "2024.11.01" },
  { id: "h4", name: "롯데 빼빼로 오리지널", barcode: "8801003", brand: "롯데", category: "과자", status: "halal", certOrg: "KMF", source: "공식인증", reports: 0, updatedAt: "2024.08.30" },
  { id: "h5", name: "서울우유 A2 우유", barcode: "8801004", brand: "서울우유", category: "유제품", status: "halal", certOrg: "KMF", source: "공식인증", reports: 2, updatedAt: "2024.11.10" },
];

const COMMUNITY_REPORTS = [
  { id: "cr1", product: "농심 새우깡", reporter: "Muhammad Al-Rashid", issue: "돼지 성분 의심", date: "2024.11.23" },
  { id: "cr2", product: "서울우유 A2", reporter: "Siti Fatimah", issue: "인증 기관 정보 오류", date: "2024.11.22" },
  { id: "cr3", product: "오뚜기 3분 카레", reporter: "Ahmed Hassan", issue: "할랄 표시 없음", date: "2024.11.20" },
];

export const HalalDatabase = () => {
  const [tab, setTab] = useState<"products" | "reports">("products");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const filtered = PRODUCTS.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.brand.toLowerCase().includes(q);
    const matchF = filter === "전체" || p.status === filter;
    return matchQ && matchF;
  });

  const columns: Column<HalalProduct>[] = [
    {
      key: "name", header: "제품명", sortable: true,
      render: p => (
        <div>
          <p className="font-medium text-sm" style={{ color: A.text }}>{p.name}</p>
          <p className="text-xs mt-0.5 font-mono" style={{ color: A.muted }}>{p.barcode}</p>
        </div>
      ),
    },
    { key: "brand", header: "브랜드", render: p => <span className="text-sm">{p.brand}</span> },
    { key: "category", header: "카테고리", render: p => <span className="text-sm" style={{ color: A.muted }}>{p.category}</span> },
    {
      key: "status", header: "할랄 판정",
      render: p => <StatusChip status={p.status} label={p.status === "halal" ? "할랄" : p.status === "haram" ? "하람" : "의심성분"} />,
    },
    { key: "certOrg", header: "인증기관", render: p => <span className="text-sm">{p.certOrg}</span> },
    { key: "source", header: "출처", render: p => <span className="text-xs" style={{ color: A.muted }}>{p.source}</span> },
    {
      key: "reports", header: "신고",
      render: p => p.reports > 0
        ? <span className="font-semibold text-sm" style={{ color: A.dangerText }}>⚠ {p.reports}건</span>
        : <span className="text-sm" style={{ color: A.dim }}>-</span>,
    },
    { key: "updatedAt", header: "업데이트", render: p => <span className="text-xs font-mono" style={{ color: A.muted }}>{p.updatedAt}</span> },
    {
      key: "actions", header: "",
      render: p => (
        <div className="flex gap-1">
          <Btn variant="ghost">수정</Btn>
          <Btn variant="danger">삭제</Btn>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "콘텐츠 & 데이터", "할랄 데이터베이스"]}
        title="할랄 제품 데이터베이스"
        subtitle={`${PRODUCTS.length.toLocaleString()}개 등록됨`}
        actions={
          <div className="flex gap-2">
            <Btn variant="secondary" size="md">CSV 일괄 가져오기</Btn>
            <Btn variant="primary" size="md" onClick={() => setAddOpen(true)}>+ 제품 추가</Btn>
          </div>
        }
      />

      <div className="flex gap-1 mb-4" style={{ borderBottom: `1px solid ${A.border}` }}>
        {(["products", "reports"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-sm font-medium relative"
            style={{ color: tab === t ? A.green : A.muted }}>
            {t === "products" ? "제품 목록" : `커뮤니티 신고 (${COMMUNITY_REPORTS.length})`}
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: A.green }} />}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <Card>
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
            <FilterChips options={["전체", "halal", "mashbooh", "haram"]} value={filter} onChange={setFilter} />
            <SearchBar value={search} onChange={setSearch} placeholder="제품명, 바코드, 브랜드 검색..." width={260} />
          </div>
          <AdminTable columns={columns} data={filtered} />
          <Pagination page={1} total={filtered.length} perPage={10} onChange={() => {}} />
        </Card>
      )}

      {tab === "reports" && (
        <Card>
          <div className="divide-y" style={{ borderColor: A.borderLight }}>
            {COMMUNITY_REPORTS.map(r => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-sm" style={{ color: A.text }}>{r.product}</p>
                  <p className="text-xs mt-1" style={{ color: A.muted }}>신고자: {r.reporter} · {r.date}</p>
                  <p className="text-xs mt-0.5" style={{ color: A.warning }}>⚠ {r.issue}</p>
                </div>
                <div className="flex gap-2">
                  <Btn variant="warning">검토 후 수정</Btn>
                  <Btn variant="ghost">신고 기각</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="제품 추가" width={520}>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "바코드", placeholder: "8801234567890" },
            { label: "제품명", placeholder: "제품 이름" },
            { label: "브랜드", placeholder: "브랜드명" },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs font-medium mb-1.5" style={{ color: A.muted }}>{f.label}</p>
              <input className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                placeholder={f.placeholder}
                style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }}/>
            </div>
          ))}
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: A.muted }}>할랄 판정</p>
            <div className="flex gap-2">
              {["halal", "mashbooh", "haram"].map(s => (
                <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: A.textMid }}>
                  <input type="radio" name="halalStatus" className="accent-green-700"/> {s}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Btn onClick={() => setAddOpen(false)}>취소</Btn>
            <Btn variant="primary" size="md" onClick={() => { setAddOpen(false); setToast({ msg: "제품이 추가되었습니다", type: "success" }); }}>
              추가
            </Btn>
          </div>
        </div>
      </Modal>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ── Screen 13: Mosque Management ───────────────────────────────────────────────
const MOSQUES = [
  { id: "m1", name: "서울중앙성원 (이슬람 서울 센터)", area: "이태원구, 서울", type: "모스크", status: "verified", prayerSource: "공식 데이터", pending: false },
  { id: "m2", name: "이태원 마스지드", area: "이태원구, 서울", type: "모스크", status: "verified", prayerSource: "공식 데이터", pending: false },
  { id: "m3", name: "코엑스 기도실", area: "강남구, 서울", type: "기도실", status: "verified", prayerSource: "운영자 등록", pending: false },
  { id: "m4", name: "홍대 이슬람 문화센터", area: "마포구, 서울", type: "모스크", status: "pending", prayerSource: "-", pending: true },
];

export const MosqueManagement = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<"list" | "pending">("list");

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "콘텐츠 & 데이터", "모스크 관리"]}
        title="모스크 · 기도실 관리"
        subtitle={`${MOSQUES.length}개 등록됨`}
        actions={<Btn variant="primary" size="md" onClick={() => setAddOpen(true)}>+ 위치 추가</Btn>}
      />

      <div className="flex gap-1 mb-4" style={{ borderBottom: `1px solid ${A.border}` }}>
        {(["list", "pending"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-sm font-medium relative"
            style={{ color: tab === t ? A.green : A.muted }}>
            {t === "list" ? "전체 목록" : `사용자 제보 대기 (${MOSQUES.filter(m => m.pending).length})`}
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: A.green }} />}
          </button>
        ))}
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: A.bg, borderBottom: `1px solid ${A.border}` }}>
              {["장소명", "지역", "유형", "기도 시간 출처", "상태", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: A.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOSQUES.filter(m => tab === "list" || m.pending).map(m => (
              <tr key={m.id} style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                <td className="px-4 py-3 font-medium" style={{ color: A.text }}>{m.name}</td>
                <td className="px-4 py-3 text-sm" style={{ color: A.muted }}>{m.area}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: m.type === "모스크" ? A.greenLight : A.infoLight, color: m.type === "모스크" ? A.greenText : A.infoText }}>
                    {m.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: A.muted }}>{m.prayerSource}</td>
                <td className="px-4 py-3"><StatusChip status={m.status as any} label={m.status === "verified" ? "활성" : "대기중"} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Btn variant="ghost">수정</Btn>
                    {m.pending && <Btn variant="primary">승인</Btn>}
                    <Btn variant="danger">삭제</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="모스크 / 기도실 추가" width={480}>
        <div className="px-6 py-5 space-y-4">
          {[{ l: "장소명", p: "모스크 또는 기도실 이름" }, { l: "주소", p: "상세 주소" }, { l: "운영 시간", p: "예: 09:00 ~ 22:00" }].map(f => (
            <div key={f.l}>
              <p className="text-xs font-medium mb-1.5" style={{ color: A.muted }}>{f.l}</p>
              <input placeholder={f.p} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }}/>
            </div>
          ))}
          <div className="flex justify-end gap-3">
            <Btn onClick={() => setAddOpen(false)}>취소</Btn>
            <Btn variant="primary" size="md" onClick={() => setAddOpen(false)}>저장</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Screen 14: Promotions Management ──────────────────────────────────────────
const PROMOS = [
  { id: "pr1", name: "첫 주문 할인", type: "쿠폰", code: "FIRST3000", discount: "₩3,000", uses: 1241, maxUses: "무제한", status: "active", expiry: "2024.12.31" },
  { id: "pr2", name: "라마단 특별 할인", type: "쿠폰", code: "RAMADAN24", discount: "20%", uses: 482, maxUses: "1,000회", status: "active", expiry: "2024.12.15" },
  { id: "pr3", name: "이태원 할랄 위크", type: "배너", code: "-", discount: "-", uses: 0, maxUses: "-", status: "pending", expiry: "2024.12.07" },
  { id: "pr4", name: "추천 이벤트 쿠폰", type: "쿠폰", code: "REFER1500", discount: "₩1,500", uses: 89, maxUses: "무제한", status: "active", expiry: "2025.03.31" },
];

export const PromotionsManagement = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [promoType, setPromoType] = useState("쿠폰");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "콘텐츠 & 데이터", "프로모션 관리"]}
        title="프로모션 관리"
        subtitle="쿠폰, 배너, 푸시 알림 캠페인"
        actions={<Btn variant="primary" size="md" onClick={() => setCreateOpen(true)}>+ 프로모션 생성</Btn>}
      />

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "활성 쿠폰", value: PROMOS.filter(p => p.status === "active" && p.type === "쿠폰").length, color: A.green },
          { label: "총 사용 횟수", value: "1,812", color: A.gold },
          { label: "이번 달 할인 총액", value: "₩3.2M", color: A.info },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="font-mono font-bold text-2xl tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: A.muted }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: A.bg, borderBottom: `1px solid ${A.border}` }}>
              {["이름", "유형", "코드", "할인", "사용", "한도", "만료일", "상태", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: A.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROMOS.map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                <td className="px-4 py-3 font-medium" style={{ color: A.text }}>{p.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: p.type === "쿠폰" ? A.greenLight : A.infoLight, color: p.type === "쿠폰" ? A.greenText : A.infoText }}>
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: A.muted }}>{p.code}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: A.gold }}>{p.discount}</td>
                <td className="px-4 py-3 font-mono text-sm">{p.uses.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm" style={{ color: A.muted }}>{p.maxUses}</td>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: A.muted }}>{p.expiry}</td>
                <td className="px-4 py-3"><StatusChip status={p.status as any} label={p.status === "active" ? "활성" : "대기중"} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Btn variant="ghost">수정</Btn>
                    <Btn variant="danger">종료</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="프로모션 생성" width={540}>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: A.muted }}>유형</p>
            <div className="flex gap-2">
              {["쿠폰", "배너 캠페인", "푸시 알림"].map(t => (
                <button key={t} onClick={() => setPromoType(t)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ backgroundColor: promoType === t ? A.green : A.bg, color: promoType === t ? "#fff" : A.muted, border: `1px solid ${promoType === t ? A.green : A.border}` }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {[{ l: "이름", p: "프로모션 이름" }, { l: "쿠폰 코드", p: "MYCODE123" }, { l: "할인 금액 / 비율", p: "예: ₩3,000 또는 20%" }, { l: "만료일", p: "YYYY.MM.DD" }].map(f => (
            <div key={f.l}>
              <p className="text-xs font-medium mb-1.5" style={{ color: A.muted }}>{f.l}</p>
              <input placeholder={f.p} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }}/>
            </div>
          ))}
          <div className="flex justify-end gap-3">
            <Btn onClick={() => setCreateOpen(false)}>취소</Btn>
            <Btn variant="primary" size="md" onClick={() => { setCreateOpen(false); setToast({ msg: "프로모션이 생성되었습니다", type: "success" }); }}>
              생성
            </Btn>
          </div>
        </div>
      </Modal>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
