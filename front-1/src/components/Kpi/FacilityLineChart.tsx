import { useRef } from "react";
import "@/utils/register";
import { Line } from "react-chartjs-2";
import type { FacilityKpi } from "@/api/facilityApi";
import zoomPlugin from "chartjs-plugin-zoom";
import { Chart as ChartJS } from "chart.js";
import { useDarkModeStore } from "@/stores/useDarkModeStore";

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
  const { isDarkMode } = useDarkModeStore();
  const chartRef = useRef<any>(null);

  // 다크모드 색상
  const textColor = isDarkMode ? "#e5e7eb" : "#374151";
  const gridColor = isDarkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.5)";
  const legendColor = isDarkMode ? "#e5e7eb" : "#374151";

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
              backgroundColor: "#36A2EB",
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: "#36A2EB",
              fill: false,
              tension: 0.2,
              yAxisID: "y1",
            },
            {
              label: "최대 예측량 (kg)",
              data: data.map((d) => d.predictedMaxKg),
              borderColor: "#FF6384",
              backgroundColor: "#FF6384",
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: "#FF6384",
              fill: false,
              tension: 0.2,
              yAxisID: "y2",
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 800,
            easing: "easeOutQuart",
          },
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: legendColor,
                font: { size: 12 },
              },
            },
            tooltip: {
              enabled: true,
              mode: "index",
              backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.9)",
              titleColor: isDarkMode ? "#e5e7eb" : "#374151",
              bodyColor: isDarkMode ? "#e5e7eb" : "#374151",
              borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
              borderWidth: 1,
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  return `${context.dataset.label}: ${value.toFixed(1)} kg`;
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
              title: { display: false, text: " ", color: textColor },
              grid: { color: gridColor },
              ticks: { color: textColor, padding: 0 },
            },
            y1: {
              title: { display: true, text: " ", color: "#36A2EB" },
              type: "linear",
              position: "left",
              grid: { color: gridColor },
              ticks: { color: "#36A2EB" },
            },
            y2: {
              title: { display: true, text: " ", color: "#FF6384" },
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false, color: gridColor },
              ticks: { color: "#FF6384", stepSize: 50 },
            },
          },
        }}
      />
    </div>
  );
}
