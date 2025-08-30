import { useEffect, useState } from "react";
import { FacilityApi, FacilityKpi } from "@/api/facilityApi";

export type DailyData = { date: string; production: number };
export type HourlyData = { time: string; amount: number };

export const useFacilityDashboard = (
  orgId: number | null,
  facId: number | null,
  start?: string,
  end?: string,
  page: number = 0 // 하루 단위 페이지네이션
) => {
  const [data, setData] = useState<FacilityKpi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orgId || !facId || !start || !end) return;
    setLoading(true);

    FacilityApi.listByFacility({
      orgId,
      facId,
      start: `${start}T00:00:00`,
      end: `${end}T23:59:59`,
      size: 1000, // 전체 기간 데이터 충분히 받기
    })
      .then((res) => setData(res.content ?? []))
      .finally(() => setLoading(false));
  }, [orgId, facId, start, end]);

  // 일별 합계 (기간 내 모든 일자 채움, 로컬 기준)
  const daily: DailyData[] = (() => {
    if (!start || !end) return [];

    const startDate = new Date(start);
    const endDate = new Date(end);
    const map: Record<string, number> = {};

    data.forEach((cur) => {
      const local = new Date(cur.ts);
      const date = new Date(local.getTime() - local.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

      map[date] = (map[date] ?? 0) + cur.productionKg * 10.1;
    });

    const result: DailyData[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      result.push({
        date: iso,
        production: map[iso] ?? 0,
      });
    }
    return result;
  })();

  const allDates = daily.map((d) => d.date);
  const selectedDate = allDates[page] ?? null;

  const hourly: HourlyData[] = (() => {
    if (!selectedDate) return [];

    const map: Record<string, number> = {};
    for (let h = 0; h < 24; h++) {
      const hour = String(h).padStart(2, "0") + ":00";
      map[hour] = 0;
    }

    data.forEach((cur) => {
      const local = new Date(cur.ts);
      const date = new Date(local.getTime() - local.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

      if (date === selectedDate) {
        const time = new Date(local.getTime() - local.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(11, 16); // HH:mm
        if (map[time] !== undefined) {
          map[time] = Number((map[time] + cur.productionKg * 10.1).toFixed(3));
        }
      }
    });

    return Object.entries(map).map(([time, amount]) => ({ time, amount }));
  })();

  const totalPages = allDates.length;

  return { daily, hourly, loading, totalPages, page, selectedDate };
};
