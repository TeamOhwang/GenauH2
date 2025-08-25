// src/api/plant.api.ts
import apiClient, { unwrap } from "@/api/apiClient";
import type { Facility } from "@/domain/graph/facility";
import type { GenerationPeriodSummaryDTO, GenerationDailyDTO } from "@/domain/graph/facilityDTO";

const PATHS = {
  facilities: "/plant/list",                            // { success, data }
  periodSummary: "/generation/period-summary",          // DTO 직접
  daily: "/generation/daily",                           // DTO 직접
} as const;

const unwrapData = <T,>(res: unknown) =>
  (unwrap<{ success: boolean; data: T }>(res)?.data ?? null) as T | null;

export async function fetchFacilities(orgId?: number): Promise<Facility[]> {
  const res = await apiClient.get(PATHS.facilities, { params: orgId ? { orgId } : undefined });
  return unwrapData<Facility[]>(res) ?? [];
}

export async function fetchPeriodSummary(params: {
  plantId: string | number; start: string; end: string;
}): Promise<GenerationPeriodSummaryDTO> {
  const res = await apiClient.get(PATHS.periodSummary, { params });
  return unwrap<GenerationPeriodSummaryDTO>(res)!;
}

export async function fetchDaily(params: {
  plantId: string | number; start: string; end: string;
}): Promise<GenerationDailyDTO[]> {
  const res = await apiClient.get(PATHS.daily, { params });
  return unwrap<GenerationDailyDTO[]>(res) ?? [];
}
