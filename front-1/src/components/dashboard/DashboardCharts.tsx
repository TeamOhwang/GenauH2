import ChartComponent from "@/components/ui/ChartComponent";
import { Plant, TimeFrame, ChartData, ChartOptions } from "@/utils/chartDataBuilder";
import { buildDailyChartOptions, buildWeeklyChartOptions, buildMonthlyChartOptions } from "@/utils/chartDataBuilder";

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


    const currentChartOptions = getChartOptions();
    const currentChartType = getChartType();

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
                        <option value="plant1">발전소 1 (1.2MW)</option>
                        <option value="plant2">발전소 2 (800kW)</option>
                        <option value="plant3">발전소 3 (500kW)</option>
                    </select>
                </div>
                <ChartComponent 
                    data={solaData[activeTimeFrame][selectedPlant]} 
                    options={currentChartOptions[selectedPlant]} 
                    chartType={currentChartType}
                />
            </div>

            {/* 수소 생산량 차트 */}
            <div className="m-0 bg-white rounded-2xl shadow p-4 mb-6">
                <p className="text-xl font-bold mb-3">{chart2Title}</p>
                <ChartComponent 
                    data={h2Data} 
                    options={currentChartOptions.plant1} 
                    chartType={currentChartType}
                />
            </div>
        </div>
    );
}