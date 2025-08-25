import {
    getDailyGenerationApi,
    // getDailyGenerationApi,
    // getDetailedGenerationApi,
    /* The line `// getDetailedGenerationApi,` is a commented-out import statement in the TypeScript
    code. This means that the `getDetailedGenerationApi` function is not being imported or used in
    the current code. The double forward slashes `//` indicate that this line is a comment and is
    not considered part of the active code. */
    // getHourlyAvgGenerationApi,
    getRawGenerationApi,
    // getSummaryGenerationApi
} from "./generationApi";

// 원시 데이터 조회
export async function fetchRawGeneration(startDate: string, endDate: string) {
    return await getRawGenerationApi(startDate, endDate);
}

// 일별 데이터
export async function fetchDailyGeneration(plantId: string, startDate: string, endDate: string) {
    return await getDailyGenerationApi(plantId, startDate, endDate);
}

// 시간별 평균 데이터
// export async function fetchHourlyAvgGeneration(startDate: string, endDate: string) {
//     return await getHourlyAvgGenerationApi(startDate, endDate);
// }

// 요약 데이터 조회
// export async function fetchSummaryGeneration(startDate: string, endDate: string) {
//     return await getSummaryGenerationApi(startDate, endDate);
// }

// 상세 데이터 조회
// export async function fetchDetailedGeneration(startDate: string, endDate: string) {
//     return await getDetailedGenerationApi(startDate, endDate);
// }