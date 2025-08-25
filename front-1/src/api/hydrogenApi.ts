import apiClient, { unwrap } from "@/api/apiClient";
import type {
  HydrogenAggRequestDTO,
  HydrogenAggResponseDTO,
  HydrogenAggPointDTO,
} from "@/domain/graph/hydrogenDTO";
import type {
  HydrogenAggResult,
  HydrogenAggPoint,
} from "@/domain/graph/hydrogen";

/** 소수 첫째자리 반올림 */
const round1 = (n: number) => Math.round(n * 10) / 10;

/** DTO → Domain: 한 포인트 변환 */
function toPoint(d: HydrogenAggPointDTO): HydrogenAggPoint {
  const prod = d.productionKg ?? 0;
  const pred = d.predictedKg ?? 0;
  const util0to1 = d.utilizationRate ?? 0;

  return {
    bucketStart: new Date(d.bucketStart),
    productionKg: prod,
    predictedKg: pred,
    powerConsumedKwh: d.powerConsumedKwh ?? 0,
    idlePowerKw: d.idlePowerKw ?? 0,
    utilizationPct: round1(util0to1 * 100), // 0~100 [%]
    method: d.method,
    modelVersion: d.modelVersion ?? null,
    achievementRate: pred > 0 ? round1((prod / pred) * 100) : 0,
  };
}

/**
 * 집계 조회 API
 * - GET /api/hydrogen/aggregate
 * - 요청: HydrogenAggRequestDTO
 * - 응답: HydrogenAggResult (도메인)
 */
export async function fetchHydrogenAgg(
  req: HydrogenAggRequestDTO
): Promise<HydrogenAggResult> {
  const res = await apiClient.get("/api/hydrogen/aggregate", { params: req });
  const data = unwrap<HydrogenAggResponseDTO>(res);

  return {
    groupBy: data.groupBy,
    range: {
      startDate: new Date(data.range.startDate),
      endDate: new Date(data.range.endDate),
    },
    facilities: data.facilities.map((f) => ({
      facilityId: f.facilityId,
      facilityName: f.facilityName,
      series: f.series.map(toPoint),
    })),
  };
}
