import React, { useState } from "react";
import {
  A, AdminTable, Column, StatusChip, SearchBar, FilterChips, Card, PageHeader,
  Btn, Modal, Toast, Pagination, StarDisplay,
} from "./AdminShared";

type Courier = {
  id: string; name: string; vehicle: "이륜차" | "자전거" | "승용차";
  zone: string; rating: number; deliveries: number;
  status: "active" | "offline" | "suspended" | "pending";
  docsStatus: "verified" | "pending" | "expired";
  joinDate: string; earnings: number;
};

const COURIERS: Courier[] = [
  { id: "c1", name: "김민준", vehicle: "이륜차", zone: "이태원/용산", rating: 4.92, deliveries: 1241, status: "active", docsStatus: "verified", joinDate: "2022.11.15", earnings: 12_840_000 },
  { id: "c2", name: "이동현", vehicle: "자전거", zone: "홍대/마포", rating: 4.78, deliveries: 834, status: "active", docsStatus: "verified", joinDate: "2023.03.22", earnings: 8_170_000 },
  { id: "c3", name: "박성민", vehicle: "이륜차", zone: "강남", rating: 4.65, deliveries: 456, status: "offline", docsStatus: "pending", joinDate: "2024.08.11", earnings: 4_560_000 },
  { id: "c4", name: "Wang Fang", vehicle: "이륜차", zone: "이태원/용산", rating: 4.88, deliveries: 2109, status: "active", docsStatus: "verified", joinDate: "2022.06.04", earnings: 21_090_000 },
  { id: "c5", name: "Abdul Karim", vehicle: "자전거", zone: "마포", rating: 0, deliveries: 0, status: "pending", docsStatus: "pending", joinDate: "2024.11.20", earnings: 0 },
  { id: "c6", name: "정현우", vehicle: "승용차", zone: "강남/서초", rating: 4.55, deliveries: 320, status: "suspended", docsStatus: "expired", joinDate: "2023.09.18", earnings: 3_200_000 },
];

const PENDING_COURIERS = [
  {
    id: "p1", name: "Abdul Karim", phone: "010-3344-5566", email: "a.karim@gmail.com",
    vehicle: "자전거", zone: "마포구", nationality: "방글라데시",
    submitted: "2024.11.20", licenseType: "해당없음 (자전거)",
  },
];

