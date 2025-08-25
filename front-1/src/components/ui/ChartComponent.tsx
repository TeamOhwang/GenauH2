import { Line, Bar } from "react-chartjs-2";

import {
    Chart as ChartJs,
    CategoryScale, // x축
    LinearScale, // y축
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
} from "chart.js"

ChartJs.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
)

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor?: string;
        backgroundColor?: string;
        pointRadius?: number;
        borderDash?: number[];
        yAxisID?: string;
        fill?: boolean;
        type?: string;
    }[];
}

interface ChartProps {
    data: ChartData;
    options?: any;
    chartType?: "line" | "bar" | "mixed";
}

export default function ChartComponent({ data, options, chartType = "line" }: ChartProps) {
    // 혼합 차트 타입인 경우 (막대 + 라인)
    if (chartType === "mixed") {
        return <Line data={data} options={options} />;
    }
    
    // 막대 차트인 경우
    if (chartType === "bar") {
        return <Bar data={data} options={options} />;
    }
    
    // 기본적으로 라인 차트
    return <Line data={data} options={options} />;
}
