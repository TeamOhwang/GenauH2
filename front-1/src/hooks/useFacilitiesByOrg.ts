import { useEffect, useState, useCallback } from "react";
import { FacilityApi, FacilityKpi, PageResponse } from "@/api/facilityApi";

/** 기본 기간: 최근 7일 */
const defaultStart = () =>
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const defaultEnd = () => new Date().toISOString();

export function useFacilitiesByOrg(
  orgId: number | null, // 로그인한 사용자 orgId (null 허용)
  start?: string,
  end?: string,
  page: number = 0,
  size: number = 12
) {
  const [data, setData] = useState<FacilityKpi[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** 데이터 패치 함수 */
  const fetchFacilities = useCallback(async () => {
    if (orgId === null || orgId === undefined) {
      console.warn("⏭ orgId 없음 → 요청 건너뜀");
      setData([]);
      setTotalPages(0);
      setTotalElements(0);
      return;
    }

    setLoading(true);
    try {
      console.log("🔥 프론트에서 호출하는 orgId:", orgId);

      // start/end 기본값 보장
      const startDate = start ?? defaultStart();
      const endDate = end ?? defaultEnd();

      const res: PageResponse<FacilityKpi> = await FacilityApi.listByOrg({
        orgId,
        start: startDate,
        end: endDate,
        page,
        size,
      });

      setData(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      setError(null);
    } catch (e: unknown) {
      console.error("❌ 시설 데이터 조회 실패:", e);
      setError(
        e instanceof Error ? e.message : "설비 목록을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [orgId, start, end, page, size]);

  /** orgId 또는 필터 변경 시 자동 호출 */
  useEffect(() => {
    if (orgId !== null && orgId !== undefined) {
      fetchFacilities();
    }
  }, [fetchFacilities, orgId]);

  return {
    data,
    totalPages,
    totalElements,
    loading,
    error,
    refetch: fetchFacilities,
  };
}
