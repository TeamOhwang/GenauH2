import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function KpiCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: number | undefined;
  unit: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow text-center"
    >
      {/* 제목 */}
      <div className="text-sm opacity-70">{title}</div>

      {/* 값 + 단위 */}
      <div className="mt-1 text-3xl font-extrabold text-cyan-400">
        <CountUp
          end={Number(value ?? 0)}
          duration={1.2}
          decimals={1}
          separator=","
        />
        <span className="ml-1 text-base font-medium opacity-60">{unit}</span>
      </div>
    </motion.div>
  );
}
