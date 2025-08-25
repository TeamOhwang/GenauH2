import apiClient, { unwrap } from "@/api/apiClient";
import type { Facility, FacilityKpi } from "@/domain/graph/facility";
import type { FacilityDTO, FacilityKpiDTO } from "@/domain/graph/facilityDTO";

const PATHS = {
  facilitiesByUser: (userId: number) => `/gh/users/${userId}/facilities`,
  facilityKpis: "/gh/hydrogen/aggregate",
} as const;

/** 유저 ID 기준 설비 목록 조회 */
export async function fetchFacilities(userId: number): Promise<Facility[]> {
  const res = await apiClient.get(PATHS.facilitiesByUser(userId));
  const dtos = unwrap<FacilityDTO[]>(res) ?? [];
  return dtos.map((dto) => ({ id: dto.id, name: dto.name }));
}

/** 설비 KPI 데이터 조회 */
export async function fetchFacilityKpis(params: {
  facilityIds: number[];
  startDate: string;
  endDate: string;
}): Promise<FacilityKpi[]> {
  const res = await apiClient.get(PATHS.facilityKpis, { params });
  const dtos = unwrap<FacilityKpiDTO[]>(res) ?? [];
  return dtos.map((dto) => ({
    facilityId: dto.facilityId,
    facilityName: dto.facilityName,
    productionKg: dto.productionKg,
    maxPredictedKg: dto.maxPredictedKg,
  }));
}
