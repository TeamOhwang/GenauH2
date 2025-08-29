// src/pages/FacilityDashboard.tsx
import { useState } from "react";
import { useFacilitiesByOrg } from "@/hooks/useFacilitiesByOrg";
import { useAuthStore } from "@/stores/useAuthStore";
import TopControlBar from "@/components/Kpi/TopControlBar";
import KpiCard from "@/components/Kpi/KpiCard";
import TimeSlider from "@/components/Kpi/TimeSlider";
import FacilityLineChart from "@/components/Kpi/FacilityLineChart";
import FacilityTable from "@/components/Kpi/FacilityTable";

export default function FacilityDashboard() {
  // 로그인된 사용자 orgId
  const orgId = useAuthStore((s) => s.orgId);

  // 날짜/기간 필터 (LocalDateTime 포맷 문자열)
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  // 페이지네이션
  const [page, setPage] = useState(0);
  const size = 12;

  // interval (차트 뷰 단위)
  const [interval, setInterval] = useState<"15min" | "1h" | "1d">("1h");

  // 데이터 훅 호출 (start/end 기본값은 훅 내부에서 보장됨)
  const { data, totalPages, totalElements, loading, error } = useFacilitiesByOrg(
    orgId ?? 0,
    start || undefined,
    end || undefined,
    page,
    size
  );

  // KPI 계산 (NaN 방지)
  const totalPredicted = data.reduce((a, c) => a + (c.predictedMaxKg || 0), 0);
  const totalProduction = data.reduce((a, c) => a + (c.productionKg || 0), 0);

  // 조직 정보 없음 처리
  if (!orgId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400 text-lg">
        ⚠ 조직 정보 없음 (로그인 다시 확인 필요)
      </div>
    );
  }

  return (
    <div className="flex bg-slate-900 text-white min-h-screen">
      {/* 왼쪽 영역: KPI + 차트 */}
      <div className="w-2/3 flex flex-col p-6 space-y-6">
        {/* 상단 컨트롤바 */}
        <TopControlBar
          interval={interval}
          onIntervalChange={setInterval}
          onRangeChange={(s, e) => {
            setStart(s);
            setEnd(e);
            setPage(0); // 날짜 바뀌면 페이지 리셋
          }}
        />

        {/* 로딩/에러 처리 */}
        {loading && (
          <div className="text-gray-400 text-center mt-10">
            📡 데이터 불러오는 중...
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center mt-10">⚠ {error}</div>
        )}

        {!loading && !error && (
          <>
            {/* KPI 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <KpiCard title="총 최대 예측량" value={totalPredicted} unit="kg" />
              <KpiCard title="총 실제 생산량" value={totalProduction} unit="kg" />
              <KpiCard title="데이터 개수" value={totalElements} unit="rows" />
            </div>

            {/* 기간 슬라이더 */}
            <div className="bg-slate-800 p-4 rounded-xl">
              <TimeSlider dataLength={data.length} />
            </div>

            {/* 라인 차트 */}
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

      {/* 오른쪽 영역: 테이블 */}
      <div className="w-1/3 bg-slate-800 p-4 flex flex-col">
        <FacilityTable
          orgId={orgId}
          data={data}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          start={start || undefined}
          end={end || undefined}
        />
      </div>
    </div>
  );
}
