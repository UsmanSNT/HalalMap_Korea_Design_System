import React, { useEffect, useRef, useState } from "react";

type Field = { name: string; label: string; value?: string; type?: string; required?: boolean };
type Notice = { title: string; message: string; fields?: Field[]; resolve?: (value: Record<string, string> | null) => void };
export function editFields(title: string, fields: Field[], message = "Ma’lumot faqat shu qurilmada saqlanadi.") {
  return new Promise<Record<string, string> | null>(resolve => window.dispatchEvent(new CustomEvent("halalmap:notice", { detail: { title, message, fields, resolve } })));
}

export function explainUnavailable(feature: string) {
  window.dispatchEvent(new CustomEvent("halalmap:notice", { detail: { title: feature, message: "Bu funksiya uchun backend yoki tashqi xizmat hali ulanmagan. Hech qanday so‘rov, to‘lov yoki o‘zgarish yuborilmadi." } }));
}

export function showNotice(title: string, message: string) {
  window.dispatchEvent(new CustomEvent("halalmap:notice", { detail: { title, message } }));
}

export default function ActionDialog() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const handle = (event: Event) => setNotice((event as CustomEvent).detail);
    window.addEventListener("halalmap:notice", handle);
    return () => window.removeEventListener("halalmap:notice", handle);
  }, []);
  useEffect(() => { if (notice && !dialog.current?.open) dialog.current?.showModal(); }, [notice]);
  return <dialog ref={dialog} className="action-dialog rounded-2xl bg-white p-6 text-[var(--charcoal)] shadow-xl" aria-labelledby="notice-title" onClose={() => { notice?.resolve?.(null); setNotice(null); }} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <h2 id="notice-title" className="text-lg font-bold">{notice?.title}</h2><p className="my-4 text-sm leading-relaxed">{notice?.message}</p>
    {notice?.fields ? <form key={notice.title} onSubmit={event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>; if (notice.fields?.some(field => field.required !== false && !values[field.name]?.trim())) return; notice.resolve?.(values); dialog.current?.close(); }} className="space-y-4">
      {notice.fields.map((field, index) => <label key={field.name} className="block text-sm font-semibold">{field.label}<input autoFocus={index === 0} name={field.name} type={field.type ?? "text"} defaultValue={field.value ?? ""} required={field.required !== false} className="mt-1 block w-full rounded-xl border border-[var(--border)] p-3" /></label>)}
      <div className="flex gap-3"><button type="submit" className="rounded-xl bg-[var(--green)] px-5 py-3 font-semibold text-white">Saqlash</button><button type="button" onClick={() => dialog.current?.close()} className="rounded-xl border px-5 py-3">Bekor qilish</button></div>
    </form> : <button autoFocus onClick={() => dialog.current?.close()} className="rounded-xl bg-[var(--green)] px-5 py-3 font-semibold text-white">Yopish</button>}
  </dialog>;
}
