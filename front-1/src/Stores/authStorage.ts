export const ACCESS_TOKEN_KEY = "accessToken";
const LOGIN_ROUTE = "/login";

let accessToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

const hasBC =
  typeof window !== "undefined" && typeof (window as any).BroadcastChannel !== "undefined";
const AUTH_CH: BroadcastChannel | null = hasBC ? new BroadcastChannel("auth") : null;

export const authToken = {
  get(): string | null { return accessToken; },
  set(token: string | null) {
    accessToken = token;
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
      else localStorage.removeItem(ACCESS_TOKEN_KEY);
      AUTH_CH?.postMessage({ type: "SET", token });
    }
  },
  clear() {
    this.set(null);
    if (typeof window !== "undefined") {
      AUTH_CH?.postMessage({ type: "LOGOUT" });
      window.location.replace(LOGIN_ROUTE);
    }
  },
};

AUTH_CH?.addEventListener("message", (e: MessageEvent) => {
  const { type, token } = e.data ?? {};
  if (type === "SET") accessToken = token ?? null;
  if (type === "LOGOUT") {
    accessToken = null;
    if (typeof window !== "undefined") window.location.replace(LOGIN_ROUTE);
  }
});
