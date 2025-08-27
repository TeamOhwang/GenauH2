import type { FacilityReq } from "@/api/facilityApi";

type Props = {
  items: FacilityReq[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
};

export default function FacilityTable({ items, selectedIds, onToggleSelect }: Props) {
  if (!items.length) {
    return <p className="p-4 text-gray-500">등록된 설비가 없습니다.</p>;
  }

  return (
    <table className="min-w-full border border-gray-200 text-sm">
      <thead className="bg-green-600 text-white">
        <tr>
          <th className="border px-3 py-2">선택</th>
          <th className="border px-3 py-2">설비 명</th>
          <th className="border px-3 py-2">타임스탬프</th>
          <th className="border px-3 py-2">발전소번호</th>
          <th className="border px-3 py-2">최대 예측생산량(kg)</th>
          <th className="border px-3 py-2">현재 생산량(kg)</th>
        </tr>
      </thead>
      <tbody>
              {items.map((f, idx) => (
          <tr key={`${f.facId}-${f.ts}-${idx}`}
            className="even:bg-gray-50 odd:bg-white hover:bg-blue-50 transition-colors">
          
            <td className="border px-3 py-2 text-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(f.facId)}
                onChange={() => onToggleSelect(f.facId)}
              />
            </td>
            <td className="border px-3 py-2">{f.facilityName}</td>
            <td className="border px-3 py-2">{f.ts}</td>
            <td className="border px-3 py-2">{f.plantId}</td>
            <td className="border px-3 py-2">{f.predictedMaxKg}</td>
            <td className="border px-3 py-2">{f.predictedCurrentKg}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
