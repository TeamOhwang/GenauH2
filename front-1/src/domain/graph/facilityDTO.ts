/** 서버 응답용 설비 DTO */
export interface FacilityDTO {
  id: number;
  name: string;
}

/** 서버 응답용 설비 KPI DTO */
export interface FacilityKpiDTO {
  facilityId: number;
  facilityName: string;
  productionKg: number;
  maxPredictedKg: number;
}