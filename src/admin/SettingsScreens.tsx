import React, { useState } from "react";
import { A, Card, PageHeader, Btn, Modal, Toast, StatusChip } from "./AdminShared";

// ── Toggle component ───────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!value)}
    className="w-11 h-6 rounded-full relative transition-all duration-200 flex-shrink-0"
    style={{ backgroundColor: value ? A.green : A.border }}>
    <div className="absolute w-4 h-4 rounded-full bg-white top-1 transition-all duration-200"
      style={{ left: value ? "calc(100% - 20px)" : "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
  </button>
);

// ── Screen 16: Platform Settings ──────────────────────────────────────────────
export const PlatformSettings = () => {
  const [tab, setTab] = useState<"fees" | "cities" | "payment" | "notifs" | "halal" | "api">("fees");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const [fees, setFees] = useState({
    platformCommission: "15",
    minDeliveryFee: "1500",
    maxDeliveryFee: "5000",
    freeDeliveryThreshold: "30000",
    courierBaseRate: "2500",
    courierPerKm: "200",
  });

  const [notifToggles, setNotifToggles] = useState({
    orderPlaced: true,
    orderAccepted: true,
    orderDelivered: true,
    orderCancelled: true,
    prayerTime: false,
    promotions: true,
  });

  const TABS = [
    { id: "fees" as const, label: "수수료 & 배달비" },
    { id: "cities" as const, label: "서비스 지역" },
    { id: "payment" as const, label: "결제 게이트웨이" },
    { id: "notifs" as const, label: "알림 템플릿" },
    { id: "halal" as const, label: "할랄 인증 기준" },
    { id: "api" as const, label: "API 키" },
  ];

  const CITIES = [
    { name: "서울 (이태원, 용산, 홍대)", status: "active", restaurants: 284, coverage: "전역" },
    { name: "부산 (서면, 해운대)", status: "active", restaurants: 42, coverage: "일부" },
    { name: "인천 (차이나타운 인근)", status: "active", restaurants: 18, coverage: "일부" },
    { name: "대구", status: "pending", restaurants: 8, coverage: "-" },
    { name: "제주도", status: "pending", restaurants: 3, coverage: "-" },
  ];

  const PAYMENT_GWS = [
    { name: "카카오페이", status: true, txFee: "1.8%", icon: "💛" },
    { name: "토스페이먼츠", status: true, txFee: "2.0%", icon: "🔵" },
    { name: "신한 카드", status: true, txFee: "2.2%", icon: "🟦" },
    { name: "네이버페이", status: false, txFee: "1.9%", icon: "🟢" },
    { name: "Apple Pay", status: false, txFee: "2.5%", icon: "⚫" },
  ];

  const CERT_ORGS = [
    { name: "한국이슬람교중앙회 (KMF)", accepted: true, country: "한국" },
    { name: "JAKIM Malaysia", accepted: true, country: "말레이시아" },
    { name: "MUI Indonesia", accepted: true, country: "인도네시아" },
    { name: "ESMA UAE", accepted: true, country: "UAE" },
    { name: "IFANCA USA", accepted: false, country: "미국" },
  ];

  const API_KEYS = [
    { name: "Firebase FCM (푸시 알림)", key: "AIzaSy••••••••••••••••••••••", status: "active" as const },
    { name: "Google Maps API", key: "AIzaSy••••••••••••••••••••••", status: "active" as const },
    { name: "Kakao Local API", key: "••••••••••••••••••••", status: "active" as const },
    { name: "Stripe 결제", key: "sk_live_••••••••••••••••••••••", status: "warning" as const },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "설정", "플랫폼 설정"]}
        title="플랫폼 설정"
        subtitle="수수료, 지역, 결제, 알림, 인증 기준 관리"
        actions={
          <Btn variant="primary" size="md" onClick={() => setToast({ msg: "설정이 저장되었습니다", type: "success" })}>
            변경사항 저장
          </Btn>
        }
      />

      {/* Tab row */}
      <div className="flex gap-1 mb-5 overflow-x-auto" style={{ borderBottom: `1px solid ${A.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2.5 text-sm font-medium whitespace-nowrap relative"
            style={{ color: tab === t.id ? A.green : A.muted }}>
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: A.green }} />}
          </button>
        ))}
      </div>

      {/* Fees */}
      {tab === "fees" && (
        <div className="grid grid-cols-2 gap-5">
          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>플랫폼 수수료</p>
            </div>
            <div className="px-5 py-4 space-y-4">
              {[
                { label: "플랫폼 수수료율 (%)", key: "platformCommission" as const },
                { label: "무료 배달 기준 금액 (₩)", key: "freeDeliveryThreshold" as const },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium" style={{ color: A.muted }}>{f.label}</label>
                  <input value={fees[f.key]} onChange={e => setFees(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg outline-none font-mono"
                    style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }}/>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>배달비 구조</p>
            </div>
            <div className="px-5 py-4 space-y-4">
              {[
                { label: "최소 배달비 (₩)", key: "minDeliveryFee" as const },
                { label: "최대 배달비 (₩)", key: "maxDeliveryFee" as const },
                { label: "배달파트너 기본 요금 (₩)", key: "courierBaseRate" as const },
                { label: "배달파트너 km당 추가 (₩)", key: "courierPerKm" as const },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium" style={{ color: A.muted }}>{f.label}</label>
                  <input value={fees[f.key]} onChange={e => setFees(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg outline-none font-mono"
                    style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }}/>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Cities */}
      {tab === "cities" && (
        <Card>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>서비스 지역</p>
            <Btn variant="primary">+ 지역 추가</Btn>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: A.bg, borderBottom: `1px solid ${A.border}` }}>
                {["도시 / 지역", "레스토랑 수", "서비스 범위", "상태", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: A.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CITIES.map(c => (
                <tr key={c.name} style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                  <td className="px-4 py-3 font-medium" style={{ color: A.text }}>{c.name}</td>
                  <td className="px-4 py-3 font-mono text-sm">{c.restaurants}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: A.muted }}>{c.coverage}</td>
                  <td className="px-4 py-3"><StatusChip status={c.status as any} label={c.status === "active" ? "운영중" : "준비중"} /></td>
                  <td className="px-4 py-3"><div className="flex gap-1"><Btn variant="ghost">수정</Btn><Btn variant="danger">비활성화</Btn></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Payment */}
      {tab === "payment" && (
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>결제 게이트웨이</p>
          </div>
          <div className="divide-y" style={{ borderColor: A.borderLight }}>
            {PAYMENT_GWS.map((gw, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{gw.icon}</span>
                  <div>
                    <p className="font-medium text-sm" style={{ color: A.text }}>{gw.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: A.muted }}>거래 수수료: {gw.txFee}</p>
                  </div>
                </div>
                <Toggle value={gw.status} onChange={() => {}} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notifications */}
      {tab === "notifs" && (
        <div className="grid grid-cols-2 gap-5">
          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>알림 유형 활성화</p>
            </div>
            <div className="divide-y" style={{ borderColor: A.borderLight }}>
              {Object.entries(notifToggles).map(([key, val]) => {
                const labels: Record<string, string> = {
                  orderPlaced: "주문 접수 알림",
                  orderAccepted: "주문 수락 알림",
                  orderDelivered: "배달 완료 알림",
                  orderCancelled: "주문 취소 알림",
                  prayerTime: "기도 시간 알림",
                  promotions: "프로모션 알림",
                };
                return (
                  <div key={key} className="flex items-center justify-between px-5 py-4">
                    <p className="text-sm" style={{ color: A.textMid }}>{labels[key]}</p>
                    <Toggle value={val} onChange={v => setNotifToggles(p => ({ ...p, [key]: v }))} />
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="font-semibold text-sm" style={{ color: A.text }}>주문 완료 알림 템플릿 (미리보기)</p>
            </div>
            <div className="px-5 py-4">
              <div className="rounded-xl p-4" style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}>
                <p className="text-xs font-bold mb-1" style={{ color: A.muted }}>PUSH NOTIFICATION</p>
                <p className="font-semibold text-sm" style={{ color: A.text }}>배달이 완료되었습니다! 🎉</p>
                <p className="text-xs mt-1" style={{ color: A.muted }}>주문 #HMK-8901이 이태원동에 배달되었습니다. 음식을 즐겨보세요!</p>
              </div>
              <textarea rows={4} defaultValue="배달이 완료되었습니다! 🎉\n주문 #{orderId}이 {area}에 배달되었습니다. 음식을 즐겨보세요!"
                className="w-full mt-3 px-3 py-2.5 text-sm rounded-lg outline-none resize-none"
                style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }}/>
              <div className="mt-2"><Btn variant="secondary" size="md">템플릿 저장</Btn></div>
            </div>
          </Card>
        </div>
      )}

      {/* Halal cert criteria */}
      {tab === "halal" && (
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>인정 할랄 인증 기관</p>
          </div>
          <div className="divide-y" style={{ borderColor: A.borderLight }}>
            {CERT_ORGS.map((org, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-sm" style={{ color: A.text }}>{org.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: A.muted }}>{org.country}</p>
                </div>
                <Toggle value={org.accepted} onChange={() => {}} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* API Keys */}
      {tab === "api" && (
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="font-semibold text-sm" style={{ color: A.text }}>API 키 관리</p>
          </div>
          <div className="divide-y" style={{ borderColor: A.borderLight }}>
            {API_KEYS.map((k, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-sm" style={{ color: A.text }}>{k.name}</p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: A.dim }}>{k.key}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusChip status={k.status} label={k.status === "active" ? "활성" : "갱신 필요"} />
                  <Btn variant="ghost">재발급</Btn>
                  <Btn variant="ghost">복사</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ── Screen 17: Admin Users & Roles ────────────────────────────────────────────
type AdminUser = {
  id: string; name: string; email: string; role: "super_admin" | "operations" | "support" | "content";
  lastLogin: string; status: "active" | "inactive"; joinDate: string;
};

const ADMIN_USERS: AdminUser[] = [
  { id: "a1", name: "김관리자", email: "admin@halalmap.kr", role: "super_admin", lastLogin: "방금 전", status: "active", joinDate: "2022.01.01" },
  { id: "a2", name: "이운영", email: "ops@halalmap.kr", role: "operations", lastLogin: "1시간 전", status: "active", joinDate: "2023.03.15" },
  { id: "a3", name: "박지원", email: "support@halalmap.kr", role: "support", lastLogin: "어제", status: "active", joinDate: "2023.08.22" },
  { id: "a4", name: "최콘텐츠", email: "content@halalmap.kr", role: "content", lastLogin: "3일 전", status: "active", joinDate: "2024.02.10" },
  { id: "a5", name: "정퇴직", email: "ex@halalmap.kr", role: "support", lastLogin: "2개월 전", status: "inactive", joinDate: "2022.11.05" },
];

const ROLE_LABELS: Record<AdminUser["role"], string> = {
  super_admin: "슈퍼 어드민",
  operations: "운영자",
  support: "고객지원",
  content: "콘텐츠 관리",
};

const ROLE_COLORS: Record<AdminUser["role"], { bg: string; text: string }> = {
  super_admin: { bg: "#FDF2F8", text: "#9D174D" },
  operations: { bg: A.infoLight, text: A.infoText },
  support: { bg: A.greenLight, text: A.greenText },
  content: { bg: A.goldLight, text: A.goldText },
};

const ROLE_PERMISSIONS: Record<AdminUser["role"], string[]> = {
  super_admin: ["전체 접근", "설정 변경", "관리자 관리", "데이터 삭제"],
  operations: ["주문 관리", "배달파트너 관리", "레스토랑 관리", "실시간 운영"],
  support: ["사용자 조회", "주문 환불", "문의 처리"],
  content: ["할랄 DB", "모스크 관리", "프로모션 관리", "앱 콘텐츠"],
};

export const AdminUsers = () => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminUser["role"]>("super_admin");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "설정", "관리자 계정"]}
        title="관리자 계정 & 역할"
        subtitle={`${ADMIN_USERS.length}명의 관리자`}
        actions={<Btn variant="primary" size="md" onClick={() => setInviteOpen(true)}>+ 관리자 초대</Btn>}
      />

      <div className="grid grid-cols-4 gap-4 mb-5">
        {(Object.keys(ROLE_LABELS) as AdminUser["role"][]).map(role => {
          const col = ROLE_COLORS[role];
          const count = ADMIN_USERS.filter(u => u.role === role).length;
          return (
            <Card key={role} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-2xl" style={{ color: A.text }}>{count}</p>
                  <p className="text-xs mt-1" style={{ color: A.muted }}>{ROLE_LABELS[role]}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                  style={{ backgroundColor: col.bg, color: col.text }}>{ROLE_LABELS[role]}</span>
              </div>
              <div className="mt-3">
                <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: A.dim }}>권한</p>
                {ROLE_PERMISSIONS[role].slice(0, 3).map(p => (
                  <p key={p} className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: A.muted }}>
                    <span style={{ color: A.green }}>✓</span> {p}
                  </p>
                ))}
                {ROLE_PERMISSIONS[role].length > 3 && (
                  <p className="text-[11px] mt-0.5" style={{ color: A.dim }}>+{ROLE_PERMISSIONS[role].length - 3}개 더</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
          <p className="font-semibold text-sm" style={{ color: A.text }}>관리자 목록</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: A.bg, borderBottom: `1px solid ${A.border}` }}>
              {["이름", "이메일", "역할", "최근 로그인", "가입일", "상태", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: A.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ADMIN_USERS.map(u => {
              const col = ROLE_COLORS[u.role];
              return (
                <tr key={u.id} style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: col.bg, color: col.text }}>
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm" style={{ color: A.text }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: A.muted }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: col.bg, color: col.text }}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: A.muted }}>{u.lastLogin}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: A.muted }}>{u.joinDate}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={u.status} label={u.status === "active" ? "활성" : "비활성"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.role !== "super_admin" && <Btn variant="ghost">수정</Btn>}
                      {u.role !== "super_admin" && <Btn variant="danger">비활성화</Btn>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="관리자 초대" width={440}>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium" style={{ color: A.muted }}>이메일</label>
            <input placeholder="newadmin@halalmap.kr" className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg outline-none"
              style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }}/>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: A.muted }}>역할</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {(Object.keys(ROLE_LABELS) as AdminUser["role"][]).map(role => (
                <button key={role} onClick={() => setSelectedRole(role)}
                  className="py-2.5 px-3 rounded-lg text-xs font-medium text-left transition-all"
                  style={{
                    backgroundColor: selectedRole === role ? ROLE_COLORS[role].bg : A.bg,
                    color: selectedRole === role ? ROLE_COLORS[role].text : A.muted,
                    border: `1.5px solid ${selectedRole === role ? ROLE_COLORS[role].text : A.border}`,
                  }}>
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Btn onClick={() => setInviteOpen(false)}>취소</Btn>
            <Btn variant="primary" size="md" onClick={() => { setInviteOpen(false); setToast({ msg: "초대 이메일이 발송되었습니다", type: "success" }); }}>
              초대 전송
            </Btn>
          </div>
        </div>
      </Modal>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
