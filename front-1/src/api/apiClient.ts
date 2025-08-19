// src/api/apiClient.ts
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";



// - 토큰 자동 첨부 (Authorization 헤더)
// - 토큰 만료 시 자동 재발급
// - 401 에러 시 자동 재시도
// - 쿠키 기반 리프레시 토큰 관리
/* ------------------------ 상수 & 타입 ------------------------ */
const API_BASE_URL: string =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:8088/gh";

const ACCESS_TOKEN_KEY = "accessToken";
const LOGIN_PATH = "/login";
const EXP_MARGIN_SEC = 30; // 만료 30초 전부터 만료 간주

export type ApiEnvelope<T> = { data: T };
type RefreshRes = ApiEnvelope<{ accessToken: string }>;
type JwtPayload = { exp?: number };

/* ------------------ 토큰 저장소 (메모리 + 로컬) ------------------ */
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

/* -------------------- JWT 유틸 -------------------- */
function base64UrlToBase64(input: string): string {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
}

function decodeJwt(token?: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split(".", 2);
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

/* ------------------ 인증 제외 엔드포인트 ------------------ */
function shouldSkipAuth(url?: string | null): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes("/user/login") || u.includes("/user/logout") || u.includes("/reissue");
}

/* ------------------ 재발급 (전역 axios 사용) ------------------ */
async function requestNewAccessToken(): Promise<string> {
  // 전역 axios 사용(자기 인스턴스 인터셉터 루프 방지)
  const res = await axios.post<RefreshRes>(`${API_BASE_URL}/reissue`, {}, { withCredentials: true });
  const newToken = res.data?.data?.accessToken;
  if (!newToken) throw new Error("No accessToken in reissue response");
  authToken.set(newToken);
  return newToken;
}

/* ------------- 동시 재발급 1회 보장(대기열 큐) ------------- */
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

/* -------- headers 도우미 (AxiosHeaders/Plain 모두 지원) -------- */
function setHeader(h: any, key: string, value?: string) {
  if (!h) return;

  // 삭제
  if (value === undefined) {
    if (typeof h.delete === "function") h.delete(key);
    else delete (h as Record<string, any>)[key];
    return;
  }

  // 설정
  if (typeof h.set === "function") h.set(key, value);
  else (h as Record<string, any>)[key] = value;
}

/* -------------------- Axios 인스턴스 -------------------- */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true, // Refresh 쿠키 자동 포함
});

/* ------------- 요청 인터셉터 (사전 재발급 + 헤더 부착) ------------- */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData && config.headers) {
      setHeader(config.headers, "Content-Type"); // 값 생략 = 삭제
    }

    // 인증 스킵 대상은 바로 통과
    if (shouldSkipAuth(config.url)) return config;

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
          authToken.clear(); // 요청 단계 실패도 동일 UX 처리
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

/* --------- 응답 인터셉터 (401 시 1회 사후 재발급 후 재시도) --------- */
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

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
        original.headers = original.headers ?? {};
        if (latest) setHeader(original.headers, "Authorization", `Bearer ${latest}`);

        return apiClient(original);
      } catch (e) {
        notifyQueue(e, undefined);
        authToken.clear(); // 재발급 실패 → 로그아웃
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

/* ----------------------- 공용 헬퍼 ----------------------- */
// 서버가 { data: T }면 언래핑, 아니면 원본 반환
export async function getD<T = unknown>(url: string, config?: AxiosRequestConfig) {
  const res = await apiClient.get(url, config);
  return ((res.data as ApiEnvelope<T>)?.data ?? res.data) as T;
}
export async function postD<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const res = await apiClient.post(url, body, config);
  return ((res.data as ApiEnvelope<T>)?.data ?? res.data) as T;
}
