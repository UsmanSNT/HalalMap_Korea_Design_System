import type { ReactNode } from "react";

type CommonProps = { icon: ReactNode; children: ReactNode; primary?: boolean };
type ActionButtonProps = CommonProps & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

/** Link-or-button with a consistent 44px touch target. External links open outside the app WebView history. */
export default function ActionButton({ icon, children, primary = false, href, onClick }: ActionButtonProps) {
  const className = `flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold ${
    primary ? "bg-[var(--green)] text-white" : "border border-[var(--border)] bg-white text-[var(--charcoal)]"
  }`;
  const content = (
    <>
      <span className="h-5 w-5 shrink-0 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <span className="truncate">{children}</span>
    </>
  );
  return href ? (
    <a href={href} target={href.startsWith("tel:") ? undefined : "_blank"} rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
