import { useDashboardData } from "@/hooks/useDashboardData";
import {
    buildSolaData,
    buildChartOptions,
    buildDailyChartOptions,
    buildWeeklyChartOptions,
    buildMonthlyChartOptions,
    buildH2Data,
    buildTimeFrameData
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
        weeklyData,
        monthlyData,
        lastUpdateTime,
        isUpdating,
        setActiveTimeFrame,
        setSelectedPlant,
        refreshData,
    } = useDashboardData();

    // 차트 데이터 및 옵션 생성
    console.log('🎯 Dashboard 차트 데이터 생성 시작');
    console.log('  - 일간 데이터:', { plant1: plant1.length, plant2: plant2.length, plant3: plant3.length });
    console.log('  - 주간 데이터:', {
        weeklyData: weeklyData.length,
    });
    console.log('  - 월간 데이터:', {
        monthlyData: monthlyData.length,
    });

    const solaData = buildSolaData(plant1, plant2, plant3, currentHour, weeklyData, monthlyData);
    console.log('  - 생성된 solaData:', solaData);

    // 탭별 차트 옵션 선택
    const getChartOptions = () => {
        switch (activeTimeFrame) {
            case "daily":
                return buildDailyChartOptions();
            case "weekly":
                return buildWeeklyChartOptions();
            case "monthly":
                return buildMonthlyChartOptions();
            default:
                return buildChartOptions();
        }
    };

    const chartOptions = getChartOptions();
    const h2Data = buildH2Data(currentHour);
    const timeFrameData = buildTimeFrameData();

    const currentData = timeFrameData[activeTimeFrame];

    return (
        <div className="h-full overflow-auto scrollbar-hide">
            <div className="m-6">
                {/* 헤더 */}
                <DashboardHeader
                    title={currentData.title}
                    isUpdating={isUpdating}
                    lastUpdateTime={lastUpdateTime}
                    onRefresh={refreshData}
                />

                {/* 탭 버튼들 */}
                <TimeFrameTabs
                    activeTimeFrame={activeTimeFrame}
                    onTimeFrameChange={setActiveTimeFrame}
                />

                {/* 통계 카드들 */}
                <DashboardStats stats={currentData.stats} />

                {/* 차트들 */}
                <DashboardCharts
                    solaData={solaData}
                    activeTimeFrame={activeTimeFrame}
                    selectedPlant={selectedPlant === "all" ? "plant1" : selectedPlant}
                    chartOptions={chartOptions}
                    h2Data={h2Data}
                    chart1Title={currentData.chart1Title}
                    chart2Title={currentData.chart2Title}
                    onPlantChange={setSelectedPlant}
                />
            </div>
        </div>
    );
}