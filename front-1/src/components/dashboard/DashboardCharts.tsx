import ChartComponent from "@/components/ui/ChartComponent";
import { Plant, TimeFrame, ChartData, ChartOptions } from "@/utils/chartDataBuilder";
import { buildDailyChartOptions, buildWeeklyChartOptions, buildMonthlyChartOptions, buildMonthlyH2Data } from "@/utils/chartDataBuilder";

interface DashboardChartsProps {
    solaData: Record<string, Record<string, ChartData>>;
    activeTimeFrame: TimeFrame;
    selectedPlant: Plant;
    chartOptions: Record<Plant, ChartOptions>;
    h2Data: any;
    chart1Title: string;
    chart2Title: string;
    onPlantChange: (plant: Plant) => void;
}

export default function DashboardCharts({
    solaData,
    activeTimeFrame,
    selectedPlant,
    chartOptions,
    h2Data,
    chart1Title,
    chart2Title,
    onPlantChange,
}: DashboardChartsProps) {
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
                return chartOptions;
        }
    };

    // 탭별 차트 타입 선택
    const getChartType = () => {
        switch (activeTimeFrame) {
            case "daily":
                return "line"; // 일별: 라인 차트
            case "weekly":
                return "bar"; // 주별: 막대 차트
            case "monthly":
                return "bar"; // 월별: 바 차트
            default:
                return "line";
        }
    };

    // 월간 탭일 때 수소 생산량 차트 데이터 생성
    const getH2ChartData = () => {
        if (activeTimeFrame === "monthly") {
            // 월간 탭에서는 주차별 수소 생산량 데이터 사용
            // solaData에서 monthly 데이터를 가져와서 수소 생산량 계산
            const monthlyPlantData = solaData.monthly?.[selectedPlant];
            if (monthlyPlantData && monthlyPlantData.labels.length > 0) {
                // 주차별 라벨을 기반으로 수소 생산량 데이터 생성
                const labels = monthlyPlantData.labels;
                const productionData = labels.map((_, index) => {
                    // 발전량 데이터가 있으면 그에 비례하여 수소 생산량 계산
                    const generationValue = monthlyPlantData.datasets[0]?.data[index];
                    if (generationValue !== null && generationValue !== undefined) {
                        return generationValue * 0.1; // 발전량의 10%로 수소 생산량 계산
                    }
                    return null;
                });
                
                return {
                    labels: labels,
                    datasets: [
                        {
                            label: "주차별 수소 생산량 (kg)",
                            data: productionData,
                            borderColor: "rgba(33, 150, 243, 1)",
                            backgroundColor: "rgba(33, 150, 243, 0.2)",
                            pointRadius: 4,
                            fill: false,
                            type: "line"
                        }
                    ]
                };
            }
        }
        // 기본 수소 생산량 데이터 반환
        return h2Data;
    };

    const currentChartOptions = getChartOptions();
    const currentChartType = getChartType();
    const currentH2Data = getH2ChartData();

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* 태양광 발전량 차트 */}
            <div className="m-0 bg-white rounded-2xl shadow p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xl font-bold">{chart1Title}</p>
                    <select
                        value={selectedPlant}
                        onChange={(e) => onPlantChange(e.target.value as Plant)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {activeTimeFrame === "weekly" && (
                            <option value="all">전체</option>
                        )}
                        <option value="plant1">발전소 1 (1.2MW)</option>
                        <option value="plant2">발전소 2 (800kW)</option>
                        <option value="plant3">발전소 3 (500kW)</option>
                    </select>
                </div>
                {activeTimeFrame === "monthly" ? (
                    // 월간 탭일 때는 스크롤 가능한 컨테이너로 감싸기
                    <div className="overflow-x-auto">
                        <div className="min-w-max">
                            <ChartComponent 
                                data={solaData[activeTimeFrame][selectedPlant] as any} 
                                options={currentChartOptions[selectedPlant]} 
                                chartType={currentChartType}
                            />
                        </div>
                    </div>
                ) : (
                    <ChartComponent 
                        data={solaData[activeTimeFrame][selectedPlant] as any} 
                        options={currentChartOptions[selectedPlant]} 
                        chartType={currentChartType}
                    />
                )}
            </div>

            {/* 수소 생산량 차트 */}
            <div className="m-0 bg-white rounded-2xl shadow p-4 mb-6">
                <p className="text-xl font-bold mb-3">{chart2Title}</p>
                {activeTimeFrame === "monthly" ? (
                    // 월간 탭일 때는 스크롤 가능한 컨테이너로 감싸기
                    <div className="overflow-x-auto">
                        <div className="min-w-max">
                            <ChartComponent 
                                data={currentH2Data as any} 
                                options={currentChartOptions.plant1} 
                                chartType={currentChartType}
                            />
                        </div>
                    </div>
                ) : (
                    <ChartComponent 
                        data={currentH2Data as any} 
                        options={currentChartOptions.plant1} 
                        chartType={currentChartType}
                    />
                )}
            </div>
        </div>
    );
}