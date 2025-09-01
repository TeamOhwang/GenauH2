import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

type Props = { totalProduction: number };

export default function HydrogenTank({ totalProduction }: Props) {
  const [level, setLevel] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    const normalized = totalProduction % 5000;
    const cycle = Math.floor(totalProduction / 5000);
    setLevel(normalized);
    setCycles(cycle);
  }, [totalProduction]);

  const handleDecrease = () => {
    if (cycles > 0 && confirm("판매 완료하신 수량인가요?")) {
      setCycles(cycles - 1);
    }
  };

  const percent = (level / 5000) * 100;
  const isWarning = percent < 20;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex-[1.3] flex flex-col items-start gap-6"
    >
      {/* 수소탱크 이미지 */}
      <div className="relative w-[400px] h-[600px]">
        {/* 채워지는 영역 */}
        <motion.div
          className={clsx(
            "absolute bottom-0 left-0 w-full overflow-hidden",
            isWarning ? "bg-red-400/70" : "bg-cyan-400/70"
          )}
          animate={{ height: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ zIndex: 1 }}
        >
          {/* 물결 두 겹 */}
          <div className="absolute inset-0 bg-[url('/wave.svg')] bg-repeat-x animate-wave opacity-40" />
          <div className="absolute inset-0 bg-[url('/wave.svg')] bg-repeat-x animate-wave-delayed opacity-40" />
        </motion.div>

        {/* 탱크 외곽 이미지 */}
        <img
          src="/images/KSC.svg.png"
          alt="Hydrogen Tank"
          className="absolute w-full h-full object-contain z-10"
        />
      </div>

      {/* 누적량 + 버튼 */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xl font-bold text-black dark:text-white transition-colors duration-300">
          <CountUp end={level} duration={1.2} separator="," /> / 5000 kg
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            (누적 사이클 {cycles})
          </span>
        </span>
        <button
          onClick={handleDecrease}
          disabled={cycles === 0}
          className={clsx(
            "px-3 py-1 rounded text-sm",
            cycles > 0
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          )}
        >
          -1 사이클
        </button>
      </div>
    </motion.div>
  );
}
