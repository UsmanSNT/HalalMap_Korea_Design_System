import React, { useState } from "react";
import {
  A, AdminTable, Column, StatusChip, SearchBar, FilterChips, Card, PageHeader,
  Btn, Modal, Toast, Pagination,
} from "./AdminShared";

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
