import {
  REGION_LABEL,
  toRegionCode,
  type RegionCode,
  type RegionSummary,
  type Station,
} from "@/domain/maps/MapPriceTypes";
import type { RegionAvgPriceDTO } from "@/domain/maps/RegionAvgPriceDTO";
import type { RegionPriceDTO } from "@/domain/maps/RegionPriceDTO";

/** DTO → Domain: 지역 평균가 */
export function mapRegionAvgDtoToDomain(d: RegionAvgPriceDTO): RegionSummary {
  const code = toRegionCode(d.region) ?? "11";
  return {
    regionCode: code,
    regionName: REGION_LABEL[code],
    avgPrice: Number(d.average_price) || 0,
  };
}

/** DTO → Domain: 스테이션 */
export function mapStationDtoToDomain(d: RegionPriceDTO): Station {
  const code: RegionCode = toRegionCode(d.region) ?? "11";
  return {
    id: String(d.id),
    name: d.stationName,
    regionCode: code,
    regionName: REGION_LABEL[code],
    address: d.address,
    price: Number(d.price) || 0,
    vehicleType: d.vehicleType,
    lat: d.lat,
    lng: d.lng,
  };
}

/** RegionSummary[] → 평균가 맵(regionCode → avgPrice) */
export function makeAvgPriceMap(list: RegionSummary[]): Record<RegionCode, number> {
  const m = {} as Record<RegionCode, number>;
  for (const s of list) m[s.regionCode] = s.avgPrice;
  return m;
}

/** 스테이션 목록에 지역 평균가 주입 */
export function injectRegionAvg(stations: Station[], avgMap: Record<string, number>): Station[] {
  return stations.map((s) => ({ ...s, avgPriceOfRegion: avgMap[s.regionCode] }));
}
