// src/components/facility/FacilityTable.tsx
import type { FacilityReq } from "@/api/facilityApi";

export default function FacilityTable({ items }: { items: FacilityReq[] }) {
  if (!items.length) {
    return <p className="p-4 text-gray-500">등록된 설비가 없습니다.</p>;
  }

  return (
    <table className="min-w-full border border-gray-200 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-3 py-2">ID</th>
          <th className="border px-3 py-2">시설명</th>
          <th className="border px-3 py-2">타입</th>
          <th className="border px-3 py-2">제조사</th>
          <th className="border px-3 py-2">모델</th>
          <th className="border px-3 py-2">정격전력(kW)</th>
          <th className="border px-3 py-2">수소생산량(kg/h)</th>
          <th className="border px-3 py-2">특정소비전력(kWh/kg)</th>
        </tr>
      </thead>
      <tbody>
        {items.map((f) => (
          <tr key={f.facId}>
            <td className="border px-3 py-2">{f.facId}</td>
            <td className="border px-3 py-2">{f.name}</td>
            <td className="border px-3 py-2">{f.type}</td>
            <td className="border px-3 py-2">{f.maker ?? "-"}</td>
            <td className="border px-3 py-2">{f.model ?? "-"}</td>
            <td className="border px-3 py-2">{f.powerKw}</td>
            <td className="border px-3 py-2">{f.h2Rate}</td>
            <td className="border px-3 py-2">{f.specKwh}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
