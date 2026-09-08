import { sessionStorage } from "./storage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

type ApiErrorBody = { error?: string; message?: string };

export const apiClient = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = sessionStorage.getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const rawBody = await response.text();
  let data: unknown = null;
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      if (response.ok) throw new Error("Backend noto‘g‘ri JSON javob qaytardi");
    }
  }

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new Error(error?.error ?? error?.message ?? `Backend xatosi (HTTP ${response.status})`);
  }

  if (data === null) throw new Error("Backend bo‘sh javob qaytardi");
  return data as T;
};
