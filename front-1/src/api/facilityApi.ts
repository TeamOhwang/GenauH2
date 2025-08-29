import apiClient, { AUTH_ENDPOINTS } from "@/api/apiClient";

/** DTO 타입 (백엔드 FacilityKpiDto 매핑) */
export type FacilityKpi = {
  orgId: number;
  facId: number;
  facilityName: string;
  ts: string;
  predictedMaxKg: number;
  productionKg: number;
};

/** Spring Data Page 구조 매핑 */
export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // 현재 페이지 번호
};

/** 날짜 → ISO(yyyy-MM-ddTHH:mm:ss) */
const toDateTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
};

/** 최근 7일 기본값 */
const defaultStart = () =>
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7일 전
const defaultEnd = () => new Date(); // 현재

export const FacilityApi = {
  /** ✅ org 단위 전체 조회 */
  async listByOrg(params: {
    orgId: number | null;
    start?: string;
    end?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<FacilityKpi>> {
    if (!params.orgId) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: params.size ?? 12,
        number: params.page ?? 0,
      };
    }

    const startDate = params.start ? new Date(params.start) : defaultStart();
    const endDate = params.end ? new Date(params.end) : defaultEnd();

    const cleanParams: Record<string, any> = {
      page: params.page ?? 0,
      size: params.size ?? 12,
      start: toDateTime(startDate),
      end: toDateTime(endDate),
    };

    console.log(
      "FacilityApi 전체 조회 URL:",
      AUTH_ENDPOINTS.facilityKpis(params.orgId),
      cleanParams
    );

    const res = await apiClient.get<PageResponse<FacilityKpi>>(
      AUTH_ENDPOINTS.facilityKpis(params.orgId),
      { params: cleanParams }
    );

    const raw = res.data ?? {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: cleanParams.size,
      number: cleanParams.page,
    };

    return {
      content: (raw.content ?? []).map((item: any) => ({
        orgId: Number(item.orgId ?? 0),
        facId: Number(item.facId ?? 0),
        facilityName: String(item.facilityName ?? ""),
        ts: item.ts ? new Date(String(item.ts)).toISOString() : "",
        predictedMaxKg: isNaN(Number(item.predictedMaxKg))
          ? 0
          : Number(item.predictedMaxKg),
        productionKg: isNaN(Number(item.productionKg))
          ? 0
          : Number(item.productionKg),
      })),
      totalPages: raw.totalPages ?? 0,
      totalElements: raw.totalElements ?? 0,
      size: raw.size ?? cleanParams.size,
      number: raw.number ?? cleanParams.page,
    };
  },

  /** ✅ 특정 설비 단위 조회 (orgId + facId) */
  async listByFacility(params: {
    orgId: number;
    facId: number;
    start?: string;
    end?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<FacilityKpi>> {
    const startDate = params.start ? new Date(params.start) : defaultStart();
    const endDate = params.end ? new Date(params.end) : defaultEnd();

    const cleanParams: Record<string, any> = {
      page: params.page ?? 0,
      size: params.size ?? 12,
      start: toDateTime(startDate),
      end: toDateTime(endDate),
      facId: params.facId, // ✅ facId 파라미터 추가
    };

    console.log(
      "FacilityApi 단일 설비 조회 URL:",
      AUTH_ENDPOINTS.facilityKpis(params.orgId),
      cleanParams
    );

    const res = await apiClient.get<PageResponse<FacilityKpi>>(
      AUTH_ENDPOINTS.facilityKpis(params.orgId),
      { params: cleanParams }
    );

    const raw = res.data ?? {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: cleanParams.size,
      number: cleanParams.page,
    };

    return {
      content: (raw.content ?? []).map((item: any) => ({
        orgId: Number(item.orgId ?? 0),
        facId: Number(item.facId ?? 0),
        facilityName: String(item.facilityName ?? ""),
        ts: item.ts ? new Date(String(item.ts)).toISOString() : "",
        predictedMaxKg: isNaN(Number(item.predictedMaxKg))
          ? 0
          : Number(item.predictedMaxKg),
        productionKg: isNaN(Number(item.productionKg))
          ? 0
          : Number(item.productionKg),
      })),
      totalPages: raw.totalPages ?? 0,
      totalElements: raw.totalElements ?? 0,
      size: raw.size ?? cleanParams.size,
      number: raw.number ?? cleanParams.page,
    };
  },
};
