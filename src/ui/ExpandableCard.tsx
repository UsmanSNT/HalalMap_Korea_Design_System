import { useId, useState, type ReactNode } from "react";
import { ChevronIcon } from "./icons";

type ExpandableCardProps = {
  /** Always-visible summary (rendered inside the toggle button). */
  summary: ReactNode;
  /** Revealed on expand. */
  children: ReactNode;
};

/** Accordion card: one big tap target toggles the details, so lists need no separate detail screens. */
export default function ExpandableCard({ summary, children }: ExpandableCardProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-16 w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">{summary}</div>
        <ChevronIcon className={`mt-1 h-5 w-5 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div id={panelId} className="space-y-3 border-t border-[var(--border)] p-4">
          {children}
        </div>
      )}
    </li>
  );
}
