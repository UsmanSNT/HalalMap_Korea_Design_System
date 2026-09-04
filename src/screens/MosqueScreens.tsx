import React, { useState, useEffect } from "react";
import { GeometricPattern, StatusBar, BottomNav, BackButton, Toggle, TabId } from "../components/Shared";
import { getMosques, getMosque, getPrayerTimes, type Mosque, type PrayerTimesData } from "@/api/mosques";
import type { ScreenId } from "../App";

// ── 18. Mosque List ────────────────────────────────────────────────────────────
export const MosqueListScreen = ({ onTabChange, onNavigate }: { onTabChange?: (t: TabId) => void; onNavigate?: (s: ScreenId) => void }) => {
  const [tab, setTab] = useState<"mosque" | "prayer-room">("mosque");
  const [mosqueList, setMosqueList] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMosques()
      .then(setMosqueList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = mosqueList.filter((m) => m.type === tab);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-xl text-[#1A1A18]">모스크 · 기도실</h1>
            <button className="w-9 h-9 rounded-xl bg-[var(--cream)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--charcoal)" strokeWidth="1.8">
                <rect x="2" y="2" width="6" height="6" rx="1.5"/>
                <rect x="10" y="2" width="6" height="6" rx="1.5"/>
                <rect x="2" y="10" width="6" height="6" rx="1.5"/>
                <rect x="10" y="10" width="6" height="6" rx="1.5"/>
              </svg>
            </button>
          </div>
          <div className="flex bg-[var(--cream)] rounded-xl p-1">
            {(["mosque", "prayer-room"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: tab === t ? "var(--green)" : "transparent",
                  color: tab === t ? "white" : "var(--muted)",
                }}
              >
                {t === "mosque" ? "🕌 모스크" : "🙏 기도실"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">로딩중...</p>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="h-28 bg-[#D8D4CC] relative">
                {m.photo && (
                  <img
                    src={`${m.photo}&w=390&h=130&fit=crop&auto=format&q=80`}
                    alt={m.nameKo}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: m.type === "mosque" ? "var(--gold)" : "var(--info)" }}>
                    {m.type === "mosque" ? "모스크" : "기도실"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-base text-[#1A1A18]">{m.nameKo}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">{m.name}</p>
                <p className="text-xs text-[var(--muted)] mt-1">📍 {m.address}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span>{m.distance}</span>
                    <span>·</span>
                    <span>{m.walkTime ?? ""}</span>
                  </div>
                  <div
                    className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}
                  >
                    {m.subtitle ?? ""}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav active="prayer" onTabChange={onTabChange} />
    </div>
  );
};

// ── 19. Mosque Detail ──────────────────────────────────────────────────────────
export const MosqueDetailScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMosque("seoul-central"), getPrayerTimes()])
      .then(([m, p]) => {
        if (cancelled) return;
        setMosque(m);
        setPrayerData(p.prayerTimes);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading || !mosque) {
    return (
      <div className="flex flex-col h-full bg-[var(--cream)] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">로딩중...</p>
      </div>
    );
  }

  const now = new Date();
  const prayerTimesForDetail = (prayerData?.prayers ?? [])
    .filter((p) => p.id !== "sunrise")
    .map((p) => {
      const [h, min] = p.time.split(":").map(Number);
      const passed = h < now.getHours() || (h === now.getHours() && min <= now.getMinutes());
      return { ...p, passed };
    });
  const nextIdx = prayerTimesForDetail.findIndex((p) => !p.passed);

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="relative flex-shrink-0">
        <div className="h-52 bg-[#D8D4CC] relative">
          {mosque.photo && (
            <img
              src={`${mosque.photo}&w=390&h=210&fit=crop&auto=format&q=80`}
              alt={mosque.nameKo}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
        </div>
        <div className="absolute top-0 left-0 right-0">
          <StatusBar dark />
        </div>
        <div className="absolute top-12 left-4 flex gap-2">
          <BackButton dark onBack={() => onNavigate?.("home")} />
        </div>
        <div className="absolute top-12 right-4">
          <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.6">
              <circle cx="14" cy="4" r="2.5"/><circle cx="4" cy="9" r="2.5"/><circle cx="14" cy="14" r="2.5"/>
              <line x1="11.5" y1="5.5" x2="6.5" y2="7.5"/><line x1="11.5" y1="12.5" x2="6.5" y2="10.5"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 phone-scroll">
        <div className="bg-white px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h1 className="font-bold text-xl text-[#1A1A18]">{mosque.nameKo}</h1>
              <p className="text-sm text-[var(--muted)]">{mosque.name}{mosque.subtitle ? ` · ${mosque.subtitle}` : ""}</p>
            </div>
            <span className="text-2xl">{mosque.type === "mosque" ? "🕌" : "🙏"}</span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-2">📍 {mosque.address}</p>
          {mosque.phone && <p className="text-xs text-[var(--muted)] mt-0.5">☎ {mosque.phone}</p>}

          {mosque.juma && (
            <div
              className="mt-3 flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: "var(--gold-light)" }}
            >
              <span className="text-xl">🌟</span>
              <div>
                <p className="font-bold text-sm" style={{ color: "#7A5220" }}>주마 예배</p>
                <p className="text-xs" style={{ color: "#9A6830" }}>{mosque.juma}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white mt-2 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm text-[#1A1A18]">오늘의 기도 시간</p>
            {prayerData && <p className="text-xs text-[var(--muted)]">{prayerData.hijriDate}</p>}
          </div>
          <div className="space-y-1">
            {prayerTimesForDetail.map((p, i) => {
              const isNext = i === nextIdx;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: isNext ? "var(--green-light)" : "transparent",
                    opacity: p.passed ? 0.45 : 1,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    {isNext ? (
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--green)" }} />
                    ) : (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.passed ? "var(--border)" : "var(--muted)" }} />
                    )}
                    <p className={`text-sm font-semibold ${isNext ? "text-[var(--green)]" : "text-[#1A1A18]"}`}>{p.name} {p.nameEn}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold tabular-nums ${isNext ? "text-[var(--green)]" : "text-[#1A1A18]"}`}>{p.time}</p>
                    {isNext && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>다음</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white mt-2 px-5 py-4">
          <p className="font-semibold text-sm text-[#1A1A18] mb-3">시설</p>
          <div className="flex flex-wrap gap-2">
            {mosque.facilities.map((f) => (
              <span key={f} className="text-xs font-medium px-3 py-2 rounded-xl bg-[var(--cream)] text-[#1A1A18]">{f}</span>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 flex gap-3">
          <button className="flex-1 py-4 rounded-2xl font-bold text-white" style={{ backgroundColor: "var(--green)" }}>
            🗺️ 길 찾기
          </button>
          <button className="flex-1 py-4 rounded-2xl font-semibold border" style={{ color: "var(--green)", borderColor: "var(--green)" }}>
            공유하기
          </button>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};

// ── 20. Prayer Times ───────────────────────────────────────────────────────────
const prayerIconMap: Record<string, string> = {
  fajr: "🌅", sunrise: "☀️", dhuhr: "🌤", asr: "🌇", maghrib: "🌆", isha: "🌃",
};

export const PrayerTimesScreen = ({ onTabChange, onNavigate }: { onTabChange?: (t: TabId) => void; onNavigate?: (s: ScreenId) => void }) => {
  const [notifState, setNotifState] = useState<Record<string, boolean>>({
    fajr: true, sunrise: false, dhuhr: false, asr: true, maghrib: true, isha: false,
  });
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrayerTimes()
      .then((data) => {
        setPrayerData(data.prayerTimes);
        setLocation(data.location);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const allPrayerTimes = (prayerData?.prayers ?? []).map((p) => {
    const [h, min] = p.time.split(":").map(Number);
    const passed = h < now.getHours() || (h === now.getHours() && min <= now.getMinutes());
    return { ...p, passed };
  });
  const nextIdx = allPrayerTimes.findIndex((p) => !p.passed && p.id !== "sunrise");
  const nextPrayer = nextIdx >= 0 ? allPrayerTimes[nextIdx] : allPrayerTimes[0];
  const today = now.getDate();

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-3">
          <h1 className="font-bold text-xl text-[#1A1A18]">기도 시간</h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">{location || "로딩중..."}{prayerData ? ` · ${prayerData.gregorianDate}` : ""}</p>
        </div>
      </div>

      <div className="flex-1 phone-scroll">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[var(--muted)]">로딩중...</p>
          </div>
        ) : (
          <>
            <div
              className="relative mx-4 mt-4 rounded-2xl p-5 overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%)" }}
            >
              <GeometricPattern color="white" opacity={0.06} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/70 text-xs">هجري · 히즈리력</p>
                    <p className="text-white font-semibold text-sm mt-0.5">{prayerData?.hijriDate ?? ""}</p>
                  </div>
                  <span className="text-3xl">🌙</span>
                </div>
                <p className="text-white/70 text-xs font-medium mb-1">다음 기도까지</p>
                <p className="text-white font-bold text-lg mb-1">{nextPrayer?.name ?? ""} {nextPrayer?.nameEn ?? ""}</p>
                <p className="text-white font-bold tabular-nums" style={{ fontSize: "36px", lineHeight: 1 }}>{nextPrayer?.time ?? "--:--"}</p>
              </div>
            </div>

            <div className="bg-white mx-4 mt-3 rounded-2xl overflow-hidden shadow-sm">
              {allPrayerTimes.map((p, i) => {
                const isNext = i === nextIdx;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${i < allPrayerTimes.length - 1 ? "border-b border-[var(--border)]" : ""}`}
                    style={{
                      backgroundColor: isNext ? "var(--green-light)" : "transparent",
                      opacity: p.passed ? 0.5 : 1,
                    }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isNext ? "var(--green)" : "var(--cream)" }}>
                      <span className="text-sm">{prayerIconMap[p.id] ?? "🕐"}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm ${isNext ? "text-[var(--green)]" : "text-[#1A1A18]"}`}>{p.name}</p>
                        {isNext && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>다음</span>}
                      </div>
                      <p className="text-xs text-[var(--muted)]">{p.nameEn}</p>
                    </div>
                    <p className={`font-bold text-base tabular-nums ${isNext ? "text-[var(--green)]" : "text-[#1A1A18]"}`}>{p.time}</p>
                    {p.id !== "sunrise" && (
                      <Toggle on={notifState[p.id] ?? false} onToggle={() => setNotifState(s => ({ ...s, [p.id]: !s[p.id] }))} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-white mx-4 mt-3 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-[#1A1A18]">{now.getMonth() + 1}월 {now.getFullYear()}</p>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--charcoal)" strokeWidth="1.8"><path d="M8 9L5 6l3-3" strokeLinecap="round"/></svg>
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--charcoal)" strokeWidth="1.8"><path d="M4 9l3-3-3-3" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["일","월","화","수","목","금","토"].map((d) => (
                  <p key={d} className="text-[10px] font-semibold text-[var(--muted)] py-1">{d}</p>
                ))}
                {[0,1,2,3,4].map((i) => <div key={i} />)}
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <button
                    key={d}
                    className="aspect-square rounded-full text-xs font-medium flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: d === today ? "var(--green)" : "transparent",
                      color: d === today ? "white" : d === 1 || d === 8 || d === 15 || d === 22 || d === 29 ? "var(--danger)" : "var(--charcoal)",
                      fontWeight: d === today ? "700" : "400",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-6" />
          </>
        )}
      </div>

      <BottomNav active="prayer" onTabChange={onTabChange} />
    </div>
  );
};

// ── 21. Qibla Compass ─────────────────────────────────────────────────────────
export const QiblaScreen = ({ onTabChange, onNavigate }: { onTabChange?: (t: TabId) => void; onNavigate?: (s: ScreenId) => void }) => {
  const qiblaAngle = 292.4;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#0F1F17" }}>
      {/* Geometric pattern accent */}
      <div className="absolute inset-0 opacity-10">
        <GeometricPattern color="white" opacity={1} />
      </div>

      <StatusBar dark />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-5 pt-2 pb-4">
        <BackButton dark onBack={() => onNavigate?.("home")} />
        <div>
          <h1 className="font-bold text-lg text-white">키블라 Qibla</h1>
          <p className="text-xs text-white/50">서울에서 메카 방향</p>
        </div>
      </div>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 gap-6 px-8">
        <div className="relative flex items-center justify-center">
          {/* Outer decorative ring */}
          <svg width="280" height="280" viewBox="-140 -140 280 280" className="absolute">
            {/* Islamic 8-point star border */}
            {Array.from({ length: 32 }, (_, i) => {
              const angle = (i * 360) / 32;
              const rad = (angle * Math.PI) / 180;
              const r1 = 128, r2 = 118;
              const x1 = Math.cos(rad) * r1, y1 = Math.sin(rad) * r1;
              const x2 = Math.cos(rad) * r2, y2 = Math.sin(rad) * r2;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C4883A" strokeWidth="1.5" opacity="0.6"/>;
            })}
            <circle r="125" stroke="#C4883A" strokeWidth="1" fill="none" opacity="0.3"/>
            <circle r="105" stroke="#1B6B4A" strokeWidth="0.5" fill="none" opacity="0.5"/>

            {/* Cardinal directions */}
            {[{label:"N",angle:0},{label:"E",angle:90},{label:"S",angle:180},{label:"W",angle:270}].map(({label,angle}) => {
              const rad = ((angle - 90) * Math.PI) / 180;
              const x = Math.cos(rad) * 90, y = Math.sin(rad) * 90;
              return <text key={label} x={x} y={y + 5} textAnchor="middle" fill={label === "N" ? "#D94F4F" : "rgba(255,255,255,0.7)"} fontSize="14" fontWeight="700" fontFamily="sans-serif">{label}</text>;
            })}

            {/* Degree marks */}
            {Array.from({ length: 36 }, (_, i) => {
              const angle = i * 10;
              const rad = ((angle - 90) * Math.PI) / 180;
              const r1 = 102, r2 = angle % 90 === 0 ? 88 : 96;
              const x1 = Math.cos(rad) * r1, y1 = Math.sin(rad) * r1;
              const x2 = Math.cos(rad) * r2, y2 = Math.sin(rad) * r2;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.3)" strokeWidth={angle % 30 === 0 ? "1.5" : "0.8"}/>;
            })}
          </svg>

          {/* Compass face */}
          <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center relative" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            {/* Kaaba icon */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--gold)", opacity: 0.9 }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="black">
                  <rect x="4" y="6" width="20" height="18" rx="1"/>
                  <line x1="4" y1="12" x2="24" y2="12" stroke="rgba(196,136,58,0.8)" strokeWidth="1.5"/>
                  <rect x="10" y="18" width="8" height="6" fill="rgba(196,136,58,0.8)"/>
                </svg>
              </div>
              <p className="text-white/60 text-[10px] font-medium">메카 Mecca</p>
            </div>

            {/* Needle */}
            <div
              className="absolute inset-0 flex items-center justify-center animate-compass"
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              <div className="absolute" style={{ top: "8px" }}>
                <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "32px solid var(--gold)" }} />
              </div>
              <div className="absolute" style={{ bottom: "8px" }}>
                <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "24px solid rgba(255,255,255,0.2)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-center space-y-2">
          <p className="text-white/50 text-xs">키블라 방향</p>
          <p className="text-white font-bold text-3xl">{qiblaAngle}°</p>
          <p className="text-white/60 text-sm">현재 방향: 147° (남동쪽)</p>
        </div>

        <div
          className="w-full rounded-2xl px-5 py-4 text-center"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-white/50 text-xs mb-1">캘리브레이션 안내</p>
          <p className="text-white/70 text-sm leading-relaxed">기기를 들고 8자 모양으로 천천히 움직여 나침반을 보정하세요</p>
        </div>
      </div>

      <BottomNav active="prayer" onTabChange={onTabChange} />
    </div>
  );
};
