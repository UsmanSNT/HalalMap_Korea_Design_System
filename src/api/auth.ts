import { apiClient, getToken, setToken, clearToken } from "@/services/apiClient";

export type UserRole = "user" | "owner" | "courier" | "admin";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export const login = async (email: string, password: string) => {
  const demos = [
    ["user@halalmap.test", "User123!", "user", "Test User"],
    ["owner@halalmap.test", "Owner123!", "owner", "Restaurant Owner"],
    ["courier@halalmap.test", "Courier123!", "courier", "Courier"],
    ["admin@halalmap.test", "Admin123!", "admin", "Admin"],
  ];
  const demo = demos.find(d => d[0] === email && d[1] === password);
  if (demo) {
    const user: AuthUser = { id: 1, email, role: demo[2] as UserRole, name: demo[3] };
    localStorage.setItem("halalmap-demo-session", JSON.stringify(user));
    setToken("demo-token");
    return user;
  }
  const result = await apiClient<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(result.token);
  return result.user;
};

export const getCurrentUser = async () => {
  if (getToken() === "demo-token") {
    try { return JSON.parse(localStorage.getItem("halalmap-demo-session") ?? "null") as AuthUser | null; } catch { return null; }
  }
  if (!getToken()) return null;
  try {
    const result = await apiClient<{ user: AuthUser }>("/api/auth/me");
    return result.user;
  } catch {
    clearToken();
    return null;
  }
};

export const logout = async () => {
  localStorage.removeItem("halalmap-demo-session");
  if (getToken() === "demo-token") { clearToken(); return; }
  try {
    await apiClient<{ success: boolean }>("/api/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
};
