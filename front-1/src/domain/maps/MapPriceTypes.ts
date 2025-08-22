/** 시·도 코드 */
export type RegionCode =
  | "11" | "26" | "27" | "28" | "29" | "30" | "31" | "36"
  | "41" | "42" | "43" | "44" | "45" | "46" | "47" | "48" | "50";

/** 시·도 코드 → 한글명(축약형) */
export const REGION_LABEL: Record<RegionCode, string> = {
  "11": "서울", "26": "부산", "27": "대구", "28": "인천", "29": "광주",
  "30": "대전", "31": "울산", "36": "세종",
  "41": "경기", "42": "강원", "43": "충북", "44": "충남",
  "45": "전북", "46": "전남", "47": "경북", "48": "경남", "50": "제주",
};

/** 한글명 → 코드 (축약형 기준) */
const NAME_TO_CODE: Record<string, RegionCode | undefined> =
  Object.fromEntries(
    Object.entries(REGION_LABEL).map(([code, name]) => [name, code as RegionCode])
  );

/** 접미어 제거(가장 긴 패턴 먼저), 공백 제거 */
export const stripSidoSuffix = (raw: string) =>
  String(raw ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/(특별자치도|특별자치시|특별시|광역시|자치도|자치시|도|시)$/g, "");

/** 장형 → 축약형 보정 (전라남 → 전남, 경상북 → 경북, 충청남 → 충남 등) */
function compactLongName(s: string) {
  return s
    .replace(/^전라남/, "전남")
    .replace(/^전라북/, "전북")
    .replace(/^경상남/, "경남")
    .replace(/^경상북/, "경북")
    .replace(/^충청남/, "충남")
    .replace(/^충청북/, "충북");
}

/** 코드/이름 입력을 RegionCode로 정규화 (강화판) */
export function toRegionCode(input: string): RegionCode | null {
  const s0 = String(input ?? "").trim();
  if (!s0) return null;

  // 1) 이미 "11" 같은 코드면 통과
  if ((Object.keys(REGION_LABEL) as RegionCode[]).includes(s0 as RegionCode)) {
    return s0 as RegionCode;
  }

  // 2) 접미어 제거 + 장형 축약화
  const s1 = compactLongName(stripSidoSuffix(s0));

  // 3) 축약형 매핑 우선
  const byShort = NAME_TO_CODE[s1];
  if (byShort) return byShort;

  // 4) 혹시 원문이 축약형 라벨과 일치하는 케이스
  const byExact = NAME_TO_CODE[s0];
  if (byExact) return byExact;

  return null;
}

/** GeoJSON properties에서 코드/라벨 뽑기 (파일 키에 맞게 조정) */
export function pickRegionFromProps(props: Record<string, unknown>) {
  // CTPRVN_CD(시도 코드) 또는 SIG_CD(시군구 코드)의 앞 2자리 우선
  const rawCode = String(props["CTPRVN_CD"] ?? props["SIG_CD"] ?? "");
  const code = (rawCode.slice(0, 2) as RegionCode) ||
    (toRegionCode(String(props["CTPRVN_NM"] ?? props["SIG_KOR_NM"] ?? props["name"] ?? "")) as RegionCode | null);

  const label = code ? REGION_LABEL[code] : "알수없음";
  return { code, label };
}

/** 도메인: 시·도 평균 단가 요약 */
export type RegionSummary = {
  regionCode: RegionCode;      // 두 자리 코드 권장
  regionName: string;          // "서울" 등
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
  avgPriceOfRegion?: number;
};
