// src/components/maps/KoreaMap.tsx
import { memo, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import type { Feature, Geometry, GeoJsonProperties } from "geojson";
import type { RegionSummary, RegionCode } from "@/domain/maps/MapPriceTypes";
import { stripSidoSuffix, toRegionCode } from "@/domain/maps/MapPriceTypes";

/** 지도 파일은 src/assets/maps/korea-sido-lite.topo.json 에 두세요. */
import geoUrl from "@/assets/maps/korea-sido-lite.topo.json?url";
// public을 쓸 경우 ↓로 대체하고 파일을 public/maps/에 배치
// const geoUrl = "/maps/korea-sido-lite.topo.json";

type GeoFeature = Feature<Geometry, GeoJsonProperties> & {
  rsmKey?: string;
  properties: Record<string, unknown>;
};

// GeoJSON/TopoJSON properties에서 지역명 뽑고 "서울특별시" -> "서울"로 정규화
function getRegionName(p: Record<string, unknown>): string {
  const raw =
    (p["name"] as string) ??
    (p["SIG_KOR_NM"] as string) ??
    (p["CTP_KOR_NM"] as string) ??
    (p["CTPRVN_NM"] as string) ??
    "알수없음";
  return stripSidoSuffix(raw);
}

function makeColorize(max = 15000) {
  return (v?: number, selected?: boolean) => {
    if (selected) return "#60A5FA";
    if (v == null) return "#E5E7EB";
    const t = Math.max(0, Math.min(1, v / (max || 1)));
    const g = Math.round(224 - 160 * t);
    const b = Math.round(224 + 16 * t);
    return `rgb(160,${g},${b})`;
  };
}

export const KoreaMap = memo(function KoreaMap(props: {
  summary: RegionSummary[];            // [{ regionName:"서울", avgPrice:... }, ...]
  max?: number;                        // 색상 스케일 최대값
  selectedRegion?: RegionCode | null;  // 선택된 지역 코드
  onRegionSelect?: (r?: RegionCode) => void;
}) {
  const { summary, max = 15000, selectedRegion, onRegionSelect } = props;
  const [hoverName, setHoverName] = useState<string | null>(null);

  // "서울" → 평균가 매핑
  const avgByName = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of summary) m[s.regionName] = s.avgPrice;
    return m;
  }, [summary]);

  const colorize = useMemo(() => makeColorize(max), [max]);

  return (
    <ComposableMap projection="geoMercator" projectionConfig={{ center: [128, 36], scale: 3000 }}>
      <Geographies geography={geoUrl}>
        {({ geographies }: { geographies: GeoFeature[] }) =>
          geographies.map((geo) => {
            const name = getRegionName(geo.properties);
            const code = toRegionCode(name);
            const avg = avgByName[name];

            const [cx, cy] = geoCentroid(geo as any);
            const hasCenter = Number.isFinite(cx) && Number.isFinite(cy);

            const isSelected = !!selectedRegion && code === selectedRegion;

            return (
              <g key={geo.rsmKey ?? (geo.id as string) ?? JSON.stringify(geo.properties)}>
                <Geography
                  geography={geo}
                  fill={colorize(avg, isSelected)}
                  stroke="#777"
                  strokeWidth={0.6}
                  onMouseEnter={() => setHoverName(name)}
                  onMouseLeave={() => setHoverName(null)}
                  onClick={() => onRegionSelect?.(code ?? undefined)}
                />
                {hasCenter && (
                  <>
                    <text x={cx} y={cy} textAnchor="middle" fontSize={10} fill="#111827">
                      {name.slice(0, 2)}
                    </text>
                    {typeof avg === "number" && (
                      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#e11d48">
                        {avg.toLocaleString()}원
                      </text>
                    )}
                    {hoverName === name && <circle cx={cx} cy={cy} r={1.5} fill="#111827" />}
                  </>
                )}
              </g>
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
});
