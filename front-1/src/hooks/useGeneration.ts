import { getHourlyHydrogenProductionApi } from "@/api/generationApi";
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
        // console.log('🔧 useGeneration.getDailyGeneration 호출');
        // console.log('  - plantId:', plantId);
        // console.log('  - 시작일:', startDate);
        // console.log('  - 종료일:', endDate);

        if (plantId === 'plant1') {
            plantId = 'plt001';
        } else if (plantId === 'plant2') {
            plantId = 'plt002';
        } else if (plantId === 'plant3') {
            plantId = 'plt003';
        }
        // console.log(' - plantId:', plantId);


        setLoading(true);
        setError(null);
        try {
            // console.log('  - fetchDailyGeneration 호출 중...');
            const data = await fetchDailyGeneration(plantId, startDate, endDate);
            // console.log('  - fetchDailyGeneration 결과:', data);
            // console.log('  - 데이터 타입:', typeof data);
            // console.log('  - 데이터 길이:', Array.isArray(data) ? data.length : '배열 아님');
            
            // if (Array.isArray(data) && data.length > 0) {
            //     console.log('  - 첫 번째 데이터 샘플:', data[0]);
            //     console.log('  - 마지막 데이터 샘플:', data[data.length - 1]);
                
            //     // 데이터 구조 확인
            //     const sampleKeys = Object.keys(data[0]);
            //     console.log('  - 데이터 키들:', sampleKeys);
            // }
            
            return data;
        } catch (e: any) {
            // console.error('❌ getDailyGeneration 오류:', e);
            // console.error('  - 에러 상세:', {
            //     message: e?.message,
            //     status: e?.response?.status,
            //     statusText: e?.response?.statusText,
            //     data: e?.response?.data
            // });
            setError(e?.message ?? "일별 데이터 조회 실패");
            return null;
        } finally {
            setLoading(false);
            // console.log('  - getDailyGeneration 완료');
        }
    }, [])

    const getHourlyHydrogenProduction = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔧 useGeneration.getHourlyHydrogenProduction 호출');
            
            const data = await getHourlyHydrogenProductionApi();
            console.log('  - 수소 생산량 데이터:', data);
            return data;
        }
        catch (e: any) {
            console.error('❌ getHourlyHydrogenProduction 오류:', e);
            setError(e?.message ?? "시간별 수소 생산량 조회 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    // const getHourlyAvgGeneration = useCallback(async (startDate: string, endDate: string) => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const data = await fetchHourlyAvgGeneration(startDate, endDate);
    //         return data;
    //     } catch (e: any) {
    //         setError(e?.message ?? "시간별 평균 데이터 조회 실패");
    //         return null;
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [])

    // const getSummaryGeneration = useCallback(async (startDate: string, endDate: string) => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const data = await fetchSummaryGeneration(startDate, endDate);
    //         return data;
    //     } catch (e: any) {
    //         setError(e?.message ?? "요약 데이터 조회 실패");
    //         return null;
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [])

    // const getDetailedGeneration = useCallback(async (startDate: string, endDate: string) => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const data = await fetchDetailedGeneration(startDate, endDate);
    //         return data;
    //     } catch (e: any) {
    //         setError(e?.message ?? "상세 데이터 조회 실패");
    //         return null;
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [])

    return { loading, error, getRawGeneration, getDailyGeneration, getHourlyHydrogenProduction };
}