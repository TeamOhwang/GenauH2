// src/components/model/DailyChart.tsx
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  total: { production: number; predicted: number };
};

export default function DailyChart({ total }: Props) {
  // 전체 기간 합계
  const production = total.production ?? 0;
  const predicted = total.predicted ?? 0;

  const chartData = {
    labels: ["생산량"],
    datasets: [
      {
        label: "생산량",
        data: [production, Math.max(predicted - production, 0)], // 실제 생산량 + (예측-실제)
        backgroundColor: ["#3b82f6", "#e5e7eb"], // 파란색 + 회색
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    cutout: "70%", // 도넛 안쪽 크기
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center">
      <h3 className="font-semibold mb-4">총 생산량 & 예측량</h3>
      <div className="flex items-center gap-8">
        {/* 도넛 차트 */}
        <div className="relative w-40 h-40">
          <Doughnut data={chartData} options={chartOptions} />
          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-blue-600">
            {production.toLocaleString()}kg
          </div>
        </div>

        {/* 예측 생산량 */}
        <div className="flex flex-col items-center text-red-500 font-semibold text-xl">
          <span>예측량</span>
          <span>{predicted.toLocaleString()}kg</span>
        </div>
      </div>
    </div>
  );
}
