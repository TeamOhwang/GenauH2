import { useState } from "react";
import type { RegionCode } from "@/domain/maps/MapPriceTypes";
import { KoreaMap } from "@/types/KoreaMap";
import { usePricePageData } from "@/hooks/maps/usePricePageData";
import StatBar from "@/components/maps/StatBar";
import TradeInfo from "@/components/maps/TradeInfo";
import ResultTable from "@/components/maps/ResultTable";

export default function PricePage() {
  const [selectedRegion, setSelectedRegion] = useState<RegionCode | null>(null);
  const { averages, stations, selectedAvg, nationAvg } = usePricePageData(selectedRegion);

  return (
    <div className="flex gap-6 p-4">
      <div className="flex-1 border rounded p-2 relative">
        {averages.loading && <div className="p-3 text-gray-500">지도를 불러오는 중…</div>}
        {averages.error && <div className="p-3 text-red-600">{averages.error}</div>}

        {averages.data && (
          <KoreaMap
            summary={averages.data}
            selectedRegion={selectedRegion}
            onRegionSelect={(code) => setSelectedRegion(code ?? null)}
            max={15000}
          />
        )}

        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          지도 클릭 → 우측 패널이 해당 지역으로 바뀝니다
        </div>
      </div>

      <div className="w-[520px] flex flex-col gap-3">
        <StatBar
          total={stations.data?.length ?? 0}
          nationAvg={nationAvg}
          selectedAvg={selectedAvg}
        />

        <TradeInfo
          selectedRegion={selectedRegion}
          summaryList={averages.data}
          loading={averages.loading}
          error={averages.error}
        />

        <ResultTable
          items={stations.data}
          loading={stations.loading}
          error={stations.error}
        />
      </div>
    </div>
  );
}
