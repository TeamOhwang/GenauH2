import { useFacilitiesByOrg } from "@/hooks/useFacilitiesByOrg";
import FacilityTable from "@/components/FacilityTable";

export default function FacilityPage() {
  const orgId = 1; 
  const { data, loading, error, refetch } = useFacilitiesByOrg(orgId);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">설비 목록</h1>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <FacilityTable items={data} />}

      <button
        onClick={refetch}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        새로고침
      </button>
    </div>
  );
}
