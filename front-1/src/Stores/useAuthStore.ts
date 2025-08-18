// src/Stores/useAuthStore.ts
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
  isInit: boolean;
  init: () => void;                  // 앱/새로고침 시 1회
  loginWithToken: (t: string) => void;
  logout: () => void;
}>((set) => ({
  role: getRoleFrom(authToken.get()),
  isInit: false,
  init: () => set({ role: getRoleFrom(authToken.get()), isInit: true }),
  loginWithToken: (t) => {
    authToken.set(t);
    set({ role: getRoleFrom(t) });
  },
  // 로그아웃은 redirect 포함된 authToken.clear() 사용 권장
  logout: () => {
    authToken.clear();               // 토큰 삭제 + /login으로 이동
    set({ role: null, isInit: true });
  },
}));
