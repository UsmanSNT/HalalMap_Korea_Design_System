import React, { useState } from "react";
import { type Lang } from "../components/LanguageSwitcher";
import { BackButton } from "../components/Shared";
import { type PlaceType, submitPlace } from "../api/places";

const COPY = {
  ko: { title: "장소 제보", add: "새 장소", correction: "정보 수정", type: "장소 유형", restaurant: "레스토랑", mosque: "모스크", prayer_room: "기도실", name: "공식 장소명", address: "주소", details: "추가 정보 또는 수정 내용", submit: "관리자에게 보내기", sent: "제보가 관리자 검토로 전송되었습니다." },
  en: { title: "Suggest a place", add: "New place", correction: "Correct information", type: "Place type", restaurant: "Restaurant", mosque: "Mosque", prayer_room: "Prayer room", name: "Official place name", address: "Address", details: "Additional information or correction", submit: "Send to admin", sent: "Your suggestion was sent for admin review." },
  uz: { title: "Joy haqida xabar berish", add: "Yangi joy", correction: "Ma’lumotni tuzatish", type: "Joy turi", restaurant: "Oshxona", mosque: "Masjid", prayer_room: "Namozgoh", name: "Joyning rasmiy nomi", address: "Manzil", details: "Qo‘shimcha ma’lumot yoki tuzatish", submit: "Admin’ga yuborish", sent: "Taklifingiz Admin tekshiruviga yuborildi." },
  ru: { title: "Предложить место", add: "Новое место", correction: "Исправить данные", type: "Тип места", restaurant: "Ресторан", mosque: "Мечеть", prayer_room: "Молельная комната", name: "Официальное название", address: "Адрес", details: "Дополнительная информация или исправление", submit: "Отправить администратору", sent: "Предложение отправлено на проверку администратору." },
};

export default function PlaceSubmissionScreen({ lang, initialType = "mosque" }: { lang: Lang; initialType?: PlaceType }) {
  const c = COPY[lang]; const [action, setAction] = useState<"add" | "correction">("add"); const [type, setType] = useState<PlaceType>(initialType); const [name, setName] = useState(""); const [address, setAddress] = useState(""); const [details, setDetails] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const send = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setMessage(""); try { await submitPlace({ action, type, name, address, details }); setMessage(c.sent); setName(""); setAddress(""); setDetails(""); } catch (error) { setMessage(error instanceof Error ? error.message : "Error"); } finally { setBusy(false); } };
  return <div className="flex h-full flex-col bg-[var(--cream)]"><header className="flex items-center gap-3 border-b border-[var(--border)] bg-white px-5 py-4"><BackButton/><h1 className="text-lg font-bold">{c.title}</h1></header><form onSubmit={send} className="phone-scroll mx-auto w-full max-w-2xl flex-1 space-y-5 p-5">
    <div className="grid grid-cols-2 gap-2">{(["add", "correction"] as const).map(v => <button type="button" key={v} onClick={() => setAction(v)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${action === v ? "border-[var(--green)] bg-[var(--green-light)] text-[var(--green)]" : "border-[var(--border)] bg-white"}`}>{c[v]}</button>)}</div>
    <label className="block text-sm font-semibold">{c.type}<select value={type} onChange={e => setType(e.target.value as PlaceType)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white p-3 font-normal"><option value="restaurant">{c.restaurant}</option><option value="mosque">{c.mosque}</option><option value="prayer_room">{c.prayer_room}</option></select></label>
    <label className="block text-sm font-semibold">{c.name}<input required value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white p-3 font-normal" /></label>
    <label className="block text-sm font-semibold">{c.address}<input required value={address} onChange={e => setAddress(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white p-3 font-normal" /></label>
    <label className="block text-sm font-semibold">{c.details}<textarea value={details} onChange={e => setDetails(e.target.value)} className="mt-2 h-28 w-full resize-none rounded-xl border border-[var(--border)] bg-white p-3 font-normal" /></label>
    <button disabled={busy} className="w-full rounded-xl bg-[var(--green)] py-3.5 font-bold text-white disabled:opacity-60">{c.submit}</button>{message && <p className="rounded-xl bg-white p-3 text-center text-sm font-semibold text-[var(--green)]">{message}</p>}
  </form></div>;
}
