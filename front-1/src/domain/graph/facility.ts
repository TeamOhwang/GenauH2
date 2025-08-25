/** 설비 도메인 타입 */
export interface Facility {
  id: number;
  name: string;
}

/** 설비 KPI 도메인 타입 */
export interface FacilityKpi {
  facilityId: number;
  facilityName: string;
  productionKg: number;    // 실제 생산량(kg)
  maxPredictedKg: number;  // 유휴전력 대비 최대 예측 생산량(kg)
}