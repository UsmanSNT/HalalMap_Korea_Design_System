import React, { useState } from "react";
import {
  A, AdminTable, Column, StatusChip, SearchBar, FilterChips, Card, PageHeader,
  Btn, Modal, ConfirmModal, Toast, Pagination, StarDisplay,
} from "./AdminShared";

// ── Mock data ──────────────────────────────────────────────────────────────────
type Restaurant = {
  id: string; name: string; owner: string; area: string;
  certStatus: "verified" | "pending" | "expired";
  rating: number; orders: number; revenue: number;
  status: "active" | "suspended" | "pending";
  since: string; cuisine: string;
};

const RESTAURANTS: Restaurant[] = [
  { id: "r1", name: "신당 할랄 키친", owner: "박영수", area: "이태원구, 서울", certStatus: "verified", rating: 4.8, orders: 3241, revenue: 48_620_000, status: "active", since: "2022.03.15", cuisine: "한식" },
  { id: "r2", name: "이스탄불 케밥 하우스", owner: "Ahmet Yılmaz", area: "이태원구, 서울", certStatus: "verified", rating: 4.5, orders: 2108, revenue: 31_620_000, status: "active", since: "2022.07.22", cuisine: "터키식" },
  { id: "r3", name: "마스지드 서울 카페", owner: "이정민", area: "용산구, 서울", certStatus: "verified", rating: 4.9, orders: 1876, revenue: 22_512_000, status: "active", since: "2023.01.08", cuisine: "카페" },
  { id: "r4", name: "우즈베키스탄 플로프 하우스", owner: "Bobur Karimov", area: "용산구, 서울", certStatus: "pending", rating: 4.7, orders: 892, revenue: 14_272_000, status: "pending", since: "2024.09.30", cuisine: "우즈벡" },
  { id: "r5", name: "델리 스파이스 코리아", owner: "Raj Patel", area: "마포구, 서울", certStatus: "expired", rating: 4.3, orders: 567, revenue: 9_639_000, status: "suspended", since: "2023.06.14", cuisine: "인도식" },
  { id: "r6", name: "자카르타 나시고렝", owner: "Ahmad Fauzi", area: "광진구, 서울", certStatus: "pending", rating: 4.1, orders: 234, revenue: 3_744_000, status: "pending", since: "2024.10.11", cuisine: "인도네시아" },
  { id: "r7", name: "바그다드 케밥", owner: "Omar Al-Farsi", area: "영등포구, 서울", certStatus: "verified", rating: 4.6, orders: 1108, revenue: 16_620_000, status: "active", since: "2023.04.19", cuisine: "아랍" },
];

const PENDING_APPROVALS = [
  {
    id: "p1", name: "카이로 팔라펠", owner: "Hassan Ibrahim", ownerPhone: "010-9876-5432",
    ownerEmail: "h.ibrahim@gmail.com", area: "이태원구, 서울", cuisine: "이집트식",
    certOrg: "한국이슬람교중앙회(KMF)", certExpiry: "2026.08.15",
    submitted: "2024.11.20", menuItems: 18, seating: 40, bizNum: "123-45-67890",
  },
  {
    id: "p2", name: "방콕 할랄 타이", owner: "Somchai Jaidee", ownerPhone: "010-1234-9876",
    ownerEmail: "somchai.j@kakao.com", area: "홍대, 서울", cuisine: "태국식",
    certOrg: "JAKIM Malaysia", certExpiry: "2025.12.31",
    submitted: "2024.11.22", menuItems: 24, seating: 30, bizNum: "234-56-78901",
  },
];

