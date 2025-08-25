// src/components/charts/HydrogenDonut.tsx
import { Doughnut } from "react-chartjs-2";

export type DonutRow = { name: string; value: number }; // value: %

export default function HydrogenDonut({ rows }: { rows: DonutRow[] }) {
  const data = {
    labels: rows.map(r => r.name),
    datasets: [
      {
        data: rows.map(r => r.value),
        // 필요하면 색상 팔레트 지정 가능 (없어도 기본 색 사용)
        // backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#f87171", "#a78bfa"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    cutout: "60%", // 도넛
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      title: { display: false, text: "" },
    },
  };

  return <Doughnut data={data} options={options} />;
}
