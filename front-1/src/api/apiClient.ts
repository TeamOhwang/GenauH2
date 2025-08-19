import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
  AxiosHeaders,
} from "axios";

/* ======================== 상수 & 타입 ======================== */
export const API_BASE_URL: string =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:8088/gh";
export const ACCESS_TOKEN_KEY = "accessToken";

const LOGIN_PATH = "/login";                 // 프론트 라우트
const EXP_MARGIN_SEC = 30;                   // 만료 30초 전부터 만료 간주
const DEBUG = !!(import.meta as any)?.env?.DEV;

export type ApiEnvelope<T> = { data: T };
type RefreshRes = ApiEnvelope<{ accessToken: string }>;
type JwtPayload = { exp?: number };

export type NormalizedError =
  | { kind: "timeout"; message: string; _redirect?: string }
  | { kind: "network"; message: string; _redirect?: string }
  | { kind: "http"; status?: number; message: string; _redirect?: string };

/* ======================== 경로 상수 ======================== */
export const PATHS = {
  login: "/user/login",
  logout: "/user/logout",
  reissue: "/reissue",
} as const;

/* ======================== 유틸 ======================== */
const log = (...a: any[]) => {
  if (DEBUG) console.log("[api]", ...a);
};

function base64UrlToBase64(input: string): string {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
}

function decodeJwt(token?: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split(".", 3);
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(base64UrlToBase64(payload));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpiredOrClose(token: string | null, marginSec = EXP_MARGIN_SEC): boolean {
  if (!token) return true;
  const exp = decodeJwt(token)?.exp;
  if (typeof exp !== "number" || !Number.isFinite(exp)) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + marginSec;
}

function shouldSkipAuth(url?: string | null): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes(PATHS.login) || u.includes(PATHS.logout) || u.includes(PATHS.reissue);
}

/* ---- 범용 Header 유틸 (AxiosHeaders/POJO 모두 지원) ---- */
type HeaderLike = AxiosHeaders | Record<string, any> | undefined;

function setHeader(h: HeaderLike, key: string, value?: string) {
  if (!h) return;
  if (value === undefined) {
    if (typeof (h as AxiosHeaders).delete === "function") {
      (h as AxiosHeaders).delete(key);
    } else {
      delete (h as Record<string, any>)[key];
    }
    return;
  }
  if (typeof (h as AxiosHeaders).set === "function") {
    (h as AxiosHeaders).set(key, value);
  } else {
    (h as Record<string, any>)[key] = value;
  }
}

function normalizeAxiosError(err: AxiosError): NormalizedError {
  const st = err.response?.status;
  if (err.code === "ECONNABORTED") return { kind: "timeout", message: "요청이 지연되었습니다." };
  if (!err.response) return { kind: "network", message: "네트워크 연결을 확인해주세요." };
  const serverMsg =
    (err.response.data as any)?.message ||
    (err.response.data as any)?.error ||
    err.message;
  return { kind: "http", status: st, message: serverMsg };
}

async function retryOnce<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (e: any) {
    const st = e?.status ?? e?.response?.status;
    const transient = !st || (st >= 500 && st < 600);
    if (transient) return await fn();
    throw e;
  }
}

function unwrap<T>(res: any): T {
  if (!res) return undefined as unknown as T;
  const d = res.data;
  if (d == null || d === "") return undefined as unknown as T;
  return ((d as ApiEnvelope<T>)?.data ?? d) as T;
}

/* ---- 역할 파싱 헬퍼 (스토어 의존 없이 토큰만으로 판단) ---- */
type Role = "USER" | "ADMIN" | null;

function getRoleFromToken(t: string | null): Role {
  if (!t) return null;
  const p = (decodeJwt(t) as { role?: "USER" | "ADMIN"; roles?: string[] } | null) ?? null;
  if (!p) return null;
  if (p.role === "ADMIN" || p.role === "USER") return p.role;
  if (Array.isArray(p.roles)) {
    if (p.roles.includes("ADMIN")) return "ADMIN";
    if (p.roles.includes("USER")) return "USER";
  }
  return null;
}

/* ======================== 토큰 저장소 & 다탭 동기화 ======================== */
let accessToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

const hasBC =
  typeof window !== "undefined" && typeof (window as any).BroadcastChannel !== "undefined";
const AUTH_CH: BroadcastChannel | null = hasBC ? new BroadcastChannel("auth") : null;

export const authToken = {
  get(): string | null {
    return accessToken;
  },
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
      window.location.replace(LOGIN_PATH);
    }
  },
};

