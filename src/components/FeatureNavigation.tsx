import React from "react";
import { navigate } from "../services/navigation";

export const featureGroups = [
  { title: "Taom va joylar", links: [["restaurant-list", "Restoranlar"], ["search", "Qidiruv"], ["map-view", "Xarita"], ["city-selector", "Shahar"], ["saved-places", "Saqlangan joylar"], ["submit-place", "Joy taklif qilish"]] },
  { title: "Namoz va sayohat", links: [["mosque-list", "Masjidlar"], ["prayer-times", "Namoz vaqtlari"], ["qibla", "Qibla"], ["travel-planner", "Sayohat rejasi"], ["offline-prayer", "Oflayn namoz"], ["ramadan", "Ramazon"], ["eid", "Hayit"]] },
  { title: "Buyurtmalar", links: [["cart", "Savat"], ["order-history", "Buyurtma tarixi"], ["ai-meal", "Taom tavsiyalari"], ["group-order", "Guruh buyurtmasi"], ["meal-plans", "Taom rejasi"], ["grocery", "Oziq-ovqat"]] },
  { title: "Hamjamiyat", links: [["community", "Hamjamiyat"], ["reviews", "Sharhlar"], ["scanner", "Skaner"], ["scan-history", "Skan tarixi"], ["loyalty", "Ballar va kuponlar"], ["referral", "Do‘st taklif qilish"], ["share", "Ulashish"]] },
  { title: "Hisob", links: [["profile", "Profil"], ["address", "Manzillar"], ["settings", "Sozlamalar"], ["notifications", "Bildirishnomalar"], ["language", "Til"], ["tutorial", "Qo‘llanma"], ["multilingual", "Ko‘p tilli ko‘rinish"], ["onboarding", "Ilova bilan tanishish"], ["apply-courier", "Kuryer bo‘lish"], ["apply-owner", "Restoran egasi bo‘lish"]] },
];

export default function FeatureNavigation() {
  return <details className="feature-navigation relative shrink-0 border-b border-[var(--border)] bg-white">
    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[var(--green)]">☰ HalalMap · Bo‘limlar</summary>
    <nav aria-label="Barcha bo‘limlar" className="absolute inset-x-0 top-full z-50 grid max-h-[70dvh] gap-5 overflow-auto border-b border-[var(--border)] bg-white p-5 shadow-lg sm:grid-cols-2 xl:grid-cols-3">
      {featureGroups.map(group => <section key={group.title}><h2 className="mb-2 font-bold">{group.title}</h2><div className="grid gap-1">{group.links.map(([id, label]) => <a key={id} href={`#/customer/${id}`} className="rounded-lg px-3 py-2 text-sm hover:bg-[var(--green-light)]" onClick={event => { event.preventDefault(); event.currentTarget.closest("details")?.removeAttribute("open"); navigate(`/customer/${id}`); }}>{label}</a>)}</div></section>)}
      <section className="lg:hidden"><h2 className="mb-2 font-bold">Vaqtinchalik test panellari</h2><button className="block py-3" onClick={() => navigate("/courier/go-online")}>TEST · Kuryer</button><button className="block py-3" onClick={() => navigate("/owner/main-dashboard")}>TEST · Restoran egasi</button></section>
    </nav>
  </details>;
}
