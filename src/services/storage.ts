const SESSION_TOKEN_KEY = "halalmap_session_token";

export const sessionStorage = {
  getToken: () => localStorage.getItem(SESSION_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(SESSION_TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(SESSION_TOKEN_KEY),
};
