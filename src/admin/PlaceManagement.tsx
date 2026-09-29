import React, { useEffect, useMemo, useState } from "react";
import { createAdminPlace, deactivateAdminPlace, getAdminPlaces, updateAdminPlace, type Place, type PlaceType } from "@/api/places";
import { A, Btn, Card, FilterChips, Modal, PageHeader, SearchBar, StatusChip, Toast } from "./AdminShared";

const typeLabels: Record<PlaceType, string> = {
  mosque: "모스크",
  prayer_room: "기도실",
  restaurant: "레스토랑",
  halal_market: "할랄 마켓",
};

const statusLabels: Record<Place["halalStatus"], string> = {
  halal_certified: "할랄 인증",
  self_certified: "자체 인증",
  muslim_friendly: "무슬림 프렌들리",
  pork_free: "돼지고기 없음",
  unknown: "확인 필요",
};

const emptyForm = (type: PlaceType) => ({
  name: "",
  nameKo: "",
  nameEn: "",
  type,
  address: "",
  latitude: "",
  longitude: "",
  phone: "",
  website: "",
  halalStatus: "unknown" as Place["halalStatus"],
  certification: "",
});

export default function PlaceManagement({ initialType }: { initialType: "restaurant" | "mosque" }) {
  const allowedTypes: PlaceType[] = initialType === "restaurant" ? ["restaurant", "halal_market"] : ["mosque", "prayer_room"];
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [editing, setEditing] = useState<Place | null>(null);
  const [form, setForm] = useState(emptyForm(allowedTypes[0]));
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const load = () => getAdminPlaces().then(setPlaces).catch((error) => setToast({ msg: error.message, type: "error" }));
  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => places.filter((place) => {
    if (!allowedTypes.includes(place.type)) return false;
    if (filter !== "전체" && typeLabels[place.type] !== filter) return false;
    const query = search.trim().toLowerCase();
    return !query || [place.name, place.nameKo, place.nameEn, place.address].some((value) => value?.toLowerCase().includes(query));
  }), [places, search, filter, initialType]);

  const beginCreate = () => {
    setEditing(null);
    setForm(emptyForm(allowedTypes[0]));
    setOpen(true);
  };

  const beginEdit = (place: Place) => {
    setEditing(place);
    setForm({
      name: place.name,
      nameKo: place.nameKo ?? "",
      nameEn: place.nameEn ?? "",
      type: place.type,
      address: place.address ?? "",
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      phone: place.phone ?? "",
      website: place.website ?? "",
      halalStatus: place.halalStatus,
      certification: place.certification ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) };
      if (editing) await updateAdminPlace(editing.id, payload);
      else await createAdminPlace(payload);
      setOpen(false);
      await load();
      setToast({ msg: editing ? "장소가 수정되었습니다" : "장소가 추가되었습니다", type: "success" });
    } catch (error) {
      setToast({ msg: error instanceof Error ? error.message : "저장할 수 없습니다", type: "error" });
    }
  };

  const deactivate = async (place: Place) => {
    if (!window.confirm(`${place.nameKo || place.name} 비활성화?`)) return;
    await deactivateAdminPlace(place.id);
    await load();
  };

  const verify = async (place: Place) => {
    await updateAdminPlace(place.id, { verificationStatus: "verified", lastVerifiedAt: new Date().toISOString() });
    await load();
    setToast({ msg: "검증 상태가 업데이트되었습니다", type: "success" });
  };

  const filterOptions = ["전체", ...allowedTypes.map((type) => typeLabels[type])];
  return (
    <div>
      <PageHeader
        breadcrumb={["HalalMap Admin", "콘텐츠 & 데이터", initialType === "restaurant" ? "레스토랑" : "모스크 · 기도실"]}
        title={initialType === "restaurant" ? "레스토랑 · 할랄 마켓 관리" : "모스크 · 기도실 관리"}
        subtitle={`${filtered.length.toLocaleString()}개 표시 중`}
        actions={<Btn variant="primary" size="md" onClick={beginCreate}>+ 위치 추가</Btn>}
      />
      <Card>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5" style={{ borderBottom: `1px solid ${A.border}` }}>
          <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
          <SearchBar value={search} onChange={setSearch} placeholder="이름 또는 주소 검색..." width={280} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: A.bg, borderBottom: `1px solid ${A.border}` }}>
              {["장소명", "유형", "할랄 상태", "출처", "검증", "업데이트", ""].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-medium" style={{ color: A.muted }}>{label}</th>)}
            </tr></thead>
            <tbody>{filtered.map((place) => (
              <tr key={place.id} style={{ borderBottom: `1px solid ${A.borderLight}` }}>
                <td className="px-4 py-3"><p className="font-medium" style={{ color: A.text }}>{place.nameKo || place.name}</p><p className="text-xs mt-1 max-w-xs truncate" style={{ color: A.muted }}>{place.address || `${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}`}</p></td>
                <td className="px-4 py-3">{typeLabels[place.type]}</td>
                <td className="px-4 py-3">{statusLabels[place.halalStatus]}</td>
                <td className="px-4 py-3"><a href={place.sourceUrl} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: A.infoText }}>{place.source} · {place.sourceLicense}</a></td>
                <td className="px-4 py-3"><StatusChip status={place.verificationStatus === "verified" ? "verified" : "pending"} label={place.verificationStatus === "verified" ? "검증됨" : "검토 필요"} /></td>
                <td className="px-4 py-3 text-xs" style={{ color: A.muted }}>{(place.lastVerifiedAt || place.updatedAt).slice(0, 10)}</td>
                <td className="px-4 py-3"><div className="flex gap-1"><Btn variant="ghost" onClick={() => beginEdit(place)}>수정</Btn>{place.verificationStatus !== "verified" && <Btn variant="secondary" onClick={() => verify(place)}>검증</Btn>}<Btn variant="danger" onClick={() => deactivate(place)}>비활성</Btn></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "위치 수정" : "위치 추가"} width={640}>
        <div className="grid grid-cols-2 gap-4 px-6 py-5">
          {[{ key: "name", label: "기본 이름" }, { key: "nameKo", label: "한국어 이름" }, { key: "nameEn", label: "영문 이름" }, { key: "address", label: "주소" }, { key: "latitude", label: "위도" }, { key: "longitude", label: "경도" }, { key: "phone", label: "전화" }, { key: "website", label: "웹사이트" }, { key: "certification", label: "인증 기관" }].map(({ key, label }) => (
            <label key={key} className={key === "address" ? "col-span-2" : ""}><span className="block text-xs font-medium mb-1.5" style={{ color: A.muted }}>{label}</span><input value={(form as any)[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none" style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.text }} /></label>
          ))}
          <label><span className="block text-xs font-medium mb-1.5" style={{ color: A.muted }}>유형</span><select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as PlaceType }))} className="w-full px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${A.border}` }}>{allowedTypes.map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}</select></label>
          <label><span className="block text-xs font-medium mb-1.5" style={{ color: A.muted }}>할랄 상태</span><select value={form.halalStatus} onChange={(event) => setForm((current) => ({ ...current, halalStatus: event.target.value as Place["halalStatus"] }))} className="w-full px-3 py-2.5 rounded-lg" style={{ border: `1px solid ${A.border}` }}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="col-span-2 flex justify-end gap-2"><Btn onClick={() => setOpen(false)}>취소</Btn><Btn variant="primary" size="md" onClick={save}>저장</Btn></div>
        </div>
      </Modal>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
