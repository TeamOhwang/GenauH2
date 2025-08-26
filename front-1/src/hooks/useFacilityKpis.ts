import { useEffect, useState } from "react";
import { fetchFacilityKpis } from "@/api/facilityApi";
import type { FacilityKpi } from "@/domain/graph/facility";

export function useFacilityKpis(
  facilityIds: number[],
  startDate: string,
  endDate: string
) {
  const [kpis, setKpis] = useState<FacilityKpi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (facilityIds.length === 0) {
      setKpis([]);
      return;
    }
    setLoading(true);
    fetchFacilityKpis({ facilityIds, startDate, endDate }).then((data) => {
      setKpis(data);
      setLoading(false);
    });
  }, [facilityIds, startDate, endDate]);

  return { kpis, loading };
}
