import { useState, useMemo } from "react";
import { useFacilities } from "@/hooks/useFacilities";
import { useFacilityKpis } from "@/hooks/useFacilityKpis";
import FacilityDropdown from "@/components/FacilityDropdown";
import HydrogenDonut from "@/components/HydrogenDonut";
import DateRangeBar from "@/components/DateRangeBar";
import { useAuthStore } from "@/stores/useAuthStore";

export default function FacilityKpiPage() {
  const userId = useAuthStore((s) => s.userId); 

  const { facilities } = useFacilities(userId ?? 0); // null일 때 대비해서 0 등 기본값 처리

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>("2025-08-01");
  const [endDate, setEndDate] = useState<string>("2025-08-26");

  /** 선택 안 하면 → 전체 설비 자동 적용 */
  const effectiveIds = useMemo(
    () => (selectedIds.length > 0 ? selectedIds : facilities.map((f) => f.id)),
    [selectedIds, facilities]
  );

  const { kpis } = useFacilityKpis(effectiveIds, startDate, endDate);

  return (
    <div>
      <h2>설비 KPI 대시보드</h2>

      <DateRangeBar
        start={startDate}
        end={endDate}
        onChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
      />

      <FacilityDropdown
        facilities={facilities}
        selected={selectedIds}
        onChange={setSelectedIds}
      />

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {kpis.map((kpi) => (
          <HydrogenDonut key={kpi.facilityId} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
