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
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">이름</th>
            <th className="text-right p-2">가격</th>
            <th className="text-left p-2">지역</th>
            <th className="text-right p-2">지역 평균</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name}</td>
              <td className="p-2 text-right">{s.price.toLocaleString()} 원</td>
              <td className="p-2">{s.regionName}</td>
              <td className="p-2 text-right">
                {s.avgPriceOfRegion != null ? `${s.avgPriceOfRegion.toLocaleString()} 원` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
