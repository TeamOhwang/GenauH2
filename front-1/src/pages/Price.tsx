// src/pages/Price.tsx
import { useEffect, useMemo, useState } from "react";
import type { RegionCode } from "@/domain/maps/MapPriceTypes";
import { KoreaMap } from "@/types/KoreaMap";
import { usePricePageData } from "@/hooks/maps/usePricePageData";
import type { Station } from "@/domain/maps/MapPriceTypes";

import StatBar from "@/components/maps/StatBar";
import TradeInfo from "@/components/maps/TradeInfo";
import ResultTable from "@/components/maps/ResultTable";
import Pager from "@/components/maps/Pager";
import SearchInput from "@/components/maps/SearchInput"; 
import StationModal from "@/components/maps/StationModal";

// 문자열 정규화 유틸(한글 IME 안정)
const norm = (s: string) => {
  const n = typeof (s as any).normalize === "function" ? s.normalize("NFC") : s;
  return n.toLowerCase().trim();
};



export default function PricePage() {
  // 내부 상태 기반 (URL 동기화 제거)
  const [page, setPage] = useState(1);   // 1-base
  const [size, setSize] = useState(20);  // 기본 20개
  const [q, setQ] = useState("");        // 검색어

  // 지도에서 선택된 지역
  const [selectedRegion, setSelectedRegion] = useState<RegionCode | null>(null);

  // 데이터 훅 (지역 변경 시 목록 재조회 / 평균/전국평균 계산 포함)
  const { averages, stations, selectedAvg, nationAvg } = usePricePageData(selectedRegion);

    const [selectedStation, setSelectedStation] = useState<Station | null>(null);


  // 지역 바뀌면 1페이지로 리셋
  useEffect(() => {
    setPage(1);
  }, [selectedRegion]);

  // page/size 변경 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, size]);

  // 1) 검색 필터 (이름 기준)
  const filtered = useMemo(() => {
    const list = stations.data ?? [];
    const key = q.trim();
    if (!key) return list;
    const k = norm(key);
    return list.filter((s) => norm(s.name).includes(k));
  }, [stations.data, q]);

  // 2) 페이지네이션은 filtered 기준
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  }, [filtered, page, size]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 p-5">
      {/* 좌측 지도 */}
      <div className="col-span-1 lg:col-span-3 border rounded p-2 relative">
        {averages.loading && <div className="p-3 text-gray-500">지도를 불러오는 중…</div>}
        {averages.error && <div className="p-3 text-red-600">{averages.error}</div>}

        {averages.data?.length > 0 && (
          <div className="mx-auto w-full">
            <div className="aspect-[1/1] sm:aspect-[4/3]">
              <KoreaMap
                summary={averages.data}
                selectedRegion={selectedRegion}
                onRegionSelect={(code) => setSelectedRegion(code ?? null)}
                max={15000}
              />
            </div>
          </div>
        )}

        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          지도 클릭 → 우측 패널이 해당 지역으로 바뀝니다
        </div>
      </div>

      {/* 우측 패널 */}
      <div className="col-span-1 lg:col-span-2 flex flex-col gap-3">
        {/* 검색 + 페이지 크기 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <SearchInput
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1); // 검색 시 첫 페이지로 이동
            }}
            delay={250}
            placeholder="이름으로 검색…"
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={size}
            onChange={(e) => {
              setPage(1);
              setSize(Number(e.target.value));
            }}
          >
            <option value={20}>20개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
        </div>

        <StatBar total={total} nationAvg={nationAvg} selectedAvg={selectedAvg} />

        <TradeInfo
          selectedRegion={selectedRegion}
          summaryList={averages.data}
          loading={averages.loading}
          error={averages.error}
        />

        <ResultTable
          items={pagedItems}
          loading={stations.loading}
          error={stations.error}
          onSelect={(s) => setSelectedStation(s)}   

        />

        <Pager
          page={page}
          totalPages={totalPages}
          total={total}
          onChange={setPage}
        />


        {selectedStation && (
        <StationModal
          station={selectedStation}
          nationAvg={nationAvg}
          onClose={() => setSelectedStation(null)}
        />
    )}
    
      </div>
    </div>
  );
}
