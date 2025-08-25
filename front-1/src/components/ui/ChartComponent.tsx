// src/components/common/ChartComponent.tsx
import { Chart as ReactChart } from "react-chartjs-2";

export type ChartTopType = "line" | "bar" | "mixed" | "doughnut";

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: Array<number | null>;
    borderColor?: string;
    backgroundColor?: string | string[]; // ← 도넛 팔레트 배열 지원
    pointRadius?: number;
    borderDash?: number[];
    yAxisID?: string;
    fill?: boolean;
    type?: "line" | "bar";               // ← 혼합차트 개별 타입
  }>;
}

interface ChartProps {
  data: ChartData;
  options?: any;                         // 필요 시 ChartOptions로 좁혀도 OK
  chartType?: ChartTopType;
}

export default function ChartComponent({ data, options, chartType = "line" }: ChartProps) {
  // mixed는 상단을 'bar'로 두고 datasets[].type으로 섞어서 렌더
  const topType: "line" | "bar" | "doughnut" =
    chartType === "mixed" ? "bar" : chartType;

  return <ReactChart type={topType as any} data={data as any} options={options} />;
}
