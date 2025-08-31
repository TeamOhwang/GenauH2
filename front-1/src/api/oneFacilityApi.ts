import apiClient, { AUTH_ENDPOINTS } from "@/api/apiClient";
import * as qs from "qs";

// FacilityKpi 타입 정의
export type FacilityKpi = {
  orgId: number;
  facId: number;
  facilityName: string;
  ts: string;
  predictedMaxKg: number;
  productionKg: number;
};

// 기본 날짜 설정 함수
const defaultStart = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7일 전
const defaultEnd = () => new Date(); // 현재

// 날짜를 ISO 형식으로 변환하는 함수
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

// API 호출 함수
export const oneFacilityApi = {
  async listByFacility(params: {
    orgId: number;
    facIds: number[];
    start?: string;
    end?: string;
    page?: number;
    size?: number;
  }): Promise<FacilityKpi[]> {
    if (!params.facIds || params.facIds.length === 0) {
      throw new Error("facIds must not be empty");
    }

    const startDate = params.start ? new Date(params.start) : defaultStart();
    const endDate = params.end ? new Date(params.end) : defaultEnd();

    const cleanParams: Record<string, any> = {
      start: toDateTime(startDate),
      end: toDateTime(endDate),
      facId: params.facIds, // 👉 그대로 배열 전달
      page: params.page ?? 0,
      size: params.size ?? 1000,
    };

    const res = await apiClient.get<FacilityKpi[]>(
      AUTH_ENDPOINTS.oneFacilityKpis(params.orgId),
      {
        params: cleanParams,
        paramsSerializer: (p) =>
          qs.stringify(p, { arrayFormat: "repeat" }), 
      }
    );

    // 안전하게 매핑
    return (res.data ?? []).map((item: any) => ({
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
    }));
  },
};
