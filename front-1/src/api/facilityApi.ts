import apiClient, { AUTH_ENDPOINTS } from "@/api/apiClient";

/** DTO 타입 (백엔드 FacilityKpiDto 매핑) */
export type FacilityKpi = {
  orgId: number;
  facId: number;
  facilityName: string;
  ts: string;              // KST 기준 ISO 문자열
  predictedMaxKg: number;
  productionKg: number;
};

/** 시설 엔티티 타입 (백엔드 Facility 매핑) */
export type Facility = {
  facId?: number;
  orgId: number;
  name: string;
  type: "PEM" | "ALK" | "SOEC";
  maker?: string;
  model?: string;
  powerKw: number;
  h2Rate: number;
  specKwh: number;
  purity?: number;
  pressure?: number;
  location?: string;
  install?: string;
  created?: string;
};

/** Spring Data Page 구조 매핑 */
export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // 현재 페이지 번호
};

/** 날짜 → yyyy-MM-dd'T'HH:mm:ss */
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
const defaultStart = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7일 전
const defaultEnd = () => new Date(); // 현재

export const FacilityApi = {
  /** org 단위 KPI 조회 */
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
      content: (raw.content ?? []).map((item: any) => {
        //  UTC → KST 변환
        let ts = "";
        if (item.ts) {
          const utc = new Date(String(item.ts));
          const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
          ts = kst.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss
        }

        return {
          orgId: Number(item.orgId ?? 0),
          facId: Number(item.facId ?? 0),
          facilityName: String(item.facilityName ?? ""),
          ts,
          predictedMaxKg: Number(item.predictedMaxKg ?? 0),
          productionKg: Number(item.productionKg ?? 0),
        };
      }),
      totalPages: raw.totalPages ?? 0,
      totalElements: raw.totalElements ?? 0,
      size: raw.size ?? cleanParams.size,
      number: raw.number ?? cleanParams.page,
    };
  },

  /** 시설 목록 조회 */
  async getFacilities(orgId?: number): Promise<Facility[]> {
    const params = orgId ? { orgId } : {};
    const res = await apiClient.get<{ success: boolean; data: Facility[] }>('/plant/list', { params });
    return res.data.data || [];
  },

  /** 시설 상세 조회 */
  async getFacility(facilityId: number): Promise<Facility> {
    const res = await apiClient.get<{ success: boolean; data: Facility }>(`/plant/detail?facilityId=${facilityId}`);
    return res.data.data;
  },

  /** 시설 추가 */
  async createFacility(facility: Omit<Facility, 'facId' | 'created'>): Promise<Facility> {
    const res = await apiClient.post<{ success: boolean; data: Facility }>('/plant/insert', facility);
    return res.data.data;
  },

  /** 시설 수정 */
  async updateFacility(facility: Facility): Promise<Facility> {
    const res = await apiClient.post<{ success: boolean; data: Facility }>('/plant/update', facility);
    return res.data.data;
  },

  /** 시설 삭제 */
  async deleteFacility(facilityId: number): Promise<void> {
    await apiClient.post<{ success: boolean; message: string }>('/plant/delete', { facilityId });
  },
};
