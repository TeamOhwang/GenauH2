import { useState, useCallback, useEffect, useRef } from 'react';
import { useGeneration } from './useGeneration';
import { useHourlyUpdater } from './useHourlyUpdater';
import { TimeFrame, Plant } from '@/types/dashboard';

export function useDashboardData() {
    const { getRawGeneration, getDailyGeneration } = useGeneration();
    const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>("daily");
    const [selectedPlant, setSelectedPlant] = useState<Plant>("plant1");
    const [data, setData] = useState<any[]>([]);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // 무한 루프 방지를 위한 ref
    const isInitialized = useRef(false);

    // 데이터 갱신 함수
    const refreshData = useCallback(async () => {
        if (isUpdating) return; // 이미 업데이트 중이면 중단
        
        setIsUpdating(true);
        const now = new Date();
        
        try {
            // 오늘 날짜 기준으로 데이터 조회
            const today = now.toISOString().split('T')[0];
            
            const result = await getRawGeneration(today, today);
            
            if (result) {
                setData(result);
                setCurrentHour(now.getHours());
                setCurrentDate(today);
                setLastUpdateTime(now);
            }

            // 주간 데이터도 함께 조회 (현재 주 + 지난 주)
            const startOfCurrentWeek = new Date(now);
            startOfCurrentWeek.setDate(now.getDate() - now.getDay()); // 이번 주 일요일
            
            const startOfLastWeek = new Date(startOfCurrentWeek);
            startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7); // 지난 주 일요일
            
            const endDate = today;
            const startDate = startOfLastWeek.toISOString().split('T')[0];
            
            const weeklyResult = await getRawGeneration(startDate, endDate);
            
            if (weeklyResult && weeklyResult.length > 0) {
                setWeeklyData(weeklyResult);
            }
        } catch (error) {
            console.error('❌ 데이터 갱신 실패:', error);
        } finally {
            setIsUpdating(false);
        }
    }, [getRawGeneration, getDailyGeneration]);

    // 매시 정각 자동 갱신
    useHourlyUpdater({ onUpdate: refreshData, immediate: false });

    // 초기 데이터 로딩 (한 번만 실행)
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            refreshData();
        }
    }, []);

    // 발전소별 데이터 필터링 (일간용)
    const plant1 = data.filter((item: any) => item.capacity_Kw === 1200);
    const plant2 = data.filter((item: any) => item.capacity_Kw === 800);
    const plant3 = data.filter((item: any) => item.capacity_Kw === 500);

    // 주간 데이터 필터링 (발전소별)
    const weeklyPlant1 = weeklyData.filter((item: any) => item.capacity_Kw === 1200);
    const weeklyPlant2 = weeklyData.filter((item: any) => item.capacity_Kw === 800);
    const weeklyPlant3 = weeklyData.filter((item: any) => item.capacity_Kw === 500);

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
        weeklyPlant1,
        weeklyPlant2,
        weeklyPlant3,
        
        // 액션
        setActiveTimeFrame,
        setSelectedPlant,
        refreshData,
    };
}
