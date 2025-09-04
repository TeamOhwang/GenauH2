import { motion } from "framer-motion";
import CountUp from "react-countup";
import { clsx } from "clsx";

const CYCLE_UNIT = 1000;

type Props = {
  level: number;          // 현재 수위 (0 ~ CYCLE_UNIT)
  cycles: number;         // 누적 사이클 (판매 차감 반영)
  onDecrease: () => void; // -1 버튼 핸들러
};

export default function HydrogenTank({ level, cycles, onDecrease }: Props) {
  const percent = Math.min((level / CYCLE_UNIT) * 150, 100); 
  const isWarning = percent < 20;

  const handleClick = () => {
    if (cycles > 0 && confirm("판매하시겠습니까?")) {
      onDecrease();
    }
  };

  // 파도 path (Morphing 대상)
  const wavePaths = [
    "M0 40 Q 40 20, 80 40 T 160 40 T 240 40 V300 H0 Z",
    "M0 42 Q 40 25, 80 42 T 160 42 T 240 42 V300 H0 Z",
    "M0 38 Q 40 18, 80 38 T 160 38 T 240 38 V300 H0 Z",
  ];

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex-[1.3] flex flex-col items-start gap-6"
    >
      {/* 수소탱크 본체 */}
      <div className="relative w-[400px] h-[600px]">
        {/* 채워지는 영역 */}
        <motion.div
          className={clsx(
            "absolute bottom-0 left-0 w-full overflow-hidden",
            isWarning ? "bg-red-400/40" : "bg-cyan-400/40"
          )}
          initial={{ height: "0%" }}
          animate={{ height: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ zIndex: 1 }}
        >
          {/* === Wave Morphing + 상하/좌우 이동 === */}
         <svg
            viewBox="0 0 240 300"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full overflow-hidden"
          >
            {/* Wave 1: 위아래 출렁 */}
            <motion.path
              d="M0 40 Q30 20, 60 40 T120 40 T180 40 T240 40 V300 H0 Z"
              fill={isWarning ? "#f87171" : "#22d3ee"}
              opacity={0.6}
              animate={{ y: [-12, 0, -12] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Wave 2: 좌우 흘러감 */}
            <motion.path
              d="M0 42 Q30 25, 60 42 T120 42 T180 42 T240 42 V300 H0 Z"
              fill={isWarning ? "#ef4444" : "#06b6d4"}
              opacity={0.4}
              animate={{ x: [0, -60] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Wave 3: 반대방향 + 약한 출렁 */}
            <motion.path
              d="M0 38 Q30 18, 60 38 T120 38 T180 38 T240 38 V300 H0 Z"
              fill={isWarning ? "#dc2626" : "#0891b2"}
              opacity={0.3}
              animate={{ x: [0, 60], y: [-6, 0, -6] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>

          {/* 보조 wave.svg 배경 */}
          <div className="absolute inset-0 bg-[url('/wave.svg')] bg-repeat-x animate-wave opacity-10" />
          <div className="absolute inset-0 bg-[url('/wave.svg')] bg-repeat-x animate-wave-delayed opacity-10" />
        </motion.div>

        {/* 외곽 이미지 */}
        <img
          src="/images/h2h2.png"
          alt="Hydrogen Tank"
          className="absolute w-full h-full object-contain z-10"
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
