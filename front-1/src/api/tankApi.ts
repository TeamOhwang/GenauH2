import apiClient, { AUTH_ENDPOINTS } from "@/api/apiClient";

export type TankKpi = {
  orgId: number;
  facId: number;
  facilityName: string;
  ts: string;
  predictedMaxKg: number;
  productionKg: number;
};

export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

const toDateTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" + pad(date.getMonth() + 1) +
    "-" + pad(date.getDate()) +
    "T" + pad(date.getHours()) +
    ":" + pad(date.getMinutes()) +
    ":" + pad(date.getSeconds())
  );
};

const defaultStart = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  d.setDate(1);
  return d;
};
const defaultEnd = () => new Date();

export const TankApi = {
  async listByOrg(params: {
    orgId: number;
    start?: string;
    end?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<TankKpi>> {
    const startDate = params.start ? new Date(params.start) : defaultStart();
    const endDate = params.end ? new Date(params.end) : defaultEnd();

    const cleanParams = {
      page: params.page ?? 0,
      size: params.size ?? 1000,
      start: toDateTime(startDate),
      end: toDateTime(endDate),
    };

    const res = await apiClient.get<PageResponse<TankKpi>>(
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
      ...raw,
      content: (raw.content ?? []).map((item: any) => ({
        orgId: Number(item.orgId ?? 0),
        facId: Number(item.facId ?? 0),
        facilityName: String(item.facilityName ?? ""),
        ts: item.ts ? new Date(String(item.ts)).toISOString() : "",
        predictedMaxKg: Number(item.predictedMaxKg ?? 0),
        productionKg: Number(item.productionKg ?? 0),
      })),
    };
  },
};
