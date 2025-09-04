import { useEffect, useState, useCallback } from "react";
import { TankApi, TankKpi, PageResponse } from "@/api/tankApi";
import { useCycleStore } from "@/stores/useCycleStore";

export type DailyProduction = { date: string; production: number };
export type MonthlyProduction = { month: string; production: number };

const CYCLE_UNIT = 1000;

async function fetchAllPages(orgId: number, size: number) {
  let page = 0;
  let all: TankKpi[] = [];
  let totalPages = 1;

  while (page < totalPages) {
    const res: PageResponse<TankKpi> = await TankApi.listByOrg({ orgId, page, size });
    all = [...all, ...res.content];
    totalPages = res.totalPages;
    page++;
  }
  return all;
}

export function useTankDashboard(orgId: number | null, size: number = 1000) {
  const { soldCycles } = useCycleStore();
  const [data, setData] = useState<TankKpi[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyProduction[]>([]);
  const [todayProduction, setTodayProduction] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [level, setLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);

    try {
      const allData = await fetchAllPages(orgId, size);

      // 설비 ID 중복 합산
      const aggregated = Object.values(
        allData.reduce((acc, cur) => {
          const key = cur.facId;
          if (!acc[key]) acc[key] = { ...cur };
          else {
            acc[key].productionKg += cur.productionKg;
            acc[key].predictedMaxKg += cur.predictedMaxKg;
          }
          return acc;
        }, {} as Record<number, TankKpi>)
      );

      //  일별 집계
      const dailyMap = allData.reduce((acc, cur) => {
        if (!cur.ts) return acc;
        const kst = new Date(new Date(cur.ts).getTime() + 9 * 60 * 60 * 1000);
        const day = kst.toISOString().slice(0, 10);
        if (!acc[day]) acc[day] = 0;
        acc[day] += cur.productionKg ?? 0;
        return acc;
      }, {} as Record<string, number>);

      const daily = Object.keys(dailyMap).sort().map((d) => ({
        date: d,
        production: Number(dailyMap[d].toFixed(1)),
      }));

      //  월별 집계
      const monthlyMap = daily.reduce((acc, cur) => {
        const month = cur.date.slice(0, 7);
        if (!acc[month]) acc[month] = 0;
        acc[month] += cur.production;
        return acc;
      }, {} as Record<string, number>);

      const monthly = Object.keys(monthlyMap).sort().map((m) => ({
        month: m,
        production: Number(monthlyMap[m].toFixed(1)),
      }));

      //  오늘까지 누적
      const today = new Date().toISOString().slice(0, 10);
      const todayTotal = daily
        .filter((d) => d.date <= today)
        .reduce((sum, d) => sum + d.production, 0);

      //  사이클/레벨 계산 (판매 반영)
      const rawCycles = Math.floor(todayTotal / CYCLE_UNIT);
      const rawLevel = todayTotal % CYCLE_UNIT;

      setData(aggregated);
      setMonthlyData(monthly);
      setTodayProduction(todayTotal);
      setCycles(rawCycles - soldCycles);
      setLevel(rawLevel);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "수소 생산 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [orgId, size, soldCycles]);

  useEffect(() => {
    if (orgId) fetchData();
  }, [fetchData, orgId]);

  return { data, monthlyData, todayProduction, cycles, level, loading, error };
}
