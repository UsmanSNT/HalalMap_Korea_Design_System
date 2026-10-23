/** User-submitted photo shown at the top of an expanded card. */
export default function PlacePhoto({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return <img src={src} alt={alt} loading="lazy" decoding="async" className="aspect-video w-full rounded-xl bg-[var(--cream)] object-cover" />;
}
