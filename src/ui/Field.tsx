import type { ReactNode } from "react";

/** Label + control wrapper. Controls use 16px text so iOS does not zoom the page on focus. */
export default function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[var(--muted)]">{hint}</span>}
    </label>
  );
}

export const INPUT_CLASS =
  "min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-base outline-none focus:border-[var(--green)]";
