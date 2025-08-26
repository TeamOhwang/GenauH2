import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { authToken } from "@/stores/authStorage";

/* ======================== 상수 ======================== */
// API 기본 주소
export const API_BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL || "/gh";
// JWT 만료 임계 시간(초)
const EXP_MARGIN_SEC = 30;
const ENABLE_REFRESH =
  ((import.meta as any)?.env?.VITE_ENABLE_REFRESH ?? "false") === "true";

/* ======================== 타입 정의 ======================== */
type JwtPayload = { exp?: number };
type HeaderLike = AxiosHeaders | Record<string, any> | undefined;

/* ======================== 인증 관련 엔드포인트 ======================== */
export const AUTH_ENDPOINTS = {
  login: "/user/login",
  logout: "/user/logout",
  reissue: "/reissue",
  profile: "/user/profile",
  signup: "/user/register",
} as const;

/* ======================== 헤더 유틸 함수 ======================== */
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

/* ======================== JWT 유틸 함수 ======================== */
const decodeJwt = (token?: string | null): JwtPayload | null => {
  if (!token) return null;
  try {
    const payload = token.split(".", 3)[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((payload.length + 3) % 4);
    return JSON.parse(atob(base64));  
  } catch {
    return null;
  }
};
const isExpiredOrClose = (t: string | null, m = EXP_MARGIN_SEC) => {
  const exp = decodeJwt(t)?.exp;
  const now = Math.floor(Date.now() / 1000);
  return !exp || exp <= now + m;
};
const shouldSkipAuth = (url?: string | null) =>
  !!url &&
  [AUTH_ENDPOINTS.login, AUTH_ENDPOINTS.logout, AUTH_ENDPOINTS.reissue].some(
    (p) => url.toLowerCase().includes(p)
  );

/* ======================== 토큰 재발급 요청 ======================== */
async function requestNewAccessToken(): Promise<string> {
  if (!ENABLE_REFRESH) throw new Error("Token refresh disabled");
  const res = await axios.post<{ accessToken: string }>(
    `${API_BASE_URL}${AUTH_ENDPOINTS.reissue}`,
    {},
    { withCredentials: true }
  );
  const token = (res.data as any)?.accessToken;
  if (!token) throw new Error("No accessToken in reissue");
  authToken.set(token);
  return token;
}

/* ======================== 동시 갱신 제어 ======================== */
let isRefreshing = false;
let waitQueue: {
  resolve: (t: string) => void;
  reject: (e: unknown) => void;
}[] = [];
const notifyQueue = (err: unknown | null, token?: string) => {
  waitQueue.forEach(({ resolve, reject }) =>
    err || !token ? reject(err) : resolve(token)
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
  let token = authToken.get();
  if (!shouldSkipAuth(config.url) && token) {
    if (ENABLE_REFRESH && isExpiredOrClose(token)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await requestNewAccessToken();
          notifyQueue(null, newToken);
          token = newToken;
        } catch (e) {
          notifyQueue(e);
          authToken.clear();
          throw e;
        } finally {
          isRefreshing = false;
        }
      } else {
        token = await new Promise((resolve, reject) =>
          waitQueue.push({ resolve, reject })
        );
      }
    }
    setHeader(config.headers as any, "Authorization", `Bearer ${token}`);
  }
  return config;
});

/* ======================== 응답 인터셉터 ======================== */
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError & { _redirect?: string }) => {
    const st = error.response?.status;
    const original = error.config as any;

    if (ENABLE_REFRESH && st === 401 && !original._retry) {
      original._retry = true;
      try {
        const token = await requestNewAccessToken();
        setHeader(original.headers, "Authorization", `Bearer ${token}`);
        return apiClient(original);
      } catch {
        authToken.clear();
      }
    }
    if (st === 403) return Promise.reject({ ...error, _redirect: "/403" });
    return Promise.reject(error);
  }
);

export function unwrap<T = unknown>(res: any): T {
  return (res?.data?.data ?? res?.data) as T;
}
export default apiClient;
