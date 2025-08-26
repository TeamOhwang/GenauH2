import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { authToken } from "@/stores/authStorage";
import { AuthApi } from "@/api/authApi";

export type Role = "USER" | "SUPERVISOR" | null;

type JWTPayload = {
  role?: "USER" | "SUPERVISOR";
  roles?: string[];
  exp?: number;
  sub?: string | number;   
  userId?: number;         
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
  } catch {
  }
  return null;
};

export const useAuthStore = create<{
  role: Role;
  userId: number | null;
  email: string | null;
  isInit: boolean;
  setRole: (r: Role) => void;
  setUserId: (id: number | null) => void;
  setEmail: (e: string | null) => void;
  init: () => Promise<void>;
  logout: () => void;
}>((set) => ({
  role: decodeRole(authToken.get()),
  userId: null,
  email: null,
  isInit: false,

  setRole: (r) => set({ role: r }),
  setUserId: (id) => set({ userId: id }),
  setEmail: (e) => set({ email: e }),

  init: async () => {
    const t = authToken.get();
    set({ role: decodeRole(t), isInit: true });
  },

  logout: () => {
    AuthApi.logoutAll();
    set({ role: null, userId: null, email: null, isInit: true });
  },
}));
