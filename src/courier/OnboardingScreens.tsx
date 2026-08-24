import React, { useState } from "react";
import { C, CStatusBar, SwipeConfirm } from "./CourierShared";

// ── 1. Courier Registration ────────────────────────────────────────────────────
export const CourierRegistrationScreen = () => {
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState<"motorcycle" | "bicycle" | "car">("motorcycle");
  const [zones, setZones] = useState(["이태원"]);

  const allZones = ["이태원", "홍대", "강남", "동대문", "신촌", "종로", "여의도", "마포"];

  const toggleZone = (z: string) =>
    setZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.card }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round">
              <path d="M11 4L7 9l4 5"/>
            </svg>
          </button>
        )}
        <div className="flex-1">
          <p className="font-bold text-base" style={{ color: C.text }}>배달 파트너 등록</p>
          <p className="text-xs" style={{ color: C.muted }}>{step}/3단계</p>
        </div>
        {/* Step dots */}
        <div className="flex gap-1.5">
          {[1,2,3].map(s => (
            <div key={s} className="h-2 rounded-full transition-all"
              style={{ width: s === step ? "20px" : "8px", backgroundColor: s <= step ? C.green : C.card }} />
          ))}
        </div>
      </div>

      <div className="flex-1 phone-scroll px-5 pt-4 space-y-4">
        {step === 1 && (
          <>
            <p className="font-bold text-lg" style={{ color: C.text }}>기본 정보</p>

            {[
              { label: "이름 (실명)", placeholder: "홍길동" },
              { label: "전화번호", placeholder: "010-0000-0000", type: "tel" },
              { label: "이메일", placeholder: "example@email.com", type: "email" },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: C.muted }}>{f.label}</p>
                <input type={f.type || "text"} placeholder={f.placeholder}
                  className="w-full px-4 py-4 rounded-2xl text-base outline-none"
                  style={{ backgroundColor: C.card, color: C.text, border: `1.5px solid ${C.borderBright}` }}
                />
              </div>
            ))}

            {/* Vehicle type */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: C.muted }}>차량 종류</p>
              <div className="grid grid-cols-3 gap-3">
                {(["motorcycle", "bicycle", "car"] as const).map(v => {
                  const cfg = {
                    motorcycle: { label: "오토바이", icon: "🛵" },
                    bicycle: { label: "자전거", icon: "🚲" },
                    car: { label: "자동차", icon: "🚗" },
                  }[v];
                  return (
                    <button key={v} onClick={() => setVehicle(v)}
                      className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
                      style={{
                        backgroundColor: vehicle === v ? C.greenGlow : C.card,
                        border: `2px solid ${vehicle === v ? C.green : C.borderBright}`,
                      }}>
                      <span className="text-3xl">{cfg.icon}</span>
                      <span className="text-xs font-bold" style={{ color: vehicle === v ? C.green : C.muted }}>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-bold text-base" style={{ backgroundColor: C.green, color: "#0E1620" }}>
              다음 →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="font-bold text-lg" style={{ color: C.text }}>서류 및 계좌</p>

            {/* License upload */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: C.muted }}>면허증 또는 신분증</p>
              <div className="flex flex-col items-center justify-center py-8 rounded-2xl gap-3"
                style={{ backgroundColor: C.card, border: `2px dashed ${C.borderBright}` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.cardAlt }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <circle cx="9" cy="11" r="3"/>
                    <path d="M14 8h4M14 12h3M6 17h12"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: C.text }}>사진 업로드</p>
                <p className="text-xs text-center" style={{ color: C.muted }}>JPG, PNG · 최대 10MB</p>
                <button className="px-5 py-2.5 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: C.cardAlt, color: C.text, border: `1px solid ${C.borderBright}` }}>
                  파일 선택
                </button>
              </div>
            </div>

            {/* Bank account */}
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: C.muted }}>정산 계좌</p>
              <select className="w-full px-4 py-4 rounded-2xl text-sm mb-2 outline-none"
                style={{ backgroundColor: C.card, color: C.text, border: `1.5px solid ${C.borderBright}` }}>
                <option>은행 선택</option>
                <option>신한은행</option><option>국민은행</option><option>카카오뱅크</option><option>토스뱅크</option>
              </select>
              <input placeholder="계좌번호 (하이픈 없이)" type="tel"
                className="w-full px-4 py-4 rounded-2xl text-sm outline-none"
                style={{ backgroundColor: C.card, color: C.text, border: `1.5px solid ${C.borderBright}` }}
              />
            </div>

            <button onClick={() => setStep(3)}
              className="w-full py-4 rounded-2xl font-bold text-base" style={{ backgroundColor: C.green, color: "#0E1620" }}>
              다음 →
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p className="font-bold text-lg" style={{ color: C.text }}>선호 배달 구역</p>
            <p className="text-sm" style={{ color: C.muted }}>주로 활동할 지역을 선택하세요 (복수 선택 가능)</p>

            <div className="grid grid-cols-2 gap-3">
              {allZones.map(zone => (
                <button key={zone} onClick={() => toggleZone(zone)}
                  className="py-4 rounded-2xl font-bold text-sm transition-all"
                  style={{
                    backgroundColor: zones.includes(zone) ? C.greenGlow : C.card,
                    border: `2px solid ${zones.includes(zone) ? C.green : C.borderBright}`,
                    color: zones.includes(zone) ? C.green : C.muted,
                  }}>
                  {zone}
                </button>
              ))}
            </div>

            {/* Terms */}
            <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: C.card }}>
              {["이용약관 동의 (필수)", "개인정보 처리방침 동의 (필수)", "위치정보 이용 동의 (필수)", "마케팅 수신 동의 (선택)"].map(t => (
                <div key={t} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: C.green }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M2 6l3 3 5-5"/>
                    </svg>
                  </div>
                  <p className="text-xs" style={{ color: C.muted }}>{t}</p>
                </div>
              ))}
            </div>

            <button className="w-full py-4 rounded-2xl font-bold text-base" style={{ backgroundColor: C.green, color: "#0E1620" }}>
              등록 신청 제출
            </button>
            <div className="h-4" />
          </>
        )}
      </div>
    </div>
  );
};

