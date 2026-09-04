import React, { useState } from "react";
import { StatusBar, BackButton } from "../components/Shared";
import type { ScreenId } from "../App";

// ── 22. Scanner Screen ─────────────────────────────────────────────────────────
export const ScannerScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [flash, setFlash] = useState(false);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#0A0A0A" }}>
      <StatusBar dark />

      {/* Controls */}
      <div className="flex items-center justify-between px-5 pb-4 relative z-20">
        <BackButton dark onBack={() => onNavigate?.("home")} />
        <h1 className="font-bold text-white text-lg">할랄 스캐너</h1>
        <button
          onClick={() => setFlash(!flash)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: flash ? "#FCD34D" : "rgba(255,255,255,0.15)" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill={flash ? "#1A1A18" : "white"}>
            <path d="M10 1L4 10h5l-1 7 7-10h-5L10 1z"/>
          </svg>
        </button>
      </div>

      {/* Camera area */}
      <div className="flex-1 relative flex flex-col items-center justify-center px-6">
        {/* Scan frame */}
        <div className="relative w-64 h-64">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-white" style={{ borderTopWidth: 3, borderLeftWidth: 3 }} />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-white" style={{ borderTopWidth: 3, borderRightWidth: 3 }} />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-white" style={{ borderBottomWidth: 3, borderLeftWidth: 3 }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-white" style={{ borderBottomWidth: 3, borderRightWidth: 3 }} />

          {/* Corner glow */}
          <div className="absolute top-0 left-0 w-6 h-6" style={{ boxShadow: "0 0 8px 2px rgba(27,107,74,0.8)" }} />
          <div className="absolute top-0 right-0 w-6 h-6" style={{ boxShadow: "0 0 8px 2px rgba(27,107,74,0.8)" }} />
          <div className="absolute bottom-0 left-0 w-6 h-6" style={{ boxShadow: "0 0 8px 2px rgba(27,107,74,0.8)" }} />
          <div className="absolute bottom-0 right-0 w-6 h-6" style={{ boxShadow: "0 0 8px 2px rgba(27,107,74,0.8)" }} />

          {/* Scan beam */}
          <div
            className="absolute left-2 right-2 h-0.5 animate-scan-beam"
            style={{
              background: "linear-gradient(90deg, transparent, var(--green), transparent)",
              boxShadow: "0 0 8px 2px rgba(27,107,74,0.6)",
              top: "4px",
            }}
          />

          {/* Barcode placeholder */}
          <div className="absolute inset-8 flex flex-col items-center justify-center gap-3">
            <div className="flex gap-1 items-end opacity-30">
              {[3,5,2,6,3,5,2,4,3,6,4,2,5,3].map((h, i) => (
                <div key={i} className="bg-white w-1 rounded-sm" style={{ height: `${h * 6}px` }} />
              ))}
            </div>
            <p className="text-white/30 text-[10px] font-mono">8801012345678</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 px-6 py-3 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-white text-sm font-medium text-center leading-relaxed">
            바코드 또는 성분표를 스캔하세요
          </p>
        </div>

        {/* Overlay dimming */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 270px 270px at center, transparent 0%, rgba(0,0,0,0.55) 100%)"
        }} />
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-10 space-y-4 relative z-10">
        {/* Recent scan */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1567620905572-d1d0d6ca9ea0?w=80&h=80&fit=crop&auto=format&q=80" alt="scan" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-white/60 text-[10px] font-medium">최근 스캔</p>
            <p className="text-white text-sm font-semibold">오리온 초코파이 정 (12개입)</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: "var(--green)", color: "white" }}>HALAL</span>
        </div>

        {/* Gallery button */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/20 text-white font-semibold text-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.6">
              <rect x="2" y="2" width="14" height="14" rx="2.5"/>
              <circle cx="6.5" cy="6.5" r="1.5"/>
              <path d="M2 12l4-4 3 3 2-2 4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            갤러리에서 선택
          </button>
        </div>
      </div>
    </div>
  );
};

// ── 23. Scan Result ────────────────────────────────────────────────────────────
type Verdict = "halal" | "haram" | "mashbooh";

const verdictConfig: Record<Verdict, { label: string; labelKo: string; color: string; bg: string; icon: string; desc: string }> = {
  halal: {
    label: "HALAL",
    labelKo: "할랄 인증",
    color: "#1B6B4A",
    bg: "#E8F3ED",
    icon: "✅",
    desc: "이 제품은 이슬람 율법에 따라 할랄 인증을 받았습니다.",
  },
  haram: {
    label: "HARAM",
    labelKo: "하람 (금지)",
    color: "#D94F4F",
    bg: "#FEE2E2",
    icon: "❌",
    desc: "이 제품에는 이슬람 율법에 따라 금지된 성분이 포함되어 있습니다.",
  },
  mashbooh: {
    label: "MASHBOOH",
    labelKo: "의심 (확인 필요)",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: "⚠️",
    desc: "일부 성분의 출처를 확인할 수 없습니다. 추가 확인이 필요합니다.",
  },
};

const ingredients = [
  { name: "밀가루 (소맥분)", status: "ok" },
  { name: "설탕", status: "ok" },
  { name: "팜유 (말레이시아산)", status: "ok" },
  { name: "코코아 파우더", status: "ok" },
  { name: "전란", status: "ok" },
  { name: "바닐라 향료 (합성)", status: "warn" },
  { name: "유화제 (대두레시틴)", status: "ok" },
  { name: "팽창제", status: "ok" },
];

