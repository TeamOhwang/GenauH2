import { getRawGenerationApi } from "./generationApi";

export async function fetchRawGeneration(startDate: string, endDate: string) {
    return await getRawGenerationApi(startDate, endDate);
}