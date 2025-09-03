import { motion } from "framer-motion";
import CountUp from "react-countup";
import { clsx } from "clsx";

const CYCLE_UNIT = 10000;

type Props = {
  level: number;          // 현재 수위 (0 ~ CYCLE_UNIT)
  cycles: number;         // 누적 사이클 (판매 차감 반영)
  onDecrease: () => void; // -1 버튼 핸들러
};

export default function HydrogenTank({ level, cycles, onDecrease }: Props) {
  const percent = (level / CYCLE_UNIT) * 100;
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
      {/* 수소탱크 본체 */}
      <div className="relative w-[400px] h-[600px]">
        {/* 채워지는 영역 */}
        <motion.div
          key={level}
          className={clsx(
            "absolute bottom-0 left-0 w-full overflow-hidden",
            isWarning ? "bg-red-400/70" : "bg-cyan-400/70"
          )}
          animate={{ height: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ zIndex: 1 }}
        >
          <div className="absolute inset-0 bg-[url('/wave.svg')] bg-repeat-x animate-wave opacity-40" />
          <div className="absolute inset-0 bg-[url('/wave.svg')] bg-repeat-x animate-wave-delayed opacity-40" />
        </motion.div>
        {/* 외곽 이미지 */}
        <img
          src="/images/KSC.svg.png"
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
