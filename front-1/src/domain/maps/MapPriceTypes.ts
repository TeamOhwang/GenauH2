// src/domain/maps/MapPriceTypes.ts

/** 시·도 코드 */
export type RegionCode =
  | "11" | "26" | "27" | "28" | "29" | "30" | "31" | "36"
  | "41" | "42" | "43" | "44" | "45" | "46" | "47" | "48" | "50";

/** 시·도 코드 → 한글명 */
export const REGION_LABEL: Record<RegionCode, string> = {
  "11": "서울", "26": "부산", "27": "대구", "28": "인천", "29": "광주",
  "30": "대전", "31": "울산", "36": "세종",
  "41": "경기", "42": "강원", "43": "충북", "44": "충남",
  "45": "전북", "46": "전남", "47": "경북", "48": "경남", "50": "제주",
};

/** 한글명 → 코드 */
const NAME_TO_CODE: Record<string, RegionCode | undefined> =
  Object.fromEntries(Object.entries(REGION_LABEL).map(([code, name]) => [name, code as RegionCode]));

/** "서울특별시" → "서울" 등 접미어 제거 */
export const stripSidoSuffix = (raw: string) =>
  String(raw ?? "").replace(/(특별자치시|특별시|광역시|자치시|도)$/g, "");

/** 코드/이름 입력을 RegionCode로 정규화 */
export function toRegionCode(input: string): RegionCode | null {
  const s = String(input ?? "").trim();
  if (!s) return null;
  if ((Object.keys(REGION_LABEL) as RegionCode[]).includes(s as RegionCode)) {
    return s as RegionCode;
  }
  return NAME_TO_CODE[s] ?? NAME_TO_CODE[stripSidoSuffix(s)] ?? null;
}

/** 도메인: 시·도 평균 단가 요약 (기존 코드 호환용 타입명 유지) */
export type RegionSummary = {
  regionCode: RegionCode;
  regionName: string;   // 예: "서울", "부산"
  avgPrice: number;
};

/** 도메인: 주유소/충전소 */
export type Station = {
  id: string;
  name: string;
  regionCode: RegionCode;
  regionName: string;
  address: string;
  price: number;
  vehicleType: string;
  lat?: number;
  lng?: number;
  avgPriceOfRegion?: number; // 화면에서 주입해서 사용
};
