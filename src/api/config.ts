// In the web build, relative paths ("/api/...") work because Vite's dev
// server proxies them to the local API. A packaged Capacitor app has no
// such proxy — it's served from its own capacitor://localhost origin — so
// it needs an absolute URL to the deployed backend. Set VITE_API_BASE_URL
// at build time for native builds (see android/README or the build docs);
// leave it unset for web, where relative paths keep working as before.
export const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const apiUrl = (path: string) => `${API_BASE}${path}`;
