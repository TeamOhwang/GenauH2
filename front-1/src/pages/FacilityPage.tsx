import { useState } from "react";
import { useFacilitiesByOrg } from "@/hooks/useFacilitiesByOrg";
import { useAuthStore } from "@/stores/useAuthStore";
import TopControlBar from "@/components/Kpi/TopControlBar";
import KpiCard from "@/components/Kpi/KpiCard";
import FacilityLineChart from "@/components/Kpi/FacilityLineChart";
import FacilityTable from "@/components/Kpi/FacilityTable";

export default function FacilityDashboard() {
  const orgId = useAuthStore((s) => s.orgId);

  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");

  const [page, setPage] = useState(0);
  const size = 500; // 하루 데이터 충분히 커버 가능

  const { data, totalPages, loading, error } = useFacilitiesByOrg(
    orgId ?? 0,
    start || undefined,
    end || undefined,
    page,
    size
  );

  const totalProduction = data.reduce((sum, d) => sum + (d.productionKg || 0), 0);
  const totalPredicted = data.reduce((sum, d) => sum + (d.predictedMaxKg ?? 50), 0);
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
        {/* 날짜 버튼 */}
        <TopControlBar
          onDateSelect={(s, e, day) => {
            setStart(s);
            setEnd(e);
            setSelectedDay(day);
            setPage(0);
          }}
        />

        {loading && <div className="text-gray-400 text-center mt-10">📡 데이터 불러오는 중...</div>}
        {error && <div className="text-red-500 text-center mt-10">⚠ {error}</div>}

        {!loading && !error && (
          <>
            {/* KPI 카드 */}
            <div className="grid grid-cols-2 gap-4">
              <KpiCard title={`${selectedDay} 총 최대 예측량`} value={totalPredicted} unit="kg" />
              <KpiCard title={`${selectedDay} 총 실제 생산량`} value={totalProduction} unit="kg" />
            </div>

            {/* 차트 */}
            <div className="bg-slate-800 p-4 rounded-xl flex-1">
              {data.length > 0 ? (
                <FacilityLineChart data={data} />
              ) : (
                <div className="text-gray-400 text-center py-20">
                  표시할 데이터가 없습니다.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 오른쪽: 테이블 */}
      <div className="w-1/3 bg-slate-800 p-4 flex flex-col">
        <FacilityTable
          orgId={orgId}
          data={data}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          start={start}
          end={end}
        />
      </div>
    </div>

    
  );

  
}
