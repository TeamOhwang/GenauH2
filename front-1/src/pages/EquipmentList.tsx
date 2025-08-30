import { useState } from "react";

import FacilityImage from "@/components/model/FacilityImage";
import DailyChart from "@/components/model/DailyChart";
import HourlyTable from "@/components/model/ThreeDTable";
import TopControlBar from "@/components/model/TopControlBar";
import { useFacilityDashboard } from "@/hooks/threeDModel";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Dashboard() {
  const orgId = useAuthStore((s) => s.orgId);

  const [selected, setSelected] = useState<number | null>(null);
  const [start, setStart] = useState<string>();
  const [end, setEnd] = useState<string>();
  const [page, setPage] = useState(0);

  
  //  훅에서 orgId, 선택 설비, 날짜 범위, 페이지를 기반으로 데이터 가져오기
  const { daily, hourly, loading, totalPages } = useFacilityDashboard(
    orgId,
    selected,
    start,
    end,
    page,
  );

  // 설비별 이미지 매핑
  const facilityImages: Record<number, string> = {
    1: "/images/ffimg.jpg",
    // 필요 시 2,3,... 추가 가능
  };



  return (
    <div className="flex h-screen">
      <main className="flex-1 bg-slate-100 p-6 grid grid-cols-3 gap-6">
        {/* 메인 영역 */}
        <section className="col-span-2 space-y-4">
          <TopControlBar
            orgId={orgId}
            onDateSelect={(startDate, endDate) => {
              setStart(startDate);
              setEnd(endDate);
              setPage(0);
            }}
            onFacilitySelect={(facId) => {
              setSelected(facId);
              setPage(0);
            }}
          />

          {selected !== null ? (
            <>
              <FacilityImage
                imageUrl={facilityImages[selected] ?? "/images/ffimg.jpg"}
                alt={`설비 ${selected}`}
              />
              <DailyChart data={daily} start={start} end={end} />
            </>
          ) : (
            <p className="text-gray-500">설비를 선택해주세요</p>
          )}
        </section>

        {/* 사이드 영역 (시간별 테이블) */}
        <section className="col-span-1">
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <HourlyTable
              data={hourly}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              start={start}
              end={end}
            />
          )}
        </section>
      </main>
    </div>
  );
}