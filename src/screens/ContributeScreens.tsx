import React, { useState } from "react";
import { StatusBar, BackButton, FloatingInput } from "../components/Shared";
import { useLanguage, type Lang } from "../components/LanguageSwitcher";
import { submitRestaurant, submitMosque } from "../api/submissions";

type NavigateFn = (screen: string) => void;

const TR = {
  restaurantTitle: { ko: "할랄 레스토랑 제보하기", en: "Submit a Halal Restaurant", uz: "Halol restoran haqida ma'lumot yuborish", ru: "Сообщить о халяльном ресторане" },
  mosqueTitle: { ko: "모스크·기도실 제보하기", en: "Submit a Mosque / Prayer Room", uz: "Masjid/namozxona haqida ma'lumot yuborish", ru: "Сообщить о мечети / молельной комнате" },
  intro: { ko: "아는 곳을 제보해 주시면 검토 후 지도에 반영됩니다. 여러분의 제보가 지도를 더 정확하게 만듭니다.", en: "Submit a place you know — after review it'll appear on the map. Your reports make the map more accurate for everyone.", uz: "Bilgan joyingizni yuboring — tekshirilgandan so'ng xaritada paydo bo'ladi. Sizning xabaringiz xaritani hamma uchun aniqroq qiladi.", ru: "Отправьте известное вам место — после проверки оно появится на карте. Ваши сообщения делают карту точнее для всех." },
  name: { ko: "이름", en: "Name", uz: "Nomi", ru: "Название" },
  address: { ko: "주소", en: "Address", uz: "Manzil", ru: "Адрес" },
  city: { ko: "도시", en: "City", uz: "Shahar", ru: "Город" },
  cuisine: { ko: "음식 종류", en: "Cuisine", uz: "Taom turi", ru: "Тип кухни" },
  phone: { ko: "전화번호", en: "Phone", uz: "Telefon", ru: "Телефон" },
  contact: { ko: "연락처", en: "Contact", uz: "Aloqa", ru: "Контакт" },
  capacity: { ko: "수용 인원", en: "Capacity", uz: "Sig'imi", ru: "Вместимость" },
  description: { ko: "설명", en: "Description", uz: "Tavsif", ru: "Описание" },
  descPlaceholder: { ko: "이 장소에 대해 더 알려주세요 (선택)", en: "Tell us more about this place (optional)", uz: "Bu joy haqida ko'proq ma'lumot bering (ixtiyoriy)", ru: "Расскажите подробнее об этом месте (по желанию)" },
  halalType: { ko: "할랄 인증 유형", en: "Halal Certification Type", uz: "Halollik sertifikati turi", ru: "Тип халяль-сертификации" },
  certified: { ko: "할랄 인증됨", en: "Halal Certified", uz: "Halol sertifikatlangan", ru: "Халяль сертифицирован" },
  owned: { ko: "무슬림 소유", en: "Muslim-Owned", uz: "Musulmon egaligidagi", ru: "Владелец — мусульманин" },
  friendly: { ko: "할랄 친화적", en: "Halal-Friendly", uz: "Halolga qulay", ru: "Халяль-дружелюбно" },
  hasPrayerRoom: { ko: "기도실이 있습니다", en: "Has a prayer room", uz: "Namozxonasi bor", ru: "Есть молельная комната" },
  submit: { ko: "제보하기", en: "Submit", uz: "Yuborish", ru: "Отправить" },
  submitting: { ko: "제출 중…", en: "Submitting…", uz: "Yuborilmoqda…", ru: "Отправка…" },
  requiredError: { ko: "이름과 주소는 필수입니다", en: "Name and address are required", uz: "Nomi va manzili majburiy", ru: "Название и адрес обязательны" },
  successTitle: { ko: "제보해 주셔서 감사합니다!", en: "Thank you for your submission!", uz: "Ma'lumot uchun rahmat!", ru: "Спасибо за ваше сообщение!" },
  successBody: { ko: "검토 후 승인되면 지도에 표시됩니다.", en: "Once reviewed and approved, it will appear on the map.", uz: "Tekshirilib tasdiqlangandan so'ng xaritada ko'rinadi.", ru: "После проверки и одобрения оно появится на карте." },
  submitAnother: { ko: "다른 곳 제보하기", en: "Submit another place", uz: "Yana joy qo'shish", ru: "Отправить ещё одно место" },
  backToHome: { ko: "홈으로 돌아가기", en: "Back to Home", uz: "Bosh sahifaga qaytish", ru: "Вернуться на главную" },
} satisfies Record<string, Record<Lang, string>>;

function SuccessState({ lang, t, onSubmitAnother, onNavigate }: {
  lang: Lang; t: (k: keyof typeof TR) => string; onSubmitAnother: () => void; onNavigate?: NavigateFn;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--green-light)" }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 19l8 8 16-18" />
        </svg>
      </div>
      <h1 className="font-bold text-xl text-[#1A1A18]">{t("successTitle")}</h1>
      <p className="text-sm text-[var(--muted)] leading-relaxed">{t("successBody")}</p>
      <div className="w-full space-y-2.5 pt-4">
        <button onClick={onSubmitAnother} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm" style={{ backgroundColor: "var(--green)" }}>
          {t("submitAnother")}
        </button>
        <button onClick={() => onNavigate?.("home")} className="w-full py-3 rounded-2xl font-semibold text-sm border" style={{ color: "var(--green)", borderColor: "var(--green)" }}>
          {t("backToHome")}
        </button>
      </div>
    </div>
  );
}

