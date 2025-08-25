type Row = {
  plantId: string;
  name: string;
  productionTotalKg: number;
  predictedTotalKg: number;
  predictedPeakKg: number;
};

export default function PerPlantTable({ rows }: { rows: Row[] }) {
  const r1 = (n: number) => Math.round(n * 10) / 10;

  return (
    <section className="rounded-2xl border p-4">
      <h2 className="text-lg font-semibold mb-3">설비별 합계</h2>
      <div className="overflow-auto">
        <table className="min-w-[720px] text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">설비</th>
              <th className="p-2">생산 합계(kg)</th>
              <th className="p-2">예측 합계(kg)</th>
              <th className="p-2">예측 피크(kg/일)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.plantId} className="border-b last:border-0">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r1(r.productionTotalKg).toLocaleString()}</td>
                <td className="p-2">{r1(r.predictedTotalKg).toLocaleString()}</td>
                <td className="p-2">{r1(r.predictedPeakKg).toLocaleString()}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-2 text-gray-500" colSpan={4}>
                  표시할 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
