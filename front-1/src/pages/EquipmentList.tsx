import { useState } from "react";
import Sidebar from "@/components/model/ThreeDBar";
import Facility3D from "@/components/model/ThreeDFacility";
import DailyChart from "@/components/model/DailyChart";
import HourlyTable from "@/components/model/ThreeDTable";
import { useFacilityDashboard } from "@/hooks/threeDModel";
import { useAuthStore } from "@/stores/useAuthStore"; // ✅ orgId 가져오기

export default function Dashboard() {
  const orgId = useAuthStore((s) => s.orgId);          // ✅ 로그인된 사용자 orgId
  const [selected, setSelected] = useState<number | null>(null); // facId

  const facilities = [
    { id: 1, name: "광명 설비" },
    { id: 2, name: "벽석 설비" },
    { id: 3, name: "화성 설비" },
  ];

  // ✅ orgId + facId 넘겨줌
  const { daily, hourly, loading } = useFacilityDashboard(orgId, selected);

  return (
    <div className="flex h-screen">
      <Sidebar facilities={facilities} onSelect={setSelected} />

      <main className="flex-1 bg-slate-100 p-6 grid grid-cols-3 gap-6">
        <section className="col-span-2 space-y-4">
          {selected ? (
            <>
              <Facility3D modelUrl="/models/facility.glb" />
              <DailyChart data={daily} />
            </>
          ) : (
            <p className="text-gray-500">설비를 선택해주세요</p>
          )}
        </section>

        <section className="col-span-1">
          {loading ? <p>로딩 중...</p> : <HourlyTable data={hourly} />}
        </section>
      </main>
    </div>
  );
}
