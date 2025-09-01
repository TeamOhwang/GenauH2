import { useRef } from "react";
import "@/utils/register";
import { Line } from "react-chartjs-2";
import type { FacilityKpi } from "@/api/facilityApi";
import zoomPlugin from "chartjs-plugin-zoom";
import { Chart as ChartJS } from "chart.js";

ChartJS.register(zoomPlugin);

export default function FacilityLineChart({
  data = [],
  onHover,
  selectedDay,
}: {
  data?: FacilityKpi[];
  onHover?: (prod: number | null, pred: number | null, ts?: string) => void;
  selectedDay?: string; // YYYY-MM-DD
}) {
  const chartRef = useRef<any>(null);

  return (
    <div className="flex-1 flex flex-col">
      <Line
        ref={chartRef}
        data={{
          labels: data.map((d) => new Date(d.ts).getHours() + "시"),
          datasets: [
            {
              label: "실제 생산량 (kg)",
              data: data.map((d) => d.productionKg),
              borderColor: "#36A2EB",
              borderWidth: 2,
              pointRadius: 2,
              fill: false,
              tension: 0.1,
              yAxisID: "y1",
            },
            {
              label: "최대 예측량 (kg)",
              data: data.map((d) => d.predictedMaxKg),
              borderColor: "#FF6384",
              borderWidth: 2,
              pointRadius: 2,
              fill: false,
              tension: 0.1,
              yAxisID: "y2",
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            legend: { position: "top" },
            tooltip: {
              enabled: true,
              mode: "index",
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  return `${context.dataset.label}: ${value.toFixed(2)} kg`;
                },
                afterBody: (items) => {
                  if (onHover && items.length > 0) {
                    const idx = items[0].dataIndex;
                    const point = data[idx];
                    onHover(point.productionKg, point.predictedMaxKg, point.ts);
                  }
                  return "";
                },
              },
            },
          },
          onHover: (_, elements) => {
            if (onHover && elements.length === 0) {
              onHover(null, null);
            }
          },
        scales: {
          x: {
            ticks: { color: "#ccc" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
          y1: {
            position: "left",
            ticks: { color: "#36A2EB" },
            min: 29,        
            max: 32,      
          },
          y2: {
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: { color: "#FF6384" },
          },
        },
        }}
      />
    </div>
  );
}
