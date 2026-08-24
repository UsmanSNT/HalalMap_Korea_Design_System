import React, { useEffect, useMemo, useState } from "react";
import { GeometricPattern, StatusBar, BottomNav, BackButton, Toggle, TabId } from "../components/Shared";

// ── 18. Mosque List ────────────────────────────────────────────────────────────
const mosques = [
  { name: "서울중앙성원", nameEn: "Seoul Central Mosque", address: "이태원로 34길 39, 용산구", distance: "1.2km", walk: "도보 15분", nextPrayer: "아스르 14:32", type: "mosque" as const },
  { name: "이태원 마스지드", nameEn: "Itaewon Masjid", address: "우사단로 10길 12, 이태원", distance: "0.3km", walk: "도보 4분", nextPrayer: "아스르 14:35", type: "mosque" as const },
  { name: "코엑스 기도실", nameEn: "COEX Prayer Room", address: "봉은사로 524, 강남구", distance: "3.8km", walk: "차량 15분", nextPrayer: "아스르 14:32", type: "room" as const },
  { name: "수원 이슬람 성원", nameEn: "Suwon Masjid", address: "매탄동 1316, 수원", distance: "28km", walk: "차량 40분", nextPrayer: "아스르 14:30", type: "mosque" as const },
];

export const MosqueListScreen = ({ onTabChange, onNavigate }: { onTabChange?: (t: TabId) => void; onNavigate?: (screen: string) => void }) => {
  const [tab, setTab] = useState<"mosque" | "room">("mosque");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-xl text-[#1A1A18]">모스크 · 기도실</h1>
            <button onClick={() => onNavigate?.("submit-place")} title="Joy qo‘shish" className="w-9 h-9 rounded-xl bg-[var(--green-light)] text-[var(--green)] flex items-center justify-center font-bold text-xl">+</button>
          </div>
          <div className="flex bg-[var(--cream)] rounded-xl p-1">
            {(["mosque", "room"] as const).map((t) => (
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

      <div className="flex-1 phone-scroll px-4 py-4 space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:content-start lg:gap-4 lg:space-y-0 lg:px-5 lg:py-5">
        {mosques
          .filter((m) => tab === "mosque" ? m.type === "mosque" : m.type === "room")
          .map((m) => (
            <article key={m.name} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition-shadow hover:shadow-md">
              {/* Photo strip */}
              <div className="relative h-28 bg-[#D8D4CC] lg:h-32">
                <img
                  src="https://images.unsplash.com/photo-1519817650134-7780eb40b2fb?w=390&h=130&fit=crop&auto=format&q=80"
                  alt={m.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: m.type === "mosque" ? "var(--gold)" : "var(--info)" }}>
                    {m.type === "mosque" ? "모스크" : "기도실"}
                  </span>
                </div>
              </div>
              <div className="p-4 lg:p-3.5">
                <h3 className="font-bold text-base text-[#1A1A18] lg:text-sm">{m.name}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">{m.nameEn}</p>
                <p className="mt-1 truncate text-xs text-[var(--muted)]">📍 {m.address}</p>
                <div className="mt-3 flex items-center justify-between gap-2 lg:mt-2.5">
                  <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--muted)]">
                    <span>{m.distance}</span>
                    <span>·</span>
                    <span className="truncate">{m.walk}</span>
                  </div>
                  <div
                    className="flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}
                  >
                    {m.nextPrayer}
                  </div>
                </div>
              </div>
            </article>
          ))}
      </div>

      <BottomNav active="prayer" onTabChange={onTabChange} />
    </div>
  );
};

// ── 19. Mosque Detail ──────────────────────────────────────────────────────────
const prayerTimes = [
  { name: "파즈르 Fajr", time: "04:47", passed: true },
  { name: "두흐르 Dhuhr", time: "12:15", passed: true },
  { name: "아스르 Asr", time: "14:32", passed: false, next: true },
  { name: "마그립 Maghrib", time: "17:48", passed: false },
  { name: "이샤 Isha", time: "19:21", passed: false },
];

