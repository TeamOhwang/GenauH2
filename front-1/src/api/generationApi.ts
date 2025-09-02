import apiClient from "./apiClient";

export const GENERATION_ENDPOINTS = {
    getRaw: "/generation/raw",
    getLatest: "/generation/latest",
    getDaily: "/generation/daily",
 
    getHourlyHydrogenProduction: "/storage/hourly-hydrogen-production",
    getWeeklyProduction: "/real/weekly-production",
    getRangeData: "/real/range",
    getPredictRangeData: "/predict/range",
}

// 원시 데이터 조회
export async function getRawGenerationApi(startDate: string, endDate: string) {
    const res = await apiClient.get(GENERATION_ENDPOINTS.getRaw, { params: { start: startDate, end: endDate, limit: 10000 } });
    return res.data ?? [];
}

// 최신 데이터 조회
// 일별 데이터 조회
export async function getDailyGenerationApi(plantId: string, startDate: string, endDate: string) {
    try {
        const res = await apiClient.get(GENERATION_ENDPOINTS.getDaily, { 
            params: { plantId: plantId, start: startDate, end: endDate, limit: 2000 } 
        });
        return res.data ?? [];
    } catch (error) {

        throw error;
    }
}

// 시간별 수소 생산량 조회
export async function getHourlyHydrogenProductionApi() {
    try {
        const res = await apiClient.get(GENERATION_ENDPOINTS.getHourlyHydrogenProduction);
        return res.data ?? [];
    } catch (error) {

        throw error;
    }
}

// 주간 수소 생산량 조회
export async function getWeeklyProductionApi(orgId: string) {
    try {
        const res = await apiClient.get(`${GENERATION_ENDPOINTS.getWeeklyProduction}/${orgId}`);
        return res.data ?? [];
    } catch (error) {

        throw error;
    }
}

// 기간별 수소 생산량 데이터 조회 (이번 주 + 저번 주)
export async function getWeeklyHydrogenRangeApi(orgId: string, startDate: string, endDate: string) {
    try {
        const res = await apiClient.get(GENERATION_ENDPOINTS.getRangeData, { 
            params: { startDate, endDate } 
        });
        
        // orgId가 일치하는 데이터만 필터링
        const filteredData = res.data?.filter((item: any) => item.orgid === parseInt(orgId)) ?? [];
        
        return filteredData;
    } catch (error) {

        throw error;
    }
}

// 주차별 수소 생산량 예측 데이터 조회
export async function getWeeklyHydrogenPredictRangeApi(orgId: string, startDate: string, endDate: string) {
    try {
        console.log("🔍 API 호출 시작 - getWeeklyHydrogenPredictRangeApi");
        console.log("🔍 API 파라미터 - orgId:", orgId, "startDate:", startDate, "endDate:", endDate);
        console.log("🔍 API URL:", `/predict/weekly-production/${orgId}`);
        
        const res = await apiClient.get(`/predict/weekly-production/${orgId}`);
        
        console.log("🔍 API 응답 상태:", res.status);
        console.log("🔍 API 응답 데이터:", res.data);
        console.log("🔍 API 응답 데이터 타입:", typeof res.data);
        console.log("🔍 API 응답 데이터 길이:", res.data?.length);
        
        return res.data ?? [];
    } catch (error) {
        console.error("❌ API 호출 실패 - getWeeklyHydrogenPredictRangeApi:", error);
        throw error;
    }
}

