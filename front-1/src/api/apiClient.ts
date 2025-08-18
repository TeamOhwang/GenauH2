// src/api/apiClient.ts
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";

/* ------------------------ 1) 상수 & 타입 ------------------------ */
const API_BASE_URL: string =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:8089/api";

const ACCESS_TOKEN_KEY = "accessToken";
const LOGIN_PATH = "/login";
const EXP_MARGIN_SEC = 30; // 만료 30초 전부터 만료 간주

type ApiEnvelope<T> = { data: T };
type RefreshRes = ApiEnvelope<{ accessToken: string }>;
type JwtPayload = { exp?: number };

/* ------------------ 2) 토큰 저장소(메모리 + 로컬) ------------------ */
let accessToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const authToken = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null) {
    accessToken = token;
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
      else localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },
  clear() {
    this.set(null);
    if (typeof window !== "undefined") window.location.replace(LOGIN_PATH);
  },
};

/* ------------------------ 3) JWT 유틸 ------------------------ */
function base64UrlToBase64(input: string): string {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
}

function decodeJwt(token?: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(base64UrlToBase64(payload));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpiredOrClose(token: string | null, marginSec = EXP_MARGIN_SEC): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + marginSec;
}

/* ------------------ 4) 재발급 (전역 axios 사용) ------------------ */
async function requestNewAccessToken(): Promise<string> {
  const res = await axios.post<RefreshRes>(`${API_BASE_URL}/reissue`, {}, { withCredentials: true });
  const newToken = res.data?.data?.accessToken;
  if (!newToken) throw new Error("No accessToken in reissue response");
  authToken.set(newToken);
  return newToken;
}

/* ------------- 5) 동시 재발급 1회 보장(대기열 큐) ------------- */
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

/* -------- 6) headers 도우미 (AxiosHeaders/Plain 객체 모두 지원) -------- */
function setHeader(h: any, key: string, value?: string) {
  if (!h) return;
  if (typeof h.set === "function") {
    h.set(key, value as any); // AxiosHeaders
  } else if (value === undefined) {
    delete (h as Record<string, any>)[key];
  } else {
    (h as Record<string, any>)[key] = value;
  }
}

/* -------------------- 7) Axios 인스턴스 -------------------- */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true, // Refresh 쿠키 포함
});

/* ------------- 8) 요청 인터셉터 (사전 재발급 + 헤더 부착) ------------- */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // FormData 업로드 시 Content-Type 강제 제거(브라우저가 설정하도록)
    if (config.data instanceof FormData && config.headers) {
      setHeader(config.headers, "Content-Type", undefined as unknown as string);
    }

    let token = authToken.get();

    // 만료(또는 임박) 시 재발급
    if (token && isExpiredOrClose(token)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await requestNewAccessToken();
          notifyQueue(null, newToken);
          token = newToken;
        } catch (e) {
          notifyQueue(e, undefined);
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
      config.headers = config.headers ?? {};
      setHeader(config.headers, "Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/* --------- 9) 응답 인터셉터 (401 시 1회 사후 재발급 후 재시도) --------- */
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
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
        original.headers = original.headers ?? {};
        if (latest) setHeader(original.headers, "Authorization", `Bearer ${latest}`);

        return apiClient(original);
      } catch (e) {
        notifyQueue(e, undefined);
        authToken.clear(); // 재발급 자체 실패 → 로그아웃
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

/* ----------------------- 10) (선택) 헬퍼 ----------------------- */
// 서버가 { data: T }로 주면 언래핑, 아니면 원본 반환
export async function getD<T = unknown>(url: string, config?: AxiosRequestConfig) {
  const res = await apiClient.get(url, config);
  return ((res.data as ApiEnvelope<T>)?.data ?? res.data) as T;
}
export async function postD<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const res = await apiClient.post(url, body, config);
  return ((res.data as ApiEnvelope<T>)?.data ?? res.data) as T;
}
