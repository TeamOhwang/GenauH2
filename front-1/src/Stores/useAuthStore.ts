
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { authToken, ACCESS_TOKEN_KEY } from "@/stores/authStorage";
import { AuthApi } from "@/api/authApi";

export type Role = "USER" | "ADMIN" | null;
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

// BroadcastChannel 준비
const hasBC =
  typeof window !== "undefined" &&
  typeof (window as any).BroadcastChannel !== "undefined";
const AUTH_CH: BroadcastChannel | null = hasBC ? new BroadcastChannel("auth") : null;

let listenersBound = false;
let initInFlight: Promise<void> | null = null;

type AuthState = {
  role: Role;
  isInit: boolean;
  setRole: (r: Role) => void;
  init: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  role: decodeRole(authToken.get()),
  isInit: false,

  setRole: (r) => set({ role: r }),

  init: async () => {
    if (initInFlight) {
      await initInFlight;
      return;
    }

    // 리스너 1회성 바인딩
    if (!listenersBound) {
      listenersBound = true;
      if (typeof window !== "undefined") {
        window.addEventListener("storage", (e) => {
          if (e.key === ACCESS_TOKEN_KEY) set({ role: decodeRole(e.newValue) });
        });
      }
      AUTH_CH?.addEventListener("message", (e: MessageEvent) => {
        const { type, token } = (e.data ?? {}) as {
          type?: string;
          token?: string | null;
        };
        if (type === "SET") set({ role: decodeRole(token ?? null) });
        if (type === "LOGOUT") set({ role: null });
      });
    }

    initInFlight = (async () => {
      const t = authToken.get();
      if (!get().role && t) {
        try {
          const role = await AuthApi.syncRole();
          set({ role });
        } catch {
          set({ role: null });
        }
      }
      set({ isInit: true });
    })();

    try {
      await initInFlight;
    } finally {
      initInFlight = null;
    }
  },

  logout: () => {
    AuthApi.logoutAll().catch(() => {});
    set({ role: null, isInit: true });
  },
}));
