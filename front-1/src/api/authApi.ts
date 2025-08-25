
import apiClient, { AUTH_ENDPOINTS, unwrap } from "@/api/apiClient";
import { authToken } from "@/stores/authStorage";

/** 공개 타입 */
export type Role = "ADMIN" | "USER";
export type LoginReq = { email: string; password: string };

/** 토큰 정규화 */
const extractBearer = (raw: string) => raw.replace(/^Bearer\s+/i, "").trim();

/** 서버 role → 앱 Role 매핑 (런타임/타입 안전) */
const ROLE_MAP = {
  ADMIN: "ADMIN",
  SUPERVISOR: "ADMIN", // 서버 SUPERVISOR → 앱 ADMIN
  USER: "USER",
} as const;
type ServerRoleKey = keyof typeof ROLE_MAP;
const mapServerRole = (serverRole: unknown): Role | null => {
  if (typeof serverRole !== "string") return null;
  const key = serverRole.toUpperCase().trim() as ServerRoleKey;
  return key in ROLE_MAP ? ROLE_MAP[key] : null;
};

/** 프로필 정규화 타입 */
export type Profile = {
  userId?: number;
  orgId?: number;
  role?: string;     // 서버의 생 문자열 ("USER" | "SUPERVISOR" | "ADMIN")
  email?: string;
};

export const AuthApi = {
  /** 순수 API 호출 --------------------------------------- */
  async login(body: LoginReq): Promise<string> {
    type LoginOk =
      | string
      | { accessToken?: string; token?: string; Authorization?: string };

    const res = await apiClient.post(AUTH_ENDPOINTS.login, body);
    const u = unwrap<LoginOk>(res);

    const raw =
      typeof u === "string" ? u : u?.accessToken ?? u?.token ?? u?.Authorization;

    const token = raw ? extractBearer(raw) : null;
    if (!token) throw new Error("로그인 응답에 토큰이 없습니다.");
    return token;
  },

  async logout(): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.logout, {});
  },

  /**  프로필: { success, data } 래핑/비래핑 모두 안전 파싱 */
  async profile(): Promise<Profile> {
    const res = await apiClient.get(AUTH_ENDPOINTS.profile);

    // 서버 표준: { success, data: {...} }
    const wrapped = unwrap<{ success?: boolean; data?: any }>(res);
    const d = wrapped?.data ?? wrapped; // 혹시 래핑이 없다면 본문 자체를 사용

    return {
      userId: d?.userId ?? d?.user?.userId,
      orgId:  d?.orgId  ?? d?.user?.orgId,
      role:   typeof d?.role === "string" ? d.role : d?.role?.toString?.(),
      email:  d?.email ?? d?.user?.email,
    };
  },

  /** 편의 메서드 ----------------------------------------- */
  async loginAndSyncRole(payload: LoginReq): Promise<Role | null> {
    const token = await AuthApi.login(payload);
    authToken.set(token);
    const prof = await AuthApi.profile();
    return mapServerRole(prof.role);
  },

  async syncRole(): Promise<Role | null> {
    const prof = await AuthApi.profile();
    return mapServerRole(prof.role);
  },

  async logoutAll(): Promise<void> {
    try {
      await AuthApi.logout();
    } finally {
      authToken.clear();
    }
  },
} as const;
