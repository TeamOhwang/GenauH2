
import ChartComponent, { type ChartData as UiChartData } from "@/components/ui/ChartComponent";

export type LineRow = {
  time: string;
  productionKg: number;
  predictedKg: number;
};

export default function HydrogenLine({ rows }: { rows: LineRow[] }) {

  const data: UiChartData = {
    labels: rows.map(r => r.time),
    datasets: [
      {
        label: "생산(kg)",
        // (number|null)[]로 맞춰주기 (number[]도 대부분 OK지만 안전하게 단언)
        data: rows.map(r => r.productionKg) as Array<number | null>,
        borderColor: "rgba(33,150,243,1)",
        backgroundColor: "rgba(33,150,243,0.15)",
        pointRadius: 3,
        fill: true,
        type: "line" as const,
      },
      {
        label: "예측(kg)",
        data: rows.map(r => r.predictedKg) as Array<number | null>,
        borderColor: "rgba(99,102,241,1)",
        backgroundColor: "rgba(99,102,241,0.12)",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        type: "line" as const,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
    elements: { line: { spanGaps: true } },
    scales: { x: { grid: { display: true } }, y: { grid: { display: true } } },
  };

  return <ChartComponent data={data} options={options} chartType="line" />;
}
