import type { FacilityReq } from "@/api/facilityApi";

type Props = {
  items: FacilityReq[];
};

export default function FacilityTable({ items }: Props) {
  if (!items.length) {
    return (
      <p className="p-4 text-gray-400 text-center bg-gray-900 rounded">
        등록된 설비가 없습니다.
      </p>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg overflow-x-auto">
      <table className="w-full border-collapse text-sm sm:text-base">
        {/* 헤더 */}
        <thead>
          <tr className="bg-green-500 text-white">
            <th className="px-4 py-2 text-left">설비명</th>
            <th className="px-4 py-2 text-center">타임스탬프</th>
            <th className="px-4 py-2 text-center">시간당 최대 생산량(kg)</th>
            <th className="px-4 py-2 text-center">시간당 현재 생산량(kg)</th>
            <th className="px-4 py-2 text-center">누적 최대 생산량(kg)</th>
            <th className="px-4 py-2 text-center">누적 현재 생산량(kg)</th>
          </tr>
        </thead>

        {/* 바디 */}
        <tbody>
          {items.map((f, idx) => (
            <tr
              key={`${f.facId}-${f.ts}-${idx}`}
              className="odd:bg-white even:bg-gray-100 hover:bg-blue-50 transition-colors"
            >
              <td className="border px-4 py-2 font-medium">{f.facilityName}</td>
              <td className="border px-4 py-2 text-center">{f.ts}</td>
              <td className="border px-4 py-2 text-center">{f.totalMaxKg}</td>
              <td className="border px-4 py-2 text-center">{f.totalCurrentKg}</td>
              <td className="border px-4 py-2 text-center">{f.cumulativeMax}</td>
              <td className="border px-4 py-2 text-center">{f.cumulativeCurrent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
