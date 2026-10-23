// Backend client. VITE_API_URL is the API origin (e.g. https://api.example.com); empty means same origin.
const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/$/, "");
const TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
  }
}

/** Throws ApiError("network", 0) when the server is unreachable or times out. */
export async function api<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...rest.headers,
      },
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) throw new ApiError(data.error ?? "server_error", response.status);
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("network", 0);
  } finally {
    window.clearTimeout(timer);
  }
}
