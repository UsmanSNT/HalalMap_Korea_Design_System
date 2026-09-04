import React, { useState } from "react";
import { GeometricPattern, StatusBar, BackButton, Toggle } from "../components/Shared";
import type { ScreenId } from "../App";
import { LocalizedText as T } from "../i18n";

// ── 8. Travel Planner ──────────────────────────────────────────────────────────
const savedTrips = [
  { city: "부산", dates: "12월 8-10일", spots: 12, imageId: "1614854262318-831574f15f1f" },
  { city: "제주", dates: "1월 3-5일", spots: 6, imageId: "1601581975053-7655b55a96a1" },
];

const nearbySpots = [
  { type: "restaurant" as const, name: "부산역 할랄 키친", dist: "0.4km", badge: "certified" },
  { type: "mosque" as const, name: "부산 마스지드 알 파루크", dist: "1.1km", badge: null },
  { type: "restaurant" as const, name: "서면 케밥 & 피타", dist: "0.9km", badge: "certified" },
  { type: "restaurant" as const, name: "범일동 할랄 분식", dist: "1.5km", badge: "friendly" },
  { type: "mosque" as const, name: "부산 이슬람 센터 기도실", dist: "2.0km", badge: null },
];

export const TravelPlannerScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [city, setCity] = useState("부산");
  const [dates, setDates] = useState("12월 8일 – 10일");

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="relative overflow-hidden flex-shrink-0" style={{ backgroundColor: "var(--green)" }}>
        <GeometricPattern color="white" opacity={0.05} />
        <StatusBar dark />
        <div className="relative z-10 px-5 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <BackButton dark onBack={() => onNavigate?.("home")} />
            <h1 className="font-bold text-lg text-white"><T ko="여행 계획" en="Travel planner" uz="Sayohat rejasi" /></h1>
          </div>

          {/* Destination inputs */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--green)">
                <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5ZM8 7.5C7.2 7.5 6.5 6.8 6.5 6C6.5 5.2 7.2 4.5 8 4.5C8.8 4.5 9.5 5.2 9.5 6C9.5 6.8 8.8 7.5 8 7.5Z"/>
              </svg>
              <input value={city} onChange={e => setCity(e.target.value)} className="flex-1 text-sm text-[#1A1A18] outline-none bg-transparent font-semibold" placeholder="도시 입력..." />
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                <rect x="2" y="2" width="12" height="12" rx="2"/>
                <line x1="5" y1="1" x2="5" y2="3"/><line x1="11" y1="1" x2="11" y2="3"/>
                <line x1="2" y1="6" x2="14" y2="6"/>
              </svg>
              <input value={dates} onChange={e => setDates(e.target.value)} className="flex-1 text-sm text-[#1A1A18] outline-none bg-transparent" placeholder="날짜 입력..." />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Saved trips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-sm text-[#1A1A18]"><T ko="저장된 여행" en="Saved trips" uz="Saqlangan sayohatlar" /></p>
            <button className="text-xs font-medium" style={{ color: "var(--green)" }}><T ko="+ 새 여행" en="+ New trip" uz="+ Yangi sayohat" /></button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {savedTrips.map((trip, i) => (
              <div key={i} className="relative w-36 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                <img src={`https://images.unsplash.com/photo-${trip.imageId}?w=180&h=120&fit=crop&auto=format&q=80`} alt={trip.city} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-2.5">
                  <p className="text-white font-bold text-sm">{trip.city}</p>
                  <p className="text-white/70 text-[10px]">{trip.dates}</p>
                  <p className="text-white/60 text-[10px]">{trip.spots}곳 저장</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map preview for Busan */}
        <div>
          <p className="font-bold text-sm text-[#1A1A18] mb-2">부산역 주변 할랄 지도</p>
          <div className="relative h-44 rounded-2xl overflow-hidden shadow-sm bg-[#E8E4DC]">
            {/* Fake map */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 176" xmlns="http://www.w3.org/2000/svg">
              <rect width="360" height="176" fill="#E8E4DC"/>
              <rect x="0" y="70" width="360" height="12" fill="#F5F2EC"/>
              <rect x="0" y="120" width="360" height="10" fill="#F5F2EC"/>
              <rect x="80" y="0" width="12" height="176" fill="#F5F2EC"/>
              <rect x="230" y="0" width="10" height="176" fill="#F5F2EC"/>
              <rect x="10" y="15" width="60" height="50" fill="#D8D4CC" rx="3" opacity="0.7"/>
              <rect x="100" y="15" width="120" height="50" fill="#D8D4CC" rx="3" opacity="0.7"/>
              <rect x="250" y="15" width="100" height="50" fill="#D8D4CC" rx="3" opacity="0.7"/>
              <rect x="10" y="88" width="60" height="26" fill="#D8D4CC" rx="3" opacity="0.7"/>
              <rect x="100" y="88" width="120" height="26" fill="#D8D4CC" rx="3" opacity="0.7"/>
              <rect x="250" y="88" width="100" height="26" fill="#D8D4CC" rx="3" opacity="0.7"/>
              {/* Pins */}
              <circle cx="175" cy="88" r="8" fill="var(--green)" stroke="white" strokeWidth="2"/>
              <text x="175" y="92" textAnchor="middle" fontSize="8" fill="white">🍽</text>
              <circle cx="110" cy="75" r="8" fill="var(--gold)" stroke="white" strokeWidth="2"/>
              <text x="110" y="79" textAnchor="middle" fontSize="8" fill="white">🕌</text>
              <circle cx="230" cy="65" r="8" fill="var(--green)" stroke="white" strokeWidth="2"/>
              <text x="230" y="69" textAnchor="middle" fontSize="8" fill="white">🍽</text>
              <circle cx="160" cy="60" r="6" fill="var(--info)" stroke="white" strokeWidth="1.5"/>
            </svg>
            <div className="absolute bottom-3 left-3">
              <div className="bg-white rounded-xl px-3 py-2 shadow-md">
                <p className="text-xs font-bold text-[#1A1A18]">부산역 주변</p>
                <p className="text-[10px] text-[var(--muted)]">5곳 할랄 · 2곳 모스크</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby spots */}
        <div>
          <p className="font-bold text-sm text-[#1A1A18] mb-2">부산역 근처 추천 ({nearbySpots.length}곳)</p>
          <div className="space-y-2">
            {nearbySpots.map((spot, i) => (
              <div key={i} className="bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: spot.type === "restaurant" ? "var(--green-light)" : "var(--gold-light)" }}>
                  <span className="text-lg">{spot.type === "restaurant" ? "🍽️" : "🕌"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1A1A18] truncate">{spot.name}</p>
                  <p className="text-xs text-[var(--muted)]">{spot.dist}</p>
                </div>
                <div className="flex items-center gap-2">
                  {spot.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}>
                      {spot.badge === "certified" ? "인증" : "프렌들리"}
                    </span>
                  )}
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--cream)" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--muted)" strokeWidth="1.6">
                      <path d="M7 1.5C4.8 1.5 3 3.3 3 5.5C3 8.5 7 12.5 7 12.5C7 12.5 11 8.5 11 5.5C11 3.3 9.2 1.5 7 1.5ZM7 6.5C6.4 6.5 5.9 6 5.9 5.4C5.9 4.8 6.4 4.3 7 4.3C7.6 4.3 8.1 4.8 8.1 5.4C8.1 6 7.6 6.5 7 6.5Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-4 rounded-2xl font-bold text-white text-sm" style={{ backgroundColor: "var(--green)" }}>
            <T ko="여행 저장" en="Save trip" uz="Sayohatni saqlash" />
          </button>
          <button className="flex-1 py-4 rounded-2xl font-semibold text-sm border" style={{ color: "var(--green)", borderColor: "var(--green)" }}>
            <T ko="공유하기" en="Share" uz="Ulashish" />
          </button>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};

// ── 9. Offline Prayer Times ────────────────────────────────────────────────────
const cities = [
  { name: "서울 Seoul", downloaded: true, size: "42KB", updated: "2024.11" },
  { name: "부산 Busan", downloaded: true, size: "41KB", updated: "2024.11" },
  { name: "제주 Jeju", downloaded: false, size: "38KB", updated: null },
  { name: "대구 Daegu", downloaded: false, size: "40KB", updated: null },
  { name: "인천 Incheon", downloaded: false, size: "39KB", updated: null },
  { name: "광주 Gwangju", downloaded: false, size: "37KB", updated: null },
];

const offlinePrayers = [
  { name: "파즈르 Fajr", time: "04:51" },
  { name: "두흐르 Dhuhr", time: "12:16" },
  { name: "아스르 Asr", time: "14:33" },
  { name: "마그립 Maghrib", time: "17:49" },
  { name: "이샤 Isha", time: "19:22" },
];

export const OfflinePrayerScreen = ({ onNavigate }: { onNavigate?: (s: ScreenId) => void }) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string[]>(["서울 Seoul", "부산 Busan"]);

  const handleDownload = (cityName: string) => {
    setDownloading(cityName);
    setTimeout(() => {
      setDownloading(null);
      setDownloaded(d => [...d, cityName]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <div className="flex-1">
            <h1 className="font-bold text-lg"><T ko="오프라인 기도 시간" en="Offline prayer times" uz="Oflayn namoz vaqtlari" /></h1>
            <p className="text-xs text-[var(--muted)]"><T ko="인터넷 없이 사용 가능" en="Available without internet" uz="Internetsiz ishlaydi" /></p>
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Status card */}
        <div className="relative rounded-2xl p-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F1F17 0%, #1B3B28 100%)" }}>
          <GeometricPattern color="white" opacity={0.05} />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              📡
            </div>
            <div className="flex-1">
              <p className="text-white font-bold"><T ko="오프라인 모드" en="Offline mode" uz="Oflayn rejim" /></p>
              <p className="text-white/60 text-xs mt-0.5"><T ko="인터넷 없이도 기도 시간 확인 가능" en="Check prayer times without internet" uz="Namoz vaqtlarini internetsiz tekshiring" /></p>
            </div>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--green)" }} />
          </div>
        </div>

        {/* Quick preview — current city */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm text-[#1A1A18]">서울 · 오늘 기도 시간</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}>오프라인 저장됨</span>
          </div>
          <div className="space-y-2">
            {offlinePrayers.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-1.5" style={{ opacity: i < 3 ? 0.5 : 1 }}>
                <p className="text-sm font-medium text-[#1A1A18]">{p.name}</p>
                <p className={`font-bold tabular-nums ${i === 2 ? "text-[var(--green)]" : "text-[#1A1A18]"} text-sm`}>{p.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download cities */}
        <div>
          <p className="font-bold text-sm text-[#1A1A18] mb-2"><T ko="도시별 다운로드" en="Downloads by city" uz="Shaharlar bo'yicha yuklash" /></p>
          <div className="space-y-2">
            {cities.map((city) => {
              const isDownloaded = downloaded.includes(city.name);
              const isDownloading = downloading === city.name;
              return (
                <div key={city.name} className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: isDownloaded ? "var(--green-light)" : "var(--cream)" }}>
                    {isDownloaded ? "✓" : "🏙️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#1A1A18]">{city.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {isDownloaded ? `업데이트: ${city.updated} · ${city.size}` : `${city.size} · 2024년 기도 시간`}
                    </p>
                  </div>
                  {isDownloading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--green)] border-t-transparent animate-spin" />
                      <span className="text-xs text-[var(--muted)]">받는 중...</span>
                    </div>
                  ) : isDownloaded ? (
                    <div className="flex items-center gap-1.5">
                      <button className="text-xs text-[var(--muted)]">삭제</button>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--green)" }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4l2.5 2.5L9 1"/></svg>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(city.name)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "var(--green)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M7 2v7M4 6l3 3 3-3"/>
                        <line x1="2" y1="12" x2="12" y2="12" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold text-sm text-[#1A1A18]"><T ko="자동 업데이트" en="Automatic updates" uz="Avtomatik yangilash" /></p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">Wi-Fi 연결 시 자동 업데이트</p>
            <Toggle on={true} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">앱 시작 시 동기화</p>
            <Toggle on={true} />
          </div>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};
