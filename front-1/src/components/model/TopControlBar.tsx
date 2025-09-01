import { useEffect, useState } from "react";
import { FacilityApi, FacilityKpi } from "@/api/facilityApi";

type Props = {
  orgId: number | null;  // 추가: 설비 조회용
  onDateSelect: (start: string, end: string) => void;
  onFacilitySelect: (facId: number) => void; // 추가: 설비 선택 이벤트
};

export default function TopControlBar({ orgId, onDateSelect, onFacilitySelect }: Props) {
  const [facilities, setFacilities] = useState<FacilityKpi[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  // 설비 목록 불러오기
  useEffect(() => {
    if (!orgId) return;
    FacilityApi.listByOrg({ orgId })
      .then((res) => {
        console.log("API 응답:", res.content);

        const uniqueFacilities = Array.from(
          new Map(res.content.map((item) => [item.facId, item])).values()
        );

        setFacilities(uniqueFacilities);

        if (uniqueFacilities.length > 0 && selected === null) {
          const firstFacility = uniqueFacilities[0].facId;
          setSelected(firstFacility);
          onFacilitySelect(firstFacility);
        }
      })
      .catch((error) => {
        console.error("설비 목록 불러오기 실패:", error);
      });
  }, [orgId, selected]);

  return (
    <div className="flex gap-4 bg-gray-100 dark:bg-slate-800 p-3 rounded-lg items-center">
      {/* 설비 선택 드롭다운 */}
      <div className="flex flex-col">
        <label className="text-gray-900 dark:text-white">설비 선택</label>
        <select
          value={selected ?? ""}
          onChange={(e) => {
            const facId = e.target.value ? Number(e.target.value) : null;
            setSelected(facId);
            if (facId) onFacilitySelect(facId);
          }}
          className="text-gray-900 dark:text-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded"
        >
          <option value="">-- 선택 --</option>
          {facilities.map((f) => (
            <option key={f.facId} value={f.facId}>
              {f.facilityName}
            </option>
          ))}
        </select>
      </div>

      {/* 시작일 */}
      <div className="flex flex-col">
        <label className="text-gray-900 dark:text-white">시작일</label>
        <input
          type="date"
          className="text-gray-900 dark:text-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded"
          onChange={(e) => {
            const start = e.target.value;
            const endInput = document.getElementById("endDate") as HTMLInputElement;
            if (start && endInput?.value) onDateSelect(start, endInput.value);
          }}
        />
      </div>

      {/* 종료일 */}
      <div className="flex flex-col">
        <label className="text-gray-900 dark:text-white">종료일</label>
        <input
          id="endDate"
          type="date"
          className="text-gray-900 dark:text-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded"
          onChange={(e) => {
            const end = e.target.value;
            const startInput = document.querySelector<HTMLInputElement>("input[type=date]");
            if (startInput?.value && end) onDateSelect(startInput.value, end);
          }}
        />
      </div>
    </div>
  );
}
