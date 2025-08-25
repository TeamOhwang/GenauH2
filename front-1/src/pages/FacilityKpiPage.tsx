// src/pages/FacilityKpiPage.tsx
import { useState } from "react";
import DateRangeBar from "@/components/DateRangeBar";
import FacilityMultiSelect from "@/components/FacilityMultiSelect";
import {KpiCard, AchievementBar} from "@/components/KpiCard";
import PerPlantTable from "@/components/PerPlantTable";
import { useUserFacilitiesKpi } from "@/hooks/usePlantKpis";

const DAY = 86_400_000;
const toLocalDateStr = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const today = new Date();
const defaultStart = toLocalDateStr(new Date(today.getTime() - 6 * DAY));
const defaultEnd = toLocalDateStr(today);

export default function FacilityKpiPage() {
  const [inputStart, setInputStart] = useState(defaultStart);
  const [inputEnd, setInputEnd] = useState(defaultEnd);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { facilities, totalProduction, totalPredicted, predictedPeak, perPlant, loading, error } =
    useUserFacilitiesKpi({ start, end, selectedIds });

  const apply = () => {
    setStart(inputStart);
    setEnd(inputEnd);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">설비별 수소 생산 KPI</h1>

      <DateRangeBar start={inputStart} end={inputEnd} onStart={setInputStart} onEnd={setInputEnd} onApply={apply} />

      <FacilityMultiSelect
        facilities={facilities}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
      />

      {loading && <Info text="불러오는 중…" />}
      {Boolean(error) && <Info text="오류가 발생했어요. 콘솔을 확인해주세요." tone="error" />}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="총 생산량(kg)" value={totalProduction} />
        <KpiCard label="총 예측량(kg)" value={totalPredicted} />
        <KpiCard label="예측 피크(kg/일)" value={predictedPeak} />
      </section>

      <AchievementBar produced={totalProduction} predicted={totalPredicted} />

      <PerPlantTable rows={perPlant} />
    </div>
  );
}

function Info({ text, tone = "info" }: { text: string; tone?: "info" | "error" }) {
  const cls =
    tone === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  return <div className={`text-sm rounded-xl border px-3 py-2 ${cls}`}>{text}</div>;
}