export const AddRestaurantScreen = ({ onNavigate }: { onNavigate?: NavigateFn } = {}) => {
  const { lang } = useLanguage();
  const t = (k: keyof typeof TR) => TR[k][lang];
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState<"certified" | "owned" | "friendly">("friendly");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setName(""); setAddress(""); setCity(""); setCuisine(""); setPhone(""); setDescription("");
    setBadge("friendly"); setError(""); setDone(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !address.trim()) return setError(t("requiredError"));
    setSubmitting(true);
    setError("");
    try {
      await submitRestaurant({ name: name.trim(), address: address.trim(), city: city.trim(), cuisine: cuisine.trim(), phone: phone.trim(), description: description.trim(), badge });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg">{t("restaurantTitle")}</h1>
        </div>
      </div>

      {done ? (
        <SuccessState lang={lang} t={t} onSubmitAnother={reset} onNavigate={onNavigate} />
      ) : (
        <form onSubmit={submit} className="flex-1 phone-scroll px-5 pt-4 pb-8 space-y-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed">{t("intro")}</p>

          <FloatingInput label={t("name")} value={name} onChange={setName} />
          <FloatingInput label={t("address")} value={address} onChange={setAddress} />
          <FloatingInput label={t("city")} value={city} onChange={setCity} />
          <FloatingInput label={t("cuisine")} value={cuisine} onChange={setCuisine} />
          <FloatingInput label={t("phone")} value={phone} onChange={setPhone} />

          <div>
            <p className="font-semibold text-sm text-[#1A1A18] mb-2.5">{t("halalType")}</p>
            <div className="space-y-2">
              {(["certified", "owned", "friendly"] as const).map((b) => (
                <button key={b} type="button" onClick={() => setBadge(b)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left"
                  style={{ borderColor: badge === b ? "var(--green)" : "var(--border)", backgroundColor: badge === b ? "var(--green-light)" : "white" }}>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: badge === b ? "var(--green)" : "var(--border)" }}>
                    {badge === b && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--green)" }} />}
                  </div>
                  <span className="text-sm font-medium text-[#1A1A18]">{t(b)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-sm text-[#1A1A18] mb-2">{t("description")}</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descPlaceholder")}
              className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[#1A1A18] bg-white outline-none resize-none focus:border-[var(--green)]"
              rows={3}
            />
          </div>

          {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm disabled:opacity-60"
            style={{ backgroundColor: "var(--green)" }}>
            {submitting ? t("submitting") : t("submit")}
          </button>
        </form>
      )}
    </div>
  );
};

export const AddMosqueScreen = ({ onNavigate }: { onNavigate?: NavigateFn } = {}) => {
  const { lang } = useLanguage();
  const t = (k: keyof typeof TR) => TR[k][lang];
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [hasPrayerRoom, setHasPrayerRoom] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setName(""); setAddress(""); setCity(""); setContact(""); setCapacity(""); setDescription("");
    setHasPrayerRoom(true); setError(""); setDone(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !address.trim()) return setError(t("requiredError"));
    setSubmitting(true);
    setError("");
    try {
      await submitMosque({
        name: name.trim(), address: address.trim(), city: city.trim(), contact: contact.trim(),
        description: description.trim(), hasPrayerRoom,
        capacity: capacity.trim() ? Number(capacity) : undefined,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton onBack={() => onNavigate?.("home")} />
          <h1 className="font-bold text-lg">{t("mosqueTitle")}</h1>
        </div>
      </div>

      {done ? (
        <SuccessState lang={lang} t={t} onSubmitAnother={reset} onNavigate={onNavigate} />
      ) : (
        <form onSubmit={submit} className="flex-1 phone-scroll px-5 pt-4 pb-8 space-y-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed">{t("intro")}</p>

          <FloatingInput label={t("name")} value={name} onChange={setName} />
          <FloatingInput label={t("address")} value={address} onChange={setAddress} />
          <FloatingInput label={t("city")} value={city} onChange={setCity} />
          <FloatingInput label={t("contact")} value={contact} onChange={setContact} />
          <FloatingInput label={t("capacity")} type="number" value={capacity} onChange={setCapacity} />

          <button type="button" onClick={() => setHasPrayerRoom(!hasPrayerRoom)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left"
            style={{ borderColor: hasPrayerRoom ? "var(--green)" : "var(--border)", backgroundColor: hasPrayerRoom ? "var(--green-light)" : "white" }}>
            <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: hasPrayerRoom ? "var(--green)" : "var(--border)", backgroundColor: hasPrayerRoom ? "var(--green)" : "white" }}>
              {hasPrayerRoom && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4l2.5 2.5L9 1"/></svg>}
            </div>
            <span className="text-sm font-medium text-[#1A1A18]">{t("hasPrayerRoom")}</span>
          </button>

          <div>
            <p className="font-semibold text-sm text-[#1A1A18] mb-2">{t("description")}</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descPlaceholder")}
              className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[#1A1A18] bg-white outline-none resize-none focus:border-[var(--green)]"
              rows={3}
            />
          </div>

          {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-sm disabled:opacity-60"
            style={{ backgroundColor: "var(--green)" }}>
            {submitting ? t("submitting") : t("submit")}
          </button>
        </form>
      )}
    </div>
  );
};
