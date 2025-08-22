import { useEffect, useMemo, useState } from "react";
import type { RegionCode, RegionSummary, Station } from "@/domain/maps/MapPriceTypes";
import { REGION_LABEL } from "@/domain/maps/MapPriceTypes";
import {
  fetchRegionAverages,
  fetchAllStations,
  fetchStationsByRegion,
} from "@/api/priceApi";

type Loadable<T> = { data: T | null; loading: boolean; error: string | null };

export function usePricePageData(selectedRegion: RegionCode | null) {
  const [averages, setAverages] = useState<Loadable<RegionSummary[]>>({ data: null, loading: true, error: null });
  const [stations, setStations] = useState<Loadable<Station[]>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let alive = true;

    setAverages((s) => ({ ...s, loading: true, error: null }));
    fetchRegionAverages()
      .then((list) => { if (alive) setAverages({ data: list, loading: false, error: null }); })
      .catch((e)  => { if (alive) setAverages({ data: null, loading: false, error: String(e?.message ?? e) }); });

    setStations((s) => ({ ...s, loading: true, error: null }));
    const p = selectedRegion
      ? fetchStationsByRegion(REGION_LABEL[selectedRegion]) // 코드→한글명
      : fetchAllStations();

    p.then((list) => { if (alive) setStations({ data: list, loading: false, error: null }); })
     .catch((e)  => { if (alive) setStations({ data: null, loading: false, error: String(e?.message ?? e) }); });

    return () => { alive = false; };
  }, [selectedRegion]);

  // 평균가 맵
  const avgMap = useMemo(() => {
    const m: Record<string, number> = {};
    if (averages.data) for (const a of averages.data) m[a.regionCode] = a.avgPrice;
    return m;
  }, [averages.data]);

  // 스테이션에 지역 평균가 주입
  const stationsWithAvg = useMemo(() => {
    if (!stations.data) return null;
    return stations.data.map((s) => ({ ...s, avgPriceOfRegion: avgMap[s.regionCode] }));
  }, [stations.data, avgMap]);

  const selectedAvg = useMemo(() => {
    if (!selectedRegion) return undefined;
    return avgMap[selectedRegion];
  }, [selectedRegion, avgMap]);

  const nationAvg = useMemo(() => {
    if (!averages.data || averages.data.length === 0) return undefined;
    const sum = averages.data.reduce((acc, x) => acc + (x.avgPrice ?? 0), 0);
    return Math.round(sum / averages.data.length);
  }, [averages.data]);

  return {
    averages,                                   // { data, loading, error }
    stations: { ...stations, data: stationsWithAvg }, // avg 주입된 Station[]
    selectedAvg,
    nationAvg,
  };
}
