import apiClient, { AUTH_ENDPOINTS } from "@/api/apiClient";
import * as qs from "qs";

export type FacilityKpi = {
  orgId: number;
  facId: number;
  facilityName: string;
  ts: string; // ISO 그대로
  predictedMaxKg: number;
  productionKg: number;
};

const defaultStart = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const defaultEnd = () => new Date();

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
      facId: params.facIds,
      page: params.page ?? 0,
      size: params.size ?? 1000,
    };

    const res = await apiClient.get<FacilityKpi[]>(
      AUTH_ENDPOINTS.oneFacilityKpis(params.orgId),
      {
        params: cleanParams,
        paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
      }
    );

    return (res.data ?? []).map((item: any) => ({
      orgId: Number(item.orgId ?? 0),
      facId: Number(item.facId ?? 0),
      facilityName: String(item.facilityName ?? ""),
      ts: String(item.ts ?? ""),
      predictedMaxKg: Number(item.predictedMaxKg ?? 0),
      productionKg: Number(item.productionKg ?? 0),
    }));
  },
};
