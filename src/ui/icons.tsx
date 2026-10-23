import type { ReactNode } from "react";

type IconProps = { className?: string };

const Svg = ({ children, className = "h-6 w-6" }: IconProps & { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
);

export const ClockIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const CompassIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></Svg>;
export const MosqueIcon = (p: IconProps) => <Svg {...p}><path d="M12 3c-1.5 2-3.5 3-3.5 5.5a3.5 3.5 0 0 0 7 0C15.5 6 13.5 5 12 3Z" /><path d="M5 21v-8h14v8M3 21h18M8 13V9M16 13V9" /></Svg>;
export const FoodIcon = (p: IconProps) => <Svg {...p}><path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 21V3c-2.2 1.2-3 4-3 7 0 1.7 1 3 3 3" /></Svg>;
export const PinIcon = (p: IconProps) => <Svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Svg>;
export const PhoneIcon = (p: IconProps) => <Svg {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></Svg>;
export const NavigateIcon = (p: IconProps) => <Svg {...p}><path d="m3 11 18-8-8 18-2-8z" /></Svg>;
export const CopyIcon = (p: IconProps) => <Svg {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></Svg>;
export const CheckIcon = (p: IconProps) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>;
export const ChevronIcon = (p: IconProps) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>;
export const SearchIcon = (p: IconProps) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
