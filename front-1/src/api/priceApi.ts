// src/api/priceApi.ts
import apiClient from "@/api/apiClient";
import {
  REGION_LABEL,
  type RegionCode,
  type RegionSummary,
  type Station,
} from "@/domain/maps/MapPriceTypes";
import type { RegionAvgPriceDTO } from "@/domain/maps/RegionAvgPriceDTO";
import type { RegionPriceDTO } from "@/domain/maps/RegionPriceDTO";
import { mapRegionAvgDtoToDomain, mapStationDtoToDomain } from "@/domain/maps/regionMappers";

const PATHS = {
  regionAverages: "/trade/list",
  allStations: "/api/region-price",
  stationsByRegion: "/api/region-price/by-region",
} as const;

/** 유틸: Axios가 배열 또는 {data: 배열}을 줄 때 공통 추출 */
function pickArray<T>(data: T[] | { data: T[] }): T[] {
  return Array.isArray(data) ? data : (data?.data ?? []);
}

/** 1) 지역 평균가 */
export async function fetchRegionAverages(): Promise<RegionSummary[]> {
  const res = await apiClient.get<RegionAvgPriceDTO[] | { data: RegionAvgPriceDTO[] }>(PATHS.regionAverages);
  const rows = pickArray(res.data);
  return rows.map(mapRegionAvgDtoToDomain);
}

/** 2) 전체 스테이션 */
export async function fetchAllStations(): Promise<Station[]> {
  const res = await apiClient.get<RegionPriceDTO[] | { data: RegionPriceDTO[] }>(PATHS.allStations);
  const rows = pickArray(res.data);
  return rows.map(mapStationDtoToDomain);
}

/** 3) 지역별 스테이션 (한글 지역명 필요: "서울") */
export async function fetchStationsByRegion(regionName: string): Promise<Station[]> {
  const res = await apiClient.get<RegionPriceDTO[] | { data: RegionPriceDTO[] }>(
    PATHS.stationsByRegion,
    { params: { region: regionName } }
  );
  const rows = pickArray(res.data);
  return rows.map(mapStationDtoToDomain);
}

/** (편의) 코드로 조회 */
export async function fetchStationsByRegionCode(code: RegionCode): Promise<Station[]> {
  return fetchStationsByRegion(REGION_LABEL[code]);
}
