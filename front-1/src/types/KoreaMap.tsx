// src/types/KoreaMap.tsx
import { memo, useMemo, useCallback, useState, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { useFloating, offset, flip, shift, FloatingPortal } from "@floating-ui/react";
import type { Feature, Geometry, GeoJsonProperties } from "geojson";
import type { RegionSummary, RegionCode } from "../domain/maps/MapPriceTypes";
import { toRegionCode, REGION_LABEL, stripSidoSuffix } from "../domain/maps/MapPriceTypes";

const geoUrl =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json";

type GeoFeature = Feature<Geometry, GeoJsonProperties> & {
  rsmKey?: string;
  properties: Record<string, unknown>;
};

function pickRegionFromProps(props: Record<string, unknown>): { code: RegionCode | null; label: string } {
  const raw = String(props["CTPRVN_CD"] ?? props["SIDO_CD"] ?? props["SIG_CD"] ?? "").trim();
  const two = raw.length >= 2 ? raw.slice(0, 2) : "";
  const codeFromCd = (two in REGION_LABEL ? (two as RegionCode) : null);

  const nameRaw = String(props["CTPRVN_NM"] ?? props["SIDO_NM"] ?? props["SIG_KOR_NM"] ?? props["name"] ?? "");
  const codeFromName = toRegionCode(stripSidoSuffix(nameRaw));

  const code = codeFromCd ?? codeFromName;
  const label = code ? REGION_LABEL[code] : "알수없음";
  return { code, label };
}

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

type KoreaMapProps = {
  summary: RegionSummary[];
  max?: number;
  selectedRegion?: RegionCode | null;
  onRegionSelect?: (r?: RegionCode) => void;
};

export const KoreaMap = memo(function KoreaMap({
  summary,
  max = 15000,
  selectedRegion,
  onRegionSelect,
}: KoreaMapProps) {
  const avgByCode = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of summary) {
      const code = s.regionCode ?? toRegionCode(s.regionName);
      if (code) m[code] = s.avgPrice;
    }
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
  const handleClick = useCallback((code?: RegionCode) => onRegionSelect?.(code), [onRegionSelect]);


  // 툴팁 상태
  const [hover, setHover] = useState<{ label: string; avg?: number } | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);

  // 스로틀용 ref 
  const moveRaf = useRef<number | null>(null);
  const scheduleMove = useCallback((e: React.MouseEvent) => {
    if (moveRaf.current) cancelAnimationFrame(moveRaf.current);
    const { clientX, clientY } = e;
    moveRaf.current = requestAnimationFrame(() => {
      setCoords({ x: clientX, y: clientY });
    });
  }, []);
  useEffect(() => () => {
    if (moveRaf.current) cancelAnimationFrame(moveRaf.current);
  }, []);
 
  // 가상 reference
  const virtualEl = useMemo(
    () => ({
      getBoundingClientRect: () => ({
        x: coords.x,
        y: coords.y,
        left: coords.x,
        top: coords.y,
        right: coords.x,
        bottom: coords.y,
        width: 0,
        height: 0,
      }),
    }),
    [coords]
  );

  const { x, y, refs, strategy } = useFloating({
    open,
    placement: "top",
    middleware: [offset(12), flip(), shift({ padding: 8 })],
    strategy: "fixed",
  });

  useEffect(() => {
    refs.setReference(virtualEl as any);
  }, [virtualEl, refs]);

 return (
    <div className="w-full h-[700px]"> 
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [128.0, 35.9], scale: 5000 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: GeoFeature[] }) =>
            geographies.map((geo) => {
              const { code, label } = pickRegionFromProps(geo.properties);
              const avg = code ? avgByCode[code] : undefined;
              const isSelected = !!selectedRegion && code === selectedRegion;

              return (
                <g
                  key={geo.rsmKey ?? (geo.id as string) ?? JSON.stringify(geo.properties)}
                  style={{ cursor: code ? "pointer" : "default" }}
                >
                  <Geography
                    geography={geo}
                    fill={colorize(avg, isSelected)}
                    stroke="#fff"                
                    strokeWidth={0.8}            
                    tabIndex={-1}
                    style={{
                      default: { outline: "none" },
                      hover:   { outline: "none" },
                      pressed: { outline: "none" },
                    } as any}
                    onClick={() => handleClick(code ?? undefined)}
                    onMouseEnter={(e: any) => {
                      setHover({ label, avg });
                      scheduleMove(e);
                      setOpen(true);
                    }}
                    onMouseMove={scheduleMove}
                    onMouseLeave={() => {
                      setOpen(false);
                      setHover(null);
                    }}
                  />
                </g>
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <FloatingPortal>
        {open && hover && (
          <div
            ref={refs.setFloating}
            style={{ position: strategy, left: x ?? 0, top: y ?? 0 }}
            className="z-50 pointer-events-none bg-white/95 backdrop-blur text-xs shadow-md border rounded px-2 py-1"
            role="tooltip"
            aria-live="polite"
          >
            <div className="font-medium">{hover.label}</div>
            <div className="text-gray-600">
              {typeof hover.avg === "number" ? `${hover.avg.toLocaleString()} 원` : "데이터 없음"}
            </div>
          </div>
        )}
      </FloatingPortal>
    </div>
  );
});
