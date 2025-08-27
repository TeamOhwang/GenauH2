// src/hooks/useFacilitiesByOrg.ts
import { useEffect, useState } from "react";
import { FacilityApi, FacilityReq } from "@/api/facilityApi";

export function useFacilitiesByOrg(orgId: number) {
  const [data, setData] = useState<FacilityReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const facilities = await FacilityApi.listByOrg(orgId);
      setData(facilities);
      setError(null);
    } catch {
      setError("설비 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchFacilities();
  }, [orgId]);

  return { data, loading, error, refetch: fetchFacilities };
}