// ── 2. Courier Login ───────────────────────────────────────────────────────────
export const CourierLoginScreen = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar />

      {/* Brand */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: `linear-gradient(135deg, ${C.green} 0%, #17A350 100%)` }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2C9 2 5 6 5 11C5 17.5 14 25 14 25C14 25 23 17.5 23 11C23 6 19 2 14 2ZM14 14C12.3 14 11 12.7 11 11C11 9.3 12.3 8 14 8C15.7 8 17 9.3 17 11C17 12.7 15.7 14 14 14Z" fill="white"/>
          </svg>
        </div>
        <p className="font-bold text-2xl" style={{ color: C.text }}>HalalMap Courier</p>
        <p className="text-sm mt-1" style={{ color: C.muted }}>배달 파트너 앱</p>
      </div>

      <div className="flex-1 px-5 pt-4 space-y-5">
        {step === "phone" ? (
          <>
            <div>
              <p className="font-bold text-base mb-4" style={{ color: C.text }}>전화번호로 로그인</p>
              <div className="flex gap-2">
                <div className="px-4 py-4 rounded-2xl flex items-center gap-1 flex-shrink-0"
                  style={{ backgroundColor: C.card, border: `1.5px solid ${C.borderBright}` }}>
                  <span className="text-base">🇰🇷</span>
                  <span className="text-sm font-mono font-bold" style={{ color: C.text }}>+82</span>
                </div>
                <input type="tel" placeholder="010-0000-0000"
                  className="flex-1 px-4 py-4 rounded-2xl text-base outline-none font-mono"
                  style={{ backgroundColor: C.card, color: C.text, border: `1.5px solid ${C.green}` }}
                />
              </div>
            </div>

            <button onClick={() => setStep("otp")}
              className="w-full py-5 rounded-2xl font-bold text-lg" style={{ backgroundColor: C.green, color: "#0E1620" }}>
              인증번호 발송
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
              <span className="text-xs" style={{ color: C.dim }}>또는</span>
              <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
            </div>

            <button className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: "#FEE500", color: "#1A1A18" }}>
              <span className="text-lg">💬</span> 카카오로 로그인
            </button>

            <p className="text-center text-sm" style={{ color: C.muted }}>
              아직 파트너가 아니신가요?{" "}
              <span className="font-bold" style={{ color: C.green }}>등록하기</span>
            </p>
          </>
        ) : (
          <>
            <div>
              <p className="font-bold text-base mb-1" style={{ color: C.text }}>인증번호 입력</p>
              <p className="text-sm mb-4" style={{ color: C.muted }}>010-****-1234 로 발송된 6자리를 입력하세요</p>
              <div className="flex gap-2 justify-between">
                {otp.map((digit, i) => (
                  <div key={i} className="w-12 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-2xl"
                    style={{
                      backgroundColor: C.card,
                      border: `2px solid ${i === otp.filter(d => d !== "").length ? C.green : C.borderBright}`,
                      color: C.text,
                    }}>
                    {["3", "8", "5", "", "", ""][i] || ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3">
              {["1","2","3","4","5","6","7","8","9","","0","⌫"].map(k => (
                <button key={k}
                  className="py-4 rounded-2xl font-bold text-xl transition-opacity active:opacity-60"
                  style={{ backgroundColor: k === "" ? "transparent" : C.card, color: C.text }}>
                  {k}
                </button>
              ))}
            </div>

            <button className="w-full py-5 rounded-2xl font-bold text-lg" style={{ backgroundColor: C.green, color: "#0E1620" }}>
              로그인
            </button>

            <p className="text-center text-sm" style={{ color: C.muted }}>
              인증번호를 받지 못했나요?{" "}
              <span className="font-bold" style={{ color: C.green }}>재발송</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ── 3. Verification Pending ────────────────────────────────────────────────────
export const VerificationPendingScreen = () => {
  const docs = [
    { label: "신분증", status: "verified" },
    { label: "운전면허증", status: "verified" },
    { label: "오토바이 보험증", status: "reviewing" },
    { label: "정산 계좌", status: "verified" },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <CStatusBar />

      {/* Illustration */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "#F5A62320" }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="20" stroke={C.gold} strokeWidth="2"/>
            <path d="M22 12v12M22 30v2" stroke={C.gold} strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="font-bold text-2xl text-center mb-2" style={{ color: C.text }}>서류 검토 중</p>
        <p className="text-sm text-center leading-relaxed" style={{ color: C.muted }}>
          제출하신 서류를 검토하고 있습니다.<br/>보통 1~2 영업일이 소요됩니다.
        </p>
      </div>

      {/* Progress timeline */}
      <div className="px-5 space-y-1">
        {[
          { label: "신청 완료", done: true, desc: "2024.11.24 오후 2:34" },
          { label: "서류 검토 중", done: false, active: true, desc: "영업일 기준 1-2일 소요" },
          { label: "최종 승인", done: false, desc: "승인 후 배달 시작 가능" },
        ].map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: step.done ? C.green : step.active ? C.goldGlow : C.card,
                  border: `2px solid ${step.done ? C.green : step.active ? C.gold : C.borderBright}`,
                }}>
                {step.done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 7l3 3 5-5"/>
                  </svg>
                ) : step.active ? (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.gold }} />
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.dim }} />
                )}
              </div>
              {i < 2 && <div className="w-0.5 h-8" style={{ backgroundColor: step.done ? C.green : C.border }} />}
            </div>
            <div className="pt-1 pb-5">
              <p className="font-bold text-sm" style={{ color: step.done ? C.text : step.active ? C.gold : C.muted }}>{step.label}</p>
              <p className="text-xs mt-0.5" style={{ color: C.dim }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Document checklist */}
      <div className="mx-5 mt-2 rounded-2xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        {docs.map((doc, i) => (
          <div key={doc.label} className="flex items-center gap-4 px-4 py-3.5"
            style={{ borderBottom: i < docs.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: doc.status === "verified" ? C.greenGlow : C.goldGlow }}>
              {doc.status === "verified" ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M2.5 7l4 4 5-6"/>
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.gold }} />
              )}
            </div>
            <p className="flex-1 font-medium text-sm" style={{ color: C.text }}>{doc.label}</p>
            <span className="text-xs font-bold"
              style={{ color: doc.status === "verified" ? C.green : C.gold }}>
              {doc.status === "verified" ? "확인 완료" : "검토 중"}
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 mt-4 space-y-3">
        <button className="w-full py-4 rounded-2xl font-bold text-base" style={{ backgroundColor: C.card, color: C.text, border: `1.5px solid ${C.borderBright}` }}>
          카카오톡으로 알림 받기
        </button>
        <p className="text-center text-xs" style={{ color: C.dim }}>승인되면 즉시 문자로 알려드립니다</p>
      </div>
    </div>
  );
};
