import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosHeaders, AxiosRequestConfig } from "axios";
import { authToken } from "@/stores/authStorage";

/* ======================== 상수 ======================== */
// API 기본 주소
export const API_BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL || "/gh";
// JWT 만료 임계 시간(초)
const EXP_MARGIN_SEC = 30;
// 리프레시 토큰 사용 여부
const ENABLE_REFRESH = ((import.meta as any)?.env?.VITE_ENABLE_REFRESH ?? "false") === "true";

/* ======================== 타입 정의 ======================== */
type ApiEnvelope<T> = { data: T };
type JwtPayload = { exp?: number };
type HeaderLike = AxiosHeaders | Record<string, any> | undefined;

/* ======================== 인증 관련 엔드포인트 ======================== */
const AUTH_ENDPOINTS = { login: "/user/login", logout: "/user/logout", reissue: "/reissue" } as const;

/* ======================== 헤더 유틸 함수 ======================== */
// 요청 헤더에 값 설정/삭제
const setHeader = (h: HeaderLike, key: string, value?: string) => {
  if (!h) return;
  if (value === undefined) { // 값 없으면 삭제
    if (typeof (h as any).delete === "function") (h as any).delete(key);
    else delete (h as any)[key];
    return;
  }
  if (typeof (h as any).set === "function") (h as any).set(key, value);
  else (h as any)[key] = value;
};

/* ======================== JWT 유틸 함수 ======================== */
// base64url → base64 변환
const base64UrlToBase64 = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);

// JWT 디코딩 (payload 추출)
const decodeJwt = (token?: string | null): JwtPayload | null => {
  if (!token) return null;
  try {
    const payload = token.split(".", 3)[1];
    return JSON.parse(atob(base64UrlToBase64(payload)));
  } catch {
    return null;
  }
};

// 만료 여부 검사 (임박 포함)
const isExpiredOrClose = (t: string | null, m = EXP_MARGIN_SEC) => {
  if (!t) return true;
  const exp = decodeJwt(t)?.exp;
  if (!exp || !Number.isFinite(exp)) return true;
  const now = Math.floor(Date.now()/1000);
  return exp <= now + m;
};

// 인증 필요 없는 요청 필터링
const shouldSkipAuth = (url?: string | null) =>
  !!url && [AUTH_ENDPOINTS.login, AUTH_ENDPOINTS.logout, AUTH_ENDPOINTS.reissue].some(p => url.toLowerCase().includes(p));

/* ======================== 토큰 재발급 요청 ======================== */
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

/* ======================== 동시 갱신 제어(Queue) ======================== */
let isRefreshing = false; // 현재 재발급 진행 여부
type Waiter = { resolve: (t: string) => void; reject: (e: unknown) => void };
let waitQueue: Waiter[] = [];
// 재발급 완료 시 대기중인 요청에 알림
const notifyQueue = (error: unknown | null, token?: string) => {
  waitQueue.forEach(({ resolve, reject }) => error || !token ? reject(error ?? new Error("Refresh failed")) : resolve(token));
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
  // FormData 요청 시 Content-Type 자동 제거
  if (config.data instanceof FormData) setHeader(config.headers as any, "Content-Type");
  // 로그인/로그아웃/재발급 요청은 토큰 제외
  if (shouldSkipAuth(config.url)) return config;

  let token = authToken.get();

  // 만료 임박 시 리프레시 처리
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
      // 이미 다른 요청이 리프레시 중 → 큐에 대기
      token = await new Promise<string>((resolve, reject) => { waitQueue.push({ resolve, reject }); });
    }
  }

  // Authorization 헤더 세팅
  if (token) {
    config.headers = (config.headers ?? {}) as any;
    setHeader(config.headers as any, "Authorization", `Bearer ${token}`);
  }
  return config;
});

/* ======================== 응답 인터셉터 ======================== */
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError & { _redirect?: string }) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // 401 응답 시 → 재발급 후 재요청
    if (ENABLE_REFRESH && error.response?.status === 401 && original && !original._retry && !shouldSkipAuth(original.url)) {
      original._retry = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          await requestNewAccessToken();
          notifyQueue(null, authToken.get()!);
        } else {
          await new Promise<string>((resolve, reject) => { waitQueue.push({ resolve, reject }); });
        }
        const latest = authToken.get();
        original.headers = (original.headers ?? {}) as any;
        if (latest) setHeader(original.headers as any, "Authorization", `Bearer ${latest}`);
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
export default apiClient;
export { AUTH_ENDPOINTS };
export type { ApiEnvelope };
