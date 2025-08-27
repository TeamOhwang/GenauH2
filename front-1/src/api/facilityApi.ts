import apiClient, { AUTH_ENDPOINTS, unwrap } from "@/api/apiClient";

export type FacilityReq = {
  facId :number;
  plantId:number;
  ts: string;                 // 타임스탬프 (ISO: YYYY-MM-DDTHH:mm:ss)
  predictedMaxKg: string;     // 예측 최대 수소 생산량 (kg)
  predictedCurrentKg: string; // 예측 현재 수소 생산량 (kg)
  facilityName: string;       // 설비명
};


export const FacilityApi = {
  async listByOrg(orgId: number): Promise<FacilityReq[]> {
    const res = await apiClient.get(AUTH_ENDPOINTS.predictAll, { params: { orgId } });
    const data = res.data.map((item: any) => ({
      facId: item.facid,
      plantId: item.plantId,
      facilityName: item.facilityName,
      predictedMaxKg: item.predictedmaxkg,
      predictedCurrentKg: item.predictedcurrentkg,
      ts: item.ts,
    }));

    console.log("필드만 추출:", data);

    return data;
  },
};
