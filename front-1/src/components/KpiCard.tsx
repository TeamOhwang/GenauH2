
/** 단일 KPI 카드: 라벨 + 숫자 */
export function KpiCard({ label, value }: { label: string; value: number }) {
  const v = Math.round(value * 10) / 10;
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{v.toLocaleString()}</div>
    </div>
  );
}

/** 달성률 바: produced / predicted 비율 */
export function AchievementBar({
  produced,
  predicted,
}: {
  produced: number;
  predicted: number;
}) {
  const pct = predicted > 0 ? (produced / predicted) * 100 : 0;
  const width = Math.max(0, Math.min(100, pct));
  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">달성률</h2>
        <span className="text-sm text-gray-600">
          {Number.isFinite(pct) ? pct.toFixed(1) : "0.0"}%
        </span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-xl mt-3 overflow-hidden">
        <div className="h-3 bg-blue-500" style={{ width: `${width}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-2">총 생산량 / 총 예측량 × 100</p>
    </section>
  );
}

export default KpiCard;
