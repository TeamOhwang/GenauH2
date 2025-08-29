import type { FacilityKpi } from "@/api/facilityApi";

/** 하루 단위 (0~23시) 데이터를 채워주는 함수 */
export function fillDayHours(day: string, data: FacilityKpi[], orgId = 0, facId = 0): FacilityKpi[] {
  if (!day) return data;

  const baseDate = new Date(day);
  const map = new Map<number, FacilityKpi>();

  // 기존 데이터 맵핑 (시간별)
  data.forEach((d) => {
    const hour = new Date(d.ts).getHours();
    map.set(hour, d);
  });

  const filled: FacilityKpi[] = [];
  for (let h = 0; h < 24; h++) {
    if (map.has(h)) {
      filled.push(map.get(h)!);
    } else {
      const ts = new Date(baseDate);
      ts.setHours(h, 0, 0, 0);
      filled.push({
        ts: ts.toISOString(),
        facilityName: "-",
        predictedMaxKg: 0,
        productionKg: 0,
        orgId,   // FacilityKpi 타입 충족
        facId,
      });
    }
  }
  return filled;
}
