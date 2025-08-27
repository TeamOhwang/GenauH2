import apiClient, { AUTH_ENDPOINTS, unwrap } from "@/api/apiClient";

export type FacilityReq = {
  facId: number;
  orgId: number;
  name: string;
  type: "PEM" | "ALK" | "SOEC";
  maker?: string;
  model?: string;
  powerKw: string;
  h2Rate: string;
  specKwh: string;
  purity?: string;
  pressure?: string;
  location?: string;
  install?: string;   // YYYY-MM-DD
  created?: string;   // ISO datetime
};


export const FacilityApi = {
  /** orgId 기준 설비 조회 */
  async listByOrg(orgId: number): Promise<FacilityReq[]> {
    const res = await apiClient.get(AUTH_ENDPOINTS.list, { params: { orgId } });
    return unwrap<FacilityReq[]>(res) ?? [];
  },
}