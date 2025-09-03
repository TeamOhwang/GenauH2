import {
    getDailyGenerationApi,
    getRawGenerationApi,
} from "./generationApi";

// 원시 데이터 조회
export async function fetchRawGeneration(startDate: string, endDate: string) {
    return await getRawGenerationApi(startDate, endDate);
}

// 일별 데이터
export async function fetchDailyGeneration(plantId: string, startDate: string, endDate: string) {
    return await getDailyGenerationApi(plantId, startDate, endDate);
}