// ── Screen 7: Couriers List ────────────────────────────────────────────────────
export const CourierList = ({ onDetail }: { onDetail?: (id: string) => void }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const VEHICLE_ICON: Record<Courier["vehicle"], string> = { "이륜차": "🏍️", "자전거": "🚲", "승용차": "🚗" };

  const filtered = COURIERS.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.zone.toLowerCase().includes(q);
    const matchF = filter === "전체" || (filter === "활성" && c.status === "active") || (filter === "오프라인" && c.status === "offline") || (filter === "대기" && c.status === "pending") || (filter === "정지" && c.status === "suspended");
    return matchQ && matchF;
  });

  const STATUS_LABELS: Record<Courier["status"], string> = { active: "배달중", offline: "오프라인", suspended: "정지됨", pending: "심사대기" };

  const columns: Column<Courier>[] = [
    {
      key: "name", header: "파트너", sortable: true,
      render: c => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: A.bg }}>{VEHICLE_ICON[c.vehicle]}</div>
          <div>
            <p className="font-medium text-sm" style={{ color: A.text }}>{c.name}</p>
            <p className="text-xs mt-0.5" style={{ color: A.muted }}>{c.vehicle} · {c.zone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rating", header: "평점", sortable: true,
      render: c => c.rating > 0 ? <StarDisplay rating={c.rating} /> : <span className="text-xs" style={{ color: A.dim }}>-</span>,
    },
    {
      key: "deliveries", header: "총 배달", sortable: true,
      render: c => <span className="font-mono text-sm tabular-nums">{c.deliveries.toLocaleString()}건</span>,
    },
    {
      key: "earnings", header: "총 수익", sortable: true,
      render: c => <span className="font-mono text-sm tabular-nums">₩{(c.earnings/1_000_000).toFixed(1)}M</span>,
    },
    {
      key: "docs", header: "서류 상태",
      render: c => <StatusChip status={c.docsStatus} label={c.docsStatus === "verified" ? "확인됨" : c.docsStatus === "pending" ? "심사중" : "만료"} />,
    },
    {
      key: "joinDate", header: "등록일",
      render: c => <span className="text-sm" style={{ color: A.muted }}>{c.joinDate}</span>,
    },
    {
      key: "status", header: "상태",
      render: c => <StatusChip status={c.status} label={STATUS_LABELS[c.status]} />,
    },
    {
      key: "actions", header: "",
      render: c => (
        <div className="flex items-center gap-1.5">
          <Btn onClick={() => onDetail?.(c.id)} variant="ghost">보기</Btn>
          {c.status === "active" && <Btn onClick={() => setToast({ msg: `${c.name} 정지됨`, type: "error" })} variant="danger">정지</Btn>}
          {c.status === "suspended" && <Btn onClick={() => setToast({ msg: `${c.name} 활성화됨`, type: "success" })} variant="secondary">활성화</Btn>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "배달파트너 관리", "파트너 목록"]}
        title="배달 파트너 목록"
        subtitle={`총 ${COURIERS.length}명 등록`}
        actions={<Btn variant="primary" size="md">+ 파트너 초대</Btn>}
      />
      <Card>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <FilterChips options={["전체", "활성", "오프라인", "대기", "정지"]} value={filter} onChange={setFilter} />
          <SearchBar value={search} onChange={setSearch} placeholder="이름, 구역 검색..." width={220} />
        </div>
        <AdminTable columns={columns} data={filtered} onRowClick={c => onDetail?.(c.id)} />
        <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
      </Card>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ── Screen 8: Courier Approval ─────────────────────────────────────────────────
export const CourierApproval = () => {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const app = PENDING_COURIERS[0];

  const DOC_ITEMS = [
    { label: "신분증 (여권 / 외국인등록증)", status: "verified" as const, file: "passport_karim.jpg" },
    { label: "자전거 보험증서", status: "pending" as const, file: "insurance_pending.pdf" },
    { label: "계좌 정보 (통장 사본)", status: "verified" as const, file: "bankbook_karim.jpg" },
    { label: "거주지 증명", status: "verified" as const, file: "residence_cert.pdf" },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "배달파트너 관리", "파트너 승인 대기"]}
        title="파트너 승인 심사"
        subtitle={`${PENDING_COURIERS.length}건 검토 필요`}
      />

      <div className="grid grid-cols-3 gap-4">
        {/* Applicant info */}
        <div className="col-span-1 space-y-4">
          <Card>
            <div className="px-5 py-4 text-center" style={{ borderBottom: `1px solid ${A.border}` }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-2"
                style={{ backgroundColor: A.bg }}>🚲</div>
              <p className="font-semibold" style={{ color: A.text }}>{app.name}</p>
              <p className="text-xs mt-1" style={{ color: A.muted }}>{app.nationality} · {app.vehicle}</p>
              <div className="mt-2"><StatusChip status="pending" label="심사 대기" /></div>
            </div>
            <div className="px-5 py-3 space-y-0">
              {[
                { l: "연락처", v: app.phone },
                { l: "이메일", v: app.email },
                { l: "희망 구역", v: app.zone },
                { l: "면허 유형", v: app.licenseType },
                { l: "제출일", v: app.submitted },
              ].map(item => (
                <div key={item.l} className="flex justify-between py-2.5" style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                  <span className="text-xs" style={{ color: A.muted }}>{item.l}</span>
                  <span className="text-xs font-medium" style={{ color: A.text }}>{item.v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Document review */}
        <div className="col-span-2 space-y-4">
          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>서류 검토</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {DOC_ITEMS.map(doc => (
                <div key={doc.label} className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{doc.status === "verified" ? "✅" : "⏳"}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: A.text }}>{doc.label}</p>
                      <p className="text-xs mt-0.5 font-mono" style={{ color: A.muted }}>{doc.file}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={doc.status} label={doc.status === "verified" ? "확인됨" : "검토 필요"} />
                    <Btn variant="ghost">열기</Btn>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Btn variant="primary" size="md" onClick={() => setToast({ msg: `${app.name} 파트너 승인 완료`, type: "success" })}>
                  ✓ 파트너 승인
                </Btn>
                <Btn variant="danger" size="md" onClick={() => setRejectOpen(true)}>
                  ✕ 거절
                </Btn>
                <Btn variant="warning" size="md">추가 서류 요청</Btn>
              </div>
              <p className="text-xs" style={{ color: A.muted }}>제출일: {app.submitted}</p>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="파트너 신청 거절" width={440}>
        <div className="px-6 py-5">
          <p className="text-sm mb-3" style={{ color: A.muted }}>거절 사유를 입력하세요. 신청자에게 이메일로 발송됩니다.</p>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
            placeholder="거절 사유..."
            className="w-full rounded-lg px-3 py-2.5 text-sm resize-none outline-none"
            style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }}/>
          <div className="flex justify-end gap-3 mt-4">
            <Btn onClick={() => setRejectOpen(false)}>취소</Btn>
            <Btn variant="danger" size="md" onClick={() => { setRejectOpen(false); setToast({ msg: "거절 처리됨", type: "error" }); }}>
              거절 전송
            </Btn>
          </div>
        </div>
      </Modal>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ── Screen 9: Courier Detail ───────────────────────────────────────────────────
export const CourierDetail = ({ courierId = "c1" }: { courierId?: string }) => {
  const c = COURIERS.find(x => x.id === courierId) ?? COURIERS[0];

  const DELIVERY_HISTORY = [
    { id: "HMK-8855", restaurant: "신당 할랄 키친", area: "이태원동", date: "오늘 15:42", amount: 4200, mins: 18, rating: 5 },
    { id: "HMK-8848", restaurant: "이스탄불 케밥", area: "한남동", date: "오늘 14:10", amount: 3800, mins: 22, rating: 5 },
    { id: "HMK-8840", restaurant: "마스지드 서울 카페", area: "이태원동", date: "오늘 12:33", amount: 5100, mins: 28, rating: 4 },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "배달파트너 관리", "파트너 목록", c.name]}
        title={c.name}
        subtitle={`${c.vehicle} · ${c.zone} 구역`}
        actions={
          <div className="flex gap-2">
            <Btn variant="secondary" size="md">메시지 보내기</Btn>
            <Btn variant="danger" size="md">파트너 정지</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "총 배달", value: `${c.deliveries.toLocaleString()}건`, icon: "📦", bg: A.infoLight, color: A.infoText },
          { label: "평점", value: `★ ${c.rating}`, icon: "⭐", bg: A.goldLight, color: A.goldText },
          { label: "총 수익", value: `₩${(c.earnings/1_000_000).toFixed(1)}M`, icon: "💰", bg: A.greenLight, color: A.greenText },
          { label: "수락률", value: "94%", icon: "✅", bg: A.purpleLight, color: A.purpleText },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: s.bg }}>{s.icon}</div>
            <div>
              <p className="font-mono font-bold text-xl" style={{ color: A.text }}>{s.value}</p>
              <p className="text-xs" style={{ color: A.muted }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>파트너 정보</p>
          </div>
          <div className="px-5 py-3 space-y-0">
            {[
              { l: "등록일", v: c.joinDate },
              { l: "서류 상태", v: c.docsStatus === "verified" ? "확인됨" : "심사중" },
              { l: "차량 종류", v: c.vehicle },
              { l: "담당 구역", v: c.zone },
              { l: "평균 배달 시간", v: "24분" },
              { l: "취소율", v: "1.8%" },
            ].map(item => (
              <div key={item.l} className="flex justify-between py-2.5" style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                <span className="text-xs" style={{ color: A.muted }}>{item.l}</span>
                <span className="text-xs font-medium" style={{ color: A.text }}>{item.v}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="col-span-2">
          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>최근 배달 이력</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: A.bg, borderBottom: `1px solid ${A.border}` }}>
                  {["주문번호", "레스토랑", "구역", "날짜", "금액", "시간", "평점"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: A.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DELIVERY_HISTORY.map(d => (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: A.green }}>#{d.id}</td>
                    <td className="px-4 py-3 text-sm">{d.restaurant}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: A.muted }}>{d.area}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: A.muted }}>{d.date}</td>
                    <td className="px-4 py-3 font-mono text-sm">₩{d.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{d.mins}분</td>
                    <td className="px-4 py-3 text-sm" style={{ color: A.gold }}>{"★".repeat(d.rating)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
};
