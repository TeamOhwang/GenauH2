
import apiClient, { unwrap } from "@/api/apiClient";
import type { RegionAvgPriceDTO } from "@/domain/maps/RegionAvgPriceDTO";
import type { RegionPriceDTO } from "@/domain/maps/RegionPriceDTO";

const PATHS = {
  regionAverages: "/trade/list",
  allStations: "/api/region-price",
  stationsByRegion: "/api/region-price/by-region",
} as const;

/** 1) 지역 평균가 DTO */
export async function fetchRegionAveragesDto(): Promise<RegionAvgPriceDTO[]> {
  const res = await apiClient.get(PATHS.regionAverages);
  return unwrap<RegionAvgPriceDTO[]>(res) ?? [];
}

/** 2) 전체 스테이션 DTO */
export async function fetchAllStationsDto(): Promise<RegionPriceDTO[]> {
  const res = await apiClient.get(PATHS.allStations);
  return unwrap<RegionPriceDTO[]>(res) ?? [];
}

/** 3) 지역별 스테이션 DTO (한글 지역명 필요: "서울") */
export async function fetchStationsByRegionDto(regionName: string): Promise<RegionPriceDTO[]> {
  const res = await apiClient.get(PATHS.stationsByRegion, { params: { region: regionName } });
  return unwrap<RegionPriceDTO[]>(res) ?? [];
}
