import apiClient, { AUTH_ENDPOINTS, unwrap } from "@/api/apiClient";

export type FacilityReq = {
  orgId: number;               // 사업자 ID
  facId: number;               // 설비 ID
  facilityName: string;        // 설비 이름
  ts: string;                  // ISO 날짜 문자열 (백엔드 LocalDateTime → JSON 문자열)
  totalMaxKg: number;          // 시간당 최대생산량 합계
  totalCurrentKg: number;      // 시간당 실제생산량 합계
  cumulativeMax: number;       // 누적 최대생산량
  cumulativeCurrent: number;   // 누적 실제생산량
};


export const FacilityApi = {
  async listByOrg(orgId: number): Promise<FacilityReq[]> {
    const res = await apiClient.get(AUTH_ENDPOINTS.predictAll, { params: { orgId } });
    const raw = unwrap<any[]>(res) ?? []; 

    return raw.map((item) => ({
      orgId: item.orgId,
      facId: item.facId,
      facilityName: item.facilityName,      
      ts: item.ts,
      totalMaxKg: Number(item.totalMaxKg),  
      totalCurrentKg: Number(item.totalCurrentKg), 
      cumulativeMax: Number(item.cumulativeMax),
      cumulativeCurrent: Number(item.cumulativeCurrent),
    }));
  },
};