// ── Screen 2: Restaurant List ──────────────────────────────────────────────────
export const RestaurantList = ({ onDetail }: { onDetail?: (id: string) => void }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const filtered = RESTAURANTS.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q) || r.area.toLowerCase().includes(q);
    const matchF = filter === "전체" || (filter === "활성" && r.status === "active") || (filter === "대기" && r.status === "pending") || (filter === "정지" && r.status === "suspended") || (filter === "인증만료" && r.certStatus === "expired");
    return matchQ && matchF;
  });

  const columns: Column<Restaurant>[] = [
    {
      key: "name", header: "레스토랑", sortable: true,
      render: r => (
        <div>
          <p className="font-medium text-sm" style={{ color: A.text }}>{r.name}</p>
          <p className="text-xs mt-0.5" style={{ color: A.muted }}>{r.cuisine} · {r.area}</p>
        </div>
      ),
    },
    {
      key: "owner", header: "대표자", sortable: true,
      render: r => <span className="text-sm">{r.owner}</span>,
    },
    {
      key: "cert", header: "할랄 인증",
      render: r => <StatusChip status={r.certStatus} label={r.certStatus === "verified" ? "인증됨" : r.certStatus === "pending" ? "심사중" : "만료"} />,
    },
    {
      key: "rating", header: "평점", sortable: true,
      render: r => <StarDisplay rating={r.rating} />,
    },
    {
      key: "orders", header: "총 주문", sortable: true,
      render: r => <span className="font-mono text-sm tabular-nums">{r.orders.toLocaleString()}</span>,
    },
    {
      key: "revenue", header: "총 매출", sortable: true,
      render: r => <span className="font-mono text-sm tabular-nums">₩{(r.revenue / 1_000_000).toFixed(1)}M</span>,
    },
    {
      key: "since", header: "등록일",
      render: r => <span className="text-sm" style={{ color: A.muted }}>{r.since}</span>,
    },
    {
      key: "status", header: "상태",
      render: r => <StatusChip status={r.status} label={r.status === "active" ? "활성" : r.status === "pending" ? "대기중" : "정지됨"} />,
    },
    {
      key: "actions", header: "",
      render: r => (
        <div className="flex items-center gap-1.5">
          <Btn onClick={() => onDetail?.(r.id)} variant="ghost">보기</Btn>
          {r.status === "active" && <Btn onClick={() => setToast({ msg: `${r.name} 정지 처리됨`, type: "info" })} variant="danger">정지</Btn>}
          {r.status === "suspended" && <Btn onClick={() => setToast({ msg: `${r.name} 활성화됨`, type: "success" })} variant="secondary">활성화</Btn>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "레스토랑 관리", "레스토랑 목록"]}
        title="레스토랑 목록"
        subtitle={`총 ${RESTAURANTS.length}개 등록됨`}
        actions={<Btn variant="primary" size="md">+ 직접 등록</Btn>}
      />

      <Card>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <FilterChips options={["전체", "활성", "대기", "정지", "인증만료"]} value={filter} onChange={setFilter} />
          <div className="flex items-center gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="이름, 대표자, 지역 검색..." width={240} />
            <Btn variant="secondary">내보내기</Btn>
          </div>
        </div>
        <AdminTable columns={columns} data={filtered} onRowClick={r => onDetail?.(r.id)} />
        <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
      </Card>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ── Screen 3: Restaurant Approval Queue ────────────────────────────────────────
export const RestaurantApproval = () => {
  const [selected, setSelected] = useState(PENDING_APPROVALS[0]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "레스토랑 관리", "승인 대기"]}
        title="레스토랑 승인 대기"
        subtitle={`${PENDING_APPROVALS.length}건 검토 필요`}
      />

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Queue list */}
        <div className="w-72 flex-shrink-0 space-y-2 overflow-y-auto">
          {PENDING_APPROVALS.map(app => (
            <button key={app.id} onClick={() => setSelected(app)}
              className="w-full text-left rounded-xl p-4 transition-all"
              style={{
                backgroundColor: selected.id === app.id ? A.greenLight : A.surface,
                border: `1.5px solid ${selected.id === app.id ? A.greenBorder : A.border}`,
              }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>{app.name}</p>
              <p className="text-xs mt-1" style={{ color: A.muted }}>{app.owner}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px]" style={{ color: A.dim }}>{app.submitted} 제출</span>
                <StatusChip status="pending" label="검토 대기" />
              </div>
            </button>
          ))}
        </div>

        {/* Detail review panel */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Business info */}
          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>사업자 정보</p>
            </div>
            <div className="px-5 py-4 grid grid-cols-3 gap-y-4 gap-x-8">
              {[
                { l: "상호명", v: selected.name },
                { l: "대표자", v: selected.owner },
                { l: "음식 종류", v: selected.cuisine },
                { l: "연락처", v: selected.ownerPhone },
                { l: "이메일", v: selected.ownerEmail },
                { l: "사업자번호", v: selected.bizNum },
                { l: "소재지", v: selected.area },
                { l: "좌석 수", v: `${selected.seating}석` },
                { l: "메뉴 수", v: `${selected.menuItems}개` },
              ].map(item => (
                <div key={item.l}>
                  <p className="text-xs font-medium" style={{ color: A.muted }}>{item.l}</p>
                  <p className="text-sm font-medium mt-1" style={{ color: A.text }}>{item.v}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Halal cert */}
          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>할랄 인증서</p>
            </div>
            <div className="px-5 py-4 flex items-center gap-6">
              {/* Cert document preview */}
              <div className="w-48 h-60 rounded-xl flex flex-col items-center justify-center gap-2 flex-shrink-0"
                style={{ backgroundColor: A.bg, border: `2px dashed ${A.border}` }}>
                <span className="text-4xl">📄</span>
                <span className="text-xs font-medium" style={{ color: A.muted }}>halal_certificate.pdf</span>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg mt-1"
                  style={{ backgroundColor: A.greenLight, color: A.greenText }}>열기</button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: A.muted }}>인증 기관</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: A.text }}>{selected.certOrg}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: A.muted }}>유효 기간</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: A.text }}>~ {selected.certExpiry}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <StatusChip status="verified" label="인증 기관 확인됨" />
                  <StatusChip status="verified" label="만료일 유효" />
                </div>
              </div>
            </div>
          </Card>

          {/* Fake mini-map */}
          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>위치 확인</p>
            </div>
            <div className="relative h-40 overflow-hidden rounded-b-xl" style={{ backgroundColor: "#E8F0E4" }}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 160">
                <rect width="600" height="160" fill="#E8F0E4"/>
                {[0,1,2,3,4,5].map(i => <line key={i} x1={i*120} y1="0" x2={i*120} y2="160" stroke="#D4DECD" strokeWidth="1"/>)}
                {[0,1,2,3].map(i => <line key={i} x1="0" y1={i*40} x2="600" y2={i*40} stroke="#D4DECD" strokeWidth="1"/>)}
                <rect x="60" y="20" width="80" height="40" rx="4" fill="#C8D8C0"/>
                <rect x="200" y="60" width="120" height="60" rx="4" fill="#C8D8C0"/>
                <rect x="380" y="10" width="60" height="80" rx="4" fill="#C8D8C0"/>
                <rect x="0" y="100" width="180" height="60" rx="4" fill="#C8D8C0"/>
                <line x1="160" y1="0" x2="160" y2="160" stroke="#B8CCB0" strokeWidth="6"/>
                <line x1="0" y1="80" x2="600" y2="80" stroke="#B8CCB0" strokeWidth="6"/>
                <circle cx="300" cy="75" r="12" fill={A.green}/>
                <text x="300" y="80" textAnchor="middle" fill="white" fontSize="12">📍</text>
              </svg>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "rgba(255,255,255,0.9)", color: A.text }}>{selected.area}</div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Btn variant="primary" size="md" onClick={() => setToast({ msg: `${selected.name} 승인 완료`, type: "success" })}>
                  ✓ 승인
                </Btn>
                <Btn variant="danger" size="md" onClick={() => setRejectOpen(true)}>
                  ✕ 거절
                </Btn>
                <Btn variant="warning" size="md">
                  ℹ 추가 정보 요청
                </Btn>
              </div>
              <p className="text-xs" style={{ color: A.muted }}>제출일: {selected.submitted}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Reject reason modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="거절 사유 입력" width={440}>
        <div className="px-6 py-5">
          <p className="text-sm mb-3" style={{ color: A.muted }}>거절 사유를 입력하면 신청자에게 이메일로 전송됩니다.</p>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            rows={4} placeholder="거절 사유를 입력하세요..."
            className="w-full rounded-lg px-3 py-2.5 text-sm resize-none outline-none"
            style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }}/>
          <div className="flex justify-end gap-3 mt-4">
            <Btn onClick={() => setRejectOpen(false)}>취소</Btn>
            <Btn variant="danger" size="md" onClick={() => { setRejectOpen(false); setToast({ msg: `${selected.name} 거절 처리됨`, type: "error" }); }}>
              거절 전송
            </Btn>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ── Screen 4: Restaurant Detail ────────────────────────────────────────────────
