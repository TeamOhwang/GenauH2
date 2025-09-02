
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTargetSettingStore } from "@/stores/useTargetSettingStore";
import {
    buildSolaData,
    buildDailyChartOptions,
    buildWeeklyChartOptions,
    buildMonthlyChartOptions,
    buildH2Data,
    buildTimeFrameData,
    buildH2LineChartOptions,
    buildH2BarChartOptions,
    buildH2TimeChartOptions,
    buildH2DailyChartData,
    buildH2WeeklyChartData,
    buildH2MonthlyChartData,
    buildWeeklyH2DataFromRange,
    buildMonthlyH2Data,
} from "@/utils/chartDataBuilder";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TimeFrameTabs from "@/components/dashboard/TimeFrameTabs";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export default function Dashboard() {
    const {
        activeTimeFrame,
        selectedPlant,
        currentHour,
        plant1,
        plant2,
        plant3,
        previousDayData, // 전일 데이터 추가
        facilities, // 설비 정보 추가
        weeklyData,
        weeklyHydrogenRangeData, // 주간 수소 생산량 범위 데이터 추가
        weeklyHydrogenPredictData, // 주간 수소 생산량 예측 데이터 추가
        monthlyData,
        monthlyHydrogenProductionData, // 월간 수소 생산량 데이터 추가
        monthlyHydrogenPredictData, // 월간 수소 생산량 예측 데이터 추가
        hourlyHydrogenProduction,
        lastUpdateTime,
        isUpdating,
        setActiveTimeFrame,
        setSelectedPlant,
        refreshData,
    } = useDashboardData();

    // 목표 설정 스토어에서 목표 비율 가져오기
    const { hydrogenTargetRate } = useTargetSettingStore();

    // 차트 데이터 및 옵션 생성
    const solaData = buildSolaData(plant1, plant2, plant3, currentHour, weeklyData, monthlyData);

    // 탭별 차트 옵션 선택
    const getChartOptions = () => {
        switch (activeTimeFrame) {
            case "daily":
                return buildDailyChartOptions();
            case "weekly":
                return buildWeeklyChartOptions();
            case "monthly":
                return buildMonthlyChartOptions();
        }
    };

    // 탭별 수소 생산량 차트 옵션 선택
    const getH2ChartOptions = () => {
        switch (activeTimeFrame) {
            case "daily":
                return buildH2TimeChartOptions();
            case "weekly":
                return buildH2LineChartOptions();
            case "monthly":
                return buildH2BarChartOptions();
            default:
                return buildH2TimeChartOptions();
        }
    };

    // 탭별 수소 생산량 차트 데이터 생성
    const getH2ChartData = () => {
        switch (activeTimeFrame) {
            case "daily":
                return buildH2DailyChartData(hourlyHydrogenProduction || [], currentHour);
            case "weekly":
                return buildWeeklyH2DataFromRange(weeklyHydrogenRangeData || []);
            case "monthly":
                return buildMonthlyH2Data(monthlyHydrogenProductionData || []);
            default:
                return buildH2DailyChartData(hourlyHydrogenProduction || [], currentHour);
        }
    };

    const chartOptions = getChartOptions();
    const h2ChartOptions = getH2ChartOptions();
    const h2ChartData = getH2ChartData();
    console.log("🔍 Dashboard에서 weeklyHydrogenRangeData:", weeklyHydrogenRangeData);
    console.log("🔍 Dashboard에서 weeklyHydrogenPredictData:", weeklyHydrogenPredictData);
    console.log("🔍 Dashboard에서 weeklyHydrogenPredictData 타입:", typeof weeklyHydrogenPredictData);
    console.log("🔍 Dashboard에서 weeklyHydrogenPredictData 길이:", weeklyHydrogenPredictData?.length);
    
    const timeFrameData = buildTimeFrameData(plant1, plant2, plant3, currentHour, hourlyHydrogenProduction, hydrogenTargetRate, previousDayData, facilities, weeklyHydrogenRangeData, weeklyHydrogenPredictData, monthlyHydrogenProductionData, monthlyHydrogenPredictData); // 전일 데이터, 설비 정보, 주간 수소 데이터, 주간 수소 예측 데이터, 월간 수소 데이터, 월간 수소 예측 데이터 전달

    const currentData = timeFrameData[activeTimeFrame];

    return (
        <div className="h-full overflow-auto scrollbar-hide">
            <div className="m-6">
                {/* 헤더 - 모든 요소를 일렬로 정렬 */}
                <div className="flex items-center justify-between mb-6">
                    {/* 왼쪽: 제목과 타임프레임 탭 */}
                    <div className="flex items-center space-x-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">대시보드</h1>
                        <TimeFrameTabs
                            activeTimeFrame={activeTimeFrame}
                            onTimeFrameChange={setActiveTimeFrame}
                        />
                    </div>
                    
                    {/* 오른쪽: 실시간 정보와 갱신 버튼 */}
                    <DashboardHeader
                        isUpdating={isUpdating}
                        lastUpdateTime={lastUpdateTime}
                        onRefresh={refreshData}
                    />
                </div>

                {/* 통계 카드들 */}
                <DashboardStats stats={currentData.stats} efficiencyData={timeFrameData.efficiencyData} />

                {/* 차트들 */}
                <DashboardCharts
                    solaData={solaData}
                    activeTimeFrame={activeTimeFrame}
                    selectedPlant={selectedPlant}
                    chartOptions={chartOptions}
                    h2Data={h2ChartData}
                    h2ChartOptions={h2ChartOptions}
                    chart1Title={currentData.chart1Title}
                    chart2Title={currentData.chart2Title}
                    onPlantChange={setSelectedPlant}
                />
            </div>
        </div>
    );
}