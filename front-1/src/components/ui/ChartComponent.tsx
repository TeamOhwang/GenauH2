import { Line } from "react-chartjs-2";

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


interface LineChartProps {
    data: {
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

export default function LineChart({ data, options }: LineChartProps) {
    return <Line data={data} options={options} />;
}
