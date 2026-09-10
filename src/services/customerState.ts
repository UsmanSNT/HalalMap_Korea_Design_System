import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
export function readLocal<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(`halalmap-demo-${key}`) ?? "null") ?? fallback; } catch { return fallback; }
}
export function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(`halalmap-demo-${key}`, JSON.stringify(value));
  listeners.forEach(fn => fn());
}
export function useLocal<T>(key: string, fallback: T): [T, (next: T | ((old: T) => T)) => void] {
  const raw = useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => localStorage.getItem(`halalmap-demo-${key}`));
  let value = fallback;
  try { value = raw ? JSON.parse(raw) : fallback; } catch {}
  return [value, next => writeLocal(key, typeof next === "function" ? (next as (old: T) => T)(readLocal(key, fallback)) : next)];
}
export type CartItem = { id: string; restaurantId: string; name: string; option: string; price: number; qty: number };
export function addToCart(item: CartItem) {
  const cart = readLocal<CartItem[]>("cart", []);
  const existing = cart.find(x => x.id === item.id && x.option === item.option);
  writeLocal("cart", existing ? cart.map(x => x === existing ? { ...x, qty: x.qty + item.qty } : x) : [...cart, item]);
}
export function directions(address: string) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, "_blank", "noopener,noreferrer");
}
