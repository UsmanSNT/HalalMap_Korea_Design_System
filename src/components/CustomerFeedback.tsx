import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export function showUnavailable() {
  window.dispatchEvent(new CustomEvent("customer-feedback", { detail: "flow.backend_required" }));
}
export function showFeedback(key: string) {
  window.dispatchEvent(new CustomEvent("customer-feedback", { detail: key }));
}
export default function CustomerFeedback() {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const receive = (e: Event) => { setMessage((e as CustomEvent<string>).detail); dialog.current?.showModal(); };
    window.addEventListener("customer-feedback", receive);
    return () => window.removeEventListener("customer-feedback", receive);
  }, []);
  return <dialog ref={dialog} className="m-auto w-[calc(100%-32px)] max-w-sm rounded-2xl p-5 backdrop:bg-black/40" aria-labelledby="feedback-title">
    <h2 id="feedback-title" className="font-bold text-lg">{t("flow.demo")}</h2>
    <p className="my-4 text-sm">{t(message)}</p>
    <form method="dialog"><button className="w-full rounded-xl bg-[var(--green)] py-3 text-white">{t("common.confirm")}</button></form>
  </dialog>;
}
