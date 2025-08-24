
import type { Station } from "@/domain/maps/MapPriceTypes";

export default function ResultTable(props: {
  items: Station[] | null;
  loading: boolean;
  error: string | null;
}) {
  const { items, loading, error } = props;

  if (loading) return <div className="p-3 text-gray-500 border rounded">목록 로딩 중…</div>;
  if (error) return <div className="p-3 text-red-600 border rounded">{error}</div>;
  if (!items || items.length === 0) return <div className="p-3 text-gray-500 border rounded">데이터 없음</div>;

  return (
    <div className="border rounded overflow-auto">
      <table className="min-w-full table-fixed text-sm">
        {/* 열 폭 고정: 이름 34% / 지역 22% / 가격 22% / 평균 22% */}
        <colgroup>
          <col style={{ width: "34%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
        </colgroup>

        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-2 py-1">이름</th>
            <th className="text-left px-2 py-1">지역</th>
            <th className="text-right px-2 py-1">수소 1kg 매입가격</th>
            <th className="text-right px-2 py-1">지역 1kg 평균매입가</th>
          </tr>
        </thead>

        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="border-t">
              {/* 이름/지역: 말줄임 처리 */}
              <td className="px-2 py-1 align-middle">
                <div className="truncate" title={s.name}>{s.name}</div>
              </td>
              <td className="px-2 py-1 align-middle">
                <div className="truncate" title={s.regionName}>{s.regionName}</div>
              </td>

              {/* 숫자: 우측 정렬 + 줄바꿈 방지 */}
              <td className="px-2 py-1 text-right whitespace-nowrap align-middle">
                {s.price.toLocaleString()} 원/kg
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap align-middle">
                {s.avgPriceOfRegion != null ? `${s.avgPriceOfRegion.toLocaleString()} 원/kg` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