export const MosqueDetailScreen = () => (
  <div className="flex flex-col h-full bg-[var(--cream)]">
    {/* Hero */}
    <div className="relative flex-shrink-0">
      <div className="h-52 bg-[#D8D4CC] relative">
        <img
          src="https://images.unsplash.com/photo-1519817650134-7780eb40b2fb?w=390&h=210&fit=crop&auto=format&q=80"
          alt="서울중앙성원"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
      </div>
      <div className="absolute top-0 left-0 right-0">
        <StatusBar dark />
      </div>
      <div className="absolute top-12 left-4 flex gap-2">
        <BackButton dark />
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
      {/* Title card */}
      <div className="bg-white px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h1 className="font-bold text-xl text-[#1A1A18]">서울중앙성원</h1>
            <p className="text-sm text-[var(--muted)]">Seoul Central Mosque · 이슬람 서울 센터</p>
          </div>
          <span className="text-2xl">🕌</span>
        </div>
        <p className="text-sm text-[var(--muted)] mt-2">📍 서울특별시 용산구 우사단로10길 39</p>
        <p className="text-xs text-[var(--muted)] mt-0.5">☎ 02-793-6908 · www.islamkorea.com</p>

        {/* Juma */}
        <div
          className="mt-3 flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: "var(--gold-light)" }}
        >
          <span className="text-xl">🌟</span>
          <div>
            <p className="font-bold text-sm" style={{ color: "#7A5220" }}>주마 예배</p>
            <p className="text-xs" style={{ color: "#9A6830" }}>매주 금요일 12:30 PM · Juma Prayer</p>
          </div>
        </div>
      </div>

      {/* Prayer times */}
      <div className="bg-white mt-2 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm text-[#1A1A18]">오늘의 기도 시간</p>
          <p className="text-xs text-[var(--muted)]">1446년 주마다 알아왈 22일</p>
        </div>
        <div className="space-y-1">
          {prayerTimes.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between px-3 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: p.next ? "var(--green-light)" : "transparent",
                opacity: p.passed ? 0.45 : 1,
              }}
            >
              <div className="flex items-center gap-2.5">
                {p.next ? (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--green)" }} />
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.passed ? "var(--border)" : "var(--muted)" }} />
                )}
                <p className={`text-sm font-semibold ${p.next ? "text-[var(--green)]" : "text-[#1A1A18]"}`}>{p.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold tabular-nums ${p.next ? "text-[var(--green)]" : "text-[#1A1A18]"}`}>{p.time}</p>
                {p.next && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>다음</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities */}
      <div className="bg-white mt-2 px-5 py-4">
        <p className="font-semibold text-sm text-[#1A1A18] mb-3">시설</p>
        <div className="flex flex-wrap gap-2">
          {["🚿 우두 시설", "🚺 여성 기도실", "🅿️ 주차 가능", "🌍 영어 가능", "📚 이슬람 자료실"].map((f) => (
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

// ── 20. Prayer Times ───────────────────────────────────────────────────────────
const prayerDefinitions = [
  { id: "fajr", key: "Fajr", name: "파즈르", nameEn: "Fajr" }, { id: "sunrise", key: "Sunrise", name: "일출", nameEn: "Sunrise" }, { id: "dhuhr", key: "Dhuhr", name: "두흐르", nameEn: "Dhuhr" }, { id: "asr", key: "Asr", name: "아스르", nameEn: "Asr" }, { id: "maghrib", key: "Maghrib", name: "마그립", nameEn: "Maghrib" }, { id: "isha", key: "Isha", name: "이샤", nameEn: "Isha" },
] as const;
type PrayerResponse = { source: string; calculationMethod: string; timings: Record<string, string>; date: { readable: string; gregorian: { date: string }; hijri: { day: string; month: { en: string }; year: string } } };

const calDays = [25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

export const PrayerTimesScreen = ({ onTabChange }: { onTabChange?: (t: TabId) => void }) => {
  const [notifState, setNotifState] = useState<Record<string, boolean>>({
    fajr: true, sunrise: false, dhuhr: false, asr: true, maghrib: true, isha: false,
  });
  const [data, setData] = useState<PrayerResponse | null>(null);
  const [location, setLocation] = useState("Seoul, Korea");
  const [error, setError] = useState("");
  const [clock, setClock] = useState(() => new Date());
  const loadTimes = async (latitude = 37.5665, longitude = 126.9780, label = "Seoul, Korea") => { try { setError(""); const response = await fetch(`/api/prayer-times?latitude=${latitude}&longitude=${longitude}`); const body = await response.json(); if (!response.ok) throw new Error(body.error); setData(body); setLocation(label); } catch (reason) { setError(reason instanceof Error ? reason.message : "Namoz vaqtlarini olib bo‘lmadi"); } };
  useEffect(() => { void loadTimes(); const timer = window.setInterval(() => setClock(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  const useCurrentLocation = () => navigator.geolocation?.getCurrentPosition((position) => void loadTimes(position.coords.latitude, position.coords.longitude, "Current location, Korea"), () => setError("Joylashuv ruxsati berilmadi"));
  const nowMinutes = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(clock).split(":")[0]) * 60 + Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(clock).split(":")[1]);
  const allPrayerTimes = useMemo(() => prayerDefinitions.map((p) => { const time = data?.timings[p.key]?.slice(0, 5) ?? "--:--"; const [hour, minute] = time.split(":").map(Number); return { ...p, time, minutes: hour * 60 + minute }; }).map((p, index, rows) => ({ ...p, passed: Number.isFinite(p.minutes) && p.minutes < nowMinutes, next: index === rows.findIndex(row => row.minutes >= nowMinutes) })), [data, nowMinutes]);
  const nextPrayer = allPrayerTimes.find((p) => p.next) ?? allPrayerTimes[0];
  const remainingSeconds = nextPrayer.time === "--:--" ? 0 : Math.max(0, ((nextPrayer.minutes < nowMinutes ? nextPrayer.minutes + 1440 : nextPrayer.minutes) * 60) - (nowMinutes * 60 + clock.getSeconds()));
  const remaining = `${String(Math.floor(remainingSeconds / 3600)).padStart(2,"0")}:${String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2,"0")}:${String(remainingSeconds % 60).padStart(2,"0")}`;
  const koreaDate = new Date(clock.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const calendarYear = koreaDate.getFullYear(), calendarMonth = koreaDate.getMonth(), calendarToday = koreaDate.getDate();
  const calendarOffset = new Date(calendarYear, calendarMonth, 1).getDay(), calendarDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-3">
          <h1 className="font-bold text-xl text-[#1A1A18]">기도 시간</h1>
          <div className="mt-0.5 flex items-center gap-2"><p className="text-xs text-[var(--muted)]">{location} · {data?.date.readable ?? "Loading…"}</p><button onClick={useCurrentLocation} className="rounded-lg bg-[var(--green-light)] px-2 py-1 text-[10px] font-bold text-[var(--green)]">현재 위치</button></div>
          {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
        </div>
      </div>

      <div className="flex-1 phone-scroll">
        <div className="lg:mx-auto lg:grid lg:max-w-[1040px] lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-start lg:gap-5 lg:p-5">
          <div className="min-w-0">
        {/* Hijri date + countdown */}
        <div
          className="relative mx-4 mt-4 overflow-hidden rounded-2xl p-5 lg:mx-0 lg:mt-0 lg:p-6"
          style={{ background: "linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%)" }}
        >
          <GeometricPattern color="white" opacity={0.06} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-xs">هجري · 히즈리력</p>
                <p className="text-white font-semibold text-sm mt-0.5">{data ? `${data.date.hijri.year} ${data.date.hijri.month.en} ${data.date.hijri.day}` : "Loading…"}</p>
              </div>
              <span className="text-3xl">🌙</span>
            </div>
            <p className="text-white/70 text-xs font-medium mb-1">다음 기도까지</p>
            <p className="text-white font-bold text-lg mb-1">{nextPrayer.name} {nextPrayer.nameEn}</p>
            <p className="text-white font-bold tabular-nums" style={{ fontSize: "36px", lineHeight: 1 }}>{remaining}</p>
            <p className="mt-2 text-[10px] text-white/60">{data?.source ?? ""} · {data?.calculationMethod ?? ""}</p>
          </div>
        </div>

        {/* Prayer list */}
        <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow-sm lg:mx-0">
          {allPrayerTimes.map((p, i) => (
            <div
              key={p.id}
              className={`grid grid-cols-[32px_minmax(0,1fr)_64px_48px] items-center gap-3 px-4 py-3.5 lg:px-5 ${i < allPrayerTimes.length - 1 ? "border-b border-[var(--border)]" : ""}`}
              style={{
                backgroundColor: p.next ? "var(--green-light)" : "transparent",
                opacity: p.passed ? 0.5 : 1,
              }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: p.next ? "var(--green)" : "var(--cream)" }}>
                <span className="text-sm">{
                  p.id === "fajr" ? "🌅" : p.id === "sunrise" ? "☀️" : p.id === "dhuhr" ? "🌤" : p.id === "asr" ? "🌇" : p.id === "maghrib" ? "🌆" : "🌃"
                }</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-sm ${p.next ? "text-[var(--green)]" : "text-[#1A1A18]"}`}>{p.name}</p>
                  {p.next && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--green)" }}>다음</span>}
                </div>
                <p className="text-xs text-[var(--muted)]">{p.nameEn}</p>
              </div>
              <p className={`font-bold text-base tabular-nums ${p.next ? "text-[var(--green)]" : "text-[#1A1A18]"}`}>{p.time}</p>
              {p.id !== "sunrise" && (
                <Toggle on={notifState[p.id]} onToggle={() => setNotifState(s => ({ ...s, [p.id]: !s[p.id] }))} />
              )}
              {p.id === "sunrise" && <span className="h-6 w-12" aria-hidden="true" />}
            </div>
          ))}
        </div>
          </div>

        {/* Mini calendar */}
        <div className="mx-4 mt-3 rounded-2xl bg-white p-4 shadow-sm lg:mx-0 lg:mt-0 lg:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm text-[#1A1A18]">{calendarYear}.{String(calendarMonth + 1).padStart(2, "0")}</p>
            <div className="flex gap-1">
              <button className="w-7 h-7 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--charcoal)" strokeWidth="1.8"><path d="M8 9L5 6l3-3" strokeLinecap="round"/></svg>
              </button>
              <button className="w-7 h-7 rounded-lg bg-[var(--cream)] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--charcoal)" strokeWidth="1.8"><path d="M4 9l3-3-3-3" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center lg:gap-1.5">
            {["일","월","화","수","목","금","토"].map((d) => (
              <p key={d} className="text-[10px] font-semibold text-[var(--muted)] py-1">{d}</p>
            ))}
            {/* Offset */}
            {Array.from({ length: calendarOffset }, (_, i) => <div key={i} />)}
            {Array.from({ length: calendarDays }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                className="aspect-square rounded-full text-xs font-medium flex items-center justify-center transition-all"
                style={{
                  backgroundColor: d === calendarToday ? "var(--green)" : "transparent",
                  color: d === calendarToday ? "white" : new Date(calendarYear, calendarMonth, d).getDay() === 0 ? "var(--danger)" : "var(--charcoal)",
                  fontWeight: d === calendarToday ? "700" : "400",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        </div>

        <div className="h-6 lg:hidden" />
      </div>

      <BottomNav active="prayer" onTabChange={onTabChange} />
    </div>
  );
};

// ── 21. Qibla Compass ─────────────────────────────────────────────────────────
export const QiblaScreen = ({ onTabChange }: { onTabChange?: (t: TabId) => void }) => {
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
        <BackButton dark />
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
