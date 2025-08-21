// src/types/KoreaMap.tsx
import { memo, useMemo, useState, useCallback } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import type { Feature, Geometry, GeoJsonProperties } from "geojson";
import type { RegionSummary, RegionCode } from "../domain/maps/MapPriceTypes";
import { toRegionCode, REGION_LABEL, stripSidoSuffix } from "../domain/maps/MapPriceTypes";

/** 더 가벼운 시·도 경계 GeoJSON (GitHub Raw) */
const geoUrl =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json";

type GeoFeature = Feature<Geometry, GeoJsonProperties> & {
  rsmKey?: string;
  properties: Record<string, unknown>;
};

/** GeoJSON properties → { code, label } (다양한 키 케이스 대응) */
function pickRegionFromProps(props: Record<string, unknown>): { code: RegionCode | null; label: string } {
  // 1) 코드 우선: SIDO_CD / CTPRVN_CD / SIG_CD(앞 2자리)
  const rawCode =
    String(props["SIDO_CD"] ?? props["CTPRVN_CD"] ?? props["SIG_CD"] ?? "")
      .trim();

  const codeFromId = rawCode ? (rawCode.slice(0, 2) as RegionCode) : null;

  if (codeFromId) {
    return { code: codeFromId, label: REGION_LABEL[codeFromId] };
  }

  // 2) 이름 기반 보정: SIDO_NM / CTPRVN_NM / CTP_KOR_NM / name …
  const rawName = (props["SIDO_NM"] ??
    props["CTPRVN_NM"] ??
    props["CTP_KOR_NM"] ??
    props["SIG_KOR_NM"] ??
    props["name"] ??
    "") as string;

  const norm = stripSidoSuffix(String(rawName));
  const codeFromName = toRegionCode(norm);

  return {
    code: codeFromName,
    label: codeFromName ? REGION_LABEL[codeFromName] : (norm || " "),
  };
}

/** 색상 함수 */
const createColorFunction = (max: number) => {
  return (v?: number, selected?: boolean) => {
    if (selected) return "#60A5FA";
    if (v == null) return "#E5E7EB";
    const t = Math.max(0, Math.min(1, v / (max || 1)));
    const g = Math.round(224 - 160 * t);
    const b = Math.round(224 + 16 * t);
    return `rgb(160,${g},${b})`;
  };
};

export const KoreaMap = memo(function KoreaMap(props: {
  summary: RegionSummary[];
  max?: number;
  selectedRegion?: RegionCode | null;
  onRegionSelect?: (r?: RegionCode) => void;
}) {
  const { summary, max = 15000, selectedRegion, onRegionSelect } = props;
  const [hoverName, setHoverName] = useState<string | null>(null);

  /** ✅ 코드 기준 평균가 맵 */
  const avgByCode = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of summary) {
      const code = s.regionCode ?? toRegionCode(s.regionName);
      if (code) m[code] = s.avgPrice;
    }

    // (옵션) 테스트용 기본값: 실제 데이터 없을 때만
    if (Object.keys(m).length === 0) {
      Object.assign(m, {
        "11": 12000, "26": 8000, "27": 6000, "28": 9000, "29": 5000,
        "30": 7000, "31": 8500, "36": 7500, "41": 10000, "42": 4000,
        "43": 5500, "44": 6500, "45": 4500, "46": 4200, "47": 5800,
        "48": 6800, "50": 11000,
      });
    }
    return m;
  }, [summary]);

  const colorize = useMemo(() => createColorFunction(max), [max]);

  const handleMouseEnter = useCallback((name: string) => setHoverName(name), []);
  const handleMouseLeave = useCallback(() => setHoverName(null), []);
  const handleClick = useCallback((code?: RegionCode) => onRegionSelect?.(code), [onRegionSelect]);

  return (
    <div className="w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [127.5, 36.5], scale: 4500 }}
        width={800}
        height={600}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: GeoFeature[] }) =>
            geographies.map((geo) => {
              const { code, label } = pickRegionFromProps(geo.properties);
              const avg = code ? avgByCode[code] : undefined;
              const isSelected = !!selectedRegion && code === selectedRegion;

              const [cx, cy] = geoCentroid(geo as any);
              const hasValidCenter = Number.isFinite(cx) && Number.isFinite(cy);

              return (
                <g key={geo.rsmKey ?? (geo.id as string) ?? JSON.stringify(geo.properties)}>
                  <Geography
                    geography={geo}
                    fill={colorize(avg, isSelected)}
                    stroke="#777"
                    strokeWidth={0.6}
                    onMouseEnter={() => handleMouseEnter(label)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(code ?? undefined)}
                    style={{ cursor: code ? "pointer" : "default" }}
                  />


                  {/* {hasValidCenter && (
                    <>
                      <text x={cx} y={cy} textAnchor="middle" fontSize={10} fill="#111827">
                        {label.slice(0, 2)}
                      </text>

                      {typeof avg === "number" && (
                        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="#e11d48">
                          {avg.toLocaleString()}원
                        </text>
                      )}

                      {hoverName === label && <circle cx={cx} cy={cy} r={2} fill="#111827" />}
                    </>
                  )} */}



                </g>
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
});
