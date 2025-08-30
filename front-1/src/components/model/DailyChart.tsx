// src/components/model/DailyChart.tsx
import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";
import { DailyData } from "@/hooks/threeDModel";

type Props = {
  data: DailyData[];
  start ?: string;
  end ? : string;
};

export default function DailyChart({ data }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const productionSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const predictedSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // ✅ 차트 초기화
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { background: { color: "#fff" }, textColor: "#333" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    // ✅ 생산량 (막대, 왼쪽 Y축)
    productionSeriesRef.current = chartRef.current.addHistogramSeries({
      color: "#3b82f6", // 파란색
      priceScaleId: "left", // 왼쪽 축
      priceFormat: { type: "volume" },
    });

    // ✅ 예측량 (선, 오른쪽 Y축)
    predictedSeriesRef.current = chartRef.current.addLineSeries({
      color: "#ef4444", // 빨간색
      lineWidth: 2,
      priceScaleId: "right", // 오른쪽 축
    });

    // ✅ 왼쪽 축 옵션 (생산량)
    chartRef.current.priceScale("left").applyOptions({
      scaleMargins: { top: 0.1, bottom: 0.05 },
    });

    // ✅ 오른쪽 축 옵션 (예측량)
    chartRef.current.priceScale("right").applyOptions({
      scaleMargins: { top: 0.1, bottom: 0.05 },
    });

    // 리사이즈
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ 데이터 반영
  useEffect(() => {
    if (!chartRef.current || !productionSeriesRef.current || !predictedSeriesRef.current) return;

    if (!data || data.length === 0) {
      productionSeriesRef.current.setData([]);
      predictedSeriesRef.current.setData([]);
      return;
    }

    const prodData = data.map((d) => ({
      time: Math.floor(new Date(d.date).getTime() / 1000) as UTCTimestamp,
      value: d.production,
    }));

    const predData = data.map((d) => ({
      time: Math.floor(new Date(d.date).getTime() / 1000) as UTCTimestamp,
      value: d.predicted,
    }));

    productionSeriesRef.current.setData(prodData);
    predictedSeriesRef.current.setData(predData);

    chartRef.current.timeScale().fitContent();
  }, [data]);

  return (
    <div className="bg-white rounded-xl p-4 shadow flex-1 flex flex-col">
      <h3 className="font-semibold mb-2">일별 생산량 & 예측량</h3>
      <div ref={chartContainerRef} className="w-full flex-1" />
    </div>
  );
}
