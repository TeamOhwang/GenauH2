import apiClient from "./apiClient";

export const GENERATION_ENDPOINTS = {
    getRaw: "/generation/raw",
    getLatest: "/generation/latest",
    getDaily: "/generation/daily",
    getHourlyAvg: "/generation/hourly-avg",
    getSummary: "/generation/summary",
    getDetailed: "/generation/detailed",
}

// 원시 데이터 조회
export async function getRawGenerationApi(startDate: string, endDate: string) {
    const res = await apiClient.get(GENERATION_ENDPOINTS.getRaw, { params: { start: startDate, end: endDate, limit:2000 } });
    return res.data ?? [];
}

// 최신 데이터 조회

// 일별 데이터 조회

// 시간별 평균 데이터 조회

// 요약 데이터 조회

// 상세 데이터 조회
