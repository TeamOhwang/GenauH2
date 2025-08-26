import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFacilityStore } from "@/stores/useFacilityStore";
import { fetchFacilities } from "@/api/facilityApi";
import { useFacilityKpis } from "@/hooks/useFacilityKpis";
import FacilityDropdown from "@/components/FacilityDropdown";
import HydrogenDonut from "@/components/HydrogenDonut";
import DateRangeBar from "@/components/DateRangeBar";

export default function FacilityKpiPage() {
  const userId = useAuthStore((s) => s.userId);
  const { facilities, setFacilities, clear } = useFacilityStore();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-26");

  // 유저 변경 시 설비 목록 갱신
  useEffect(() => {
    if (!userId) {
      clear();
      return;
    }
    fetchFacilities(userId).then(setFacilities);
  }, [userId]);

  const effectiveIds = useMemo(
    () => (selectedIds.length > 0 ? selectedIds : facilities.map((f) => f.facilityId)),
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

      <FacilityDropdown facilities={facilities} selected={selectedIds} onChange={setSelectedIds} />

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {kpis.map((kpi) => (
          <HydrogenDonut key={kpi.facilityId} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
