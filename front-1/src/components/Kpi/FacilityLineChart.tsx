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
  //  0~23시 skeleton
  const hours = Array.from({ length: 24 }, (_, i) => i);

  //  skeleton 데이터 (해당 시각에 매칭되는 값 있으면 채움)
  const mappedData = hours.map((h) => {
    const point = data.find((d) => new Date(d.ts).getHours() === h);
    return {
      ts: `${selectedDay}T${String(h).padStart(2, "0")}:00:00`,
      productionKg: point?.productionKg ?? 0,
      predictedMaxKg: point?.predictedMaxKg ?? 0,
    };
  });

  const chartRef = useRef<any>(null);

  return (
     <div className="flex-1 flex flex-col">
      <Line
        ref={chartRef}
        data={{
          labels: hours.map((h) => `${h}시`), 
          datasets: [
            {
              label: "실제 생산량 (kg)",
              data: mappedData.map((d) => d.productionKg *10.1),
              borderColor: "#36A2EB",
              borderWidth: 2,
              pointRadius: 2,
              fill: false,
              tension: 0.1,
              yAxisID: "y1",
            },
            {
              label: "최대 예측량 (kg)",
              data: mappedData.map((d) => d.predictedMaxKg ),
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
          layout: {
            padding: { top: 10, bottom: 0 }, 
          },
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            legend: { position: "top" },
            tooltip: {
              enabled: true,
              mode: "index",
              callbacks: {
                title: (items) => items[0].label,
                label: (context) => {
                  const value = context.raw as number;
                  return `${context.dataset.label}: ${value.toFixed(2)} kg`;
                },
                afterBody: (items) => {
                  if (onHover && items.length > 0) {
                    const idx = items[0].dataIndex;
                    const point = mappedData[idx];

                    const prod = point.productionKg * 10.1;
                    const pred = point.predictedMaxKg ;

                    onHover(prod, pred, point.ts);
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
              title: { display: false, text: " ", color: "#ccc" },
              grid: { color: "rgba(255,255,255,0.05)" },
              ticks: { color: "#ccc", padding: 0 },
            },
            y1: {
              title: { display: true, text: " ", color: "#36A2EB" },
              type: "linear",
              position: "left",
              ticks: { color: "#36A2EB" ,},
              
              
              
            },
            y2: {
              title: { display: true, text: " ", color: "#FF6384" },
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              ticks: { color: "#FF6384" ,stepSize: 50,},
            },
          },
        }}
      />
    </div>
  );
}
