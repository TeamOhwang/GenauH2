import { useEffect, useState, useCallback } from "react";
import { TankApi, TankKpi, PageResponse } from "@/api/tankApi";

export type MonthlyProduction = {
  month: string;   // YYYY-MM
  production: number; // 월별 누적 생산량 (소수점 첫째 자리 반올림)
};

// 📌 월 리스트 생성
const generateMonthRange = (start: Date, end: Date) => {
  const months: string[] = [];
  const d = new Date(start);
  d.setDate(1);
  while (d <= end) {
    months.push(d.toISOString().slice(0, 7));
    d.setMonth(d.getMonth() + 1);
  }
  return months;
};

// 📌 전체 페이지 데이터 가져오기 (페이지네이션 전부 합침)
async function fetchAllPages(orgId: number, size: number) {
  let page = 0;
  let all: TankKpi[] = [];
  let totalPages = 1;

  while (page < totalPages) {
    const res: PageResponse<TankKpi> = await TankApi.listByOrg({
      orgId,
      page,
      size,
    });
    all = [...all, ...res.content];
    totalPages = res.totalPages;
    page++;
  }

  return all;
}

export function useTankDashboard(orgId: number | null, size: number = 500) {
  const [data, setData] = useState<TankKpi[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyProduction[]>([]);
  const [totalProduction, setTotalProduction] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!orgId) return;

    setLoading(true);
    try {
      const allData = await fetchAllPages(orgId, size);

      //  설비별 누적 집계
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

      // 월별 집계 (UTC → KST 보정)
      const monthlyMap = allData.reduce((acc, cur) => {
        if (!cur.ts) return acc;
        const kst = new Date(new Date(cur.ts).getTime() + 9 * 60 * 60 * 1000);
        const month = kst.toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = 0;
        acc[month] += cur.productionKg ?? 0;
        return acc;
      }, {} as Record<string, number>);

      // 최초 생산월 ~ 현재까지 월 범위
      let firstMonth: Date | null = null;
      allData.forEach((cur) => {
        if (cur.ts) {
          const d = new Date(cur.ts);
          if (!firstMonth || d < firstMonth) {
            firstMonth = d;
          }
        }
      });

      const end = new Date();
      const start = firstMonth ? new Date(firstMonth) : new Date();
      start.setDate(1);

      const monthRange = generateMonthRange(start, end);
      const monthly = monthRange.map((m) => ({
        month: m,
        production: Number((monthlyMap[m] ?? 0).toFixed(1)), 
      }));

   
      const total = allData.reduce(
        (sum, cur) => sum + (cur.productionKg ?? 0),
        0
      );

      setData(aggregated);
      setMonthlyData(monthly);
      setTotalProduction(Number(total.toFixed(1)));
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "수소 생산 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [orgId, size]);

  useEffect(() => {
    if (orgId) fetchData();
  }, [fetchData, orgId]);

  return { data, totalProduction, monthlyData, loading, error, refetch: fetchData };
}
