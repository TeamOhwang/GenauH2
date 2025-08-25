// src/components/charts/HydrogenLine.tsx
import { Line } from "react-chartjs-2";

export type LineRow = {
  time: string;            // x축 레이블(YYYY-MM-DD 등)
  productionKg: number;    // 실제
  predictedKg: number;     // 예측
};

export default function HydrogenLine({ rows }: { rows: LineRow[] }) {
  const data = {
    labels: rows.map(r => r.time),
    datasets: [
      {
        label: "생산(kg)",
        data: rows.map(r => r.productionKg),
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: "예측(kg)",
        data: rows.map(r => r.predictedKg),
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      title: { display: false, text: "" },
    },
    scales: {
      x: { grid: { display: true } },
      y: { grid: { display: true } },
    },
  };

  return <Line data={data} options={options} />;
}
