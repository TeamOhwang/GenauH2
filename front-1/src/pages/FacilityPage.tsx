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

  //  테이블용 skeleton 데이터
  const mappedData = useMemo(() => {
    if (!selectedDay) return [];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return hours.map((h) => {
      const point = data.find((d) => new Date(d.ts).getHours() === h);
      return {
        ts: `${selectedDay}T${String(h).padStart(2, "0")}:00:00`,
        facilityName: point?.facilityName ?? "-",
        productionKg: (point?.productionKg ?? 0) * 10.1,
        predictedMaxKg: point?.predictedMaxKg ?? 0,
        orgId: point?.orgId ?? 0,   
        facId: point?.facId ?? 0,   
      };
    });
  }, [data, selectedDay]);

  // 합계 (테이블 기준으로 계산)
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
  <div className="flex bg-slate-900 text-white min-h-screen">
    {/* 왼쪽: KPI + 차트 */}
    <div className="w-2/3 flex flex-col p-6 space-y-6">
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
          📅 날짜를 클릭해주세요.
        </div>
      )}

      {/*날짜 선택 후 데이터 렌더링 */}
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

          <div className="bg-slate-800 p-4 rounded-xl flex-1">
            <FacilityLineChart
              data={data}
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
    <div className="w-1/3 bg-slate-800 p-4 flex flex-col">
      <FacilityTable data={mappedData} start={start} end={end} />
    </div>
  </div>
);
}