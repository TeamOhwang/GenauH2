// src/pages/FacilityDashboard.tsx
import { useFacilitiesByOrg } from "@/hooks/useFacilitiesByOrg";
import FacilityCard from "@/components/FacilityCard";

export default function EquipmentList() {
  const orgId = 1; // TODO: 로그인 후 orgId 연동
  const { data, loading, error } = useFacilitiesByOrg(orgId);

  if (loading) return <p className="p-4">불러오는 중...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">설비 대시보드</h1>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {data.map((f, idx) => (
          <FacilityCard key={`${f.facId}-${idx}`} facility={f} index={idx + 1} />
        ))}
      </div>
    </div>
  );
}
