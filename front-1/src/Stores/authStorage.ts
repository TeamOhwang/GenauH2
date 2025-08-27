export const ACCESS_TOKEN_KEY = "accessToken";
const LOGIN_ROUTE = "/login";

let accessToken: string | null =
  typeof window !== "undefined"
    ? localStorage.getItem(ACCESS_TOKEN_KEY)
    : null;

const AUTH_CH =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("auth")
    : null;

const redirectToLogin = () => {
  if (typeof window !== "undefined") window.location.replace(LOGIN_ROUTE);
};

export const authToken = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
    if (typeof window !== "undefined") {
      token
        ? localStorage.setItem(ACCESS_TOKEN_KEY, token)
        : localStorage.removeItem(ACCESS_TOKEN_KEY);
      AUTH_CH?.postMessage({ type: "SET", token });
    }
  },
  clear: () => {
    accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      AUTH_CH?.postMessage({ type: "LOGOUT" });
      redirectToLogin();
    }
  },
};

AUTH_CH?.addEventListener("message", (e) => {
  const msg = e.data;
  if (msg.type === "SET") accessToken = msg.token ?? null;
  if (msg.type === "LOGOUT") {
    accessToken = null;
    redirectToLogin();
  }
});
