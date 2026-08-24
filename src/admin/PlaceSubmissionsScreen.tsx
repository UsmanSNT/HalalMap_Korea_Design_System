import React, { useEffect, useState } from "react";
import { getPlaceSubmissions, reviewPlaceSubmission, type PlaceSubmission } from "../api/places";
import { A, Btn, Card, PageHeader } from "./AdminShared";

export default function PlaceSubmissionsScreen() {
  const [items, setItems] = useState<PlaceSubmission[]>([]); const [error, setError] = useState("");
  const load = () => getPlaceSubmissions().then(r => setItems(r.submissions)).catch(e => setError(e.message));
  useEffect(() => { void load(); }, []);
  const review = async (id: number, status: "approved" | "rejected") => { await reviewPlaceSubmission(id, status); load(); };
  const typeLabel = { restaurant: "Oshxona", mosque: "Masjid", prayer_room: "Namozgoh" };
  return <div><PageHeader breadcrumb={["HalalMap Admin", "Kontent", "Joy takliflari"]} title="Foydalanuvchi joy takliflari" subtitle={`${items.filter(i => i.status === "pending").length} ta tasdiq kutilmoqda`} />
    {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Card><div className="divide-y" style={{ borderColor: A.borderLight }}>{items.length === 0 && <p className="p-6 text-sm" style={{ color: A.muted }}>Takliflar yo‘q</p>}{items.map(item => <div key={item.id} className="flex items-start justify-between gap-4 p-5"><div><div className="flex items-center gap-2"><strong style={{ color: A.text }}>{item.name}</strong><span className="rounded-full px-2 py-1 text-xs" style={{ background: A.greenLight, color: A.green }}>{typeLabel[item.type]}</span><span className="text-xs" style={{ color: A.muted }}>{item.action === "add" ? "Yangi joy" : "Tuzatish"}</span></div><p className="mt-1 text-sm" style={{ color: A.muted }}>{item.address}</p>{item.details && <p className="mt-1 text-sm" style={{ color: A.textMid }}>{item.details}</p>}<p className="mt-2 text-xs" style={{ color: A.dim }}>{item.reporter_email} · {item.created_at}</p></div><div className="flex gap-2">{item.status === "pending" ? <><Btn variant="primary" onClick={() => review(item.id, "approved")}>Tasdiqlash</Btn><Btn variant="danger" onClick={() => review(item.id, "rejected")}>Rad etish</Btn></> : <span className="text-xs font-semibold">{item.status}</span>}</div></div>)}</div></Card>
  </div>;
}
