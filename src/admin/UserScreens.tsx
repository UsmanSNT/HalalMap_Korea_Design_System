import React, { useState } from "react";
import {
  A, AdminTable, Column, StatusChip, SearchBar, FilterChips, Card, PageHeader,
  Btn, ConfirmModal, Toast, Pagination, StarDisplay,
} from "./AdminShared";

// ── Mock data ──────────────────────────────────────────────────────────────────
type User = {
  id: string; name: string; email: string; phone: string;
  joinDate: string; orders: number; spent: number;
  status: "active" | "suspended";
  nationality: string; lastActive: string; reviews: number;
};

const USERS: User[] = [
  { id: "u1", name: "Kim Jae-won", email: "kim.jaewon@email.com", phone: "010-1234-5678", joinDate: "2024.03.15", orders: 47, spent: 820_000, status: "active", nationality: "한국", lastActive: "1시간 전", reviews: 12 },
  { id: "u2", name: "Park Min-jun", email: "park.minjun@naver.com", phone: "010-2345-6789", joinDate: "2024.06.22", orders: 23, spent: 340_000, status: "active", nationality: "한국", lastActive: "3일 전", reviews: 5 },
  { id: "u3", name: "Muhammad Al-Rashid", email: "m.rashid@gmail.com", phone: "010-3456-7890", joinDate: "2023.11.08", orders: 89, spent: 1_450_000, status: "active", nationality: "사우디아라비아", lastActive: "30분 전", reviews: 34 },
  { id: "u4", name: "Dilnoza Yusupova", email: "d.yusupova@kakao.com", phone: "010-4567-8901", joinDate: "2024.09.30", orders: 12, spent: 180_000, status: "active", nationality: "우즈베키스탄", lastActive: "오늘", reviews: 3 },
  { id: "u5", name: "Ahmed Hassan", email: "a.hassan@gmail.com", phone: "010-5678-9012", joinDate: "2024.01.14", orders: 156, spent: 2_890_000, status: "suspended", nationality: "이집트", lastActive: "2주 전", reviews: 67 },
  { id: "u6", name: "Lee Soo-yeon", email: "lee.sy@naver.com", phone: "010-6789-0123", joinDate: "2023.08.04", orders: 38, spent: 612_000, status: "active", nationality: "한국", lastActive: "어제", reviews: 8 },
  { id: "u7", name: "Siti Fatimah", email: "siti.f@gmail.com", phone: "010-7890-1234", joinDate: "2024.02.28", orders: 71, spent: 1_136_000, status: "active", nationality: "말레이시아", lastActive: "2시간 전", reviews: 22 },
  { id: "u8", name: "Choi Dong-wook", email: "cdw@kakao.com", phone: "010-8901-2345", joinDate: "2024.07.11", orders: 8, spent: 124_000, status: "active", nationality: "한국", lastActive: "5일 전", reviews: 1 },
];

