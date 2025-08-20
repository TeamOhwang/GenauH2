import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosHeaders, AxiosRequestConfig } from "axios";
import { authToken } from "@/Stores/authStorage";

export const API_BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL || "/gh";
const EXP_MARGIN_SEC = 30;
const ENABLE_REFRESH = ((import.meta as any)?.env?.VITE_ENABLE_REFRESH ?? "false") === "true";

type ApiEnvelope<T> = { data: T };
type JwtPayload = { exp?: number };
type HeaderLike = AxiosHeaders | Record<string, any> | undefined;

const AUTH_ENDPOINTS = { login: "/user/login", logout: "/user/logout", reissue: "/reissue" } as const;

const setHeader = (h: HeaderLike, key: string, value?: string) => {
  if (!h) return;
  if (value === undefined) { if (typeof (h as any).delete === "function") (h as any).delete(key); else delete (h as any)[key]; return; }
  if (typeof (h as any).set === "function") (h as any).set(key, value); else (h as any)[key] = value;
};

const base64UrlToBase64 = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
const decodeJwt = (token?: string | null): JwtPayload | null => {
  if (!token) return null;
  try { const payload = token.split(".", 3)[1]; return JSON.parse(atob(base64UrlToBase64(payload))); } catch { return null; }
};
const isExpiredOrClose = (t: string | null, m = EXP_MARGIN_SEC) => {
  if (!t) return true; const exp = decodeJwt(t)?.exp; if (!exp || !Number.isFinite(exp)) return true;
  const now = Math.floor(Date.now()/1000); return exp <= now + m;
};
const shouldSkipAuth = (url?: string | null) =>
  !!url && [AUTH_ENDPOINTS.login, AUTH_ENDPOINTS.logout, AUTH_ENDPOINTS.reissue].some(p => url.toLowerCase().includes(p));

async function requestNewAccessToken(): Promise<string> {
  if (!ENABLE_REFRESH) throw new Error("Token refresh disabled");
  const res = await axios.post<{ data?: { accessToken?: string }; accessToken?: string }>(
    `${API_BASE_URL}${AUTH_ENDPOINTS.reissue}`, {}, { withCredentials: true }
  );
  const newToken = (res as any)?.data?.data?.accessToken ?? (res as any)?.data?.accessToken;
  if (!newToken || typeof newToken !== "string") throw new Error("Reissue response missing accessToken");
  authToken.set(newToken);
  return newToken;
}

let isRefreshing = false;
type Waiter = { resolve: (t: string) => void; reject: (e: unknown) => void };
let waitQueue: Waiter[] = [];
const notifyQueue = (error: unknown | null, token?: string) => {
  waitQueue.forEach(({ resolve, reject }) => error || !token ? reject(error ?? new Error("Refresh failed")) : resolve(token));
  waitQueue = [];
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL, timeout: 10000, withCredentials: true,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.data instanceof FormData) setHeader(config.headers as any, "Content-Type");
  if (shouldSkipAuth(config.url)) return config;

  let token = authToken.get();
  if (ENABLE_REFRESH && token && isExpiredOrClose(token)) {
    if (!isRefreshing) {
      isRefreshing = true;
      try { const newToken = await requestNewAccessToken(); notifyQueue(null, newToken); token = newToken; }
      catch (e) { notifyQueue(e, undefined); authToken.clear(); throw e; }
      finally { isRefreshing = false; }
    } else {
      token = await new Promise<string>((resolve, reject) => { waitQueue.push({ resolve, reject }); });
    }
  }
  if (token) {
    config.headers = (config.headers ?? {}) as any;
    setHeader(config.headers as any, "Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError & { _redirect?: string }) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (ENABLE_REFRESH && error.response?.status === 401 && original && !original._retry && !shouldSkipAuth(original.url)) {
      original._retry = true;
      try {
        if (!isRefreshing) { isRefreshing = true; await requestNewAccessToken(); notifyQueue(null, authToken.get()!); }
        else { await new Promise<string>((resolve, reject) => { waitQueue.push({ resolve, reject }); }); }
        const latest = authToken.get();
        original.headers = (original.headers ?? {}) as any;
        if (latest) setHeader(original.headers as any, "Authorization", `Bearer ${latest}`);
        return apiClient(original);
      } catch (e) {
        notifyQueue(e, undefined); authToken.clear();
        return Promise.reject(error);
      } finally { isRefreshing = false; }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { AUTH_ENDPOINTS };
export type { ApiEnvelope };
