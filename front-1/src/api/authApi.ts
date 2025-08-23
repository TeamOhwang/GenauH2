// src/api/authApi.ts
import apiClient, { AUTH_ENDPOINTS, unwrap } from "@/api/apiClient";
import { authToken } from "@/stores/authStorage";

/** 외부로 노출할 타입 */
export type Role = "ADMIN" | "USER";
export type LoginReq = { email: string; password: string };

/** 내부 헬퍼: Bearer 정규화 */
const normalizeToken = (t: unknown): string | null => {
  if (!t) return null;
  const s = String(t).trim();
  return s ? s.replace(/^Bearer\s+/i, "") : null;
};

/** 서버 role → 앱 Role 매핑 (확장 가능) */
const mapServerRole = (serverRole?: string): Role | null => {
  const r = (serverRole ?? "").toUpperCase();
  if (r === "ADMIN" || r === "SUPERVISOR") return "ADMIN";
  if (r === "USER") return "USER";
  return null;
};

export const AuthApi = {
  /** 순수 API 호출들 ------------------------------------------------------- */
  async login(body: LoginReq): Promise<string> {
    const res = await apiClient.post(AUTH_ENDPOINTS.login, body);
    const u = unwrap<any>(res);
    const raw = typeof u === "string" ? u : u?.accessToken ?? u?.token;
    const token = normalizeToken(raw);
    if (!token) throw new Error("토큰이 없습니다.");
    return token;
  },

  async logout(): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.logout, {});
  },

  async profile(): Promise<{ role?: string }> {
    const res = await apiClient.get(AUTH_ENDPOINTS.profile);
    return unwrap<{ role?: string }>(res) ?? {};
  },

  /** 서비스 편의 메서드들 --------------------------------------------------- */
  /**
   * 로그인 후 토큰 저장 + 프로필 조회로 Role 동기화
   */
  async loginAndSyncRole(payload: LoginReq): Promise<Role | null> {
    const token = await this.login(payload);
    authToken.set(token);
    const prof = await this.profile();
    return mapServerRole(prof.role);
  },

  /**
   * 현재 세션 기준 Role 동기화
   */
  async syncRole(): Promise<Role | null> {
    const prof = await this.profile();
    return mapServerRole(prof.role);
  },

  /**
   * 서버 로그아웃 시도 후 로컬 토큰 정리
   */
  async logoutAll(): Promise<void> {
    try {
      await this.logout();
    } finally {
      authToken.clear();
    }
  },
} as const;
