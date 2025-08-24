import { useEffect, useState, useCallback } from "react";
import LineChart from "@/components/ui/ChartComponent";
import { useGeneration } from "@/hooks/useGeneration";
import { useHourlyUpdater } from "@/hooks/useHourlyUpdater";
import { useRealTime } from "@/hooks/useRealTime";

type TimeFrame = "daily" | "weekly" | "monthly";
type Plant = "plant1" | "plant2" | "plant3";

export default function Dashboard() {
    const { getRawGeneration } = useGeneration();
    const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>("daily");
    const [selectedPlant, setSelectedPlant] = useState<Plant>("plant1");
    const [data, setData] = useState<any>([]);
    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // 실시간 시간
    const realTime = useRealTime();

    // 데이터 갱신 함수
    const refreshData = useCallback(async () => {
        setIsUpdating(true);
        const now = new Date();
        setCurrentHour(now.getHours());
        setCurrentDate(now.toISOString().split('T')[0]);
        
        try {
            // 오늘 날짜 기준으로 데이터 조회
            const today = now.toISOString().split('T')[0];
            const result = await getRawGeneration(today, today);
            if (result) {
                setData(result);
                setLastUpdateTime(now);
            }
        } catch (error) {
            console.error('데이터 갱신 실패:', error);
        } finally {
            setIsUpdating(false);
        }
    }, [getRawGeneration]);

    // 매시 정각 자동 갱신
    useHourlyUpdater({ onUpdate: refreshData });

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const plant1 = data.filter((item: any) => item.capacity_Kw === 1200);
    console.log("plant1 data:", plant1.filter((item: any) => item.hour < currentHour));
    const plant2 = data.filter((item: any) => item.capacity_Kw === 800);
    console.log("plant2 data:", plant2);
    const plant3 = data.filter((item: any) => item.capacity_Kw === 500);
    console.log("plant3 data:", plant3);


    const solaData = {
        plant1: {
            labels: plant1.map((item: any) => item.hour),
            datasets: [
                {
                    label: "시간별 태양광 발전량",
                    data: plant1.filter((item: any) => item.hour < currentHour).map((item: any) => item.generation_Kw),
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    pointRadius: 0,
                },
                {
                    label: "유휴 전력 기준선",
                    data: plant1.map((item: any) => 100),
                    borderColor: "rgba(255,99,132,1)",
                    backgroundColor: "rgba(255,99,132,0.2)",
                    borderDash: [5, 5],
                    pointRadius: 0,
                },
                {
                    label: "예측 발전량",
                    data: plant1.map((item: any) => item.forecast_Kwh),
                    borderColor: "rgba(255,206,86,1)",
                    backgroundColor: "rgba(255,206,86,0.2)",
                    borderDash: [5, 5],
                    pointRadius: 0,
                }
            ],
        },
        plant2: {
            labels: plant2.map((item: any) => item.hour),
            datasets: [
                {
                    label: "시간별 태양광 발전량",
                    data: plant2.map((item: any) => item.generation_Kw),
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                },
                {
                    label: "유휴 전력 기준선",
                    data: plant2.map((item: any) => 100),
                    borderColor: "rgba(255,99,132,1)",
                    backgroundColor: "rgba(255,99,132,0.2)",
                    borderDash: [5, 5],
                    pointRadius: 0,
                },
                {
                    label: "예측 발전량",
                    data: plant2.map((item: any) => item.forecast_Kwh),
                    borderColor: "rgba(255,206,86,1)",
                    backgroundColor: "rgba(255,206,86,0.2)",
                    borderDash: [5, 5],
                    pointRadius: 0,
                }
            ],
        },
        plant3: {
            labels: plant3.map((item: any) => item.hour),
            datasets: [
                {
                    label: "시간별 태양광 발전량",
                    data: plant3.map((item: any) => item.generation_Kw),
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                },
                {
                    label: "유휴 전력 기준선",
                    data: plant3.map((item: any) => 100),
                    borderColor: "rgba(255,99,132,1)",
                    backgroundColor: "rgba(255,99,132,0.2)",
                    borderDash: [5, 5],
                    pointRadius: 0,
                },
                {
                    label: "예측 발전량",
                    data: plant3.map((item: any) => item.forecast_Kwh),
                    borderColor: "rgba(255,206,86,1)",
                    backgroundColor: "rgba(255,206,86,0.2)",
                    borderDash: [5, 5],
                    pointRadius: 0,
                }
            ],
        },
    };

    const h2Data = {
        labels: ["9시", "10시", "11시", "12시"],
        datasets: [
            {
                label: "시간별 수소 생산량",
                data: [200, 400, 350, 283],
                borderColor: "#4880ff",
                backgroundColor: "#4880ff",
            },
        ],
    }

    const options = {
        plant1: {
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 1300,
                    ticks: {
                        stepSize: 100,
                        callback: (value: number) => {
                            return value + "kW";
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom" as const,
                },
            },
        },
        plant2: {
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 800,
                    ticks: {
                        stepSize: 100,
                        callback: (value: number) => {
                            return value + "kW";
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom" as const,
                },
            },
        },
        plant3: {
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 500,
                    ticks: {
                        stepSize: 100,
                        callback: (value: number) => {
                            return value + "kW";
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom" as const,
                },
            },
        }
    };

    const timeFrameData = {
        daily: {
            title: "데일리 모니터링",
            stats: [
                { label: "예측 유휴 전력량 vs 실제 유휴 전력량", value: "40,689", diff: "목표 대비" },
                { label: "현재 수소 생산량 vs 예측 생산량", value: "40,689", diff: "목표 대비" },
                { label: "수소 1kg당 전력 소비량", value: "78.1%", diff: "전일 대비" },
                { label: "현재 설비 가동률", value: "80%", diff: "전일 대비" },
            ],
            chart1Title: "시간대별 태양광 발전량",
            chart2Title: "시간대별 수소 생산량"
        },
        weekly: {
            title: "위클리 모니터링",
            stats: [
                { label: "총 유휴 전력 발생 시간", value: "40,689", diff: "목표 대비" },
                { label: "주간 총 수소 생산량 vs 예측 생산량", value: "40,689", diff: "목표 대비" },
                { label: "전주 대비 증감률", value: "80%", diff: "전주 대비" },
                { label: "주간 평균 효율", value: "78.1%", diff: "전주 대비" },
            ],
            chart1Title: "요일별 태양광 발전량",
            chart2Title: "요일별 수소 생산량"
        },
        monthly: {
            title: "먼슬리 모니터링",
            stats: [
                { label: "월간 총 수소 생산량 vs 예측 생산량", value: "40,689", diff: "목표 대비" },
                { label: "월 평균 수소 1kg당 전력 소비량", value: "78.1%", diff: "전월 대비" },
                { label: "전월 대비 생산 증감률", value: "40,689", diff: "전월 대비" },
                { label: "월 평균 효율", value: "80%", diff: "전월 대비" },
            ],
            chart1Title: "일별 태양광 발전량",
            chart2Title: "일별 수소 생산량"
        }
    };

    const currentData = timeFrameData[activeTimeFrame];

    // 선택된 발전소에 따라 차트 데이터 반환
    const getSelectedPlantCharts = () => {
        return <LineChart data={solaData[selectedPlant]} options={options[selectedPlant]} />;
    };

    return (
        <div className="h-full overflow-auto scrollbar-hide">
            <div className="m-6">
                {/* 실시간 시간 및 갱신 상태 표시 */}
                <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-2xl">{currentData.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <span>현재 시간:</span>
                            <span className="font-mono font-semibold">
                                {realTime.toLocaleTimeString('ko-KR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit', 
                                    second: '2-digit' 
                                })}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>다음 갱신:</span>
                            <span className="font-mono font-semibold text-blue-600">
                                {new Date(Date.now() + (60 - new Date().getMinutes()) * 60 * 1000 - new Date().getSeconds() * 1000).toLocaleTimeString('ko-KR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </span>
                        </div>
                        <button
                            onClick={refreshData}
                            disabled={isUpdating}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                isUpdating 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
                        >
                            {isUpdating ? '갱신 중...' : '수동 갱신'}
                        </button>
                        {lastUpdateTime && (
                            <div className="text-xs text-gray-500">
                                마지막 갱신: {lastUpdateTime.toLocaleTimeString('ko-KR')}
                            </div>
                        )}
                    </div>
                </div>

                {/* 탭 버튼들 */}
                <div className="flex space-x-2 mb-6">
                    {(["daily", "weekly", "monthly"] as TimeFrame[]).map((timeFrame) => (
                        <button
                            key={timeFrame}
                            onClick={() => setActiveTimeFrame(timeFrame)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTimeFrame === timeFrame
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            {timeFrame === "daily" ? "일간" : timeFrame === "weekly" ? "주간" : "월간"}
                        </button>
                    ))}
                </div>

                {/* 통계 카드들 */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {currentData.stats.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white p-4 rounded-2xl shadow"
                        >
                            <p className="text-gray-500 mb-2">{item.label}</p>
                            <h3 className="text-2xl font-bold">{item.value}</h3>
                            <p className="text-sm text-green-600">{item.diff}</p>
                        </div>
                    ))}
                </div>

                {/* 차트들 */}
                <div className="m-0 bg-white rounded-2xl shadow p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xl font-bold">{currentData.chart1Title}</p>
                        <select
                            value={selectedPlant}
                            onChange={(e) => setSelectedPlant(e.target.value as Plant)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="plant1">발전소 1 (1.2MW)</option>
                            <option value="plant2">발전소 2 (800kW)</option>
                            <option value="plant3">발전소 3 (500kW)</option>
                        </select>
                    </div>
                    {getSelectedPlantCharts()}
                </div>

                <div className="m-0 bg-white rounded-2xl shadow p-4">
                    <p className="text-xl font-bold mb-3">{currentData.chart2Title}</p>
                    <LineChart data={h2Data} options={options} />
                </div>
            </div>
        </div>
    );
}
