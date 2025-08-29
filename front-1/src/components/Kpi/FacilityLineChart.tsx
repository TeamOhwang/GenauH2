import "@/utils/register";
import { Line } from "react-chartjs-2";
import type { FacilityKpi } from "@/api/facilityApi";

export default function FacilityLineChart({ data = [] }: { data?: FacilityKpi[] }) {
  //  라벨: 시간(ts)
  const labels = data.map((d) =>
    d.ts ? new Date(d.ts).toLocaleString("ko-KR", { hour12: false }) : "-"
  );

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "실제 생산량 (kg)",
            data: data.map((d) => Number(d.productionKg ?? 0)),
            borderColor: "#36A2EB",
            backgroundColor: "rgba(54,162,235,0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 2,
          },
          {
            label: "최대 예상량 (kg)",
            data: data.map((d) => Number(d.predictedMaxKg ?? 0)),
            borderColor: "#FF6384",
            backgroundColor: "rgba(255,99,132,0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 2,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.1)" },
            ticks: { color: "#ccc" },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.1)" },
            ticks: { color: "#ccc" },
          },
        },
      }}
      height={400}
    />
  );
}
