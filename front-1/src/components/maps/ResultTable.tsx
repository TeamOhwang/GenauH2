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
      <div className="p-4 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700">
        목록 로딩 중…
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-600 rounded bg-red-50 dark:bg-red-900/20">
        {error}
      </div>
    );
  if (!items || items.length === 0)
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700">
        데이터 없음
      </div>
    );

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm overflow-hidden scrollbar-hide bg-white dark:bg-gray-800">
      <table className="min-w-full table-fixed text-sm">
        <colgroup>
          <col style={{ width: "34%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
        </colgroup>

        <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
              이름
            </th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
              지역
            </th>
            <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
              수소 1kg판매가
            </th>
            <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
              지역 평균판매가
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {items.map((s) => (
            <tr
              key={s.id}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition"
              onClick={() => onSelect?.(s)}
            >
              {/* 이름 */}
              <td className="px-3 py-2 align-middle">
                <div className="truncate font-medium text-gray-900 dark:text-gray-100" title={s.name}>
                  {s.name}
                </div>
              </td>

              {/* 지역 */}
              <td className="px-3 py-2 align-middle">
                <div className="truncate text-gray-600 dark:text-gray-400" title={s.regionName}>
                  {s.regionName}
                </div>
              </td>

              {/* 가격 */}
              <td className="px-3 py-2 text-right whitespace-nowrap align-middle font-semibold text-gray-800 dark:text-gray-200">
                {s.price.toLocaleString()} 원/kg
              </td>

              {/* 지역 평균 */}
              <td className="px-3 py-2 text-right whitespace-nowrap align-middle text-gray-600 dark:text-gray-400">
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
