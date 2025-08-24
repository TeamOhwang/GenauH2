
import type { RegionSummary, RegionCode } from "@/domain/maps/MapPriceTypes";

export default function TradeInfo(props: {
  selectedRegion?: RegionCode | null;
  summaryList: RegionSummary[] | null;
  loading: boolean;
  error: string | null;
}) {
  const { selectedRegion, summaryList, loading, error } = props;
  const card = selectedRegion && summaryList
    ? summaryList.find((x) => x.regionCode === selectedRegion) ?? null
    : null;

  return (
    <div className="border rounded p-3">
      <div className="font-semibold mb-2">거래 정보</div>
      {loading && <div className="text-gray-500">로드 중…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        card ? (
          <div className="text-sm">
            <div>지역: <b>{card.regionName}</b></div>
            <div>1kg 평균 매입가: <b>{card.avgPrice.toLocaleString()} 원/kg</b></div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">지역을 선택하세요.</div>
        )
      )}
    </div>
  );
}