export const ScanResultScreen = ({ verdict = "halal", onNavigate }: { verdict?: Verdict; onNavigate?: (s: ScreenId) => void }) => {
  const cfg = verdictConfig[verdict];

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg flex-1">스캔 결과</h1>
          <button className="text-sm font-medium" style={{ color: "var(--muted)" }}>공유</button>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Product */}
        <div className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#E8E6E1] flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1567620905572-d1d0d6ca9ea0?w=120&h=120&fit=crop&auto=format&q=80"
              alt="오리온 초코파이"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 py-1">
            <p className="text-xs text-[var(--muted)]">오리온 (Orion)</p>
            <p className="font-bold text-base text-[#1A1A18] leading-tight">초코파이 정 (12개입)</p>
            <p className="text-xs text-[var(--muted)] mt-1 font-mono">8801012345678</p>
          </div>
        </div>

        {/* Verdict */}
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.color}30` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0" style={{ backgroundColor: cfg.color }}>
              {verdict === "halal" ? (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4C9.4 4 4 9.4 4 16C4 22.6 9.4 28 16 28C22.6 28 28 22.6 28 16C28 9.4 22.6 4 16 4Z" fill="rgba(255,255,255,0.2)"/>
                  <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : <span>{cfg.icon}</span>}
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
              <p className="font-bold text-xl text-[#1A1A18] mt-0.5">{cfg.labelKo}</p>
              <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{cfg.desc}</p>
            </div>
          </div>

          {verdict === "halal" && (
            <div className="mt-4 flex items-center gap-2 pt-3 border-t" style={{ borderColor: `${cfg.color}20` }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill={cfg.color}>
                <path d="M7 1L8.5 5H12.5L9.5 7.5L10.5 12L7 9.5L3.5 12L4.5 7.5L1.5 5H5.5L7 1Z"/>
              </svg>
              <p className="text-xs font-semibold" style={{ color: cfg.color }}>인증 기관: 한국이슬람교중앙회 (KMF)</p>
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="font-semibold text-sm text-[#1A1A18]">성분 분석</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{ingredients.length}개 성분 확인됨</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {ingredients.map((ing) => (
              <div key={ing.name} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                  style={{
                    backgroundColor: ing.status === "ok" ? "var(--green-light)" : "var(--gold-light)",
                  }}
                >
                  {ing.status === "ok" ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4l2.5 2.5L9 1"/></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="var(--gold)" strokeWidth="0"><path d="M5 1L1 9h8L5 1Z"/><rect x="4.5" y="4.5" width="1" height="2.5" fill="white"/><rect x="4.5" y="7.5" width="1" height="1" fill="white"/></svg>
                  )}
                </div>
                <p className="text-sm text-[#1A1A18] flex-1">{ing.name}</p>
                {ing.status === "warn" && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--gold-light)", color: "#92400E" }}>확인 필요</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Positive notes */}
        {verdict === "halal" && (
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm space-y-2">
            <p className="font-semibold text-sm text-[#1A1A18]">확인 사항</p>
            {["돼지 젤라틴 없음", "알코올 성분 없음", "교차 오염 없음 (KMF 인증)"].map((note) => (
              <div key={note} className="flex items-center gap-2 text-sm" style={{ color: "var(--green)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4"/></svg>
                {note}
              </div>
            ))}
          </div>
        )}

        {/* Source */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--muted)]">데이터 출처</p>
            <p className="text-sm font-semibold text-[#1A1A18]">KMF 할랄 데이터베이스</p>
            <p className="text-xs text-[var(--muted)]">2024년 10월 업데이트</p>
          </div>
          <button className="text-xs font-medium px-3 py-2 rounded-xl border border-[var(--border)]" style={{ color: "var(--muted)" }}>
            오류 신고
          </button>
        </div>

        <button
          className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{ backgroundColor: "var(--green)" }}
        >
          다시 스캔하기
        </button>
        <div className="h-2" />
      </div>
    </div>
  );
};

// ── 24. Scan History ───────────────────────────────────────────────────────────
const scanHistory = [
  { name: "오리온 초코파이 정 (12개입)", brand: "오리온", date: "오늘 14:22", verdict: "halal" as Verdict },
  { name: "농심 새우깡", brand: "농심", date: "어제 19:41", verdict: "mashbooh" as Verdict },
  { name: "롯데 빼빼로 아몬드", brand: "롯데제과", date: "11월 20일", verdict: "halal" as Verdict },
  { name: "CJ 스팸 클래식", brand: "CJ제일제당", date: "11월 19일", verdict: "haram" as Verdict },
  { name: "해태 허니버터칩", brand: "해태제과", date: "11월 17일", verdict: "halal" as Verdict },
];

export const ScanHistoryScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-3">
        <BackButton onBack={() => onNavigate?.("home")} />
        <h1 className="font-bold text-lg flex-1">스캔 기록</h1>
        <button className="text-sm font-medium" style={{ color: "var(--danger)" }}>전체 삭제</button>
      </div>
    </div>

    <div className="flex-1 phone-scroll px-4 py-4 space-y-2.5">
      {scanHistory.map((item) => {
        const cfg = verdictConfig[item.verdict];
        return (
          <div key={item.name} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: cfg.bg }}
            >
              {item.verdict === "halal" ? "✅" : item.verdict === "haram" ? "❌" : "⚠️"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#1A1A18] truncate">{item.name}</p>
              <p className="text-xs text-[var(--muted)]">{item.brand} · {item.date}</p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
        );
      })}

      <div className="h-4" />
    </div>
  </div>
);
