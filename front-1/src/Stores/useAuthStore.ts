import { create } from "zustand";
import apiClient, {
  authToken,
  API_BASE_URL,
  ACCESS_TOKEN_KEY,
  PATHS,
} from "@/api/apiClient";
import { jwtDecode } from "jwt-decode";

type Role = "USER" | "ADMIN" | null;
type JWTPayload = { role?: "USER" | "ADMIN"; roles?: string[]; exp?: number };

const EXP_MARGIN_SEC = 30;

const decodeRole = (t: string | null): Role => {
  if (!t) return null;
  try {
    const p = jwtDecode<JWTPayload>(t);
    if (p.role === "ADMIN" || p.role === "USER") return p.role;
    if (Array.isArray(p.roles)) {
      if (p.roles.includes("ADMIN")) return "ADMIN";
      if (p.roles.includes("USER")) return "USER";
    }
  } catch {}
  return null;
};

const isExpiredOrClose = (t: string | null, marginSec = EXP_MARGIN_SEC): boolean => {
  if (!t) return true;
  try {
    const exp = jwtDecode<JWTPayload>(t)?.exp;
    if (!exp || !Number.isFinite(exp)) return true;
    const now = Math.floor(Date.now() / 1000);
    return exp <= now + marginSec;
  } catch {
    return true;
  }
};

const hasBC =
  typeof window !== "undefined" && typeof (window as any).BroadcastChannel !== "undefined";
const AUTH_CH: BroadcastChannel | null = hasBC ? new BroadcastChannel("auth") : null;

/** StrictMode 대비: 리스너 1회만 바인딩, init 중복 호출 병합 */
let __authListenersBound = false;
let __initInFlight: Promise<void> | null = null;

export const useAuthStore = create<{
  role: Role;
  isInit: boolean;
  init: () => Promise<void>;
  loginWithToken: (t: string) => void;
  logout: () => void;
}>()((set, get) => ({
  role: decodeRole(authToken.get()),
  isInit: false,

  init: async () => {
    if (__initInFlight) {
      await __initInFlight;
      return;
    }

    if (!__authListenersBound) {
      __authListenersBound = true;

      if (typeof window !== "undefined") {
        window.addEventListener("storage", (e) => {
          if (e.key === ACCESS_TOKEN_KEY) {
            set({ role: decodeRole(e.newValue) });
          }
        });
      }

      AUTH_CH?.addEventListener("message", (e: MessageEvent) => {
        const { type, token } =
          (e.data ?? {}) as { type?: string; token?: string | null };
        if (type === "SET") set({ role: decodeRole(token ?? null) });
        if (type === "LOGOUT") set({ role: null });
      });
    }

    __initInFlight = (async () => {
      let t = authToken.get();

      // 토큰 없거나 만료 임박 → 쿠키 기반 /reissue (절대 URL)
      if (!t || isExpiredOrClose(t)) {
        try {
          const res = await apiClient.post(`${API_BASE_URL}${PATHS.reissue}`, {});
          const newToken =
            (res as any)?.data?.data?.accessToken ?? (res as any)?.data?.accessToken;
          if (typeof newToken === "string" && newToken.length > 0) {
            authToken.set(newToken);
            t = newToken;
          }
        } catch {
          // 재발급 실패 → 로그인 필요 상태 유지
        }
      }

      set({ role: decodeRole(t), isInit: true });
    })();

    try {
      await __initInFlight;
    } finally {
      __initInFlight = null;
    }
  },

  loginWithToken: (t) => {
    authToken.set(t);
    set({ role: decodeRole(t) });
  },

  logout: () => {
    authToken.clear(); // location.replace("/login")
    set({ role: null, isInit: true });
  },
}));
