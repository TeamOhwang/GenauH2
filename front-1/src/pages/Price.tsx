// src/pages/Price.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { RegionCode } from "@/domain/maps/MapPriceTypes";
import { KoreaMap } from "@/types/KoreaMap";
import { usePricePageData } from "@/hooks/maps/usePricePageData";
import StatBar from "@/components/maps/StatBar";
import TradeInfo from "@/components/maps/TradeInfo";
import ResultTable from "@/components/maps/ResultTable";
import Pager from "@/components/maps/Pager";

export default function PricePage() {
  // URL 쿼리와 동기화되는 페이지/사이즈
  const [sp, setSp] = useSearchParams();
  const page = Math.max(1, Number(sp.get("page") ?? 1));      // 1-base
  const size = Math.max(1, Number(sp.get("size") ?? 20));     // 기본 20

  // 지역 선택 상태
  const [selectedRegion, setSelectedRegion] = useState<RegionCode | null>(null);

  // 데이터 훅(통신/매핑/파생값)
  const { averages, stations, selectedAvg, nationAvg } = usePricePageData(selectedRegion);

  // 지역 선택이 바뀌면 1페이지로 리셋 (UX)
  useEffect(() => {
    const next = new URLSearchParams(sp);
    next.set("page", "1");
    setSp(next, { replace: true });
  }, [selectedRegion]);

  // 페이지/사이즈가 바뀌면 상단으로 스크롤 (UX)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, size]);

  // 총 개수/총 페이지
  const total = stations.data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / size));

  // 현재 페이지 데이터만 slice
  const pagedItems = useMemo(() => {
    const arr = stations.data ?? [];
    const start = (page - 1) * size;
    return arr.slice(start, start + size);
  }, [stations.data, page, size]);

  // 페이지 변경
  const onPageChange = (nextPage: number) => {
    const nextSp = new URLSearchParams(sp);
    nextSp.set("page", String(nextPage));
    nextSp.set("size", String(size));
    setSp(nextSp, { replace: true });
  };

  // 페이지 크기 변경(20/50/100)
  const onChangeSize = (s: number) => {
    const nextSp = new URLSearchParams(sp);
    nextSp.set("page", "1");           // 크기 바꾸면 1페이지로
    nextSp.set("size", String(s));
    setSp(nextSp, { replace: true });
  };

  return (
    //  6:4 레이아웃 (데스크탑 기준), 모바일에서는 자동 1열
    <div className="grid grid-cols-5 gap-6 p-4">
      {/* 좌측 6 (= 3/5) : 지도 영역 */}
      <div className="col-span-5 lg:col-span-3 border rounded p-2 relative">
        {averages.loading && <div className="p-3 text-gray-500">지도를 불러오는 중…</div>}
        {averages.error && <div className="p-3 text-red-600">{averages.error}</div>}

        {averages.data?.length > 0 && (
          <div className="mx-auto w-full">
            {/* 지도 비율: 4:3 예시 (원하면 1:1로 변경 가능: aspect-[1/1]) */}
            <div className="aspect-[4/3]">
              <div className="w-full h-full">
                <KoreaMap
                  summary={averages.data}
                  selectedRegion={selectedRegion}
                  onRegionSelect={(code) => setSelectedRegion(code ?? null)}
                  max={15000}
                />
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          지도 클릭 → 우측 패널이 해당 지역으로 바뀝니다
        </div>
      </div>

      {/* 우측 4 (= 2/5) : 통계/목록/페이지네이션 */}
      <div className="col-span-5 lg:col-span-2 flex flex-col gap-3">
        <StatBar total={total} nationAvg={nationAvg} selectedAvg={selectedAvg} />

        <TradeInfo
          selectedRegion={selectedRegion}
          summaryList={averages.data}
          loading={averages.loading}
          error={averages.error}
        />

        <ResultTable
          items={pagedItems}                 // slice된 데이터만 전달
          loading={stations.loading}
          error={stations.error}
        />

        {/* 페이지 크기 + 페이저 */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <label className="mr-2 text-gray-600">페이지 크기</label>
            <select
              className="border rounded px-2 py-1"
              value={size}
              onChange={(e) => onChangeSize(Number(e.target.value))}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <Pager
            page={page}
            totalPages={totalPages}
            total={total}
            onChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
}