// ── Screen 5: Users List ───────────────────────────────────────────────────────
export const UserList = ({ onDetail }: { onDetail?: (id: string) => void }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const filtered = USERS.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    const matchF = filter === "전체" || (filter === "활성" && u.status === "active") || (filter === "정지" && u.status === "suspended");
    return matchQ && matchF;
  });

  const columns: Column<User>[] = [
    {
      key: "name", header: "사용자", sortable: true,
      render: u => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: A.greenLight, color: A.greenText }}>
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: A.text }}>{u.name}</p>
            <p className="text-xs mt-0.5" style={{ color: A.muted }}>{u.nationality}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email", header: "이메일 / 연락처",
      render: u => (
        <div>
          <p className="text-sm" style={{ color: A.textMid }}>{u.email}</p>
          <p className="text-xs mt-0.5 font-mono" style={{ color: A.muted }}>{u.phone}</p>
        </div>
      ),
    },
    {
      key: "joinDate", header: "가입일", sortable: true,
      render: u => <span className="text-sm" style={{ color: A.muted }}>{u.joinDate}</span>,
    },
    {
      key: "orders", header: "총 주문", sortable: true,
      render: u => <span className="font-mono text-sm tabular-nums">{u.orders.toLocaleString()}건</span>,
    },
    {
      key: "spent", header: "총 결제액", sortable: true,
      render: u => <span className="font-mono text-sm tabular-nums">₩{u.spent.toLocaleString()}</span>,
    },
    {
      key: "lastActive", header: "최근 활동",
      render: u => <span className="text-sm" style={{ color: A.muted }}>{u.lastActive}</span>,
    },
    {
      key: "status", header: "상태",
      render: u => <StatusChip status={u.status} label={u.status === "active" ? "활성" : "정지됨"} />,
    },
    {
      key: "actions", header: "",
      render: u => (
        <div className="flex items-center gap-1.5">
          <Btn onClick={() => onDetail?.(u.id)} variant="ghost">보기</Btn>
          {u.status === "active"
            ? <Btn onClick={() => setToast({ msg: `${u.name} 계정 정지됨`, type: "error" })} variant="danger">정지</Btn>
            : <Btn onClick={() => setToast({ msg: `${u.name} 계정 활성화됨`, type: "success" })} variant="secondary">활성화</Btn>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "사용자 관리", "사용자 목록"]}
        title="사용자 목록"
        subtitle={`총 ${USERS.length.toLocaleString()}명 가입`}
        actions={
          <div className="flex gap-2">
            <Btn variant="secondary" size="md">CSV 내보내기</Btn>
            <Btn variant="primary" size="md">+ 관리자 초대</Btn>
          </div>
        }
      />

      <Card>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <FilterChips options={["전체", "활성", "정지"]} value={filter} onChange={setFilter} />
          <SearchBar value={search} onChange={setSearch} placeholder="이름, 이메일, 전화번호 검색..." width={260} />
        </div>
        <AdminTable columns={columns} data={filtered} onRowClick={u => onDetail?.(u.id)} />
        <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
      </Card>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ── Screen 6: User Detail ──────────────────────────────────────────────────────
export const UserDetail = ({ userId = "u3" }: { userId?: string }) => {
  const u = USERS.find(x => x.id === userId) ?? USERS[0];
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "reviews" | "reports">("orders");

  const RECENT_ORDERS = [
    { id: "#HMK-8901", restaurant: "신당 할랄 키친", date: "2024.11.24", amount: 34500, status: "delivered" as const },
    { id: "#HMK-8840", restaurant: "이스탄불 케밥 하우스", date: "2024.11.23", amount: 18000, status: "delivered" as const },
    { id: "#HMK-8790", restaurant: "마스지드 서울 카페", date: "2024.11.22", amount: 9500, status: "cancelled" as const },
    { id: "#HMK-8745", restaurant: "우즈베키스탄 플로프", date: "2024.11.20", amount: 27000, status: "delivered" as const },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "사용자 관리", "사용자 목록", u.name]}
        title={u.name}
        subtitle={`${u.nationality} · 가입일 ${u.joinDate}`}
        actions={
          <div className="flex gap-2">
            <Btn variant="secondary" size="md">비밀번호 초기화</Btn>
            <Btn variant="warning" size="md" onClick={() => setSuspendOpen(true)}>
              {u.status === "active" ? "계정 정지" : "계정 활성화"}
            </Btn>
            <Btn variant="danger" size="md" onClick={() => setDeleteOpen(true)}>계정 삭제</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "총 주문 수", value: `${u.orders}건`, icon: "📦", bg: A.infoLight, color: A.infoText },
          { label: "총 결제액", value: `₩${(u.spent/1000).toFixed(0)}K`, icon: "💰", bg: A.goldLight, color: A.goldText },
          { label: "작성 리뷰", value: `${u.reviews}건`, icon: "⭐", bg: A.purpleLight, color: A.purpleText },
          { label: "신고 접수", value: u.status === "suspended" ? "3건" : "0건", icon: "🚨", bg: u.status === "suspended" ? A.dangerLight : A.bg, color: u.status === "suspended" ? A.dangerText : A.dim },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: s.bg }}>
                {s.icon}
              </div>
              <div>
                <p className="font-mono font-bold text-xl tabular-nums" style={{ color: A.text }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: A.muted }}>{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Profile info */}
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>프로필</p>
          </div>
          <div className="px-5 py-5">
            <div className="flex flex-col items-center gap-2 mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: A.greenLight, color: A.greenText }}>
                {u.name.charAt(0)}
              </div>
              <div className="text-center">
                <p className="font-semibold" style={{ color: A.text }}>{u.name}</p>
                <StatusChip status={u.status} label={u.status === "active" ? "활성" : "정지됨"} />
              </div>
            </div>
            {[
              { l: "이메일", v: u.email },
              { l: "전화번호", v: u.phone },
              { l: "국적", v: u.nationality },
              { l: "가입일", v: u.joinDate },
              { l: "최근 활동", v: u.lastActive },
              { l: "가입 경로", v: "카카오 소셜" },
            ].map(item => (
              <div key={item.l} className="flex justify-between py-2.5" style={{ borderTop: `1px solid ${A.borderLight}` }}>
                <span className="text-xs" style={{ color: A.muted }}>{item.l}</span>
                <span className="text-xs font-medium" style={{ color: A.text }}>{item.v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity panel */}
        <div className="col-span-2">
          <div className="flex gap-1 mb-3" style={{ borderBottom: `1px solid ${A.border}` }}>
            {(["orders", "reviews", "reports"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 text-sm font-medium relative transition-all"
                style={{ color: activeTab === tab ? A.green : A.muted }}>
                {tab === "orders" ? "주문 이력" : tab === "reviews" ? "작성 리뷰" : "신고 이력"}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: A.green }} />}
              </button>
            ))}
          </div>

          <Card>
            {activeTab === "orders" && (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: A.bg, borderBottom: `1px solid ${A.border}` }}>
                    {["주문번호", "레스토랑", "날짜", "금액", "상태"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: A.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map(o => (
                    <tr key={o.id} style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: A.green }}>{o.id}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: A.textMid }}>{o.restaurant}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: A.muted }}>{o.date}</td>
                      <td className="px-4 py-3 font-mono text-sm tabular-nums">₩{o.amount.toLocaleString()}</td>
                      <td className="px-4 py-3"><StatusChip status={o.status} label={o.status === "delivered" ? "배달완료" : "취소됨"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab !== "orders" && (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm" style={{ color: A.dim }}>
                  {activeTab === "reviews" ? `${u.reviews}건의 리뷰 기록` : "접수된 신고 없음"}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={suspendOpen} onClose={() => setSuspendOpen(false)}
        onConfirm={() => setToast({ msg: `${u.name} 계정 상태 변경됨`, type: "info" })}
        title="계정 정지" description={`${u.name}의 계정을 정지하시겠습니까? 즉시 로그인이 차단됩니다.`}
        confirmLabel="정지" variant="danger"
      />
      <ConfirmModal
        open={deleteOpen} onClose={() => setDeleteOpen(false)}
        onConfirm={() => setToast({ msg: `${u.name} 계정 삭제됨`, type: "error" })}
        title="계정 영구 삭제" description={`${u.name}의 모든 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="영구 삭제" variant="danger"
      />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
