import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function StatBar(props: {
  total: number;
  nationAvg?: number;
  selectedAvg?: number;
}) {
  const { total, nationAvg, selectedAvg } = props;

  const cards = [
    { label: "총 지점", value: total, unit: "곳", color: "text-cyan-500" },
    { label: "전국 평균", value: nationAvg, unit: "원", color: "text-indigo-500" },
    { label: "선택 지역 평균", value: selectedAvg, unit: "원", color: "text-pink-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.15 }}
          className="p-3 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow"
        >
          <div className="text-gray-600 dark:text-gray-300">{c.label}</div>
          <div className={`text-lg font-extrabold ${c.color}`}>
            {c.value != null ? (
              <>
                <CountUp end={c.value} decimals={0} separator="," duration={1.2} />
                <span className="ml-1 text-sm font-medium">{c.unit}</span>
              </>
            ) : (
              "-"
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
