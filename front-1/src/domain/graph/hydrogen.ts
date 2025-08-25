import type { GroupBy, Method } from "@/lib/hydrogen";

/**
 * 도메인 포인트: 화면/차트에서 바로 쓰기 좋은 형태
 * - 날짜: Date
 * - 널/결측: 0으로 보정
 * - 파생값 포함: utilizationPct, achievementRate
 */
export type HydrogenAggPoint = {
  readonly bucketStart: Date;     // 버킷 대표 시각
  readonly productionKg: number;  // [kg]
  readonly powerConsumedKwh: number; // [kWh]
  readonly idlePowerKw: number;      // [kW]
  readonly predictedKg: number;      // [kg]

  /** 0~100(%), 소수 1자리 반올림 정책 */
  readonly utilizationPct: number;

  readonly method?: Method;
  readonly modelVersion?: string | null;

  /** 달성률[%] = (productionKg / predictedKg) * 100, 소수 1자리 반올림 */
  readonly achievementRate: number;
};

/** 특정 설비의 시계열 데이터 */
export type FacilitySeries = {
  readonly facilityId: number;
  readonly facilityName: string;
  readonly series: readonly HydrogenAggPoint[]; // 시간 오름차순
};

/** 최종 조회 결과 (여러 설비 포함) */
export type HydrogenAggResult = {
  readonly groupBy: GroupBy;
  readonly range: { readonly startDate: Date; readonly endDate: Date };
  readonly facilities: readonly FacilitySeries[];
};
