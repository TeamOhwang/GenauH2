import apiClient, { AUTH_ENDPOINTS, unwrap } from "@/api/apiClient";
import { authToken } from "@/stores/authStorage";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

/** 공개 타입 */
export type Role = "ADMIN" | "USER";
export type LoginReq = { email: string; password: string };

// 회원가입 Request 타입
export type FacilityReq = {
  name: string;
  location: string;
  modelNo: string;
  cellCount: string;
  ratedPowerKw: string;
  ratedOutputKgH: string;
  secNominalKwhPerKg: string;
  catalystInstallDate: string;
};
export type SignupReq = {
  email: string;
  password: string;
  company: string;
  ceoName: string;
  bizRegNo: string;
  orgId?: string;        // 자동 연동
  facilities: FacilityReq[];
};

export const AuthApi = {
  /** 로그인 */
  async login(body: LoginReq): Promise<string> {
    type LoginOk = string | { accessToken?: string; token?: string; Authorization?: string };
    const res = await apiClient.post(AUTH_ENDPOINTS.login, body);
    const u = unwrap<LoginOk>(res);

    const raw =
      typeof u === "string" ? u : u?.accessToken ?? u?.token ?? u?.Authorization;
    if (!raw) throw new Error("로그인 응답에 토큰이 없습니다.");
    const token = raw.replace(/^Bearer\s+/i, "").trim();
    return token;
  },

  /** 로그아웃 */
  async logout(): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.logout, {});
  },

  /** 회원가입 */
  async signup(body: SignupReq): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.signup, body);
  },

  /** 프로필 조회 */
  async profile() {
    const res = await apiClient.get(AUTH_ENDPOINTS.profile);
    return unwrap<any>(res);
  },

  /** 편의 메서드 */
  async loginAndSyncRole(payload: LoginReq): Promise<Role | null> {
    const token = await AuthApi.login(payload);
    authToken.set(token);

    const prof = await AuthApi.profile();
    const { setEmail, setUserId, setRole } = useAuthStore.getState();
    setEmail(prof.email ?? null);
    setUserId(prof.userId ?? null);
    setRole(prof.role ?? null);
    return prof.role ?? null;
  },

  async syncRole(): Promise<Role | null> {
    const prof = await AuthApi.profile();
    const { setEmail, setUserId, setRole } = useAuthStore.getState();
    setEmail(prof.email ?? null);
    setUserId(prof.userId ?? null);
    setRole(prof.role ?? null);
    return prof.role ?? null;
  },

  async logoutAll(): Promise<void> {
    try {
      await AuthApi.logout();
    } finally {
      authToken.clear();
      const { setEmail, setUserId, setRole } = useAuthStore.getState();
      setEmail(null);
      setUserId(null);
      setRole(null);
    }
  },

/** 사업자 번호 조회 (공공데이터 API 직통) */
async validateBiz(bizRegNo: string) {
  const API_KEY = import.meta.env.VITE_BIZ_API_KEY;
const url = `/cloud/nts-businessman/v1/status?serviceKey=${API_KEY}&returnType=JSON`;

  const cleanBizNo = bizRegNo.replace(/-/g, "").trim();

  const res = await axios.post(
    url,
    { b_no: [cleanBizNo] },
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: false,
    }
  );

  console.log("payload", { b_no: [cleanBizNo] });
  console.log("response", res.data);

  const valid = res.data?.data?.[0]?.valid === "01";
  return { valid, raw: res.data };
}


} as const;
