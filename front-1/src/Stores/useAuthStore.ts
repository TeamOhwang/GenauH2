import { create } from "zustand";
import {jwtDecode} from "jwt-decode";
import { authToken, ACCESS_TOKEN_KEY } from "@/Stores/authStorage";
import { AuthApi } from "@/api/authApi";

export type Role = "USER" | "SUPERVISOR" | null;

type JWTPayload = {
  role?: "USER" | "SUPERVISOR";
  roles?: string[];
  exp?: number;
  sub?: string | number;   // 보통 userId는 sub에 들어옴
  userId?: number;         // 서버가 커스텀 claim으로 넣을 수도 있음
  email?: string;          
};

// JWT에서 role 파싱
const decodeRole = (t: string | null): Role => {
  if (!t) return null;
  try {
    const p = jwtDecode<JWTPayload>(t);
    if (p.role === "SUPERVISOR" || p.role === "USER") return p.role;
    if (Array.isArray(p.roles)) {
      if (p.roles.includes("SUPERVISOR")) return "SUPERVISOR";
      if (p.roles.includes("USER")) return "USER";
    }
  } catch {}
  return null;
};

// JWT에서 userId 파싱
const decodeUserId = (t: string | null): number | null => {
  if (!t) return null;
  try {
    const p = jwtDecode<JWTPayload>(t);
    if (typeof p.userId === "number") return p.userId;
    if (typeof p.sub === "number") return p.sub;
    if (typeof p.sub === "string" && !isNaN(Number(p.sub))) return Number(p.sub);
  } catch {}
  return null;
};

// JWT에서 email 파싱
const decodeEmail = (t: string | null): string | null => {
  if (!t) return null;
  try {
    const p = jwtDecode<JWTPayload>(t);
    return p.email ?? null;
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
  userId: number | null;
  email: string | null;  
  isInit: boolean;
  setRole: (r: Role) => void;
  setUserId: (id: number | null) => void;
  setEmail: (e: string | null) => void;
  init: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  role: decodeRole(authToken.get()),
  userId: decodeUserId(authToken.get()),
  email: decodeEmail(authToken.get()),
  isInit: false,

  setRole: (r) => {
    // console.log("=== useAuthStore Role 설정 ===");
    // console.log("이전 role:", get().role);
    // console.log("새로운 role:", r);
    set({ role: r });
    // console.log("✅ Role 설정 완료:", r);
    // console.log("=============================");
  },
  setUserId: (id) => set({ userId: id }),
  setEmail: (e) => set({ email: e }),

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
          if (e.key === ACCESS_TOKEN_KEY) {
            const token = e.newValue;
            set({ 
              role: decodeRole(token), 
              userId: decodeUserId(token),
              email: decodeEmail(token), 
            });
          }
        });
      }
      AUTH_CH?.addEventListener("message", (e: MessageEvent) => {
        const { type, token } = (e.data ?? {}) as {
          type?: string;
          token?: string | null;
        };
        if (type === "SET")
          set({ 
            role: decodeRole(token ?? null), 
            userId: decodeUserId(token ?? null),
            email: decodeEmail(token ?? null),  
          });
        if (type === "LOGOUT") set({ role: null, userId: null, email: null }); 
      });
    }

    initInFlight = (async () => {
      const t = authToken.get();
      // 항상 토큰에서 role/userId/email 세팅
      set({ 
        role: decodeRole(t), 
        userId: decodeUserId(t),
        email: decodeEmail(t),   
        isInit: true 
      });
    })();

    try {
      await initInFlight;
    } finally {
      initInFlight = null;
    }
  },

  logout: () => {
    AuthApi.logoutAll().catch(() => {});
    set({ role: null, userId: null, email: null, isInit: true });
  },
}));
