/** 시·도 코드 */
export type RegionCode =
  | "11" | "26" | "27" | "28" | "29" | "30" | "31" | "36"
  | "41" | "42" | "43" | "44" | "45" | "46" | "47" | "48" | "50";

/** 시·도 코드 → 라벨 (축약형) */
export const REGION_LABEL: Record<RegionCode, string> = {
  "11": "서울", "26": "부산", "27": "대구", "28": "인천", "29": "광주",
  "30": "대전", "31": "울산", "36": "세종",
  "41": "경기", "42": "강원", "43": "충북", "44": "충남",
  "45": "전북", "46": "전남", "47": "경북", "48": "경남", "50": "제주",
} as const;

/** 역매핑: 축약형 라벨 → 코드 */
const NAME_TO_CODE: Readonly<Record<string, RegionCode>> = Object.freeze(
  Object.fromEntries(
    Object.entries(REGION_LABEL).map(([code, name]) => [name, code as RegionCode])
  ) as Record<string, RegionCode>
);

/** 빠른 코드 판정용 Set */
const REGION_CODE_SET: ReadonlySet<string> = new Set(Object.keys(REGION_LABEL));

/** 접미어 제거 + 공백 제거 */
export const stripSidoSuffix = (raw: string): string =>
  String(raw ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/(특별자치도|특별자치시|특별시|광역시|자치도|자치시|도|시)$/g, "");

/** 장형 → 축약형 보정 */
export const compactLongName = (s: string): string =>
  s
    .replace(/^전라남/, "전남")
    .replace(/^전라북/, "전북")
    .replace(/^경상남/, "경남")
    .replace(/^경상북/, "경북")
    .replace(/^충청남/, "충남")
    .replace(/^충청북/, "충북");

/** 코드/이름 입력을 RegionCode로 정규화 */
export function toRegionCode(input: string): RegionCode | null {
  const s0 = String(input ?? "").trim();
  if (!s0) return null;

  // 1) "11" 같은 코드면 통과
  if (REGION_CODE_SET.has(s0)) return s0 as RegionCode;

  // 2) 접미어 제거 + 장형 축약화
  const normalized = compactLongName(stripSidoSuffix(s0));

  // 3) 축약형 라벨 매핑
  const byShort = NAME_TO_CODE[normalized];
  if (byShort) return byShort;

  // 4) 원문이 축약형과 동일한 경우
  const byExact = NAME_TO_CODE[s0];
  return byExact ?? null;
}

/** GeoJSON properties에서 코드/라벨 추출 */
export function pickRegionFromProps(props: Record<string, unknown>): {
  code: RegionCode | null; label: string;
} {
  // 시도 코드 우선, 없으면 시군구 코드 앞 2자리
  const rawCode = String(props["CTPRVN_CD"] ?? props["SIG_CD"] ?? "");
  const codeFromNum = rawCode ? (rawCode.slice(0, 2) as RegionCode) : null;

  const code =
    codeFromNum ??
    toRegionCode(String(props["CTPRVN_NM"] ?? props["SIG_KOR_NM"] ?? props["name"] ?? ""));

  const label = code ? REGION_LABEL[code] : "알수없음";
  return { code, label };
}

/** 도메인: 시·도 평균 단가 요약 */
export type RegionSummary = Readonly<{
  regionCode: RegionCode;
  regionName: string;   // "서울"
  avgPrice: number;
}>;

/** 도메인: 주유소/충전소 */
export type Station = Readonly<{
  id: string;
  name: string;
  regionCode: RegionCode;
  regionName: string;
  address: string;
  price: number;
  vehicleType: string;
  lat?: number;
  lng?: number;
  avgPriceOfRegion?: number;
}>;
