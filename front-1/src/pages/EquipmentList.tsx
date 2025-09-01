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

  const { daily, hourly, totalPages, total } = useFacilityDashboard(
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
      <main className="flex-1 bg-slate-100 p-6 grid grid-cols-3 gap-6 h-full">
        {/* 메인 영역 (왼쪽: 이미지 + 차트) */}
        <section className="col-span-2 flex flex-col h-full gap-4">
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
              <DailyChart total={total} />
            </>
          ) : (
            <p className="text-gray-500">설비를 선택해주세요</p>
          )}
        </section>

        {/* 사이드 영역 (오른쪽: 시간별 테이블) */}
        <section className="col-span-1 h-full">
          <HourlyTable
            data={hourly}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            start={start}
            end={end}
            selectedDate={daily[page]?.date}
          />
        </section>
      </main>
    </div>
  );
}
