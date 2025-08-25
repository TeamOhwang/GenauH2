import { useState, useCallback, useEffect, useRef } from 'react';
import { useGeneration } from './useGeneration';
import { useHourlyUpdater } from './useHourlyUpdater';
import { TimeFrame, Plant } from '@/types/dashboard';

// 발전소별 capacity_Kw 값 상수 정의
const PLANT_CAPACITIES = {
    plant1: 1200,
    plant2: 800,
    plant3: 500
} as const;

// plantId를 실제 백엔드에서 사용하는 값으로 매핑
const getPlantIdForBackend = (plant: Plant): string => {
    switch (plant) {
        case 'all': return '';
        case 'plant1': return 'plt001';
        case 'plant2': return 'plt002';
        case 'plant3': return 'plt003';
        default: return 'all';
    }
};

export function useDashboardData() {
    const { getRawGeneration, getDailyGeneration } = useGeneration();
    const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>("daily");
    const [selectedPlant, setSelectedPlant] = useState<Plant>("plant1");
    const [data, setData] = useState<any[]>([]);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // 무한 루프 방지를 위한 ref
    const isInitialized = useRef(false);

    // 데이터 갱신 함수
    const refreshData = useCallback(async () => {
        if (isUpdating) return; // 이미 업데이트 중이면 중단

        console.log('🔄 useDashboardData.refreshData 시작');
        setIsUpdating(true);
        const now = new Date();

        try {
            // 오늘 날짜 기준으로 데이터 조회
            const today = now.toISOString().split('T')[0];
            console.log('📅 오늘 날짜:', today);

            const result = await getRawGeneration(today, today);
            console.log('📊 일간 데이터 조회 결과:', result);

            if (result) {
                setData(result);
                setCurrentHour(now.getHours());
                setCurrentDate(today);
                setLastUpdateTime(now);
            }

            // 주간 데이터도 함께 조회 (현재 주 + 지난 주)
            console.log('📅 주간 데이터 계산 시작...');
            const startOfCurrentWeek = new Date(now);
            startOfCurrentWeek.setDate(now.getDate() - now.getDay()); // 이번 주 일요일
            console.log('  - 이번 주 일요일:', startOfCurrentWeek);
            const endOfCurrentWeek = new Date(now);
            endOfCurrentWeek.setDate(now.getDate() + (6 - now.getDay())); // 이번 주 토요일
            console.log('  - 이번 주 토요일:', endOfCurrentWeek);
            const startOfLastWeek = new Date(startOfCurrentWeek);
            startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7); // 지난 주 일요일
            console.log('  - 지난 주 일요일:', startOfLastWeek);
            const endDate = endOfCurrentWeek.toISOString().split('T')[0];
            const startDate = startOfLastWeek.toISOString().split('T')[0];

            const backendPlantId = getPlantIdForBackend(selectedPlant);

            console.log('📅 주간 데이터 범위:');
            console.log('  - 시작일 (지난주 일요일):', startDate);
            console.log('  - 종료일 (이번주 토요일):', endDate);
            console.log('  - 선택된 발전소 (프론트엔드):', selectedPlant);
            console.log('  - 백엔드로 전송할 plantId:', backendPlantId);

            console.log('🔧 getDailyGeneration 호출 중...');
            const weeklyResult = await getDailyGeneration(backendPlantId, startDate, endDate);
            console.log('📊 주간 데이터 조회 결과:', weeklyResult);
            console.log('  - 데이터 타입:', typeof weeklyResult);
            console.log('  - 데이터 길이:', Array.isArray(weeklyResult) ? weeklyResult.length : '배열 아님');

            if (Array.isArray(weeklyResult) && weeklyResult.length > 0) {
                console.log('  - 첫 번째 데이터 샘플:', weeklyResult[0]);
                console.log('  - 마지막 데이터 샘플:', weeklyResult[weeklyResult.length - 1]);
                
                // 전일 완료 형식: 오늘 데이터는 제외하고 완성된 과거 데이터만 사용
                const completedWeeklyData = weeklyResult.filter(day => day.date !== today);
                
                if (completedWeeklyData.length > 0) {
                    console.log('✅ 주간 데이터 설정 완료 (전일 완료 형식)');
                    console.log('  - 완성된 데이터:', completedWeeklyData.length, '건');
                    console.log('  - 오늘 데이터 제외됨 (아직 완료되지 않음)');
                    setWeeklyData(completedWeeklyData);
                } else {
                    console.log('⚠️ 완성된 주간 데이터가 없음');
                    setWeeklyData([]);
                }
            } else {
                console.log('⚠️ 주간 데이터가 비어있거나 올바르지 않음');
                setWeeklyData([]);
            }

            // 월간 데이터도 함께 조회 (현재 월 + 지난 월)
            const startOfCurrentMonth = new Date(now);
            startOfCurrentMonth.setDate(1);
            console.log('  - 이번 월 1일:', startOfCurrentMonth);
            const endOfCurrentMonth = new Date(now);
            endOfCurrentMonth.setMonth(now.getMonth() + 1, 0);
            console.log('  - 이번 월 말:', endOfCurrentMonth);
            const startOfLastMonth = new Date(startOfCurrentMonth);
            startOfLastMonth.setMonth(startOfCurrentMonth.getMonth() - 1);
            console.log('  - 지난 월 1일:', startOfLastMonth);
            const endDateOfMonth = endOfCurrentMonth.toISOString().split('T')[0];
            const startDateOfMonth = startOfLastMonth.toISOString().split('T')[0];

            console.log('📅 월간 데이터 범위:');
            console.log('  - 시작일 (지난월 1일):', startDateOfMonth);
            console.log('  - 종료일 (이번월 말):', endDateOfMonth);
            console.log('  - 선택된 발전소 (프론트엔드):', selectedPlant);
            console.log('  - 백엔드로 전송할 plantId:', backendPlantId);

            console.log('🔧 getDailyGeneration 호출 중...');
            const monthlyResult = await getDailyGeneration(backendPlantId, startDateOfMonth, endDateOfMonth);
            console.log('📊 월간 데이터 조회 결과:', monthlyResult);
            console.log('  - 데이터 타입:', typeof monthlyResult);
            console.log('  - 데이터 길이:', Array.isArray(monthlyResult) ? monthlyResult.length : '배열 아님');

            if (Array.isArray(monthlyResult) && monthlyResult.length > 0) {
                console.log('  - 첫 번째 데이터 샘플:', monthlyResult[0]);
                console.log('  - 마지막 데이터 샘플:', monthlyResult[monthlyResult.length - 1]);
                setMonthlyData(monthlyResult);
                console.log('✅ 월간 데이터 설정 완료');
            } else {
                console.log('⚠️ 월간 데이터가 비어있거나 올바르지 않음');
                setMonthlyData([]);
            }

        } catch (error) {
            console.error('❌ 데이터 갱신 실패:', error);
            console.error('  - 에러 상세:', {
                message: error instanceof Error ? error.message : '알 수 없는 에러',
                stack: error instanceof Error ? error.stack : undefined
            });
        } finally {
            setIsUpdating(false);
            console.log('🔄 useDashboardData.refreshData 완료');
        }
    }, [getRawGeneration, getDailyGeneration, selectedPlant]);

    // 매시 정각 자동 갱신
    useHourlyUpdater({ onUpdate: refreshData, immediate: false });

    // 초기 데이터 로딩 및 selectedPlant 변경 시 데이터 갱신
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
        }
        refreshData();
    }, [selectedPlant, refreshData]);

    // 발전소별 데이터 필터링 (일간용)
    const plant1 = data.filter((item: any) => item.capacity_Kw === PLANT_CAPACITIES.plant1);
    const plant2 = data.filter((item: any) => item.capacity_Kw === PLANT_CAPACITIES.plant2);
    const plant3 = data.filter((item: any) => item.capacity_Kw === PLANT_CAPACITIES.plant3);


    // 주간 데이터 상태 확인
    console.log('🔍 주간 데이터 상태:', weeklyData.length, '건');
    console.log('  - 선택된 발전소:', selectedPlant);
    console.log('  - 백엔드 plantId:', getPlantIdForBackend(selectedPlant));


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

        // 주간 데이터
        weeklyData,

        // 월간 데이터
        monthlyData,

        // 액션
        setActiveTimeFrame,
        setSelectedPlant,
        refreshData,
    };
}
