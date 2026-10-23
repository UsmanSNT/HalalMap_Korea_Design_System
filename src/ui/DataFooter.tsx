import { useLanguage } from "@/locale/LanguageContext";
import Notice from "./Notice";

export default function DataFooter() {
  const { t } = useLanguage();
  return (
    <div className="space-y-2 pb-2">
      <Notice>{t("data.note")}</Notice>
      <p className="text-center text-[11px] text-[var(--muted)]">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">
          {t("data.osm")}
        </a>
      </p>
    </div>
  );
}
