import { useEffect, useState, useCallback } from "react";
import { oneFacilityApi, FacilityKpi } from "@/api/oneFacilityApi";

export type DailyData = { date: string; production: number; predicted: number };
export type HourlyData = { time: string; amount: number };

export function useFacilityDashboard(
  orgId: number | null,
  facId: number | null,
  start?: string,
  end?: string,
  page: number = 0
) {
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!orgId || !facId || !start || !end) return;
    setLoading(true);

    try {
      const list: FacilityKpi[] = await oneFacilityApi.listByFacility({
        orgId,
        facIds: [facId],
        start: `${start}T00:00:00`,
        end: `${end}T23:59:59`,
        size: 1000,
      });

      // 일별 집계
      const dailyMap: Record<string, { production: number; predicted: number }> = {};
      list.forEach((cur) => {
        const date = cur.ts.slice(0, 10); // YYYY-MM-DD
        if (!dailyMap[date]) dailyMap[date] = { production: 0, predicted: 0 };
        dailyMap[date].production += cur.productionKg ?? 0;
        dailyMap[date].predicted += cur.predictedMaxKg ?? 0;
      });

      const sortedDates = Object.keys(dailyMap).sort();
      const dailyData = sortedDates.map((d) => ({
        date: d,
        production: parseFloat(dailyMap[d].production.toFixed(1)),
        predicted: parseFloat(dailyMap[d].predicted.toFixed(1)),
      }));
      setDaily(dailyData);

      // 선택일 시간별 집계
      const selectedDate = dailyData[page]?.date;
      const hourlyMap: Record<string, number> = {};
      for (let h = 0; h < 24; h++) hourlyMap[`${String(h).padStart(2, "0")}:00`] = 0;

      list.forEach((cur) => {
        const date = cur.ts.slice(0, 10);
        if (date === selectedDate) {
          const hour = cur.ts.slice(11, 13); // HH
          hourlyMap[`${hour}:00`] += cur.productionKg ?? 0;
        }
      });

      setHourly(
        Object.entries(hourlyMap).map(([time, amount]) => ({
          time,
          amount: parseFloat(amount.toFixed(1)),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [orgId, facId, start, end, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const total = daily.reduce(
    (acc, cur) => ({
      production: acc.production + cur.production,
      predicted: acc.predicted + cur.predicted,
    }),
    { production: 0, predicted: 0 }
  );

  return { daily, hourly, loading, totalPages: daily.length, total };
}
