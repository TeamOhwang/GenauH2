
import apiClient, { AUTH_ENDPOINTS,unwrap } from "@/api/apiClient";
import type { RegionAvgPriceDTO } from "@/domain/maps/RegionAvgPriceDTO";
import type { RegionPriceDTO } from "@/domain/maps/RegionPriceDTO";


/** 1) 지역 평균가 DTO */
export async function fetchRegionAveragesDto(): Promise<RegionAvgPriceDTO[]> {
  const res = await apiClient.get(AUTH_ENDPOINTS.regionAverages);
  return unwrap<RegionAvgPriceDTO[]>(res) ?? [];
}

/** 2) 전체 스테이션 DTO */
export async function fetchAllStationsDto(): Promise<RegionPriceDTO[]> {
  const res = await apiClient.get(AUTH_ENDPOINTS.allStations);
  return unwrap<RegionPriceDTO[]>(res) ?? [];
}

/** 3) 지역별 스테이션 DTO (한글 지역명 필요: "서울") */
export async function fetchStationsByRegionDto(regionName: string): Promise<RegionPriceDTO[]> {
  const res = await apiClient.get(AUTH_ENDPOINTS.stationsByRegion, { params: { region: regionName } });
  return unwrap<RegionPriceDTO[]>(res) ?? [];
}
