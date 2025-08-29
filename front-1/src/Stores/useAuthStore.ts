// src/stores/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";   // ✅ 추가
import { jwtDecode } from "jwt-decode";
import { authToken } from "@/stores/authStorage";
import { AuthApi } from "@/api/authApi";

export type Role = "USER" | "SUPERVISOR" | null;

type JWTPayload = {
  sub?: string | number;    // 현재 토큰에선 이 값이 orgId
  role?: "USER" | "SUPERVISOR";
  roles?: string[];
  exp?: number;
  orgId?: number;           
  org_id?: number;          
  organizationId?: number;  
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

export const useAuthStore = create(
  persist<{
    role: Role;
    orgId: number | null;
    email: string | null;
    isInit: boolean;
    setRole: (r: Role) => void;
    setOrgId: (id: number | null) => void;
    setEmail: (e: string | null) => void;
    init: () => Promise<void>;
    logout: () => void;
  }>(
    (set) => ({
      role: decodeRole(authToken.get()),
      orgId: null,
      email: null,
      isInit: false,

      setRole: (r) => set({ role: r }),
      setOrgId: (id) => set({ orgId: id }),
      setEmail: (e) => set({ email: e }),

      // JWT payload에서 orgId, email 세팅
      init: async () => {
        const t = authToken.get();
        console.log("🔥 init 실행됨, 토큰:", t);

        let payload: JWTPayload | null = null;
        if (t) {
          try {
            payload = jwtDecode<JWTPayload>(t);
            console.log("🔥 JWT payload 확인:", payload);
          } catch {
            payload = null;
          }
        }

        set({
          role: decodeRole(t),
          orgId:
            payload?.sub !== undefined && !isNaN(Number(payload.sub))
              ? Number(payload.sub)
              : payload?.orgId ??
                (payload as any)?.org_id ??
                (payload as any)?.organizationId ??
                null,
          email: payload?.email ?? null,
          isInit: true,
        });
      },

      logout: () => {
        AuthApi.logoutAll();
        set({ role: null, orgId: null, email: null, isInit: true });
      },
    }),
    {
      name: "auth-storage", // ✅ localStorage에 저장될 key
    }
  )
);
