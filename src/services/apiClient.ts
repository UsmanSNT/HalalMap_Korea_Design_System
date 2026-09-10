import { getMockResponse } from "./mockData";

const TOKEN_KEY = "halalmap_session_token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const method = init?.method ?? "GET";
  const canMock = method === "GET" && !path.startsWith("/api/auth/");
  if (getToken() === "demo-token" && canMock) {
    const mock = getMockResponse<T>(path);
    if (mock !== null) return mock;
  }
  try {
    const token = getToken();
    const response = await fetch(path, {
      signal: AbortSignal.timeout(5000),
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new ApiError(data.error || "So'rov bajarilmadi", response.status);
    return data;
  } catch (err) {
    const mock = canMock && !(err instanceof ApiError && err.status < 500) ? getMockResponse<T>(path) : null;
    if (mock !== null) return mock;
    throw err;
  }
};
