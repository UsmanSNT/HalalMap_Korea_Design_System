import React from "react";
import { useLocalState } from "../services/localState";
export default function FavoriteButton({ name, kind = "restaurant", className = "" }: { name: string; kind?: "restaurant" | "mosque"; className?: string }) {
  const [favorites, setFavorites] = useLocalState<string[]>(`favorites:${kind}`, []);
  const saved = favorites.includes(name);
  return <button type="button" aria-label={`${saved ? "Saqlangandan olib tashlash" : "Saqlash"}: ${name}`} aria-pressed={saved} onClick={event => { event.stopPropagation(); setFavorites(old => saved ? old.filter(value => value !== name) : [...old, name]); }} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--border)] ${className}`} style={{ color: saved ? "var(--danger)" : "var(--muted)", backgroundColor: "white" }}>{saved ? "♥" : "♡"}</button>;
}
