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
    FacilityApi.listByOrg({ orgId }).then((res) => {
      console.log("API 응답:", res.content); // 응답 확인

      // 중복 설비 처리 방식 변경
      const uniqueFacilities = Array.from(
        new Map(res.content.map((item) => [item.facId, item])).values()
      ); // facId 기준으로 중복 제거

      setFacilities(uniqueFacilities); // 설비 목록 업데이트
      console.log("설비 목록 업데이트:", uniqueFacilities);

      // 설비 목록이 업데이트되면 첫 번째 항목을 자동으로 선택
      if (uniqueFacilities.length > 0 && selected === null) {
        const firstFacility = uniqueFacilities[0].facId;
        setSelected(firstFacility); // 첫 번째 설비 선택
        onFacilitySelect(firstFacility); // 부모 컴포넌트로 전달
      }
    }).catch((error) => {
      console.error("설비 목록 불러오기 실패:", error);
    });
  }, [orgId, selected]); // orgId가 바뀔 때마다 설비 목록을 불러옵니다

  return (
    <div className="flex gap-4 bg-slate-800 p-3 rounded-lg items-center">
      {/* 설비 선택 드롭다운 */}
      <div className="flex flex-col text-white">
        <label>설비 선택</label>
        <select
          value={selected ?? ""}
          onChange={(e) => {
            const facId = e.target.value ? Number(e.target.value) : null;
            setSelected(facId);
            if (facId) onFacilitySelect(facId);  // 선택된 설비 ID 전파
          }}
          className="text-black px-2 py-1 rounded"
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
      <div className="flex flex-col text-white">
        <label>시작일</label>
        <input
          type="date"
          className="text-black px-2 py-1 rounded"
          onChange={(e) => {
            const start = e.target.value;
            const endInput = document.getElementById("endDate") as HTMLInputElement;
            if (start && endInput?.value) onDateSelect(start, endInput.value);
          }}
        />
      </div>

      {/* 종료일 */}
      <div className="flex flex-col text-white">
        <label>종료일</label>
        <input
          id="endDate"
          type="date"
          className="text-black px-2 py-1 rounded"
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
