// ChartComponent.tsx
import { Chart as ReactChart } from "react-chartjs-2";
import type { ChartData as BuilderChartData } from "@/utils/chartDataBuilder"; 

export type ChartTopType = "line" | "bar" | "mixed" | "doughnut";


export interface UiChartData {
  labels: (string | number)[];
  datasets: Array<{
    label?: string;
    data: Array<number | null | undefined>;
    borderColor?: string | string[];
    backgroundColor?: string | string[];
    borderDash?: number[];
    yAxisID?: string;
    fill?: boolean;
    type?: string;
  }>;
}


interface ChartProps {
  data: BuilderChartData | UiChartData;
  options?: any;
  chartType?: ChartTopType;
}

export default function ChartComponent({
  data,
  options,
  chartType = "line",
}: ChartProps) {
  const topType: "line" | "bar" | "doughnut" =
    chartType === "mixed" ? "bar" : chartType;

  return <ReactChart type={topType} data={data as any} options={options} />;
}
