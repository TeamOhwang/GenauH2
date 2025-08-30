import { useEffect, useState } from "react";
import { FacilityApi, FacilityKpi } from "@/api/facilityApi";

export type DailyData = { date: string; production: number };
export type HourlyData = { time: string; amount: number };

export const useFacilityDashboard = (
  orgId: number | null,
  facId: number | null   //  facId도 같이 받음
) => {
  const [data, setData] = useState<FacilityKpi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orgId || !facId) return; // orgId + facId 둘 다 있어야 호출
    setLoading(true);

    //  변경: listByFacility 사용
    FacilityApi.listByFacility({ orgId, facId, size: 500 })
      .then((res) => setData(res.content))
      .finally(() => setLoading(false));
  }, [orgId, facId]);

  //  일별 집계
  const daily: DailyData[] = Object.entries(
    data.reduce<Record<string, number>>((acc, cur) => {
      const d = cur.ts.slice(0, 10); // yyyy-MM-dd
      acc[d] = (acc[d] ?? 0) + cur.productionKg;
      return acc;
    }, {})
  ).map(([date, production]) => ({ date, production }));

  //  시간별 리스트
  const hourly: HourlyData[] = data.map((d) => ({
    time: d.ts.slice(11, 16),
    amount: d.productionKg,
  }));

  return { daily, hourly, loading };
};
