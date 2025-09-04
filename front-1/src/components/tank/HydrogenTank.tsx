import { motion } from "framer-motion";
import CountUp from "react-countup";
import { clsx } from "clsx";

const CYCLE_UNIT = 1000;

type Props = {
  level: number;
  cycles: number;
  onDecrease: () => void;
};

export default function HydrogenTank({ level, cycles, onDecrease }: Props) {
  const percent = Math.min((level / CYCLE_UNIT) * 180, 100);
  const isWarning = percent < 20;

  const handleClick = () => {
    if (cycles > 0 && confirm("판매하시겠습니까?")) {
      onDecrease();
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex-[1.3] flex flex-col items-start gap-6"
    >
      {/* 수소탱크 영역 */}
      <div className="relative w-[512px] h-[256px]">
        {/* 파도 (밑에서 위로 올라옴) */}
        <motion.div
          className="absolute bottom-0 left-0 w-full overflow-hidden"
          initial={{ height: "0%" }}
          animate={{ height: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <svg
            viewBox="0 0 240 100"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-full h-full"
          >
            {/* Wave 1 */}
            <motion.path
              d="M0 40 Q30 20, 60 40 T120 40 T180 40 T240 40 V100 H0 Z"
              fill={isWarning ? "#f87171" : "#22d3ee"}
              opacity={0.6}
              animate={{ y: [-10, 0, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Wave 2 */}
            <motion.path
              d="M0 42 Q30 25, 60 42 T120 42 T180 42 T240 42 V100 H0 Z"
              fill={isWarning ? "#ef4444" : "#06b6d4"}
              opacity={0.4}
              animate={{ x: [0, -60] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            {/* Wave 3 */}
            <motion.path
              d="M0 38 Q30 18, 60 38 T120 38 T180 38 T240 38 V100 H0 Z"
              fill={isWarning ? "#dc2626" : "#0891b2"}
              opacity={0.3}
              animate={{ x: [0, 60], y: [-6, 0, -6] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>

        {/* 트럭 아이콘: 라이트/다크 모드 이미지 교체 */}
        <img
          src="/images/h1.png"
          alt="Hydrogen Tank Light"
          className="absolute top-0 left-0 w-full h-full z-20 block dark:hidden"
        />
        <img
          src="/images/h2.png"
          alt="Hydrogen Tank Dark"
          className="absolute top-0 left-0 w-full h-full z-20 hidden dark:block"
        />
      </div>

      {/* 누적 사이클 + 판매 버튼 */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xl font-bold text-black dark:text-white">
          <CountUp end={level} duration={1.2} decimals={1} separator="," /> /{" "}
          {CYCLE_UNIT.toLocaleString()} kg
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            (누적량 {cycles}t)
          </span>
        </span>
        <button
          onClick={handleClick}
          disabled={cycles === 0}
          className={clsx(
            "px-3 py-1 rounded text-sm transition-transform duration-200",
            cycles > 0
              ? "bg-red-500 text-white hover:bg-red-600 hover:scale-110"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          )}
        >
          -1t 판매
        </button>
      </div>
    </motion.div>
  );
}
