import { Line } from "react-chartjs-2";

const data = {
  labels: ["1월", "2월", "3월", "4월"],
  datasets: [
    {
      label: "월별 매출",
      data: [100, 200, 150, 300],
      borderColor: "rgba(75,192,192,1)",
      backgroundColor: "rgba(75,192,192,0.2)",
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "월별 매출 그래프",
    },
  },
};

export default function LineChart() {
  return <Line data={data} options={options} />;
}
