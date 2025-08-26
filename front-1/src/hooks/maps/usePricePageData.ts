import { useEffect, useMemo, useRef, useState } from "react";
import type { RegionCode, RegionSummary, Station } from "@/domain/maps/MapPriceTypes";
import { REGION_LABEL } from "@/domain/maps/MapPriceTypes";
import {
  fetchRegionAveragesDto,
  fetchAllStationsDto,
  fetchStationsByRegionDto,
} from "@/api/priceApi";
import {
  mapRegionAvgDtoToDomain,
  mapStationDtoToDomain,
} from "@/domain/maps/regionMappers";

/** 공통 로더 타입 */
type Loadable<T> = { data: T; loading: boolean; error: string | null };

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch { return String(e); }
}

export function usePricePageData(selectedRegion: RegionCode | null) {
  const [averages, setAverages] = useState<Loadable<RegionSummary[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [stations, setStations] = useState<Loadable<Station[]>>({
    data: [],
    loading: true,
    error: null,
  });

  const reqIdRef = useRef(0);

  useEffect(() => {
    let canceled = false;
    const myReq = ++reqIdRef.current;

    // 1) 평균가 로드 (DTO → 도메인)
    setAverages((s) => ({ ...s, loading: true, error: null }));
    (async () => {
      try {
        const dtos = await fetchRegionAveragesDto();
        if (canceled || reqIdRef.current !== myReq) return;
        const list = dtos.map(mapRegionAvgDtoToDomain);
        setAverages({ data: list, loading: false, error: null });
      } catch (e) {
        if (canceled || reqIdRef.current !== myReq) return;
        setAverages({ data: [], loading: false, error: errMsg(e) });
      }
    })();

    // 2) 스테이션 로드 (DTO → 도메인)
    setStations((s) => ({ ...s, loading: true, error: null }));
    (async () => {
      try {
        const dtos = selectedRegion
          ? await fetchStationsByRegionDto(REGION_LABEL[selectedRegion])
          : await fetchAllStationsDto();
        if (canceled || reqIdRef.current !== myReq) return;
        const list = dtos.map(mapStationDtoToDomain);
        setStations({ data: list, loading: false, error: null });
      } catch (e) {
        if (canceled || reqIdRef.current !== myReq) return;
        setStations({ data: [], loading: false, error: errMsg(e) });
      }
    })();

    return () => { canceled = true; };
  }, [selectedRegion]);

  // 평균가 맵 (code -> avgPrice)
  const avgMap = useMemo(() => {
    const m: Partial<Record<RegionCode, number>> = {};
    for (const a of averages.data) m[a.regionCode] = a.avgPrice ?? 0;
    return m;
  }, [averages.data]);

  // 스테이션에 지역 평균가 주입
  const stationsWithAvg = useMemo<Station[]>(() => {
    if (!stations.data.length) return [];
    return stations.data.map((s) => ({ ...s, avgPriceOfRegion: avgMap[s.regionCode] }));
  }, [stations.data, avgMap]);

  const selectedAvg = useMemo(() => (
    selectedRegion ? avgMap[selectedRegion] : undefined
  ), [selectedRegion, avgMap]);

  const nationAvg = useMemo(() => {
    if (!averages.data.length) return undefined;
    const sum = averages.data.reduce((acc, x) => acc + (x.avgPrice ?? 0), 0);
    return Math.round(sum / averages.data.length);
  }, [averages.data]);

  return useMemo(() => ({
    averages,
    stations: { ...stations, data: stationsWithAvg },
    selectedAvg,
    nationAvg,
  }), [averages, stations, stationsWithAvg, selectedAvg, nationAvg]);
}
