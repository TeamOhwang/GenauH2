import { Chart as ReactChart } from "react-chartjs-2";

export type ChartTopType = "line" | "bar" | "mixed" | "doughnut";

export interface ChartData {
  labels: (string | number)[];
  datasets: Array<{
    label?: string;
    // number[] 만 오거나 (number|null)[]가 오더라도 모두 허용
    data: Array<number | null | undefined>;
    borderColor?: string;
    backgroundColor?: string | string[]; 
    borderDash?: number[];
    yAxisID?: string;
    fill?: boolean;
    type?: string;
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
