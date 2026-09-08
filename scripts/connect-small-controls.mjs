import { edit, component, hook, wire } from './lib/tsx.mjs';
edit('src/screens/SearchScreens.tsx',s=>'import { locationService } from "../services/locationService";\n'+s);
component('src/screens/SearchScreens.tsx','MapViewScreen',s=>{
 s=s.replace('<button className="w-10 h-10 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center shadow-sm">','<button type="button" aria-label="Qidiruv va filtrlar" onClick={() => navigate("search")} className="w-10 h-10 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center shadow-sm">');
 return s.replace('<button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">','<button type="button" aria-label="Joriy joylashuv" onClick={async () => { try { const position = await locationService.getCurrentPosition(); showNotice("Joylashuv", `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}. Ko‘rsatilgan xarita namuna; jonli xarita xizmati ulanmagan.`); } catch (error) { showNotice("Joylashuv", error instanceof Error ? error.message : "Ruxsat berilmadi"); } }} className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">');
});
component('src/screens/SmartScreens.tsx','AIMealScreen',s=>wire(s,[['','() => { writeLocal("favorite-meal", card); showNotice("Saqlangan taom", `${card.name} shu qurilmada saqlandi.`); }']]));
component('src/screens/SmartScreens.tsx','GroupOrderScreen',s=>wire(s,[[/readyCount ===/,'() => explainUnavailable("Guruh buyurtmasini yuborish")']]));
edit('src/courier/ProfileScreens.tsx',s=>'import { useLocalState } from "../services/localState";\nimport { navigate } from "../services/navigation";\nimport { explainUnavailable } from "../components/ActionDialog";\n'+s);
component('src/courier/ProfileScreens.tsx','CourierProfile',s=>wire(s,[['프로필 수정','() => explainUnavailable("Kuryer profilini o‘zgartirish")']]));
component('src/courier/ProfileScreens.tsx','CourierSettings',s=>{
 s=hook(s,'const [volume, setVolume] = useLocalState("courier-volume", "크게");');
 s=s.replace('i === 0 ? C.green : C.cardAlt','volume === v ? C.green : C.cardAlt').replace('i === 0 ? "#0E1620" : C.muted','volume === v ? "#0E1620" : C.muted');
 return wire(s,[['{v}','() => setVolume(v)'],['로그아웃','() => navigate("/customer/home")']]).replace('>로그아웃<','>Asosiy ilovaga qaytish<').replace('로그아웃\n','Asosiy ilovaga qaytish\n');
});
component('src/courier/OnboardingScreens.tsx','CourierLoginScreen',s=>{
 s=s.replace('onClick={() => setStep("otp")}', 'onClick={() => { setStep("otp"); explainUnavailable("SMS yuborish — bu ekran sinov ko‘rinishi"); }}');
 s=s.replace('{["3", "8", "5", "", "", ""][i] || ""}', '{digit}');
 s=wire(s,[['{k}','() => setOtp(old => { const digits = old.join(""); const next = k === "⌫" ? digits.slice(0,-1) : /^\\d$/.test(k) ? (digits + k).slice(0,6) : digits; return Array.from({ length: 6 }, (_, index) => next[index] ?? ""); })']]);
 return s.replace('<span className="font-bold" style={{ color: C.green }}>등록하기</span>', '<button type="button" onClick={() => window.location.hash = "/customer/apply-courier"} className="font-bold" style={{ color: C.green }}>등록하기</button>');
});
