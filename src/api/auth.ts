import { apiClient } from "../services/apiClient";
import { sessionStorage } from "../services/storage";

export type UserRole = "user" | "owner" | "courier" | "admin";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export const login = async (email: string, password: string) => {
  const result = await apiClient<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setToken(result.token);
  return result.user;
};

export const getCurrentUser = async () => {
  if (!sessionStorage.getToken()) return null;
  try {
    const result = await apiClient<{ user: AuthUser }>("/api/auth/me");
    return result.user;
  } catch {
    sessionStorage.clearToken();
    return null;
  }
};

export const logout = async () => {
  try {
    await apiClient<{ success: boolean }>("/api/auth/logout", { method: "POST" });
  } finally {
    sessionStorage.clearToken();
  }
};
