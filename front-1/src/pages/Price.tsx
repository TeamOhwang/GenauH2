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
import SearchInput from "@/components/maps/SearchInput"; 

// 문자열 정규화 유틸(한글 IME 안정)
const norm = (s: string) => {
  const n = typeof (s as any).normalize === "function" ? s.normalize("NFC") : s;
  return n.toLowerCase().trim();
};

export default function PricePage() {
  const [sp, setSp] = useSearchParams();

  // URL 쿼리 동기화
  const page = Math.max(1, Number(sp.get("page") ?? 1));  // 1-base
  const size = Math.max(1, Number(sp.get("size") ?? 20)); // 기본 20개
  const q = sp.get("q") ?? "";                            // 검색어

  // 지도에서 선택된 지역
  const [selectedRegion, setSelectedRegion] = useState<RegionCode | null>(null);

  // 데이터 훅(지역 변경 시 목록 재조회 / 평균/전국평균 계산 포함)
  const { averages, stations, selectedAvg, nationAvg } = usePricePageData(selectedRegion);

  // 지역 바뀌면 1페이지로 리셋
  useEffect(() => {
    const next = new URLSearchParams(sp);
    next.set("page", "1");
    setSp(next, { replace: true });
  }, [selectedRegion]);

  // page/size 변경 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, size]);

  // 1) 검색 필터 (이름 기준)
  const filtered = useMemo(() => {
    const list = stations.data ?? [];
    const key = q.trim();
    if (!key) return list; // 검색어 없으면 원본 유지
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

  // 페이지 변경
  const onPageChange = (nextPage: number) => {
    const nextSp = new URLSearchParams(sp);
    nextSp.set("page", String(nextPage));
    nextSp.set("size", String(size));
    if (q) nextSp.set("q", q); else nextSp.delete("q"); // 빈 문자열이면 q 제거
    setSp(nextSp, { replace: true });
  };

  // 페이지 크기 변경(20/50/100)
  const onChangeSize = (s: number) => {
    const nextSp = new URLSearchParams(sp);
    nextSp.set("page", "1"); 
    nextSp.set("size", String(s));
    if (q) nextSp.set("q", q); else nextSp.delete("q");
    setSp(nextSp, { replace: true });
  };

  // 검색어 변경(디바운스/IME-세이프 SearchInput 사용)
  const onChangeQuery = (value: string) => {
    const nextSp = new URLSearchParams(sp);
    nextSp.set("page", "1");
    nextSp.set("size", String(size));
    if (value) nextSp.set("q", value);
    else nextSp.delete("q"); 
    setSp(nextSp, { replace: true });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-4">
      {/* 좌측 지도 */}
      <div className="col-span-1 lg:col-span-3 border rounded p-2 relative">
        {averages.loading && <div className="p-3 text-gray-500">지도를 불러오는 중…</div>}
        {averages.error && <div className="p-3 text-red-600">{averages.error}</div>}

        {averages.data?.length > 0 && (
          <div className="mx-auto w-full">
            {/* 모바일: 정사각형, PC: 4:3 */}
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
            onChange={onChangeQuery}
            delay={250}
            placeholder="이름으로 검색…"
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={size}
            onChange={(e) => onChangeSize(Number(e.target.value))}
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
        />

        <Pager
          page={page}
          totalPages={totalPages}
          total={total}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
}