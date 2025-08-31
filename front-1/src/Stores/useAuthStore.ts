import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { authToken } from "@/stores/authStorage";

export type Role = "USER" | "SUPERVISOR" | null;

type JWTPayload = {
  sub?: string | number;    // 현재 토큰에선 이 값이 orgId
  role?: "USER" | "SUPERVISOR";
  roles?: string[];
  exp?: number;
  orgId?: number;           // orgId
  org_id?: number;          // 대체용 orgId 필드
  organizationId?: number;  // 대체용 organizationId 필드
  email?: string;           // 이메일
  orgName?: string;         // 조직명
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
  } catch (e) {
    console.error("JWT 디코딩 실패:", e);
  }
  return null;
};

export const useAuthStore = create(
  persist<{
    role: Role;
    orgId: number | null;
    orgName: string | null;  // orgName을 상태에 추가
    email: string | null;
    isInit: boolean;
    setRole: (r: Role) => void;
    setOrgId: (id: number | null) => void;
    setOrgName: (n: string | null) => void;  // setOrgName 함수 추가
    setEmail: (e: string | null) => void;
    init: () => Promise<void>;
    logout: () => void;
  }>(
    (set) => ({
      role: decodeRole(authToken.get()), // 초기값으로 JWT에서 role 파싱
      orgId: null,
      orgName: null,  // 초기값 설정
      email: null,
      isInit: false,

      setRole: (r) => set({ role: r }),
      setOrgId: (id) => set({ orgId: id }),
      setOrgName: (n) => set({ orgName: n }),  // setOrgName 함수 정의
      setEmail: (e) => set({ email: e }),

      // JWT payload에서 orgId, orgName, email 세팅
      init: async () => {
        const t = authToken.get(); // 토큰 가져오기
        console.log("로컬 스토리지에서 가져온 토큰:", t); // 로컬 스토리지에서 토큰 확인

        let payload: JWTPayload | null = null;
        if (t) {
          try {
            payload = jwtDecode<JWTPayload>(t); // JWT 디코딩
            console.log("디코딩된 JWT payload:", payload); // 디코딩된 payload 확인
          } catch (e) {
            console.error("JWT 디코딩 실패:", e); // 디코딩 실패 시 오류 메시지 출력
            payload = null;
          }
        }

        set({
          role: decodeRole(t), // JWT로 role 설정
          orgId:
            payload?.sub !== undefined && !isNaN(Number(payload.sub))
              ? Number(payload.sub)
              : payload?.orgId ?? payload?.org_id ?? payload?.organizationId ?? null, // orgId 설정
          orgName: payload?.orgName ?? null,  // orgName 설정
          email: payload?.email ?? null, // email 설정
          isInit: true, // 초기화 완료
        });
      },

      logout: () => {
        authToken.clear(); // 로컬 스토리지에서 토큰 제거
        set({ role: null, orgId: null, orgName: null, email: null, isInit: true }); // 상태 초기화
      },
    }),
    {
      name: "auth-storage", // localStorage에 저장될 key
    }
  )
);