AUTH_CH?.addEventListener("message", (e: MessageEvent) => {
  const { type, token } = e.data ?? {};
  if (type === "SET") {
    accessToken = token ?? null;
  }
  if (type === "LOGOUT") {
    accessToken = null;
    if (typeof window !== "undefined") window.location.replace(LOGIN_PATH);
  }
});

/* ======================== 재발급(전역 axios) & 동시성 큐 ======================== */
async function requestNewAccessToken(): Promise<string> {
  log("reissuing token…");
  const res = await axios.post<RefreshRes>(
    `${API_BASE_URL}${PATHS.reissue}`,
    {},
    { withCredentials: true }
  );
  const newToken = res.data?.data?.accessToken;
  if (!newToken || typeof newToken !== "string") {
    throw new Error("Reissue response missing a valid 'accessToken'");
  }
  authToken.set(newToken);
  return newToken;
}

let isRefreshing = false;
type Waiter = { resolve: (t: string) => void; reject: (e: unknown) => void };
let waitQueue: Waiter[] = [];

function notifyQueue(error: unknown | null, token?: string) {
  waitQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error ?? new Error("Refresh failed"));
    else resolve(token);
  });
  waitQueue = [];
}

/* ======================== Axios 인스턴스 ======================== */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true, // Refresh 쿠키 자동 포함
});

/* ---------------- 요청 인터셉터: 사전 재발급 + 헤더 부착 ---------------- */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // FormData면 브라우저가 Content-Type 설정하도록 삭제
    if (config.data instanceof FormData) {
      setHeader(config.headers as HeaderLike, "Content-Type");
    }

    // 인증 스킵 대상은 통과
    if (shouldSkipAuth(config.url)) return config;

    let token = authToken.get();

    // 만료(또는 임박) 시 선재발급
    if (token && isExpiredOrClose(token)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await requestNewAccessToken();
          notifyQueue(null, newToken);
          token = newToken;
        } catch (e) {
          notifyQueue(e, undefined);
          authToken.clear();
          throw e;
        } finally {
          isRefreshing = false;
        }
      } else {
        token = await new Promise<string>((resolve, reject) => {
          waitQueue.push({ resolve, reject });
        });
      }
    }

    if (token) {
      // 헤더 객체가 없으면 생성 (POJO/Headers 모두 커버)
      config.headers = (config.headers ?? {}) as any;
      setHeader(config.headers as HeaderLike, "Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/* ---------------- 응답 인터셉터: 401 사후 재발급 + 403 역할 홈 리다이렉트 ---------------- */
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError & { _redirect?: string }) => {
    // 403 → 사용자 역할 홈(/admin | /home) 또는 토큰 없으면 /login
    if (error.response?.status === 403) {
      const latest = authToken.get();
      const role = getRoleFromToken(latest);
      const redirect = role ? (role === "ADMIN" ? "/admin" : "/home") : "/login";
      const norm = normalizeAxiosError(error);
      return Promise.reject({ ...norm, _redirect: redirect });
    }

    const original =
      (error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined) ??
      undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !shouldSkipAuth(original.url)
    ) {
      original._retry = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await requestNewAccessToken();
          notifyQueue(null, newToken);
        } else {
          await new Promise<string>((resolve, reject) => {
            waitQueue.push({ resolve, reject });
          });
        }
        const latest = authToken.get();
        original.headers = (original.headers ?? {}) as any;
        if (latest) setHeader(original.headers as HeaderLike, "Authorization", `Bearer ${latest}`);
        return apiClient(original);
      } catch (e) {
        notifyQueue(e, undefined);
        authToken.clear(); // 재발급 실패 → 로그아웃
        return Promise.reject(normalizeAxiosError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeAxiosError(error));
  }
);

/* ======================== 공용 헬퍼 ======================== */
export async function getD<T = unknown>(url: string, config?: AxiosRequestConfig) {
  const run = async () => {
    const res = await apiClient.get(url, config);
    return unwrap<T>(res);
  };
  return retryOnce(run); // GET만 1회 재시도
}

export async function postD<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const res = await apiClient.post(url, body, config);
  return unwrap<T>(res);
}

export async function putD<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const res = await apiClient.put(url, body, config);
  return unwrap<T>(res);
}

export async function patchD<T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
) {
  const res = await apiClient.patch(url, body, config);
  return unwrap<T>(res);
}

// axios.delete는 body 전송 시 { data }로 감싸야 함
export async function deleteD<T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
) {
  const res = await apiClient.delete(url, { ...(config ?? {}), data: body });
  return unwrap<T>(res);
}

export default apiClient;
