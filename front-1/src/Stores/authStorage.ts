export const ACCESS_TOKEN_KEY = "accessToken";
const LOGIN_ROUTE = "/login";

let accessToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

const hasBC =
  typeof window !== "undefined" && typeof (window as any).BroadcastChannel !== "undefined";
const AUTH_CH: BroadcastChannel | null = hasBC ? new BroadcastChannel("auth") : null;

const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    window.location.replace(LOGIN_ROUTE);
  }
};

export const authToken = {
  get(): string | null {
    return accessToken;
  },

  set(token: string | null) {
    accessToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
      AUTH_CH?.postMessage({ type: "SET", token } as const);
    }
  },

  clear() {
    accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      AUTH_CH?.postMessage({ type: "LOGOUT" } as const);
      redirectToLogin();
    }
  },
};

// 동기화 리스너
AUTH_CH?.addEventListener("message", (e: MessageEvent) => {
  const msg = e.data as { type: "SET"; token: string | null } | { type: "LOGOUT" };
  if (msg.type === "SET") {
    accessToken = msg.token ?? null;
  }
  if (msg.type === "LOGOUT") {
    accessToken = null;
    redirectToLogin();
  }
});
