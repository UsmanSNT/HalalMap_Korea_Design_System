import { useSyncExternalStore } from "react";
import type { Dispatch, SetStateAction } from "react";

const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();
let scope = "guest";
export function setUserStorageScope(id: string) { scope = id; cache.clear(); listeners.forEach(fn => fn()); }
const emit = () => listeners.forEach(fn => fn());
window.addEventListener("storage", () => { cache.clear(); emit(); });
export function readLocal<T>(key: string, initial: T): T {
  const fullKey = `halalmap:${scope}:${key}`;
  if (!cache.has(fullKey)) {
    let value = initial;
    try {
      const raw = localStorage.getItem(fullKey);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        const compatible = initial === null || (Array.isArray(initial) ? Array.isArray(parsed) : typeof parsed === typeof initial && parsed !== null && !Array.isArray(parsed));
        if (compatible) value = parsed;
      }
    } catch { /* Storage is optional in private browsers. */ }
    cache.set(fullKey, value);
  }
  return cache.get(fullKey) as T;
}
export function writeLocal<T>(key: string, value: T) {
  const fullKey = `halalmap:${scope}:${key}`;
  cache.set(fullKey, value);
  try { localStorage.setItem(fullKey, JSON.stringify(value)); } catch { /* Keep the in-memory session usable. */ }
  emit();
}
export function useLocalState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const value = useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, () => readLocal(key, initial));
  return [value, next => writeLocal(key, typeof next === "function" ? (next as (old: T) => T)(readLocal(key, initial)) : next)];
}
