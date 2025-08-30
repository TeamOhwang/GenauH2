import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  HistogramSeriesOptions,
} from "lightweight-charts";
import { DailyData } from "@/hooks/threeDModel";

type Props = {
  data: DailyData[];
  start?: string;
  end?: string;
};

export default function DailyChart({ data, start, end }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  //  최초 1번: 차트 & 시리즈 생성
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { background: { color: "#fff" }, textColor: "#333" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
        timeScale: {
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,   // 스크롤 가능
        fixRightEdge: false,  // 스크롤 가능
        borderVisible: false, // 테두리 라인 제거
        },
    });

    seriesRef.current = chartRef.current.addHistogramSeries({
      color: "#3b82f6",
        priceFormat: {
        type: "custom",
        minMove: 1, // 최소 단위 (5단위로 스텝)
        formatter: (price) => `${price.toFixed(0)} kg`, // y축 라벨 표시 형식
  },
    } as HistogramSeriesOptions);

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

  //  데이터 반영 (data/start/end 변경될 때마다)
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;
    if (!data || data.length === 0) {
      seriesRef.current.setData([]); // 데이터 없으면 초기화
      return;
    }

    seriesRef.current.setData(
      data.map((d) => ({
        time: Math.floor(new Date(d.date).getTime() / 1000) as UTCTimestamp,
        value: d.production,
      }))
    );

    // X축 범위
    if (start && end) {
      chartRef.current.timeScale().setVisibleRange({
        from: Math.floor(new Date(start + "T00:00:00Z").getTime() / 1000) as UTCTimestamp,
        to: Math.floor(new Date(end + "T23:59:59Z").getTime() / 1000) as UTCTimestamp,
      });
    } else {
      chartRef.current.timeScale().fitContent();
    }

    // Y축 자동 스케일
    seriesRef.current.priceScale().applyOptions({ autoScale: true });
  }, [data, start, end]);

  return (
    <div className="bg-white rounded-xl p-4 shadow h-80">
      <h3 className="font-semibold mb-2">일별 생산량</h3>
      <div ref={chartContainerRef} className="w-full h-72" />
    </div>
  );
}
