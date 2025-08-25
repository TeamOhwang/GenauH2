
import { useEffect, useMemo, useState } from "react";
import { fetchFacilities, fetchPeriodSummary, fetchDaily } from "@/api/plantApi";
import { AuthApi } from "@/api/authApi";
import type { Facility } from "@/domain/graph/facility";


type KpiRow = {
  plantId: string;
  name: string;
  productionTotalKg: number;
  predictedTotalKg: number;
  predictedPeakKg: number; // 설비의 일별 predicted 최대값
};

export function useUserFacilitiesKpi(params: {
  start: string;
  end: string;
  selectedIds?: string[];
}) {
  const { start, end, selectedIds } = params;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [kpi, setKpi] = useState<{
    totalProduction: number;
    totalPredicted: number;
    predictedPeak: number; // 날짜별 predicted 합계의 최댓값(선택 설비 집합 기준)
    perPlant: KpiRow[];
  }>({
    totalProduction: 0,
    totalPredicted: 0,
    predictedPeak: 0,
    perPlant: [],
  });

  const key = useMemo(
    () =>
      JSON.stringify({
        start,
        end,
        selectedIds: (selectedIds ?? []).slice().sort(),
        facCount: facilities.length,
      }),
    [start, end, selectedIds, facilities.length]
  );

  /** 1) 프로필(orgId) → 설비 목록 */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(undefined);

        const me = await AuthApi.profile(); // { userId, orgId, role, email }
        const list = await fetchFacilities(me.orgId ?? undefined); // orgId 없으면 전체

        if (!alive) return;
        setFacilities(list);
      } catch (e) {
        if (!alive) return;
        setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /** 2) KPI 계산 (선택 설비 없으면 전체 설비 기준) */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!facilities.length) return;

      setLoading(true);
      setError(undefined);

      // 대상 설비 ID 목록 (string[])
      const ids = selectedIds?.length
        ? selectedIds
        : facilities.map((f) => String(f.facilityId));

      try {
        // (A) Σ 생산/예측: period-summary 우선, 실패 시 daily 폴백
        const summaries = await Promise.all(
          ids.map(async (pid) => {
            try {
              return await fetchPeriodSummary({ plantId: pid, start, end });
            } catch (err) {
              // 404/기타 에러 → daily로 합산 폴백
              const rows = await fetchDaily({ plantId: pid, start, end });
              const productionTotalKg = rows.reduce(
                (a, r) => a + (r.productionKg ?? 0),
                0
              );
              const predictedTotalKg = rows.reduce(
                (a, r) => a + (r.predictedKg ?? 0),
                0
              );
              return {
                plantId: pid,
                plantName: undefined,
                productionTotalKg,
                predictedTotalKg,
              };
            }
          })
        );

        // (B) 예측 피크: 설비별 & 선택집합(날짜합) 기준
        const perPlantPeak: Record<string, number> = {};
        const dateMap = new Map<string, number>(); // yyyy-MM-dd -> predicted 합

        await Promise.all(
          ids.map(async (pid) => {
            const rows = await fetchDaily({ plantId: pid, start, end });
            let localPeak = 0;
            for (const r of rows) {
              const pred = r.predictedKg ?? 0;
              if (pred > localPeak) localPeak = pred;
              dateMap.set(r.date, (dateMap.get(r.date) ?? 0) + pred);
            }
            perPlantPeak[pid] = localPeak;
          })
        );

        const predictedPeak =
          dateMap.size > 0 ? Math.max(0, ...Array.from(dateMap.values())) : 0;

        // (C) 합계
        const totalProduction = summaries.reduce(
          (a, s: any) => a + (s.productionTotalKg ?? 0),
          0
        );
        const totalPredicted = summaries.reduce(
          (a, s: any) => a + (s.predictedTotalKg ?? 0),
          0
        );

        // (D) 설비명 매핑 & 행 구성
        const nameMap = new Map(
          facilities.map((f) => [String(f.facilityId), f.name])
        );

        const perPlant: KpiRow[] = ids.map((pid, i) => ({
          plantId: pid,
          name: (summaries[i] as any)?.plantName ?? nameMap.get(pid) ?? pid,
          productionTotalKg: (summaries[i] as any)?.productionTotalKg ?? 0,
          predictedTotalKg: (summaries[i] as any)?.predictedTotalKg ?? 0,
          predictedPeakKg: perPlantPeak[pid] ?? 0,
        }));

        if (!alive) return;
        setKpi({ totalProduction, totalPredicted, predictedPeak, perPlant });
      } catch (e) {
        if (!alive) return;
        setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [key]);

  return { facilities, ...kpi, loading, error };
}
