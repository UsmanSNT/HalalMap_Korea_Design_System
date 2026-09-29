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
  // "#/scan-result?barcode=880…" -> "scan-result" (the query string carries screen parameters)
  return window.location.hash.replace(/^#\/?/, "").split("?")[0];
}

/** Screen parameters from the hash query, e.g. `#/mosque-detail?id=osm-node-1` -> id = "osm-node-1". */
export function getRouteParams(): URLSearchParams {
  const hash = window.location.hash;
  const index = hash.indexOf("?");
  return new URLSearchParams(index === -1 ? "" : hash.slice(index + 1));
}

/** Builds a screen path with parameters: `screenPath("scan-result", { barcode })`. */
export function screenPath(screen: string, params: Record<string, string | null | undefined> = {}): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value != null && value !== "") query.set(key, value);
  const qs = query.toString();
  return qs ? `${screen}?${qs}` : screen;
}

/** Reads the screen id encoded in the URL hash, falling back if it's missing or not a known screen. */
export function readRouteScreen<T extends string>(validScreens: readonly T[], fallback: T): T {
  const raw = currentHashScreen();
  return (validScreens as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

/**
 * Navigates to a screen by pushing (or replacing) a real browser history
 * entry. `replace` is for transitions that shouldn't be reachable by
 * pressing "back" (login, logout, tab-bar switches, the QA screen picker).
 */
export function navigateTo(screen: string, replace = false): void {
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

/** Re-renders on navigation and returns the current screen parameters. */
export function useRouteParams(): URLSearchParams {
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => window.location.hash
  );
  return getRouteParams();
}
