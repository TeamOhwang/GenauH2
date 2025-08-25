
import ChartComponent, { type ChartData as UiChartData } from "@/components/ui/ChartComponent";

export type DonutRow = { name: string; value: number };

export default function HydrogenDonut({ rows }: { rows: DonutRow[] }) {
  const data: UiChartData = {
    labels: rows.map(r => r.name),
    datasets: [
      {
        data: rows.map(r => r.value) as Array<number | null>,
        // backgroundColor: ["#60a5fa", "#34d399", "#fbbf24"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    cutout: "60%",
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
  };

  return <ChartComponent data={data} options={options} chartType="doughnut" />;
}
