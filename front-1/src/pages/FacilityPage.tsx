import { useMemo, useState } from "react";
import { useFacilitiesByOrg } from "@/hooks/useFacilitiesByOrg";
import { useAuthStore } from "@/stores/useAuthStore";

import TopControlBar from "@/components/Kpi/TopControlBar";
import KpiCard from "@/components/Kpi/KpiCard";
import FacilityLineChart from "@/components/Kpi/FacilityLineChart";
import FacilityTable from "@/components/Kpi/FacilityTable";

export default function FacilityDashboard() {
  const orgId = useAuthStore((s) => s.orgId);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedDay, setSelectedDay] = useState("");


  const { data, loading, error } = useFacilitiesByOrg(
    orgId ?? 0,
    start || undefined,
    end || undefined,
    0,
    500
  );

  // hover 상태
  const [hoverProd, setHoverProd] = useState<number | null>(null);
  const [hoverPred, setHoverPred] = useState<number | null>(null);

  //  선택된 날짜 기준으로 시간별 합산 데이터 생성
const mappedData = useMemo(() => {
  if (!selectedDay) return [];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return hours.map((h) => {
    const hourData = data.filter((d) => {
      if (!d.ts) return false;

      const dDate = new Date(d.ts);
      if (isNaN(dDate.getTime())) return false;

      //  로컬 기준 YYYY-MM-DD
      const localDate = `${dDate.getFullYear()}-${String(
        dDate.getMonth() + 1
      ).padStart(2, "0")}-${String(dDate.getDate()).padStart(2, "0")}`;

      return localDate === selectedDay && dDate.getHours() === h;
    });

    const productionSum =
      hourData.reduce((sum, d) => sum + (d.productionKg ?? 0), 0) * 10.1;
    const predictedSum =
      hourData.reduce((sum, d) => sum + (d.predictedMaxKg ?? 0), 0) / 2;

    return {
      ts: `${selectedDay}T${String(h).padStart(2, "0")}:00:00`,
      productionKg: productionSum,
      predictedMaxKg: predictedSum,
      orgId: orgId ?? 0, //  FacilityKpi 타입 맞추려면 필요
      facId: 0,          
      facilityName: "모든 설비 합산",
    };
  });
}, [data, selectedDay, orgId]);

  //  하루 전체 합계 (KPI 카드용)
  const totalProduction = mappedData.reduce((sum, d) => sum + d.productionKg, 0);
  const totalPredicted = mappedData.reduce((sum, d) => sum + d.predictedMaxKg, 0);

  if (!orgId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400 text-lg">
        ⚠ 조직 정보 없음 (로그인 다시 확인 필요)
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 dark:text-white min-h-screen">
      {/* 왼쪽: KPI + 차트 */}
      <div className="flex flex-col w-2/3 p-6 space-y-6">
        <TopControlBar
          onDateSelect={(s, e, day) => {
            setStart(s);
            setEnd(e);
            setSelectedDay(day);
          }}
        />

        {loading && (
          <div className="text-gray-400 text-center mt-10">
            📡 데이터 불러오는 중...
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center mt-10">⚠ {error}</div>
        )}

        {/* 날짜 선택 전 안내 문구 */}
        {!loading && !error && !selectedDay && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            📅 날짜를 선택해주세요.
          </div>
        )}

        {/* 날짜 선택 후 데이터 렌더링 */}
        {!loading && !error && selectedDay && (
          <>
            {/* KPI 카드 */}
            <div className="grid grid-cols-2 gap-4">
              <KpiCard
                title={`${selectedDay} 최대 예측량`}
                value={hoverPred !== null ? hoverPred : totalPredicted}
                unit="kg"
              />
              <KpiCard
                title={`${selectedDay} 실제 생산량`}
                value={hoverProd !== null ? hoverProd : totalProduction}
                unit="kg"
              />
            </div>

            {/* 차트 */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-1 min-h-[500px]">
              <FacilityLineChart
                data={mappedData} // 합산된 데이터 전달
                selectedDay={selectedDay}
                onHover={(prod, pred) => {
                  setHoverProd(prod);
                  setHoverPred(pred);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* 오른쪽: 테이블 */}
      <div className="w-1/3 bg-slate-50 dark:bg-slate-900 p-4 flex flex-col">
        <div className="flex-1">
          <FacilityTable data={mappedData} start={start} end={end} />
        </div>
      </div>
    </div>
  );
}
