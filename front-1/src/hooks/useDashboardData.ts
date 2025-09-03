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
    const { getRawGeneration, getDailyGeneration, getHourlyHydrogenProduction, getWeeklyProduction, getWeeklyHydrogenRange, getWeeklyHydrogenPredictRange, getMonthlyHydrogenProduction } = useGeneration();
    const orgId = useAuthStore((state) => state.orgId);
    const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>("daily");
    const [selectedPlant, setSelectedPlant] = useState<Plant>("plant1");
    const [data, setData] = useState<any[]>([]);
    const [previousDayData, setPreviousDayData] = useState<any[]>([]); // 전일 데이터 추가
    const [hourlyHydrogenProduction, setHourlyHydrogenProduction] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any>({data: [], success: false}); // 설비 정보 추가
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [weeklyPlant1Data, setWeeklyPlant1Data] = useState<any[]>([]);
    const [weeklyPlant2Data, setWeeklyPlant2Data] = useState<any[]>([]);
    const [weeklyPlant3Data, setWeeklyPlant3Data] = useState<any[]>([]);
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

            let endDate = endOfCurrentWeek.toISOString().split('T')[0];
            let startDate = startOfLastWeek.toISOString().split('T')[0];

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

            // 주간 수소 생산량 예측 데이터 조회 (주차별 예측 데이터)
            try {
                const weeklyHydrogenPredictResult = await getWeeklyHydrogenPredictRange(orgId?.toString() || "2");
                console.log("🔍 주간 수소 생산량 예측 데이터:", weeklyHydrogenPredictResult);
                if (weeklyHydrogenPredictResult && Array.isArray(weeklyHydrogenPredictResult)) {
                    weeklyHydrogenPredictResult.forEach((item, index) => {
                        console.log(`  [${index}] year: ${item.year}, month: ${item.month}, weekOfMonth: ${item.weekOfMonth}, weekLabel: ${item.weekLabel}, totalPredictedKg: ${item.totalPredictedKg}`);
                    });
                    setWeeklyHydrogenPredictData(weeklyHydrogenPredictResult)
                } else {
                    console.log("❌ 주간 수소 생산량 예측 데이터 없음");
                    setWeeklyHydrogenPredictData([]);
                }
            } catch (error) {
                console.log("❌ 주간 수소 생산량 예측 데이터 조회 실패:", error);
                setWeeklyHydrogenPredictData([]);
            }

            // 모든 발전소의 주간 데이터를 개별적으로 조회
            console.log("🔍 주간 데이터 조회 시작 - 기간:", startDate, "~", endDate);
            const [weeklyPlant1Result, weeklyPlant2Result, weeklyPlant3Result] = await Promise.all([
                getDailyGeneration('plt001', startDate, endDate),
                getDailyGeneration('plt002', startDate, endDate),
                getDailyGeneration('plt003', startDate, endDate)
            ]);

            console.log("🔍 API 응답 데이터 확인:");
            console.log("  - Plant1 응답:", weeklyPlant1Result);
            console.log("  - Plant1 첫 번째 항목:", weeklyPlant1Result?.[0]);
            console.log("  - Plant2 응답:", weeklyPlant2Result);
            console.log("  - Plant2 첫 번째 항목:", weeklyPlant2Result?.[0]);
            console.log("  - Plant3 응답:", weeklyPlant3Result);
            console.log("  - Plant3 첫 번째 항목:", weeklyPlant3Result?.[0]);

            // 각 발전소별로 주간 데이터 처리
            const processWeeklyData = (weeklyResult: any[]) => {
                if (Array.isArray(weeklyResult) && weeklyResult.length > 0) {
                    // 전일 완료 형식: 오늘 데이터는 제외하고 완성된 과거 데이터만 사용
                    return weeklyResult.filter(day => {
                        if (!day.date) return false;
                        
                        // date 필드가 LocalDate 객체인 경우 문자열로 변환
                        let dateStr = day.date;
                        if (typeof dateStr === 'object' && dateStr.toString) {
                            dateStr = dateStr.toString();
                        }
                        
                        return dateStr !== today;
                    });
                }
                return [];
            };

            const processedWeeklyPlant1Data = processWeeklyData(weeklyPlant1Result);
            const processedWeeklyPlant2Data = processWeeklyData(weeklyPlant2Result);
            const processedWeeklyPlant3Data = processWeeklyData(weeklyPlant3Result);

            // 각 발전소별 주간 데이터를 상태에 저장
            setWeeklyPlant1Data(processedWeeklyPlant1Data);
            setWeeklyPlant2Data(processedWeeklyPlant2Data);
            setWeeklyPlant3Data(processedWeeklyPlant3Data);

            // 선택된 발전소의 데이터를 weeklyData로 설정 (기존 호환성 유지)
            const backendPlantId = getPlantIdForBackend(selectedPlant);
            let selectedWeeklyData = [];
            if (backendPlantId === 'plt001') {
                selectedWeeklyData = processedWeeklyPlant1Data;
            } else if (backendPlantId === 'plt002') {
                selectedWeeklyData = processedWeeklyPlant2Data;
            } else if (backendPlantId === 'plt003') {
                selectedWeeklyData = processedWeeklyPlant3Data;
            }
            setWeeklyData(selectedWeeklyData);

            console.log("🔍 주간 데이터 조회 결과:");
            console.log("  - Plant1 데이터 개수:", processedWeeklyPlant1Data.length);
            console.log("  - Plant2 데이터 개수:", processedWeeklyPlant2Data.length);
            console.log("  - Plant3 데이터 개수:", processedWeeklyPlant3Data.length);
            console.log("  - 선택된 발전소 데이터 개수:", selectedWeeklyData.length);

            // 월간 데이터도 함께 조회 (현재 월 + 지난 월)
            const startOfCurrentMonth = new Date(now);
            startOfCurrentMonth.setDate(1);
            const endOfCurrentMonth = new Date(now);
            endOfCurrentMonth.setMonth(now.getMonth() + 1, 0);
            const startOfLastMonth = new Date(startOfCurrentMonth);
            startOfLastMonth.setMonth(startOfCurrentMonth.getMonth() - 1);
            const endDateOfMonth = endOfCurrentMonth.toISOString().split('T')[0];
            const startDateOfMonth = startOfLastMonth.toISOString().split('T')[0];

            // 월간 태양광 생산량 데이터 조회
            try {
                const monthlyResult = await getDailyGeneration(backendPlantId, startDateOfMonth, endDateOfMonth);
                if (Array.isArray(monthlyResult) && monthlyResult.length > 0) {
                    setMonthlyData(monthlyResult);
                } else {
                    setMonthlyData([]);
                }
            } catch (error) {
                console.log("❌ 월간 태양광 데이터 조회 실패:", error);
                setMonthlyData([]);
            }

            // 월간 수소 생산량 데이터 조회
            try {
                console.log("🔍 월간 수소 데이터 조회 시작 - 기간:", startDateOfMonth, "~", endDateOfMonth);
                const monthlyHydrogenProduction = await getWeeklyHydrogenRange(orgId?.toString() || "2", startDateOfMonth, endDateOfMonth);
                console.log("🔍 월간 수소 데이터 조회 결과:", monthlyHydrogenProduction);
                console.log("🔍 월간 수소 데이터 개수:", monthlyHydrogenProduction?.length || 0);
                
                if (Array.isArray(monthlyHydrogenProduction) && monthlyHydrogenProduction.length > 0) {
                    setMonthlyHydrogenProductionData(monthlyHydrogenProduction);
                    console.log("✅ 월간 수소 데이터 설정 완료");
                } else {
                    setMonthlyHydrogenProductionData([]);
                    console.log("❌ 월간 수소 데이터 없음");
                }
            } catch (error) {
                console.log("❌ 월간 수소 데이터 조회 실패:", error);
                setMonthlyHydrogenProductionData([]);
            }

            // 월간 수소 생산량 예측 데이터 조회 (해당 달 1일부터 마지막 날까지 일자별 예측 데이터 조회)
            try {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                
                // 해당 달의 1일과 마지막 날 계산
                const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
                const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
                
                const startDateOfMonth = firstDayOfMonth.toISOString().split('T')[0];
                const endDateOfMonth = lastDayOfMonth.toISOString().split('T')[0];
                
                console.log("🔍 월간 예측 데이터 조회 기간:", startDateOfMonth, "~", endDateOfMonth);
                
                // 해당 달의 일자별 예측 데이터 조회
                const monthlyHydrogenPredictResult = await getHydrogenPredictApi(orgId?.toString() || "2", startDateOfMonth, endDateOfMonth);
                console.log("🔍 월간 수소 생산량 예측 데이터 (일자별):", monthlyHydrogenPredictResult);
                
                if (monthlyHydrogenPredictResult && Array.isArray(monthlyHydrogenPredictResult)) {
                    // 일자별 예측 데이터를 월별로 집계
                    const monthlyPredictions: { [monthKey: string]: number } = {};
                    
                    monthlyHydrogenPredictResult.forEach((item: any) => {
                        if (item.ts) {
                            const date = new Date(item.ts);
                            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                            if (!monthlyPredictions[monthKey]) {
                                monthlyPredictions[monthKey] = 0;
                            }
                            // 예측 데이터의 생산량 합산 (predictedMaxKg 필드 사용)
                            monthlyPredictions[monthKey] += item.predictedMaxKg || 0;
                        }
                    });
                    
                    // 월별 예측 데이터를 배열로 변환
                    const monthlyPredictData = Object.keys(monthlyPredictions).map(monthKey => {
                        const [year, month] = monthKey.split('-');
                        return {
                            year: parseInt(year),
                            month: parseInt(month),
                            totalPredictedKg: monthlyPredictions[monthKey]
                        };
                    });
                    
                    console.log("🔍 월별 집계된 예측 데이터:", monthlyPredictData);
                    setMonthlyHydrogenPredictData(monthlyPredictData);
                } else {
                    console.log("❌ 월간 수소 생산량 예측 데이터 없음");
                    setMonthlyHydrogenPredictData([]);
                }
            } catch (error) {
                console.log("❌ 월간 수소 생산량 예측 데이터 조회 실패:", error);
                setMonthlyHydrogenPredictData([]);
            }



        } catch (error) {
            console.error("❌ refreshData 실행 중 오류 발생:", error);
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
        weeklyPlant1Data, // Plant1 주간 데이터 추가
        weeklyPlant2Data, // Plant2 주간 데이터 추가
        weeklyPlant3Data, // Plant3 주간 데이터 추가
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
