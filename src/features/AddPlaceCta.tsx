import { useState } from "react";
import type { PlaceKind } from "@/lib/communityApi";
import { useLanguage } from "@/locale/LanguageContext";
import AddPlaceSheet from "./AddPlaceSheet";

/** "Add a place" call-to-action plus the sheet it opens; shared by the mosque and food lists. */
export default function AddPlaceCta({ defaultKind }: { defaultKind: PlaceKind }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--green)] font-semibold text-[var(--green)]"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          +
        </span>
        {t("add.button")}
      </button>
      <AddPlaceSheet open={open} onClose={() => setOpen(false)} defaultKind={defaultKind} />
    </>
  );
}
