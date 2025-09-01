import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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

  return (
    <div className="flex-[1.3] flex flex-col items-start gap-6">
      {/* 수소탱크 이미지 */}
      <div className="relative w-[400px] h-[600px]">
        <motion.div
          className="absolute bottom-0 left-0 w-full bg-cyan-400/70"
          animate={{ height: `${(level / 5000) * 100}%` }}
          transition={{ duration: 1 }}
          style={{ zIndex: 1 }}
        />
        <img
          src="/images/KSC.svg.png"
          alt="Hydrogen Tank"
          className="absolute w-full h-full object-contain z-10"
        />
      </div>

      {/* 누적량 + 버튼 한 줄 배치 */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xl font-bold text-black dark:text-white transition-colors duration-300">
          {level.toFixed(0)} / 5000 kg (누적량 {cycles})
        </span>
        <button
          onClick={handleDecrease}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          -1 사이클
        </button>
      </div>
    </div>
  );
}
