import { useRef } from "react";
import "@/utils/register";
import { Chart } from "react-chartjs-2";
import type { FacilityKpi } from "@/api/facilityApi";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  Chart as ChartJS,
  TooltipItem,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useDarkModeStore } from "@/stores/useDarkModeStore";

ChartJS.register(
  zoomPlugin,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FacilityLineChart({
  data = [],
  onHover,
}: {
  data?: FacilityKpi[];
  onHover?: (prod: number | null, pred: number | null, ts?: string) => void;
}) {
  const { isDarkMode } = useDarkModeStore();
  const chartRef = useRef<any>(null);

  // 다크모드 색상
  const textColor = isDarkMode ? "#e5e7eb" : "#374151";
  const gridColor = isDarkMode
    ? "rgba(75, 85, 99, 0.2)"
    : "rgba(229, 231, 235, 0.5)";
  const legendColor = isDarkMode ? "#e5e7eb" : "#374151";

  return (
    <div className="flex-1 flex flex-col">
      <Chart
        ref={chartRef}
        type="line" // 기본 타입
        data={{
          labels: data.map(
            (d) =>
              new Date(d.ts).getHours().toString().padStart(2, "0") + "시"
          ),
          datasets: [
            {
              type: "line" as const,
              label: "실제 생산량 (kg)",
              data: data.map((d) => d.productionKg),
              borderColor: "#36A2EB",
              backgroundColor: "#36A2EB",
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 10,
              pointHoverBackgroundColor: "#36A2EB",
              fill: false,
              tension: 0.2,
              yAxisID: "y1",
            },
            {
              type: "line" as const,
              label: "최대 예측량 (kg)",
              data: data.map((d) => d.predictedMaxKg),
              borderColor: "#FF6384",
              backgroundColor: "#FF6384",
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 10,
              pointHoverBackgroundColor: "#FF6384",
              fill: false,
              tension: 0.2,
              yAxisID: "y2",
            },
            {
              type: "bar" as const, // ✅ 이제 에러 안 남
              label: "달성률 (%)",
              data: data.map((d) =>
                d.predictedMaxKg > 0
                  ? (d.productionKg / d.predictedMaxKg) * 100
                  : 0
              ),
              backgroundColor: "rgba(16, 185, 129, 0.6)",
              borderColor: "#10B981",
              borderWidth: 1,
              yAxisID: "y3",
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            legend: {
              position: "top",
              labels: { color: legendColor, font: { size: 12 } },
            },
            tooltip: {
              enabled: true,
              mode: "index",
              backgroundColor: isDarkMode
                ? "rgba(31, 41, 55, 0.9)"
                : "rgba(255, 255, 255, 0.9)",
              titleColor: isDarkMode ? "#e5e7eb" : "#374151",
              bodyColor: isDarkMode ? "#e5e7eb" : "#374151",
              borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
              borderWidth: 1,
              titleFont: { size: 16, weight: "bold" },
              bodyFont: { size: 14 },
              padding: 12,
              callbacks: {
                label: (context: TooltipItem<"line">) => {
                  const value = context.raw as number;
                  if (context.dataset.label === "달성률 (%)") {
                    return `달성률: ${value.toFixed(1)}%`;
                  }
                  return `${context.dataset.label}: ${value.toFixed(1)} kg`;
                },
              },
            },
          },
          onHover: (_, elements) => {
            if (!onHover) return;
            if (elements.length === 0) {
              onHover(null, null, undefined);
            } else {
              const chart = chartRef.current;
              if (chart) {
                const idx = elements[0].index;
                const point = data[idx];
                if (point) {
                  onHover(point.productionKg, point.predictedMaxKg, point.ts);
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, padding: 0 },
            },
            y1: {
              type: "linear",
              position: "left",
              grid: { color: gridColor },
              ticks: { color: "#36A2EB" },
            },
            y2: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false, color: gridColor },
              ticks: { color: "#FF6384", stepSize: 50 },
            },
            y3: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              min: 0,
              max: 120,
              ticks: {
                color: "#10B981",
                callback: (val) => val + "%",
              },
            },
          },
        }}
      />
    </div>
  );
}
