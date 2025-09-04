import { getHourlyHydrogenProductionApi, getWeeklyProductionApi, getWeeklyHydrogenRangeApi, getWeeklyHydrogenPredictRangeApi, getPredictRangeDataApi } from "@/api/generationApi";
import { fetchDailyGeneration, fetchRawGeneration } from "@/api/generationService";
import { useState, useCallback } from "react";

export function useGeneration() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getRawGeneration = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchRawGeneration(startDate, endDate);
            return data;
        } catch (e: any) {
            setError(e?.message ?? "원시 데이터 조회 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    const getDailyGeneration = useCallback(async (plantId: string, startDate: string, endDate: string) => {


        if (plantId === 'plant1') {
            plantId = 'plt001';
        } else if (plantId === 'plant2') {
            plantId = 'plt002';
        } else if (plantId === 'plant3') {
            plantId = 'plt003';
        }



        setLoading(true);
        setError(null);
        try {
            const data = await fetchDailyGeneration(plantId, startDate, endDate);
            
            return data;
        } catch (e: any) {

            setError(e?.message ?? "일별 데이터 조회 실패");
            return null;
        } finally {
            setLoading(false);

        }
    }, [])

    const getHourlyHydrogenProduction = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getHourlyHydrogenProductionApi();
            return data;
        }
        catch (e: any) {

            setError(e?.message ?? "시간별 수소 생산량 조회 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    const getWeeklyProduction = useCallback(async (orgId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getWeeklyProductionApi(orgId);
            return data;
        } catch (e: any) {

            setError(e?.message ?? "주간 수소 생산량 조회 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    const getWeeklyHydrogenRange = useCallback(async (orgId: string, startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getWeeklyHydrogenRangeApi(orgId, startDate, endDate);
            return data;
        } catch (e: any) {

            setError(e?.message ?? "주간 수소 생산량 범위 조회 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    const getWeeklyHydrogenPredictRange = useCallback(async (orgId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getWeeklyHydrogenPredictRangeApi(orgId);
            return data;
        } catch (e: any) {

            setError(e?.message ?? "주간 수소 생산량 예측 범위 조회 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    const getMonthlyHydrogenProduction = useCallback(async (orgId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getWeeklyProductionApi(orgId);
            return data;
        } catch (e: any) {

            setError(e?.message ?? "월간 수소 생산량 조회 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    const getDailyHydrogenPredict = useCallback(async (orgId: string, startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPredictRangeDataApi(startDate, endDate);
            
            // 사용자의 orgId에 맞는 데이터만 필터링
            const userOrgId = parseInt(orgId);
            const filteredData = data?.filter((item: any) => item.orgid === userOrgId) ?? [];
            
            return filteredData;
        } catch (e: any) {
            setError(e?.message ?? "일간 수소 생산량 예측 조회 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])




    return { 
        loading, 
        error, 
        getRawGeneration, 
        getDailyGeneration, 
        getHourlyHydrogenProduction, 
        getWeeklyProduction, 
        getWeeklyHydrogenRange,
        getWeeklyHydrogenPredictRange,
        getMonthlyHydrogenProduction,
        getDailyHydrogenPredict,
    };
}