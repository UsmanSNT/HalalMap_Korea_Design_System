export type UserRole = "user" | "owner" | "courier" | "admin";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

const TOKEN_KEY = "halalmap_session_token";

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const body = await response.text();
  let data: unknown = null;

  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const apiError = data && typeof data === "object" && "error" in data
      ? String(data.error)
      : `Backend javob bermadi (HTTP ${response.status})`;
    throw new Error(apiError);
  }

  if (!data) throw new Error("Backend bo‘sh yoki noto‘g‘ri javob qaytardi");
  return data as T;
};

export const login = async (email: string, password: string) => {
  const result = await request<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(TOKEN_KEY, result.token);
  return result.user;
};

export const getCurrentUser = async () => {
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  try {
    const result = await request<{ user: AuthUser }>("/api/auth/me");
    return result.user;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const logout = async () => {
  try {
    await request<{ success: boolean }>("/api/auth/logout", { method: "POST" });
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
};
