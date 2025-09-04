import { useEffect, useState } from "react";
import { FacilityApi, Facility } from "@/api/facilityApi";

type Props = {
  orgId: number | null;
  onDateSelect: (start: string, end: string) => void;
  onFacilitySelect: (facId: number) => void;
};

export default function TopControlBar({ orgId, onDateSelect, onFacilitySelect }: Props) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  // 설비 목록 불러오기
  useEffect(() => {
    if (!orgId) return;

    FacilityApi.getFacilities(orgId)
      .then((res) => {
        setFacilities(res);

        // 기본값: 첫 번째 설비 자동 선택
        if (res.length > 0 && selected === null) {
          const firstFacility = res[0].facId!;
          setSelected(firstFacility);
          onFacilitySelect(firstFacility);
        }
      })
      .catch((err) => {
        console.error("❌ 설비 목록 불러오기 실패:", err);
      });
  }, [orgId, selected]);

  return (
    <div
      className="
        flex gap-4 items-center p-3 rounded-lg shadow-md
        bg-white text-black
        dark:bg-slate-800 dark:text-white
      "
    >
      {/* 설비 선택 */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">설비 선택</label>
        <select
          value={selected ?? ""}
          onChange={(e) => {
            const facId = e.target.value ? Number(e.target.value) : null;
            setSelected(facId);
            if (facId) onFacilitySelect(facId);
          }}
          className="
            px-2 py-1 rounded border
            text-black bg-white
            dark:bg-slate-700 dark:text-white dark:border-slate-600
          "
        >
          {selected === null && <option value="">-- 선택 --</option>}
          {facilities.map((f) => (
            <option key={f.facId} value={f.facId}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* 시작일 */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">시작일</label>
        <input
          type="date"
          max={today}
          className="
            px-2 py-1 rounded border
            text-black bg-white
            dark:bg-slate-700 dark:text-white dark:border-slate-600
          "
          onChange={(e) => {
            const start = e.target.value;
            const endInput = document.getElementById("endDate") as HTMLInputElement;
            if (start && endInput?.value) onDateSelect(start, endInput.value);
          }}
        />
      </div>

      {/* 종료일 */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">종료일</label>
        <input
          id="endDate"
          type="date"
          max={today}
          className="
            px-2 py-1 rounded border
            text-black bg-white
            dark:bg-slate-700 dark:text-white dark:border-slate-600
          "
          onChange={(e) => {
            const end = e.target.value;
            const startInput = document.querySelector<HTMLInputElement>(
              "input[type=date]"
            );
            if (startInput?.value && end) onDateSelect(startInput.value, end);
          }}
        />
      </div>
    </div>
  );
}
