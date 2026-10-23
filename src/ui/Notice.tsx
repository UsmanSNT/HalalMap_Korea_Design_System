import type { ReactNode } from "react";

export default function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-[var(--gold-light)] px-3 py-2.5 text-xs leading-relaxed text-[#7a5416]">{children}</p>;
}
