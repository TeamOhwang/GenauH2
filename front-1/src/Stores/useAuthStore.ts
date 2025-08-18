

import { create } from "zustand";
import { authToken } from "@/api/apiClient"; 
import { jwtDecode } from "jwt-decode";

type Role = "USER" | "ADMIN" | null;
type JWTPayload = { role?: "USER" | "ADMIN"; roles?: string[] };

const getRoleFrom = (t: string | null): Role => {
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

export const useAuthStore = create<{
  role: Role;
  init: () => void;                 // 새로고침/앱시작 시 1회 동기화
  loginWithToken: (t: string) => void;
  logout: () => void;
}>((set) => ({
  role: getRoleFrom(authToken.get()),
  init: () => set({ role: getRoleFrom(authToken.get()) }),
  loginWithToken: (t) => { authToken.set(t); set({ role: getRoleFrom(t) }); },
  logout: () => { authToken.set(null); set({ role: null }); },
}));
