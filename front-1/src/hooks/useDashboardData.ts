import { useState, useCallback, useEffect, useRef } from 'react';
import { useGeneration } from './useGeneration';
import { useHourlyUpdater } from './useHourlyUpdater';
import { TimeFrame, Plant } from '@/types/dashboard';
import { getFacilityListApi } from '@/api/adminApi';
import { useAuthStore } from '@/stores/useAuthStore';
import { getHydrogenPredictApi } from '@/api/generationApi';

// 발전소별 capacity_Kw 값 상수 정의
const PLANT_CAPACITIES = {
    plant1: 1200,
    plant2: 800,
    plant3: 500
} as const;

// plantId를 실제 백엔드에서 사용하는 값으로 매핑
const getPlantIdForBackend = (plant: Plant): string => {
    switch (plant) {
        case 'plant1': return 'plt001';
        case 'plant2': return 'plt002';
        case 'plant3': return 'plt003';
        default: return 'plt001';
    }
};

export function useDashboardData() {
    const { getRawGeneration, getDailyGeneration, getHourlyHydrogenProduction, getWeeklyProduction, getWeeklyHydrogenRange, getWeeklyHydrogenPredictRange, getMonthlyHydrogenProduction, getMonthlyHydrogenPredict } = useGeneration();
    const orgId = useAuthStore((state) => state.orgId);
    const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>("daily");
    const [selectedPlant, setSelectedPlant] = useState<Plant>("plant1");
    const [data, setData] = useState<any[]>([]);
    const [previousDayData, setPreviousDayData] = useState<any[]>([]); // 전일 데이터 추가
    const [hourlyHydrogenProduction, setHourlyHydrogenProduction] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any>({data: [], success: false}); // 설비 정보 추가
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [weeklyHydrogenRangeData, setWeeklyHydrogenRangeData] = useState<any[]>([]); // 주간 수소 생산량 범위 데이터
    const [weeklyHydrogenPredictData, setWeeklyHydrogenPredictData] = useState<any[]>([]); // 주간 수소 생산량 예측 데이터
    const [monthlyHydrogenProductionData, setMonthlyHydrogenProductionData] = useState<any[]>([]); // 월간 수소 생산량 데이터
    const [monthlyHydrogenPredictData, setMonthlyHydrogenPredictData] = useState<any[]>([]); // 월간 수소 생산량 예측 데이터
    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // 무한 루프 방지를 위한 ref
    const isInitialized = useRef(false);
    const refreshDataRef = useRef<() => Promise<void>>();

    // 데이터 갱신 함수
    const refreshData = useCallback(async () => {
        if (isUpdating) return; // 이미 업데이트 중이면 중단


        setIsUpdating(true);
        const now = new Date();

        try {
            // 오늘 날짜 기준으로 데이터 조회
            const today = now.toISOString().split('T')[0];


            // 전일 날짜 계산
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];
            // 오늘과 전일 데이터, 수소 생산량, 설비 정보를 병렬로 조회
            const [todayResult, yesterdayResult, hourlyHydrogenProduction, facilitiesData] = await Promise.all([
                getRawGeneration(today, today),
                getRawGeneration(yesterdayString, yesterdayString),
                getHourlyHydrogenProduction(),
                getFacilityListApi(orgId?.toString()), // 설비 정보 조회 (orgId 전달)
            ]);

            if (todayResult) {
                setData(todayResult);
                setCurrentHour(now.getHours());
                setCurrentDate(today);
                setLastUpdateTime(now);
            }

            if (yesterdayResult) {
                setPreviousDayData(yesterdayResult);
            }

            if (hourlyHydrogenProduction) {
                setHourlyHydrogenProduction(hourlyHydrogenProduction);
            }

            if (facilitiesData && facilitiesData.data) {
                setFacilities(facilitiesData);
                console.log("✅ 설비 정보 설정 완료:", facilitiesData);
                console.log("✅ 설비 개수:", facilitiesData.data.length);
            } else {
                console.log("❌ 설비 정보 없음");
                setFacilities({data: [], success: false});
            }


            // 주간 데이터도 함께 조회 (지난 주 + 이번 주, 오늘 제외)
            const startOfCurrentWeek = new Date(now);
            // startOfCurrentWeek.setDate(now.getDate() - now.getDay()); // 이번 주 일요일
            const endOfCurrentWeek = new Date(now);
            endOfCurrentWeek.setDate(now.getDate() - 1); // 어제까지만 (오늘 제외)
            const startOfLastWeek = new Date(startOfCurrentWeek);
            startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7); // 지난 주 일요일
            const endDate = endOfCurrentWeek.toISOString().split('T')[0];
            const startDate = startOfLastWeek.toISOString().split('T')[0];

            // 주간 수소 생산량 범위 데이터 조회 (지난 주 + 이번 주, 오늘 제외)
            const weeklyHydrogenRangeResult = await getWeeklyHydrogenRange(orgId?.toString() || "2", startDate, endDate); // 사용자 orgId 사용
            console.log("🔍 주간 수소 데이터 조회 결과:", weeklyHydrogenRangeResult);
            console.log("📅 조회 기간:", startDate, "~", endDate);
            console.log("🏢 orgId:", orgId?.toString() || "2");
            
            if (weeklyHydrogenRangeResult) {
                setWeeklyHydrogenRangeData(weeklyHydrogenRangeResult);
                console.log("✅ 주간 수소 데이터 설정 완료");
            } else {
                console.log("❌ 주간 수소 데이터 없음");
            }

            // 주간 수소 생산량 예측 데이터 조회 (같은 기간)
            const weeklyHydrogenPredictResult = await getHydrogenPredictApi(orgId?.toString() || "2", startDate, endDate);
            console.log("🔍 주간 수소 생산량 예측 데이터:", weeklyHydrogenPredictResult);
            if (weeklyHydrogenPredictResult && Array.isArray(weeklyHydrogenPredictResult)) {
                weeklyHydrogenPredictResult.forEach((item, index) => {

                    console.log("🔍 주간 수소 생산량 예측 데이터:", item);
                });
                setWeeklyHydrogenPredictData(weeklyHydrogenPredictResult)
            } else {
                console.log("❌ 주간 수소 생산량 예측 데이터 없음");
                setWeeklyHydrogenPredictData([]);
            }

            const backendPlantId = getPlantIdForBackend(selectedPlant);


            const weeklyResult = await getDailyGeneration(backendPlantId, startDate, endDate);
            if (Array.isArray(weeklyResult) && weeklyResult.length > 0) {
                // 전일 완료 형식: 오늘 데이터는 제외하고 완성된 과거 데이터만 사용
                const completedWeeklyData = weeklyResult.filter(day => day.date !== today);
                
                if (completedWeeklyData.length > 0) {
                    setWeeklyData(completedWeeklyData);
                } else {
                    setWeeklyData([]);
                }
            } else {
                setWeeklyData([]);
            }

            // 월간 데이터도 함께 조회 (현재 월 + 지난 월)
            const startOfCurrentMonth = new Date(now);
            startOfCurrentMonth.setDate(1);
            const endOfCurrentMonth = new Date(now);
            endOfCurrentMonth.setMonth(now.getMonth() + 1, 0);
            const startOfLastMonth = new Date(startOfCurrentMonth);
            startOfLastMonth.setMonth(startOfCurrentMonth.getMonth() - 1);
            const endDateOfMonth = endOfCurrentMonth.toISOString().split('T')[0];
            const startDateOfMonth = startOfLastMonth.toISOString().split('T')[0];


            const monthlyResult = await getDailyGeneration(backendPlantId, startDateOfMonth, endDateOfMonth);
            if (Array.isArray(monthlyResult) && monthlyResult.length > 0) {
                setMonthlyData(monthlyResult);
            } else {
                setMonthlyData([]);
            }

            // 월간 수소 생산 데이터 조회 (사용자 orgId 사용)
            const monthlyHydrogenResult = await getMonthlyHydrogenProduction(orgId?.toString() || "1");
            console.log("useDashboardData🔍 월간 수소 생산량 데이터:", monthlyHydrogenResult);
            if (Array.isArray(monthlyHydrogenResult) && monthlyHydrogenResult.length > 0) {
                setMonthlyHydrogenProductionData(monthlyHydrogenResult);
            } else {
                console.log("useDashboardData❌ 월간 수소 생산량 데이터 없음");
                setMonthlyHydrogenProductionData([]);
            }

            // 월간 수소 생산량 예측 데이터 설정 (현재는 주간 예측 데이터를 사용)
            // if (weeklyHydrogenPredictResult && Array.isArray(weeklyHydrogenPredictResult)) {
            //     setMonthlyHydrogenPredictData(weeklyHydrogenPredictResult);
            //     console.log("✅ 월간 수소 예측 데이터 설정 완료 (주간 데이터 사용)");
            // } else {
            //     setMonthlyHydrogenPredictData([]);
            //     console.log("❌ 월간 수소 예측 데이터 없음");
            // }

        } catch (error) {

        } finally {
            setIsUpdating(false);
        }
    }, [getRawGeneration, getDailyGeneration, getHourlyHydrogenProduction, getWeeklyProduction, getWeeklyHydrogenRange, getWeeklyHydrogenPredictRange, getMonthlyHydrogenProduction, selectedPlant, orgId, isUpdating]);

    // refreshData 함수가 변경될 때마다 ref 업데이트
    useEffect(() => {
        refreshDataRef.current = refreshData;
    }, [refreshData]);

    // 매시 정각 자동 갱신
    useHourlyUpdater({ 
        onUpdate: () => refreshDataRef.current?.(), 
        immediate: false 
    });

    // 초기 데이터 로딩 및 selectedPlant 변경 시 데이터 갱신
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            refreshDataRef.current?.();
        }
    }, []); // 의존성 배열을 비워서 초기 로딩만 실행

    // selectedPlant 또는 orgId 변경 시 데이터 갱신
    useEffect(() => {
        if (isInitialized.current) {
            refreshDataRef.current?.();
        }
    }, [selectedPlant, orgId]);

    // 발전소별 데이터 필터링 (일간용)
    const plant1 = data.filter((item: any) => item.capacity_Kw === PLANT_CAPACITIES.plant1);
    const plant2 = data.filter((item: any) => item.capacity_Kw === PLANT_CAPACITIES.plant2);
    const plant3 = data.filter((item: any) => item.capacity_Kw === PLANT_CAPACITIES.plant3);


    return {
        // 상태
        activeTimeFrame,
        selectedPlant,
        currentHour,
        currentDate,
        lastUpdateTime,
        isUpdating,

        // 일간 데이터
        plant1,
        plant2,
        plant3,
        previousDayData, // 전일 데이터 추가
        hourlyHydrogenProduction,
        facilities, // 설비 정보 추가

        // 주간 데이터
        weeklyData,
        weeklyHydrogenRangeData, // 주간 수소 생산량 범위 데이터 추가
        weeklyHydrogenPredictData, // 주간 수소 생산량 예측 데이터 추가
        

        // 월간 데이터
        monthlyData,
        monthlyHydrogenProductionData,
        monthlyHydrogenPredictData, // 월간 수소 생산량 예측 데이터 추가

        // 액션
        setActiveTimeFrame,
        setSelectedPlant,
        refreshData,

    };
}
