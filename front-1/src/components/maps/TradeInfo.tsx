import type { RegionSummary, RegionCode } from "@/domain/maps/MapPriceTypes";

export default function TradeInfo(props: {
  selectedRegion?: RegionCode | null;
  summaryList: RegionSummary[] | null;
  loading: boolean;
  error: string | null;
}) {
  const { selectedRegion, summaryList, loading, error } = props;
  const card =
    selectedRegion && summaryList
      ? summaryList.find((x) => x.regionCode === selectedRegion) ?? null
      : null;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded p-3 bg-white dark:bg-gray-800">
      {/* 제목 */}
      <div className="font-semibold mb-2 text-black dark:text-white">거래 정보</div>

      {/* 상태별 메시지 */}
      {loading && (
        <div className="text-gray-600 dark:text-gray-400">로드 중…</div>
      )}
      {error && (
        <div className="text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* 본문 */}
      {!loading && !error && (
        card ? (
          <div className="text-sm text-black dark:text-white">
            <div>
              지역: <b>{card.regionName}</b>
            </div>
            <div>
              1kg 평균 매입가:{" "}
              <b>{card.avgPrice.toLocaleString()} 원/kg</b>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            지역을 선택하세요.
          </div>
        )
      )}
    </div>
  );
}
