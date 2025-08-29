import apiClient from "./apiClient";

export const GENERATION_ENDPOINTS = {
    getRaw: "/generation/raw",
    getLatest: "/generation/latest",
    getDaily: "/generation/daily",
    // getHourlyAvg: "/generation/hourly-avg",
    // getSummary: "/generation/summary",
    // getDetailed: "/generation/detailed",
    getHourlyHydrogenProduction: "/storage/hourly-hydrogen-production",
}

// 원시 데이터 조회
export async function getRawGenerationApi(startDate: string, endDate: string) {
    const res = await apiClient.get(GENERATION_ENDPOINTS.getRaw, { params: { start: startDate, end: endDate, limit: 10000 } });
    return res.data ?? [];
}

// 최신 데이터 조회
// 일별 데이터 조회
export async function getDailyGenerationApi(plantId: string, startDate: string, endDate: string) {
    console.log('🌐 generationApi.getDailyGenerationApi 호출');
    console.log('  - URL:', GENERATION_ENDPOINTS.getDaily);
    console.log('  - 파라미터:', { plantId, start: startDate, end: endDate, limit: 2000 });
    
    try {
        const res = await apiClient.get(GENERATION_ENDPOINTS.getDaily, { 
            params: { plantId: plantId, start: startDate, end: endDate, limit: 2000 } 
        });
        console.log('  - API 응답 상태:', res.status);
        console.log('  - API 응답 데이터:', res.data);
        return res.data ?? [];
    } catch (error) {
        console.error('❌ getDailyGenerationApi 오류:', error);
        throw error;
    }
}

export async function getHourlyHydrogenProductionApi() {
    console.log('🌐 generationApi.getHourlyHydrogenProductionApi 호출');
    console.log('  - URL:', GENERATION_ENDPOINTS.getHourlyHydrogenProduction);
    
    try {
        const res = await apiClient.get(GENERATION_ENDPOINTS.getHourlyHydrogenProduction);
        console.log('  - API 응답 상태:', res.status);
        console.log('  - API 응답 데이터:', res.data);
        return res.data ?? [];
    } catch (error) {
        console.error('❌ getHourlyHydrogenProductionApi 오류:', error);
        throw error;
    }
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

// 시간별 수소 생산량 조회
// export async function getHourlyHydrogenApi(plantId: string, startDate: string, endDate: string) {
//     const res = await apiClient.get(GENERATION_ENDPOINTS.getHourlyHydrogen, { params: { plantId: plantId, start: startDate, end: endDate, limit: 2000 } });
//     return res.data ?? [];
// }