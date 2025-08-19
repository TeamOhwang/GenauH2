import { create } from "zustand";
import { authToken, ACCESS_TOKEN_KEY } from "@/api/apiClient";
import { jwtDecode } from "jwt-decode";
import * as authService from "@/api/authService";

type Role = "USER" | "ADMIN" | null;
type JWTPayload = { role?: "USER" | "ADMIN"; roles?: string[]; exp?: number };

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

const hasBC =
  typeof window !== "undefined" && typeof (window as any).BroadcastChannel !== "undefined";
const AUTH_CH: BroadcastChannel | null = hasBC ? new BroadcastChannel("auth") : null;

let __authListenersBound = false;
let __initInFlight: Promise<void> | null = null;

export const useAuthStore = create<{
  role: Role;
  isInit: boolean;
  init: () => Promise<void>;
  setRole: (r: Role) => void;
  logout: () => void;
}>()((set, get) => ({
  role: decodeRole(authToken.get()),
  isInit: false,

  setRole: (r) => set({ role: r }),

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
        const { type, token } = (e.data ?? {}) as { type?: string; token?: string | null };
        if (type === "SET") set({ role: decodeRole(token ?? null) });
        if (type === "LOGOUT") set({ role: null });
      });
    }

    __initInFlight = (async () => {
      const t = authToken.get();
      if (!get().role && t) {
        try {
          const role = await authService.syncRole();
          set({ role });
        } catch {
          set({ role: null });
        }
      }
      set({ isInit: true });
    })();

    try {
      await __initInFlight;
    } finally {
      __initInFlight = null;
    }
  },

  logout: () => {
    // 서버 로그아웃 시도 후 토큰/상태 정리
    authService.logoutAll().catch(() => {
      /* 서버 실패여도 클라이언트 정리는 진행 */
    });
    set({ role: null, isInit: true });
  },
}));
