// src/types/KoreaMap.tsx
import { memo, useMemo, useState, useCallback } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import type { Feature, Geometry, GeoJsonProperties } from "geojson";
import type { RegionSummary, RegionCode } from "../domain/maps/MapPriceTypes";
import { stripSidoSuffix, toRegionCode } from "../domain/maps/MapPriceTypes";

/** 임시로 더 작은 한국 지도 파일 사용 */
const geoUrl = "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json";

type GeoFeature = Feature<Geometry, GeoJsonProperties> & {
  rsmKey?: string;
  properties: Record<string, unknown>;
};

// GeoJSON properties에서 지역명 추출
const getRegionName = (p: Record<string, unknown>): string => {
  const sidoNm = p["SIDO_NM"] as string;
  return sidoNm ? stripSidoSuffix(sidoNm) : "알수없음";
};

// 색상 생성 함수 메모이제이션
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

  // 지역별 평균가 매핑 (메모이제이션)
  const avgByName = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of summary) {
      m[s.regionName] = s.avgPrice;
    }
    
    // 테스트 데이터 (실제 데이터가 없을 때만)
    if (Object.keys(m).length === 0) {
      return {
        "서울": 12000, "부산": 8000, "대구": 6000, "인천": 9000,
        "광주": 5000, "대전": 7000, "울산": 8500, "세종": 7500,
        "경기": 10000, "강원": 4000, "충북": 5500, "충남": 6500,
        "전북": 4500, "전남": 4200, "경북": 5800, "경남": 6800,
        "제주": 11000
      };
    }
    
    return m;
  }, [summary]);

  // 색상 함수 메모이제이션
  const colorize = useMemo(() => createColorFunction(max), [max]);

  // 이벤트 핸들러 메모이제이션
  const handleMouseEnter = useCallback((name: string) => {
    setHoverName(name);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverName(null);
  }, []);

  const handleClick = useCallback((code?: RegionCode) => {
    onRegionSelect?.(code);
  }, [onRegionSelect]);

  return (
    <div className="w-full h-full">
      <ComposableMap 
        projection="geoMercator" 
        projectionConfig={{ 
          center: [127.5, 36.5], 
          scale: 4500 
        }}
        width={800}
        height={600}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: GeoFeature[] }) => {
            return geographies.map((geo) => {
              // 지역 정보 추출
              const name = getRegionName(geo.properties);
              const code = toRegionCode(name);
              const avg = avgByName[name];
              const isSelected = !!selectedRegion && code === selectedRegion;

              // 중심점 계산 (텍스트용)
              const [cx, cy] = geoCentroid(geo as any);
              const hasValidCenter = Number.isFinite(cx) && Number.isFinite(cy);

              return (
                <g key={geo.rsmKey ?? (geo.id as string) ?? name}>
                  <Geography
                    geography={geo}
                    fill={colorize(avg, isSelected)}
                    stroke="#777"
                    strokeWidth={0.6}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", opacity: 0.8 },
                      pressed: { outline: "none" }
                    }}
                    onMouseEnter={() => handleMouseEnter(name)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(code ?? undefined)}
                  />
                  
                  {/* 지역명과 가격 텍스트 */}
                  {hasValidCenter && (
                    <>
                      <text 
                        x={cx} 
                        y={cy} 
                        textAnchor="middle" 
                        fontSize={10} 
                        fill="#111827"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {name.slice(0, 2)}
                      </text>
                      
                      {typeof avg === "number" && (
                        <text 
                          x={cx} 
                          y={cy + 12} 
                          textAnchor="middle" 
                          fontSize={9} 
                          fill="#e11d48"
                          style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                          {avg.toLocaleString()}원
                        </text>
                      )}
                      
                      {/* 호버 효과 */}
                      {hoverName === name && (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={2} 
                          fill="#111827"
                          style={{ pointerEvents: "none" }}
                        />
                      )}
                    </>
                  )}
                </g>
              );
            });
          }}
        </Geographies>
      </ComposableMap>
    </div>
  );
});