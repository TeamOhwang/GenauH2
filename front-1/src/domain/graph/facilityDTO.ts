/** 서버 응답용 설비 DTO */
export interface FacilityDTO {
  facilityId: number;
  name: string;
  orgId?: number;
  modelNo?: string;
}

/** 서버 응답용 설비 KPI DTO */
export interface FacilityKpiDTO {
  facilityId: number;
  facilityName: string;
  productionKg: number;
  predictedMaxKg: number; // 서버는 이렇게 줄 수 있음
}
