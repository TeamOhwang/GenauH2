import { useState, useCallback, useEffect, useRef } from 'react';
import { useGeneration } from './useGeneration';
import { useHourlyUpdater } from './useHourlyUpdater';
import { TimeFrame, Plant } from '@/types/dashboard';
import { getFacilityListApi } from '@/api/adminApi';

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
    const { getRawGeneration, getDailyGeneration, getHourlyHydrogenProduction, getWeeklyProduction, getWeeklyHydrogenRange, getMonthlyHydrogenProduction } = useGeneration();
    const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>("daily");
    const [selectedPlant, setSelectedPlant] = useState<Plant>("plant1");
    const [data, setData] = useState<any[]>([]);
    const [previousDayData, setPreviousDayData] = useState<any[]>([]); // 전일 데이터 추가
    const [hourlyHydrogenProduction, setHourlyHydrogenProduction] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]); // 설비 정보 추가
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [weeklyHydrogenRangeData, setWeeklyHydrogenRangeData] = useState<any[]>([]); // 주간 수소 생산량 범위 데이터
    const [monthlyHydrogenProductionData, setMonthlyHydrogenProductionData] = useState<any[]>([]); // 월간 수소 생산량 데이터
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
            // console.log('📅 오늘 날짜:', today);

            // 전일 날짜 계산
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];
            // 오늘과 전일 데이터, 수소 생산량, 설비 정보를 병렬로 조회
            const [todayResult, yesterdayResult, hourlyHydrogenProduction, facilitiesData] = await Promise.all([
                getRawGeneration(today, today),
                getRawGeneration(yesterdayString, yesterdayString),
                getHourlyHydrogenProduction(),
                getFacilityListApi(), // 설비 정보 조회
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
            console.log('🔧 주간 수소 생산량 범위 데이터 조회:', { startDate, endDate });
            const weeklyHydrogenRangeResult = await getWeeklyHydrogenRange("2", startDate, endDate); // orgId 2 사용
            
            if (weeklyHydrogenRangeResult) {
                console.log('🔧 주간 수소 생산량 범위 데이터 수신:', weeklyHydrogenRangeResult);
                setWeeklyHydrogenRangeData(weeklyHydrogenRangeResult);
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

            // 월간 수소 생산 데이터 조회 (orgId는 2로 고정, 실제로는 사용자 조직 ID를 사용해야 함)
            const monthlyHydrogenResult = await getMonthlyHydrogenProduction("2");
            if (Array.isArray(monthlyHydrogenResult) && monthlyHydrogenResult.length > 0) {
                setMonthlyHydrogenProductionData(monthlyHydrogenResult);
            } else {
                setMonthlyHydrogenProductionData([]);
            }

        } catch (error) {
            console.error('❌ 데이터 갱신 실패:', error);
        } finally {
            setIsUpdating(false);
        }
    }, [getRawGeneration, getDailyGeneration, getHourlyHydrogenProduction, getWeeklyProduction, getWeeklyHydrogenRange, selectedPlant, isUpdating]);

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

    // selectedPlant 변경 시에만 데이터 갱신
    useEffect(() => {
        if (isInitialized.current) {
            refreshDataRef.current?.();
        }
    }, [selectedPlant]);

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

        // 월간 데이터
        monthlyData,
        monthlyHydrogenProductionData,

        // 액션
        setActiveTimeFrame,
        setSelectedPlant,
        refreshData,

    };
}