export const RestaurantDetail = ({ restaurantId = "r1" }: { restaurantId?: string }) => {
  const r = RESTAURANTS.find(x => x.id === restaurantId) ?? RESTAURANTS[0];
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "complaints" | "docs">("overview");
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const TABS = ["overview", "orders", "complaints", "docs"] as const;
  const TAB_LABELS: Record<typeof TABS[number], string> = { overview: "개요", orders: "주문 이력", complaints: "민원", docs: "서류" };

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "레스토랑 관리", "레스토랑 목록", r.name]}
        title={r.name}
        subtitle={`${r.cuisine} · ${r.area}`}
        actions={
          <div className="flex gap-2">
            <Btn variant="secondary" size="md">수정</Btn>
            <Btn variant="danger" size="md" onClick={() => setSuspendOpen(true)}>
              {r.status === "active" ? "정지" : "활성화"}
            </Btn>
          </div>
        }
      />

      {/* Status banner */}
      <div className="flex items-center gap-4 mb-5 p-4 rounded-xl"
        style={{ backgroundColor: r.status === "active" ? A.greenLight : A.dangerLight, border: `1px solid ${r.status === "active" ? A.greenBorder : A.dangerBorder}` }}>
        <StatusChip status={r.status} label={r.status === "active" ? "운영중" : "정지됨"} />
        <span className="text-sm" style={{ color: r.status === "active" ? A.greenText : A.dangerText }}>
          {r.status === "active" ? `${r.since}부터 운영 중 · 할랄 인증: ${r.certStatus === "verified" ? "유효" : "만료"}` : "관리자에 의해 정지됨"}
        </span>
        <div className="ml-auto flex gap-4 text-sm">
          <span><b style={{ color: A.text }}>{r.orders.toLocaleString()}</b><span style={{ color: A.muted }}> 총 주문</span></span>
          <span><b style={{ color: A.text }}>₩{(r.revenue / 1_000_000).toFixed(1)}M</b><span style={{ color: A.muted }}> 총 매출</span></span>
          <span><b style={{ color: A.gold }}>★ {r.rating}</b><span style={{ color: A.muted }}> 평점</span></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4" style={{ borderBottom: `1px solid ${A.border}` }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm font-medium transition-all relative"
            style={{ color: activeTab === tab ? A.green : A.muted }}>
            {TAB_LABELS[tab]}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: A.green }} />
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <Card>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
                <p className="font-semibold text-sm" style={{ color: A.text }}>기본 정보</p>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-y-4">
                {[
                  { l: "상호명", v: r.name },
                  { l: "대표자", v: r.owner },
                  { l: "음식 종류", v: r.cuisine },
                  { l: "소재지", v: r.area },
                  { l: "총 주문 수", v: r.orders.toLocaleString() },
                  { l: "총 매출", v: `₩${r.revenue.toLocaleString()}` },
                  { l: "등록일", v: r.since },
                  { l: "플랫폼 수수료", v: "15%" },
                ].map(item => (
                  <div key={item.l} className="flex items-center justify-between py-2"
                    style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                    <span className="text-sm" style={{ color: A.muted }}>{item.l}</span>
                    <span className="text-sm font-medium" style={{ color: A.text }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <div className="px-4 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
                <p className="font-semibold text-sm" style={{ color: A.text }}>할랄 인증</p>
              </div>
              <div className="px-4 py-4 space-y-3">
                <StatusChip status={r.certStatus} label={r.certStatus === "verified" ? "인증 유효" : r.certStatus === "pending" ? "심사중" : "만료됨"} />
                <div>
                  <p className="text-xs" style={{ color: A.muted }}>인증 기관</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: A.text }}>한국이슬람교중앙회 (KMF)</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: A.muted }}>만료일</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: A.text }}>2025.08.15</p>
                </div>
                <Btn variant="secondary">인증서 보기</Btn>
              </div>
            </Card>
            <Card>
              <div className="px-4 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
                <p className="font-semibold text-sm" style={{ color: A.text }}>빠른 통계</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                {[
                  { l: "이번 달 주문", v: "342건" },
                  { l: "이번 달 매출", v: "₩5.1M" },
                  { l: "취소율", v: "2.4%" },
                  { l: "평균 배달 시간", v: "28분" },
                ].map(s => (
                  <div key={s.l} className="flex justify-between py-1.5" style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                    <span className="text-xs" style={{ color: A.muted }}>{s.l}</span>
                    <span className="text-xs font-bold" style={{ color: A.text }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab !== "overview" && (
        <Card>
          <div className="flex items-center justify-center h-48">
            <p className="text-sm" style={{ color: A.dim }}>
              {activeTab === "orders" ? "주문 이력 데이터" : activeTab === "complaints" ? "접수된 민원 없음" : "인증 서류 관리"}
            </p>
          </div>
        </Card>
      )}

      <ConfirmModal
        open={suspendOpen} onClose={() => setSuspendOpen(false)}
        onConfirm={() => setToast({ msg: `${r.name} 상태 변경됨`, type: "info" })}
        title={r.status === "active" ? "레스토랑 정지" : "레스토랑 활성화"}
        description={`${r.name}을(를) ${r.status === "active" ? "정지" : "활성화"}하시겠습니까? 고객에게 영향을 미칩니다.`}
        confirmLabel={r.status === "active" ? "정지" : "활성화"}
        variant={r.status === "active" ? "danger" : "primary"}
      />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
