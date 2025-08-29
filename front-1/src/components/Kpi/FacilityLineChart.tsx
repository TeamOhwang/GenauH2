import { useRef } from "react";
import "@/utils/register";
import { Line } from "react-chartjs-2";
import type { FacilityKpi } from "@/api/facilityApi";
import zoomPlugin from "chartjs-plugin-zoom";
import { Chart as ChartJS } from "chart.js";

ChartJS.register(zoomPlugin);

export default function FacilityLineChart({ data = [] }: { data?: FacilityKpi[] }) {
  // 라벨: X축에 표시될 시간 (MM-DD HH시)
  const labels = data.map((d) =>
    d.ts
      ? new Date(d.ts).toLocaleString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          hour12: false,
        })
      : "-"
  );

  const chartRef = useRef<any>(null);

  return (
    <div className="h-[450px] flex flex-col">
      <div className="flex-1">
        <Line
          ref={chartRef}
          data={{
            labels, // 가로축(X축) = 시간
            datasets: [
              {
                label: "실제 생산량 (kg)",
                data: data.map((d) => Number(d.productionKg ?? 0)),
                borderColor: "#36A2EB",
                borderWidth: 2,
                pointRadius: 0, // 점 제거
                fill: false, // 배경 제거
                tension: 0, // 직선
                yAxisID: "y1", // 왼쪽 Y축
              },
              {
                label: "최대 예측량 (kg)",
                data: data.map((d) => Number(d.predictedMaxKg ?? 0)),
                borderColor: "#FF6384",
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0,
                yAxisID: "y2", // 오른쪽 Y축
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "nearest",
              intersect: false,
            },
            plugins: {
              legend: { position: "top" },
              tooltip: {
                enabled: true,
                mode: "index",
                intersect: false,
              },
              zoom: {
                pan: {
                  enabled: true,
                  mode: "x", // 가로축 이동
                  threshold: 5,
                },
                zoom: {
                  wheel: { enabled: true },
                  pinch: { enabled: true },
                  drag: { enabled: true },
                  mode: "x", // 가로축만 확대
                },
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "시간대",
                  color: "#ccc",
                },
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: {
                  color: "#ccc",
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 12,
                },
              },
              y1: {
                title: {
                  display: true,
                  text: "생산량 (kg)",
                  color: "#36A2EB",
                },
                type: "linear",
                position: "left",
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: { color: "#36A2EB" },
              },
              y2: {
                title: {
                  display: true,
                  text: "예측량 (kg)",
                  color: "#FF6384",
                },
                type: "linear",
                position: "right",
                grid: { drawOnChartArea: false },
                ticks: { color: "#FF6384" },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
