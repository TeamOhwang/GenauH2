import { useEffect, useState, useCallback } from "react";
import { oneFacilityApi, FacilityKpi } from "@/api/OnefacilityApi";

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
      // ✅ API는 이제 그냥 배열 반환
      const list: FacilityKpi[] = await oneFacilityApi.listByFacility({
        orgId,
        facIds: [facId],
        start: `${start}T00:00:00`,
        end: `${end}T23:59:59`,
        size: 1000,
      });

      // ✅ 일별 합계 (UTC → KST 변환 후 일자별 그룹핑)
      const dailyMap: Record<string, { production: number; predicted: number }> = {};
      list.forEach((cur) => {
        const local = new Date(cur.ts);
        const kst = new Date(local.getTime() + 9 * 60 * 60 * 1000); // UTC+9
        const date = kst.toISOString().slice(0, 10);

        if (!dailyMap[date]) dailyMap[date] = { production: 0, predicted: 0 };
        dailyMap[date].production += cur.productionKg;
        dailyMap[date].predicted += cur.predictedMaxKg;
      });

      const sortedDates = Object.keys(dailyMap).sort();
      const dailyData = sortedDates.map((d) => ({
        date: d,
        production: dailyMap[d].production,
        predicted: dailyMap[d].predicted,
      }));
      setDaily(dailyData);

      // ✅ 선택된 날짜의 시간별 합계
      const selectedDate = dailyData[page]?.date;
      const hourlyMap: Record<string, number> = {};
      for (let h = 0; h < 24; h++) hourlyMap[`${String(h).padStart(2, "0")}:00`] = 0;

      list.forEach((cur) => {
        const local = new Date(cur.ts);
        const kst = new Date(local.getTime() + 9 * 60 * 60 * 1000);
        const date = kst.toISOString().slice(0, 10);

        if (date === selectedDate) {
          const hour = kst.getHours();
          hourlyMap[`${String(hour).padStart(2, "0")}:00`] += cur.productionKg;
        }
      });

      setHourly(Object.entries(hourlyMap).map(([time, amount]) => ({ time, amount })));
    } finally {
      setLoading(false);
    }
  }, [orgId, facId, start, end, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { daily, hourly, loading, totalPages: daily.length };
}
