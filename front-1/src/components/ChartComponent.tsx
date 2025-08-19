import { Line } from "react-chartjs-2";

interface LineChartProps {
    data : {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            borderColor?: string;
            backgroundColor?: string;
        }[];
    };
    options?: any
}

export default function LineChart({data, options}: LineChartProps) {
  return <Line data={data} options={options} />;
}
