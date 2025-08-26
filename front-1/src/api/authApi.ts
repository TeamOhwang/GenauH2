import apiClient, { AUTH_ENDPOINTS, unwrap } from "@/api/apiClient";
import { authToken } from "@/stores/authStorage";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

/** 공개 타입 */
export type Role = "SUPERVISOR" | "USER";
export type LoginReq = { email: string; password: string };

/** 시설 등록 요청 DTO */
export type FacilityReq = {
  name: string;                  // 시설명
  location: string;              // 설치 위치 (주소 or 좌표)
  modelNo: string;               // 모델 번호
  cellCount: string;             // 셀 수 (숫자형)
  ratedPowerKw: string;          // 정격 출력 (kW)
  ratedOutputKgH: string;        // 정격 수소 생산량 (kg/h)
  secNominalKwhPerKg: string;    // SEC (kWh/kg)
  catalystInstallDate: string;   // 촉매 설치일 (YYYY-MM-DD)
};

/** 회원가입 + 시설 등록 요청 DTO */
export type RegisterReq = {
  orgName: string;        // 회사명
  ownerName: string;      // 대표자명
  bizRegNo: string;       // 사업자 등록번호 (하이픈 제거 문자열)
  email: string;          // 이메일
  rawPassword: string;    // 비밀번호 (서버에서 암호화 예정)
  phoneNum: string;       // 전화번호 (숫자 문자열, '-' 제거 추천)
  facilities: FacilityReq[];
};

export const AuthApi = {
  async login(body: LoginReq): Promise<string> {
    const res = await apiClient.post(AUTH_ENDPOINTS.login, body);
    const data = unwrap<any>(res);
    const token = data.token ?? data.accessToken ?? data.Authorization;
    if (!token) throw new Error("로그인 응답에 토큰 없음");
    return token;
  },

  async profile() {
    const res = await apiClient.get(AUTH_ENDPOINTS.profile);
    return unwrap<any>(res);
  },

async register(body: RegisterReq): Promise<any> {
  const res = await apiClient.post(AUTH_ENDPOINTS.register, body);
  return unwrap<any>(res);
},

  async logout() {
    await apiClient.post(AUTH_ENDPOINTS.logout, {});
  },

  async loginAndSyncRole(payload: LoginReq): Promise<Role | null> {
    const token = await this.login(payload);
    authToken.set(token);
    const prof = await this.profile();
    const { setEmail, setOrgId, setRole } = useAuthStore.getState();
    setEmail(prof.email ?? null);
    setOrgId(prof.userId ?? null);
    setRole(prof.role ?? null);
    return prof.role ?? null;
  },

  async syncRole(): Promise<Role | null> {
    const prof = await this.profile();
    const { setEmail, setOrgId, setRole } = useAuthStore.getState();
    setEmail(prof.email ?? null);
    setOrgId(prof.userId ?? null);
    setRole(prof.role ?? null);
    return prof.role ?? null;
  },

  async logoutAll() {
    try {
      await this.logout();
    } finally {
      authToken.clear();
      const { setEmail, setOrgId, setRole } = useAuthStore.getState();
      setEmail(null);
      setOrgId(null);
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
