import React, { useState } from "react";

// ── 7. Restaurant Settings ─────────────────────────────────────────────────────
const DAYS = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

export const RestaurantSettings = () => {
  const [tab, setTab] = useState<"basic" | "hours" | "delivery" | "notifications">("basic");
  const [hours, setHours] = useState(DAYS.map((_, i) => ({ open: i < 5, from: "09:00", to: "22:00" })));
  const [deliveryFee, setDeliveryFee] = useState("2000");
  const [minOrder, setMinOrder] = useState("10000");
  const [deliveryRadius, setDeliveryRadius] = useState("5");

  const tabs = [
    { id: "basic", label: "기본 정보" },
    { id: "hours", label: "영업 시간" },
    { id: "delivery", label: "배달 설정" },
    { id: "notifications", label: "알림 설정" },
  ] as const;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab nav */}
      <div className="flex border-b border-[var(--border)] bg-white flex-shrink-0 px-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="py-4 px-4 text-sm font-semibold border-b-2 transition-colors mr-2"
            style={{
              borderColor: tab === t.id ? "var(--green)" : "transparent",
              color: tab === t.id ? "var(--green)" : "var(--muted)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* ─── Basic Info ─── */}
          {tab === "basic" && (
            <>
              {/* Logo + Cover */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
                <p className="font-bold text-sm text-[#1A1A18]">브랜드 이미지</p>
                <div className="flex gap-6 items-start">
                  {/* Logo */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-[var(--border)] flex items-center justify-center cursor-pointer hover:border-[var(--green)] transition-colors" style={{ backgroundColor: "var(--green-light)" }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: "var(--green)" }}>신</div>
                    </div>
                    <p className="text-[11px] text-[var(--muted)]">로고 (200×200)</p>
                    <button className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--cream)]">변경</button>
                  </div>
                  {/* Cover */}
                  <div className="flex-1">
                    <div className="h-32 rounded-xl overflow-hidden border-2 border-dashed border-[var(--border)] flex items-center justify-center cursor-pointer hover:border-[var(--green)] transition-colors relative" style={{ backgroundColor: "#C4C0B8" }}>
                      <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=128&fit=crop&auto=format&q=80"
                        alt="cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <span className="text-white text-xs font-bold">커버 사진 변경</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] mt-1">커버 사진 (1200×400 권장)</p>
                  </div>
                </div>
              </div>

              {/* Restaurant info */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
                <p className="font-bold text-sm text-[#1A1A18]">식당 정보</p>
                {[
                  { label: "식당 이름 (한국어) *", value: "신당 할랄 키친" },
                  { label: "식당 이름 (영어)", value: "Sindang Halal Korean Kitchen" },
                  { label: "대표 전화번호", value: "02-1234-5678" },
                  { label: "사업자 등록번호", value: "123-45-67890" },
                ].map(field => (
                  <div key={field.label} className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--muted)]">{field.label}</label>
                    <input defaultValue={field.value}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[#1A1A18] outline-none focus:border-[var(--green)] transition-colors" />
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--muted)]">음식 종류</label>
                  <div className="flex flex-wrap gap-2">
                    {["한식", "터키", "우즈베크", "인도", "아랍", "퓨전"].map(c => (
                      <button key={c}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{ backgroundColor: ["한식", "퓨전"].includes(c) ? "var(--green)" : "var(--cream)", color: ["한식", "퓨전"].includes(c) ? "white" : "#1A1A18", border: ["한식", "퓨전"].includes(c) ? "none" : "1px solid var(--border)" }}>
                        {c}
                      </button>
                    ))}
                    <button className="px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-[var(--border)] hover:border-[var(--green)] transition-colors text-[var(--muted)]">+ 추가</button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--muted)]">식당 소개</label>
                  <textarea rows={3} defaultValue="이슬람 식품청(KMF) 인증 할랄 한식 전문점. 돼지고기 및 알코올 성분을 완전히 배제하고, 무슬림 고객도 안심하고 즐길 수 있는 정통 한식을 제공합니다."
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[#1A1A18] outline-none resize-none focus:border-[var(--green)] transition-colors" />
                </div>
              </div>
            </>
          )}

          {/* ─── Hours ─── */}
          {tab === "hours" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-3">
              <p className="font-bold text-sm text-[#1A1A18]">요일별 영업 시간</p>
              <div className="space-y-2">
                {DAYS.map((day, i) => (
                  <div key={day} className="flex items-center gap-4 py-2.5 border-b border-[var(--border)] last:border-none">
                    <div className="w-20 flex items-center gap-2 flex-shrink-0">
                      <div onClick={() => setHours(h => h.map((hh, j) => j === i ? { ...hh, open: !hh.open } : hh))}
                        className="w-10 h-5 rounded-full cursor-pointer transition-all relative flex-shrink-0"
                        style={{ backgroundColor: hours[i].open ? "var(--green)" : "#D1D5DB" }}>
                        <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                          style={{ left: hours[i].open ? "calc(100% - 18px)" : "2px" }} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: hours[i].open ? "#1A1A18" : "var(--muted)" }}>{day.slice(0, 2)}</span>
                    </div>
                    {hours[i].open ? (
                      <div className="flex items-center gap-2">
                        <input type="time" value={hours[i].from}
                          onChange={e => setHours(h => h.map((hh, j) => j === i ? { ...hh, from: e.target.value } : hh))}
                          className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-sm font-mono text-[#1A1A18] outline-none focus:border-[var(--green)]" />
                        <span className="text-[var(--muted)] text-sm">—</span>
                        <input type="time" value={hours[i].to}
                          onChange={e => setHours(h => h.map((hh, j) => j === i ? { ...hh, to: e.target.value } : hh))}
                          className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-sm font-mono text-[#1A1A18] outline-none focus:border-[var(--green)]" />
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--muted)] italic">휴무</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Delivery ─── */}
          {tab === "delivery" && (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
                <p className="font-bold text-sm text-[#1A1A18]">배달 설정</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "최소 주문 금액 (₩)", state: minOrder, setState: setMinOrder },
                    { label: "기본 배달비 (₩)", state: deliveryFee, setState: setDeliveryFee },
                  ].map(field => (
                    <div key={field.label} className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--muted)]">{field.label}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)] font-mono">₩</span>
                        <input type="number" value={field.state} onChange={e => field.setState(e.target.value)}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[var(--border)] text-sm font-mono font-bold text-[#1A1A18] outline-none focus:border-[var(--green)]" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--muted)]">배달 반경 (km)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="1" max="15" value={deliveryRadius}
                      onChange={e => setDeliveryRadius(e.target.value)}
                      className="flex-1 accent-[var(--green)] h-2" />
                    <span className="font-mono font-bold text-sm tabular-nums w-12 text-center text-[#1A1A18]">{deliveryRadius}km</span>
                  </div>
                </div>
              </div>

              {/* SVG map with delivery circle */}
              <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[var(--border)]">
                  <p className="font-bold text-sm text-[#1A1A18]">배달 반경 지도</p>
                </div>
                <div className="relative h-56 bg-[#E8F0E8]">
                  <svg width="100%" height="224" viewBox="0 0 600 224" preserveAspectRatio="xMidYMid slice">
                    {/* Road grid */}
                    <rect width="600" height="224" fill="#E8F0E8"/>
                    {[40,80,120,160,200,240,280,320,360,400,440,480,520,560].map(x => (
                      <line key={`v${x}`} x1={x} y1="0" x2={x} y2="224" stroke="#D4DFCE" strokeWidth="8"/>
                    ))}
                    {[40,80,120,160,200].map(y => (
                      <line key={`h${y}`} x1="0" y1={y} x2="600" y2={y} stroke="#D4DFCE" strokeWidth="8"/>
                    ))}
                    {/* Buildings */}
                    {[[20,20,40,30],[100,50,35,25],[200,30,50,35],[350,60,40,28],[460,20,55,40],[50,100,60,35],[200,110,45,30],[380,120,50,40],[500,90,45,35]].map(([x,y,w,h], i) => (
                      <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#C8D4C8" opacity="0.8"/>
                    ))}
                    {/* Delivery circle */}
                    <circle cx="300" cy="112" r={Number(deliveryRadius) * 16} fill="rgba(27,107,74,0.08)" stroke="var(--green)" strokeWidth="2" strokeDasharray="6 4"/>
                    {/* Restaurant pin */}
                    <circle cx="300" cy="112" r="10" fill="var(--green)"/>
                    <circle cx="300" cy="112" r="4" fill="white"/>
                    <text x="300" y="95" textAnchor="middle" fill="var(--green)" fontSize="10" fontWeight="700">신당 할랄 키친</text>
                  </svg>
                </div>
              </div>
            </>
          )}

          {/* ─── Notifications ─── */}
          {tab === "notifications" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
              <p className="font-bold text-sm text-[#1A1A18]">알림 설정</p>
              {[
                { label: "신규 주문 알림", desc: "새 주문 접수 시 소리 및 화면 알림", on: true },
                { label: "주문 취소 알림", desc: "고객이 주문을 취소할 때 알림", on: true },
                { label: "배달 기사 배정 알림", desc: "배달 기사가 배정되면 알림", on: true },
                { label: "리뷰 알림", desc: "새 리뷰 등록 시 알림", on: false },
                { label: "할랄 인증 만료 경고", desc: "인증 만료 30일 전부터 알림", on: true },
                { label: "앱 공지사항", desc: "HalalMap Korea 공지 및 업데이트", on: false },
              ].map(setting => (
                <div key={setting.label} className="flex items-start gap-3 py-2 border-b border-[var(--border)] last:border-none">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#1A1A18]">{setting.label}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{setting.desc}</p>
                  </div>
                  <div className="w-12 h-6 rounded-full cursor-pointer transition-all relative flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: setting.on ? "var(--green)" : "#D1D5DB" }}>
                    <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                      style={{ left: setting.on ? "calc(100% - 22px)" : "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end gap-3 pb-4">
            <button className="px-5 py-3 rounded-xl text-sm font-semibold border border-[var(--border)] bg-white hover:bg-[var(--cream)] transition-colors">
              변경 취소
            </button>
            <button className="px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 8. Halal Certification ─────────────────────────────────────────────────────
const CERT_STATUS: "verified" | "pending" | "expiring" | "expired" = "verified";

const STATUS_CERT = {
  verified: { label: "인증 완료", color: "var(--green)", bg: "var(--green-light)", icon: "✓" },
  pending:  { label: "심사 중", color: "#D97706", bg: "#FFFBEB", icon: "⏳" },
  expiring: { label: "만료 임박", color: "#D97706", bg: "#FFFBEB", icon: "⚠️" },
  expired:  { label: "만료됨", color: "var(--danger)", bg: "#FEF2F2", icon: "✕" },
};

export const HalalCertification = () => {
  const [dragOver, setDragOver] = useState(false);
  const cfg = STATUS_CERT[CERT_STATUS];

  const certHistory = [
    { id: "KMF-2024-08847", body: "한국이슬람교중앙회 (KMF)", issued: "2024-01-15", expires: "2025-01-14", status: "verified" },
    { id: "KMF-2023-07721", body: "한국이슬람교중앙회 (KMF)", issued: "2023-01-10", expires: "2024-01-09", status: "expired" },
  ];

  const daysLeft = 51;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Status banner */}
        <div className="rounded-2xl p-5 flex items-center gap-4 shadow-sm" style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.color}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: cfg.color, color: "white" }}>
            {cfg.icon}
          </div>
          <div className="flex-1">
            <p className="font-bold text-base" style={{ color: cfg.color }}>{cfg.label}</p>
            <p className="text-sm text-[#1A1A18]">인증 번호: KMF-2024-08847 · 한국이슬람교중앙회 (KMF)</p>
          </div>
          {CERT_STATUS === "verified" && (
            <div className="text-right">
              <p className="font-mono text-2xl font-bold tabular-nums" style={{ color: cfg.color }}>{daysLeft}일</p>
              <p className="text-xs" style={{ color: cfg.color }}>만료까지</p>
            </div>
          )}
        </div>

        {/* Current cert card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
          <p className="font-bold text-sm text-[#1A1A18]">현재 인증서</p>

          <div className="flex gap-5">
            {/* Document thumbnail */}
            <div className="w-32 h-40 rounded-xl border-2 border-[var(--border)] bg-[var(--cream)] flex flex-col items-center justify-center gap-2 flex-shrink-0 relative overflow-hidden">
              <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                <rect x="2" y="2" width="24" height="28" rx="2" fill="white" stroke="var(--border)" strokeWidth="1.5"/>
                <line x1="7" y1="10" x2="21" y2="10" stroke="var(--border)" strokeWidth="1.5"/>
                <line x1="7" y1="14" x2="21" y2="14" stroke="var(--border)" strokeWidth="1.5"/>
                <line x1="7" y1="18" x2="16" y2="18" stroke="var(--border)" strokeWidth="1.5"/>
                <circle cx="14" cy="25" r="4" fill="var(--green)" opacity="0.3"/>
                <path d="M12 25l1.5 1.5L16 23" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-[10px] font-bold text-[var(--muted)]">KMF 인증서</p>
              <p className="text-[9px] text-[var(--muted)]">PDF</p>
              <button className="absolute bottom-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>
                보기
              </button>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3">
              {[
                { label: "인증 기관", value: "한국이슬람교중앙회 (KMF)" },
                { label: "인증 번호", value: "KMF-2024-08847", mono: true },
                { label: "발급일", value: "2024년 1월 15일" },
                { label: "만료일", value: "2025년 1월 14일" },
                { label: "관리자 검증", value: "검증 완료 · 2024.01.20" },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2">
                  <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide w-28 flex-shrink-0">{row.label}</p>
                  <p className={`text-sm text-[#1A1A18] ${row.mono ? "font-mono font-bold tabular-nums" : "font-medium"}`}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expiry progress */}
          <div>
            <div className="flex justify-between text-xs text-[var(--muted)] mb-1.5">
              <span>인증 유효 기간</span>
              <span className="font-bold" style={{ color: "var(--green)" }}>만료까지 {daysLeft}일 남음</span>
            </div>
            <div className="h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(daysLeft / 365) * 100}%`, backgroundColor: daysLeft < 30 ? "var(--danger)" : daysLeft < 90 ? "#D97706" : "var(--green)" }} />
            </div>
          </div>
        </div>

        {/* Upload new */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] space-y-4">
          <p className="font-bold text-sm text-[#1A1A18]">새 인증서 업로드</p>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); }}
            className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 gap-3 cursor-pointer transition-all"
            style={{ borderColor: dragOver ? "var(--green)" : "var(--border)", backgroundColor: dragOver ? "var(--green-light)" : "var(--cream)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--green-light)" }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 14v2a2 2 0 002 2h10a2 2 0 002-2v-2"/>
                <path d="M11 4v10M7 8l4-4 4 4"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-[#1A1A18]">인증서 파일을 드래그하거나 클릭</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">PDF, JPG, PNG · 최대 10MB</p>
            </div>
            <button className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border)] bg-white hover:bg-[var(--cream)]">파일 선택</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted)]">인증 기관</label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[#1A1A18] outline-none focus:border-[var(--green)] bg-white">
                <option>한국이슬람교중앙회 (KMF)</option>
                <option>JAKIM (말레이시아)</option>
                <option>MUI (인도네시아)</option>
                <option>기타</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted)]">인증 만료일</label>
              <input type="date" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm font-mono text-[#1A1A18] outline-none focus:border-[var(--green)]" />
            </div>
          </div>

          <button className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>
            검토 요청 제출
          </button>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)]">
            <p className="font-bold text-sm text-[#1A1A18]">인증 이력</p>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--cream)", borderBottom: "1px solid var(--border)" }}>
                {["인증 번호", "인증 기관", "발급일", "만료일", "상태"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {certHistory.map(cert => {
                const s = STATUS_CERT[cert.status as keyof typeof STATUS_CERT];
                return (
                  <tr key={cert.id} className="hover:bg-[var(--cream)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold tabular-nums text-[#1A1A18]">{cert.id}</td>
                    <td className="px-4 py-3 text-sm text-[#1A1A18]">{cert.body}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[var(--muted)]">{cert.issued}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[var(--muted)]">{cert.expires}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
