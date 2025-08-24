
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { authToken } from "@/stores/authStorage";

/* ======================== 상수 ======================== */
// API 기본 주소
export const API_BASE_URL: string =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "/gh";
// JWT 만료 임계 시간(초)
const EXP_MARGIN_SEC = 30;
// 리프레시 토큰 사용 여부
const ENABLE_REFRESH =
  ((import.meta as any)?.env?.VITE_ENABLE_REFRESH ?? "false") === "true";

/* ======================== 타입 ======================== */
type ApiEnvelope<T> = { data: T };
type JwtPayload = { exp?: number };
type HeaderLike = AxiosHeaders | Record<string, any> | undefined;

/* ======================== 인증 엔드포인트 ======================== */
const AUTH_ENDPOINTS = {
  login: "/user/login",
  logout: "/user/logout",
  reissue: "/reissue",
  profile: "/user/profile",
} as const;

/* ======================== 소형 유틸 ======================== */
// 헤더 편의
const setHeader = (h: HeaderLike, key: string, value?: string) => {
  if (!h) return;
  if (value === undefined) {
    if (typeof (h as any).delete === "function") (h as any).delete(key);
    else delete (h as any)[key];
    return;
  }
  if (typeof (h as any).set === "function") (h as any).set(key, value);
  else (h as any)[key] = value;
};

// base64url → base64
const base64UrlToBase64 = (s: string) =>
  s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);

// JWT exp 디코드
const decodeJwt = (token?: string | null): JwtPayload | null => {
  if (!token) return null;
  try {
    const payload = token.split(".", 3)[1];
    return JSON.parse(atob(base64UrlToBase64(payload)));
  } catch {
    return null;
  }
};

// 만료(임박) 판단
const isExpiredOrClose = (t: string | null, marginSec = EXP_MARGIN_SEC) => {
  if (!t) return true;
  const exp = decodeJwt(t)?.exp;
  if (!exp || !Number.isFinite(exp)) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + marginSec;
};

// Bearer 정규화
const stripBearer = (t: string) => t.replace(/^Bearer\s+/i, "");
const withBearer = (t: string) =>
  t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}`;

// url → pathname 소문자
const getPathLower = (url?: string | null): string => {
  if (!url) return "";
  try {
    const u = new URL(url, API_BASE_URL);
    return u.pathname.toLowerCase();
  } catch {
    return String(url).toLowerCase();
  }
};

// 인증 제외 요청
const shouldSkipAuth = (url?: string | null) => {
  const p = getPathLower(url);
  return [AUTH_ENDPOINTS.login, AUTH_ENDPOINTS.logout, AUTH_ENDPOINTS.reissue].some(
    (ep) => p.includes(ep)
  );
};

/* ======================== 토큰 재발급 ======================== */
async function requestNewAccessToken(): Promise<string> {
  if (!ENABLE_REFRESH) throw new Error("Token refresh disabled");
  const res = await axios.post<{ data?: { accessToken?: string }; accessToken?: string }>(
    `${API_BASE_URL}${AUTH_ENDPOINTS.reissue}`,
    {},
    { withCredentials: true }
  );
  const newToken =
    (res as any)?.data?.data?.accessToken ?? (res as any)?.data?.accessToken;
  if (!newToken || typeof newToken !== "string") {
    throw new Error("Reissue response missing accessToken");
  }
  authToken.set(newToken);
  return newToken;
}

/* ======================== 동시 리프레시 제어 ======================== */
let isRefreshing = false;
type Waiter = { resolve: (t: string) => void; reject: (e: unknown) => void };
let waitQueue: Waiter[] = [];
const notifyQueue = (error: unknown | null, token?: string) => {
  waitQueue.forEach(({ resolve, reject }) =>
    error || !token ? reject(error ?? new Error("Refresh failed")) : resolve(token)
  );
  waitQueue = [];
};

/* ======================== Axios 인스턴스 ======================== */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

/* ======================== 요청 인터셉터 ======================== */
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // FormData면 Content-Type 제거(브라우저가 경계 자동 세팅)
  if (config.data instanceof FormData) setHeader(config.headers as any, "Content-Type");

  // 로그인/로그아웃/재발급은 토큰 제외
  if (shouldSkipAuth(config.url)) return config;

  let token = authToken.get();

  // 만료 임박 시 리프레시
  if (ENABLE_REFRESH && token && isExpiredOrClose(token)) {
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
    const normalized = withBearer(stripBearer(token));
    config.headers = (config.headers ?? {}) as any;
    setHeader(config.headers as any, "Authorization", normalized);
  }
  return config;
});

/* ======================== 응답 인터셉터 ======================== */
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError & { _redirect?: string }) => {
    const st = error.response?.status;

    // 권한 부족 → 라우터에서 활용 가능한 힌트
    if (st === 403) {
      return Promise.reject(Object.assign(error, { _redirect: "/403" }));
    }

    // 일부 백엔드: 419(인증 만료) / 440(세션 만료) 사용
    const isAuthExpired = st === 401 || st === 419 || st === 440;

    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      ENABLE_REFRESH &&
      isAuthExpired &&
      original &&
      !original._retry &&
      !shouldSkipAuth(original.url)
    ) {
      original._retry = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          await requestNewAccessToken();
          notifyQueue(null, authToken.get()!);
        } else {
          await new Promise<string>((resolve, reject) => {
            waitQueue.push({ resolve, reject });
          });
        }
        const latest = authToken.get();
        original.headers = (original.headers ?? {}) as any;
        if (latest)
          setHeader(
            original.headers as any,
            "Authorization",
            withBearer(stripBearer(latest))
          );
        return apiClient(original);
      } catch (e) {
        notifyQueue(e, undefined);
        authToken.clear();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ======================== export ======================== */
export function unwrap<T = unknown>(res: any): T {
  // 서버가 { data: T } 또는 T 자체를 보낼 때 모두 대응
  return (res?.data?.data ?? res?.data) as T;
}
export default apiClient;
export { AUTH_ENDPOINTS };
export type { ApiEnvelope };
