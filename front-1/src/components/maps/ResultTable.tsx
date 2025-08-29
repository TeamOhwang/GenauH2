import type { Station } from "@/domain/maps/MapPriceTypes";

export default function ResultTable(props: {
  items: Station[] | null;
  loading: boolean;
  error: string | null;
  onSelect?: (s: Station) => void; 
}) {
  const { items, loading, error, onSelect } = props;

  if (loading)
    return (
      <div className="p-4 text-gray-500 border rounded bg-gray-50">
        목록 로딩 중…
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-red-600 border rounded bg-red-50">
        {error}
      </div>
    );
  if (!items || items.length === 0)
    return (
      <div className="p-4 text-gray-500 border rounded bg-gray-50">
        데이터 없음
      </div>
    );

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden scrollbar-hide">
      <table className="min-w-full table-fixed text-sm">
        <colgroup>
          <col style={{ width: "34%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
        </colgroup>

        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-700">
              이름
            </th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700">
              지역
            </th>
            <th className="px-3 py-2 text-right font-semibold text-gray-700">
              수소 1kg판매가
            </th>
            <th className="px-3 py-2 text-right font-semibold text-gray-700">
              지역 평균판매가
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {items.map((s) => (
            <tr
              key={s.id}
              className="hover:bg-blue-50 cursor-pointer transition"
              onClick={() => onSelect?.(s)}
            >
              {/* 이름 */}
              <td className="px-3 py-2 align-middle">
                <div className="truncate font-medium text-gray-900" title={s.name}>
                  {s.name}
                </div>
              </td>

              {/* 지역 */}
              <td className="px-3 py-2 align-middle">
                <div className="truncate text-gray-600" title={s.regionName}>
                  {s.regionName}
                </div>
              </td>

              {/* 가격 */}
              <td className="px-3 py-2 text-right whitespace-nowrap align-middle font-semibold text-gray-800">
                {s.price.toLocaleString()} 원/kg
              </td>

              {/* 지역 평균 */}
              <td className="px-3 py-2 text-right whitespace-nowrap align-middle text-gray-600">
                {s.avgPriceOfRegion != null
                  ? `${s.avgPriceOfRegion.toLocaleString()} 원/kg`
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
