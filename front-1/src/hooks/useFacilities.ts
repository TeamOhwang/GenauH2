import { useEffect, useState } from "react";
import { fetchFacilities } from "@/api/facilityApi";
import type { Facility } from "@/domain/graph/facility";

export function useFacilities(orgId: number) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFacilities(orgId).then((data) => {
      setFacilities(data);
      setLoading(false);
    });
  }, [orgId]);

  return { facilities, loading };
}
