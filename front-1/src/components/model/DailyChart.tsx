import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import CountUp from "react-countup";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  total: { production: number; predicted: number };
};

export default function DailyChart({ total }: Props) {
  const production = total.production ?? 0;
  const predicted = total.predicted ?? 0;

  // 차트 데이터
  const chartData = {
    labels: ["생산량"],
    datasets: [
      {
        label: "생산량",
        data: [production, Math.max(predicted - production, 0)],
        backgroundColor: ["#3b82f6", "#e5e7eb"], // 파란색 + 회색
        borderWidth: 0,
      },
    ],
  };

  // 차트 옵션
  const chartOptions: ChartOptions<"doughnut"> = {
    cutout: "70%",
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

return (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow flex flex-col items-center">
    <h3 className="font-semibold mb-4 text-left text-gray-900 dark:text-white">
      일자별 생산량 & 예측량
    </h3>

    <div className="flex items-center gap-8">
      {/* 도넛 차트 */}
      <div className="relative w-60 h-60"> 
        <Doughnut data={chartData} options={chartOptions} />

        {/* 중앙: 생산량 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-xl">
          <span className="text-blue-600 dark:text-blue-400">생산량</span>
          <span className="text-blue-600 dark:text-blue-400">
            <CountUp
              end={production}
              duration={1.2}
              separator=","
              decimals={1}
            />{" "}
            kg
          </span>
        </div>
      </div>

      {/* 오른쪽: 예측량 */}
      <div className="flex flex-col items-center font-semibold text-xl text-gray-900 dark:text-white">
        <span>예측량</span>
        <span className="text-red-500 dark:text-red-400">
          <CountUp
            end={predicted}
            duration={1.2}
            separator=","
            decimals={1}
          />{" "}
          kg
        </span>
      </div>
    </div>
  </div>
);
}
