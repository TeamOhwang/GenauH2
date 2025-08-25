import { useEffect, useState } from "react";
import { fetchFacilities } from "@/api/facilityApi";
import type { Facility } from "@/domain/graph/facility";

export function useFacilities(userId: number) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFacilities(userId).then((data) => {
      setFacilities(data);
      setLoading(false);
    });
  }, [userId]);

  return { facilities, loading };
}
