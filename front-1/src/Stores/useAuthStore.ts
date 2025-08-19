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
  return null; // 실제론 JWT에 role이 없으므로 대부분 null
};

// 서버 역할 → 프론트 역할 매핑
const mapServerRole = (serverRole?: string): "ADMIN" | "USER" | null => {
  if (!serverRole) return null;
  return serverRole.toUpperCase() === "SUPERVISOR" ? "ADMIN" : "USER";
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

let __authListenersBound = false;
let __initInFlight: Promise<void> | null = null;

export const useAuthStore = create<{
  role: Role;
  isInit: boolean;
  init: () => Promise<void>;
  syncRoleFromServer: () => Promise<void>; // ← 추가
  loginWithToken: (t: string) => void;
  logout: () => void;
}>()((set, get) => ({
  role: decodeRole(authToken.get()),
  isInit: false,

  // 서버에서 역할 조회해서 세팅
  syncRoleFromServer: async () => {
    const token = authToken.get();
    if (!token) { set({ role: null }); return; }
    try {
      const res = await apiClient.get(`${API_BASE_URL}/user/profile`);
      // { success, data: { role: "SUPERVISOR" | "USER", ... } }
      const serverRole: string | undefined =
        (res as any)?.data?.data?.role ?? (res as any)?.data?.role;
      set({ role: mapServerRole(serverRole) });
    } catch {
      set({ role: null });
    }
  },

  init: async () => {
    if (__initInFlight) {
      await __initInFlight; return;
    }

    if (!__authListenersBound) {
      __authListenersBound = true;
      if (typeof window !== "undefined") {
        window.addEventListener("storage", (e) => {
          if (e.key === ACCESS_TOKEN_KEY) {
            set({ role: decodeRole(e.newValue) }); // 토큰 변경 시 우선 업데이트
          }
        });
      }
      AUTH_CH?.addEventListener("message", (e: MessageEvent) => {
        const { type, token } = (e.data ?? {}) as { type?: string; token?: string | null };
        if (type === "SET") set({ role: decodeRole(token ?? null) });
        if (type === "LOGOUT") set({ role: null });
      });
    }

    __initInFlight = (async () => {
      const t = authToken.get();
      // 리프레시 비활성화 환경이므로 재발급 호출은 생략(또는 실패 용인)
      // decodeRole만으로는 null이므로 서버에 한 번 더 물어봄
      if (!get().role && t) {
        await get().syncRoleFromServer();
      }
      set({ isInit: true });
    })();

    try { await __initInFlight; } finally { __initInFlight = null; }
  },

  loginWithToken: (t) => {
    authToken.set(t);
    set({ role: decodeRole(t) });
  },

  logout: () => {
    authToken.clear();
    set({ role: null, isInit: true });
  },
}));
