import type { GroupBy, Method } from "@/lib/hydrogen";

/**
 * 집계 API 요청 DTO (프론트 → 서버)
 * - 날짜는 string 유지(ISO or "YYYY-MM-DD")
 * - 배열은 readonly로 참조 불변 의도 표시
 */
export type HydrogenAggRequestDTO = {
  readonly startDate: string;
  readonly endDate: string;
  readonly groupBy: GroupBy;
  readonly facilityIds?: readonly number[];

  // 선택 확장(서버가 지원 시 사용)
  readonly dataType?: "actual" | "predicted" | "compare";
  readonly modelVersion?: string;
};

/**
 * 집계 포인트 DTO (서버 → 프론트)
 * - 원시형 그대로(널/결측 허용)
 * - utilizationRate 단위는 0~1(비율)로 고정 권장
 */
export type HydrogenAggPointDTO = {
  readonly bucketStart: string;       // ISO string (UTC 권장)
  readonly productionKg?: number;     // [kg]
  readonly powerConsumedKwh?: number; // [kWh]
  readonly idlePowerKw?: number;      // [kW]
  readonly predictedKg?: number;      // [kg]
  readonly utilizationRate?: number;  // 0~1
  readonly method?: Method;
  readonly modelVersion?: string | null;
};

/** 특정 설비 시계열 DTO */
export type FacilitySeriesDTO = {
  readonly facilityId: number;
  readonly facilityName: string;
  readonly series: readonly HydrogenAggPointDTO[]; // 시간 오름차순 권장
};

/** 전체 응답 DTO */
export type HydrogenAggResponseDTO = {
  readonly groupBy: GroupBy;
  readonly range: { readonly startDate: string; readonly endDate: string };
  readonly facilities: readonly FacilitySeriesDTO[];
};
