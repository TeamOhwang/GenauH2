import { motion } from "framer-motion";
import CountUp from "react-countup";
import type { RegionSummary, RegionCode } from "@/domain/maps/MapPriceTypes";

export default function TradeInfo(props: {
  selectedRegion?: RegionCode | null;
  summaryList: RegionSummary[] | null;
  loading: boolean;
  error: string | null;
}) {
  const { selectedRegion, summaryList, loading, error } = props;
  const card =
    selectedRegion && summaryList
      ? summaryList.find((x) => x.regionCode === selectedRegion) ?? null
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-gray-200 dark:border-gray-600 rounded p-3 bg-white dark:bg-gray-800 shadow"
    >
      {/* 제목 */}
      <div className="font-semibold mb-2 text-black dark:text-white">거래 정보</div>

      {/* 상태별 메시지 */}
      {loading && (
        <div className="text-gray-600 dark:text-gray-400 animate-pulse">로드 중…</div>
      )}
      {error && (
        <div className="text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* 본문 */}
      {!loading && !error && (
        card ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-black dark:text-white space-y-1"
          >
            <div>
              지역: <b>{card.regionName}</b>
            </div>
            <div>
              1kg 평균 매입가:{" "}
              <b className="text-blue-600 dark:text-blue-400">
                <CountUp
                  end={card.avgPrice}
                  decimals={0}
                  separator=","
                  duration={1}
                />{" "}
                원/kg
              </b>
            </div>
          </motion.div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            지역을 선택하세요.
          </div>
        )
      )}
    </motion.div>
  );
}
