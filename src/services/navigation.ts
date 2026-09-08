import { useSyncExternalStore } from "react";

import { isRoute, parentRoute, type Workspace } from "./routeRegistry";
export type { Workspace } from "./routeRegistry";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());
window.addEventListener("hashchange", emit);
window.addEventListener("popstate", emit);

export function readRoute() {
  try {
    const url = new URL(window.location.hash.slice(1) || "/customer/home", "https://halalmap.local");
    const parts = url.pathname.split("/").filter(Boolean);
    const [workspace = "customer", screen = "home"] = parts;
    return { workspace: workspace as Workspace, screen, params: url.searchParams, valid: parts.length <= 2 && url.origin === "https://halalmap.local" && isRoute(workspace, screen) };
  } catch { return { workspace: "customer" as Workspace, screen: "not-found", params: new URLSearchParams(), valid: false }; }
}

export function navigate(screen: string, params?: Record<string, string>, replace = false) {
  const path = screen.startsWith("/") ? screen : `/${readRoute().workspace}/${screen}`;
  const query = params ? new URLSearchParams(params).toString() : "";
  const hash = `#${path}${query ? `?${query}` : ""}`;
  if (window.location.hash === hash) return;
  const depth = (window.history.state?.halalmapDepth ?? 0) + (replace ? 0 : 1);
  window.history[replace ? "replaceState" : "pushState"]({ ...window.history.state, halalmapDepth: depth }, "", hash);
  emit();
}

export function goBack(parent?: string) {
  if ((window.history.state?.halalmapDepth ?? 0) > 0) window.history.back();
  else { const route = readRoute(); navigate(parent ?? (route.valid ? parentRoute(route.workspace, route.screen) : "/customer/home"), undefined, true); }
}

export function useRoute() {
  useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => window.location.hash);
  return readRoute();
}

export function useRouteScreen<T extends string>(workspace: Workspace, fallback: T): [T, (screen: T) => void] {
  const route = useRoute();
  return [(route.workspace === workspace ? route.screen : fallback) as T, screen => navigate(`/${workspace}/${screen}`)];
}

window.addEventListener("halalmap:back", () => goBack());
