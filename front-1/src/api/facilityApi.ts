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
  async listByOrg(params: {
    orgId: number | null;   // orgId는 null 가능
    start?: string;
    end?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<FacilityKpi>> {
    // orgId 없으면 API 호출하지 않고 빈 데이터 반환
    if (!params.orgId) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: params.size ?? 12,
        number: params.page ?? 0,
      };
    }

    // start/end 기본값 보장
    const startDate = params.start ? new Date(params.start) : defaultStart();
    const endDate = params.end ? new Date(params.end) : defaultEnd();

    // 요청 파라미터 구성
    const cleanParams: Record<string, any> = {
      page: params.page ?? 0,
      size: params.size ?? 12,
      start: toDateTime(startDate),
      end: toDateTime(endDate),
    };

    console.log("📤 FacilityApi 요청 URL:",
      AUTH_ENDPOINTS.facilityKpis(params.orgId),
      cleanParams
    );

    // API 호출
    const res = await apiClient.get<PageResponse<any>>(
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

    // DTO 변환
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
