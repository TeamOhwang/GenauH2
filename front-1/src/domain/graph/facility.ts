/** 설비 도메인 타입 */
export interface Facility {
  facilityId: number;   // 설비 ID
  name: string;         // 설비 이름
  orgId?: number;       // 사업자 ID (옵션)
  modelNo?: string;     // 모델 번호 (옵션)
}

/** 설비 KPI 도메인 타입 */
export interface FacilityKpi {
  facilityId: number;
  facilityName: string;
  productionKg: number;     // 실제 생산량
  maxPredictedKg: number;   // 최대 예측 생산량
}


