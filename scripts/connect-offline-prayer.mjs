import { edit, component } from './lib/tsx.mjs';
const file='src/screens/TravelScreens.tsx';
edit(file,s=>'import { prayerService, type PrayerTimesResponse } from "../services/prayerService";\n'+s);
component(file,'OfflinePrayerScreen',s=>{
 const start=s.indexOf('  const [downloading'), end=s.indexOf('\n  return (',start);
 s=s.slice(0,start)+`  const [downloading, setDownloading] = useState<string | null>(null);
  const [cached, setCached] = useLocalState<Record<string, PrayerTimesResponse>>("offline-prayer-days", {});
  const [selectedCity, setSelectedCity] = useState("서울 Seoul");
  const selected = cached[selectedCity];
  const downloaded = Object.keys(cached);
  // City centers: https://www.geonames.org/advanced-search.html?country=KR
  const coordinates: Record<string, [number, number]> = {
    "서울 Seoul": [37.5665,126.978], "부산 Busan": [35.10168,129.03004],
    "제주 Jeju": [33.509722,126.521944], "대구 Daegu": [35.870278,128.591111],
    "인천 Incheon": [37.45646,126.70515], "광주 Gwangju": [35.154722,126.915556],
  };
  const handleDownload = async (cityName: string) => {
    if (downloading) return;
    setDownloading(cityName);
    try {
      const data = await prayerService.getTimes(...coordinates[cityName]);
      setCached(old => ({ ...old, [cityName]: data }));
      setSelectedCity(cityName);
    } catch (error) { showNotice("Saqlash amalga oshmadi", error instanceof Error ? error.message : "Internet ulanishini tekshiring."); }
    finally { setDownloading(null); }
  };
  const rows = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map(name => ({ name, time: selected?.timings[name]?.slice(0,5) ?? "--:--" }));
`+s.slice(end);
 s=s.replace('서울 · 오늘 기도 시간','{selectedCity} · {selected?.date.readable ?? "Hali saqlanmagan"}').replace('>오프라인 저장됨</span>', '>{selected ? "Saqlangan sana uchun" : "Ma’lumot yo‘q"}</span>').replace('offlinePrayers.map','rows.map');
 s=s.replace('{isDownloaded ? `업데이트: ${city.updated} · ${city.size}` : `${city.size} · 2024년 기도 시간`}', '{cached[city.name]?.date.readable ?? "Bugungi vaqtlarni saqlash"}');
 s=s.replace('<p className="font-semibold text-sm text-[#1A1A18]">{city.name}</p>', '<button type="button" onClick={() => setSelectedCity(city.name)} className="font-semibold text-sm text-[#1A1A18]">{city.name}</button>');
 s=s.replace('<button className="text-xs text-[var(--muted)]">삭제</button>', '<button type="button" onClick={() => setCached(old => Object.fromEntries(Object.entries(old).filter(([name]) => name !== city.name)))} className="text-xs text-[var(--muted)]">삭제</button><button type="button" onClick={() => handleDownload(city.name)} className="text-xs text-[var(--green)]">Yangilash</button>');
 s=s.replaceAll('<Toggle on={true} />','<Toggle on={false} onToggle={() => showNotice("Avtomatik yangilash", "Hozircha qo‘lda yangilash ishlaydi. Faqat ko‘rsatilgan kun ma’lumotlari saqlanadi.")} />');
 return s.replace('인터넷 없이도 기도 시간 확인 가능','Saqlangan sana uchun vaqtlar. Har kuni yangilang.');
});
