export type GenerationPeriodSummaryDTO = {
  plantId?: string | null;
  plantName?: string | null;
  productionTotalKg: number;
  predictedTotalKg: number;
};

export type GenerationDailyDTO = {
  date: string;              // yyyy-MM-dd
  productionKg?: number;
  predictedKg?: number;
};

// src/domain/user.ts
export type UserProfile = {
  userId: number;
  orgId?: number | null;     // 설비를 orgId로 조회할 거라 필요
  email: string;
  role: "USER" | "SUPERVISOR" | "ADMIN";
};