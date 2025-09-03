import { useState } from "react";
import FacilityImage from "@/components/model/FacilityImage";
import DailyChart from "@/components/model/DailyChart";
import HourlyTable from "@/components/model/ThreeDTable";
import TopControlBar from "@/components/model/TopControlBar";
import { useFacilityDashboard } from "@/hooks/threeDModel";
import { useAuthStore } from "@/stores/useAuthStore";
import { motion } from "framer-motion";

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
    page
  );

  const facilityImages: Record<number, string> = {
    1: "/images/ffimg.jpg",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex h-screen"
    >
      <main className="flex-1 bg-slate-100 dark:bg-gray-900 p-6 grid grid-cols-3 gap-6">
        {/* 왼쪽: 이미지 + 일별 차트 */}
        <section className="col-span-2 flex flex-col gap-4">
          <TopControlBar
            orgId={orgId}
            onDateSelect={(s, e) => {
              setStart(s);
              setEnd(e);
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
            <p className="text-gray-600 dark:text-gray-400">설비를 선택해주세요</p>
          )}
        </section>

        {/* 오른쪽: 시간별 테이블 */}
        <section className="col-span-1">
          <HourlyTable
            data={hourly}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            selectedDate={daily[page]?.date}
          />
        </section>
      </main>
    </motion.div>
  );
}
