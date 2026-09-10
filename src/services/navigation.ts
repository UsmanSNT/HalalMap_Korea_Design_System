import { useSyncExternalStore } from "react";

// Real, URL-hash-based routing for the customer app: every screen gets a
// bookmarkable/shareable `#/screen-id` URL, and the browser's native
// back/forward buttons work correctly (each navigation is a real history
// entry, not just local component state).
//
// Deliberately screen-agnostic: it knows nothing about ScreenId, i18n, or
// any screen's content, so it can sit underneath the app's existing
// (fully translated) screens without touching them.

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
window.addEventListener("hashchange", emit);
window.addEventListener("popstate", emit);

function currentHashScreen(): string {
  return window.location.hash.replace(/^#\/?/, "").split("?")[0];
}

/** Reads the screen id encoded in the URL hash, falling back if it's missing or not a known screen. */
export function readRouteScreen<T extends string>(validScreens: readonly T[], fallback: T): T {
  const raw = currentHashScreen();
  return (validScreens as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

/**
 * Navigates to a screen by pushing (or replacing) a real browser history
 * entry. `replace` is for transitions that shouldn't be reachable by
 * pressing "back" (login, logout and the QA screen picker).
 */
export function routeParam(key: string, fallback = ""): string {
  return new URLSearchParams(window.location.hash.split("?")[1]).get(key) ?? fallback;
}
export function openEntity(screen: string, key: string, id: string) {
  navigateTo(`${screen}?${new URLSearchParams({ [key]: id })}`);
}
export function navigateTo(screen: string, replace = false): void {
  if (screen === "share") {
    const source = currentHashScreen();
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    if (source !== "share") params.set("source", source);
    screen = `share?${params}`;
  }
  const related = ["restaurant-detail", "restaurant-map-detail", "menu", "item-detail", "reviews", "share"];
  if (!screen.includes("?") && related.includes(screen)) {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    if (params.size) screen += `?${params}`;
  }
  const hash = `#/${screen}`;
  if (window.location.hash === hash) return;
  const depth = (window.history.state?.halalmapDepth ?? 0) + (replace ? 0 : 1);
  window.history[replace ? "replaceState" : "pushState"]({ halalmapDepth: depth }, "", hash);
  emit();
}

/** Goes back in browser history if this session pushed an entry, otherwise jumps to `fallback`. */
export function goBack(fallback: string): void {
  if ((window.history.state?.halalmapDepth ?? 0) > 0) {
    window.history.back();
  } else {
    navigateTo(fallback, true);
  }
}

/** Subscribes a component to the current route; re-renders on navigation, back/forward, or a manual hash edit. */
export function useRouteScreen<T extends string>(validScreens: readonly T[], fallback: T): T {
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => window.location.hash
  );
  return readRouteScreen(validScreens, fallback);
}
