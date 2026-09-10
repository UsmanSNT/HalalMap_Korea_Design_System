import React, { useState } from "react";
import { useLocal } from "../services/customerState";
import { useLanguage } from "../i18n/LanguageContext";
import { tx } from "../i18n/content";

export const initialAddresses = [
  { id: "home", label: "Home", address: "서울특별시 용산구 이태원로 123, 501호", primary: true },
  { id: "work", label: "Work", address: "서울특별시 강남구 테헤란로 456, 12층", primary: false },
];
export function AddressBook() {
  const { t } = useLanguage();
  const [addresses, setAddresses] = useLocal("addresses", initialAddresses);
  const [editing, setEditing] = useState<(typeof initialAddresses)[number] | null>(null);
  return <div className="space-y-3">
    <p className="text-xs text-[var(--muted)]">{t("flow.local_only")}</p>
    {addresses.map(a => <article key={a.id} className="bg-white rounded-2xl p-4 space-y-2">
      <h2 className="font-bold">{a.id === "home" ? t("home.address_home") : a.id === "work" ? t("flow.work") : a.label} {a.primary && "✓"}</h2>
      <p className="text-sm">{tx(a.address)}</p>
      <div className="flex flex-wrap gap-4 text-sm text-[var(--green)]">
        <button onClick={() => setEditing(a)}>{t("flow.edit")}</button>
        <button onClick={() => setAddresses(old => old.filter(x => x.id !== a.id).map((x,i) => ({...x, primary: a.primary ? i === 0 : x.primary})))}>{t("flow.remove")}</button>
        {!a.primary && <button onClick={() => setAddresses(old => old.map(x => ({...x, primary: x.id === a.id})))}>{t("profile.set_as_default")}</button>}
      </div>
    </article>)}
    {!addresses.length && <p>{t("flow.empty")}</p>}
    <button className="w-full border border-dashed rounded-xl py-3" onClick={() => setEditing({id: crypto.randomUUID(),label:"",address:"",primary:!addresses.length})}>{t("profile.add_address")}</button>
    {editing && <form className="rounded-2xl p-4 bg-white space-y-3" onSubmit={e => {
      e.preventDefault(); if(!editing.label.trim() || !editing.address.trim()) return;
      setAddresses(old => old.some(a => a.id === editing.id) ? old.map(a => a.id === editing.id ? editing : a) : [...old,editing]);setEditing(null);
    }}>
      <label className="block text-sm">{t("flow.address_label")}<input autoFocus required value={editing.label} onChange={e => setEditing({...editing,label:e.target.value})} className="w-full border rounded-xl p-3" /></label>
      <label className="block text-sm">{t("flow.address_value")}<textarea required value={editing.address} onChange={e => setEditing({...editing,address:e.target.value})} className="w-full border rounded-xl p-3" /></label>
      <div className="flex gap-3"><button className="bg-[var(--green)] text-white px-4 py-2 rounded-lg" type="submit">{t("common.save")}</button><button type="button" onClick={() => setEditing(null)}>{t("common.cancel")}</button></div>
    </form>}
  </div>;
}

export function ProfileEditor() {
  const { t } = useLanguage();
  const [name, setName] = useLocal("profile-name", "Test User");
  const [draft, setDraft] = useState(name);
  const [saved, setSaved] = useState(false);
  return <form className="p-5 space-y-3 bg-white" onSubmit={e => {e.preventDefault(); if(draft.trim()) {setName(draft.trim());setSaved(true);} }}>
    <label className="block text-sm font-semibold">{t("flow.name")}<input required value={draft} onChange={e => {setDraft(e.target.value);setSaved(false);}} className="block mt-2 w-full border rounded-xl p-3" /></label>
    <p className="text-xs">{t("flow.local_only")}</p>
    <button type="submit" className="bg-[var(--green)] text-white rounded-xl px-4 py-2">{t("common.save")}</button>
    {saved && <p role="status">{t("flow.saved")}</p>}
  </form>;
}
