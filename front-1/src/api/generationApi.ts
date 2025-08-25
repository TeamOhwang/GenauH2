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
    const res = await apiClient.get(GENERATION_ENDPOINTS.getRaw, { params: { start: startDate, end: endDate, limit: 10000 } });
    return res.data ?? [];
}

// 최신 데이터 조회
// 일별 데이터 조회
export async function getDailyGenerationApi(plantId: string, startDate: string, endDate: string) {
    const res = await apiClient.get(GENERATION_ENDPOINTS.getDaily, { params: { plantId: plantId, start: startDate, end: endDate, limit:2000 } });
    return res.data ?? [];
}

// 시간별 평균 데이터 조회
// export async function getHourlyAvgGenerationApi(startDate: string, endDate: string) {
//     const res = await apiClient.get(GENERATION_ENDPOINTS.getHourlyAvg, { params: { start: startDate, end: endDate, limit:2000 } });
//     return res.data ?? [];
// }

// 요약 데이터 조회
// export async function getSummaryGenerationApi(startDate: string, endDate: string) {
//     const res = await apiClient.get(GENERATION_ENDPOINTS.getSummary, { params: { start: startDate, end: endDate, limit:2000 } });
//     return res.data ?? [];
// }

// 상세 데이터 조회
// export async function getDetailedGenerationApi(startDate: string, endDate: string) {
//     const res = await apiClient.get(GENERATION_ENDPOINTS.getDetailed, { params: { start: startDate, end: endDate, limit:2000 } });
//     return res.data ?? [];
// }
