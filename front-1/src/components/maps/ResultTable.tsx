import { motion } from "framer-motion";
import CountUp from "react-countup";
import type { Station } from "@/domain/maps/MapPriceTypes";

export default function ResultTable(props: {
  items: Station[] | null;
  loading: boolean;
  error: string | null;
  onSelect?: (s: Station) => void;
}) {
  const { items, loading, error, onSelect } = props;

  if (loading)
    return <div className="p-4 animate-pulse text-gray-500 dark:text-gray-400">📡 목록 로딩 중…</div>;
  if (error)
    return <div className="p-4 text-red-600 dark:text-red-400">⚠ {error}</div>;
  if (!items || items.length === 0)
    return <div className="p-4 text-gray-500 dark:text-gray-400">데이터 없음</div>;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800">
      <table className="min-w-full table-fixed text-sm text-black dark:text-white">
        <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">이름</th>
            <th className="px-3 py-2 text-left font-semibold">지역</th>
            <th className="px-3 py-2 text-right font-semibold">수소 1kg 판매가</th>
            <th className="px-3 py-2 text-right font-semibold">지역 평균 판매가</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s, i) => (
            <motion.tr
              key={s.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(59,130,246,0.05)" }}
              className="cursor-pointer border-b dark:border-gray-700"
              onClick={() => onSelect?.(s)}
            >
              <td className="px-3 py-2">{s.name}</td>
              <td className="px-3 py-2">{s.regionName}</td>
              <td className="px-3 py-2 text-right font-semibold text-blue-500">
                <CountUp end={s.price} decimals={0} separator="," /> 원/kg
              </td>
              <td className="px-3 py-2 text-right text-red-400">
                {s.avgPriceOfRegion != null ? (
                  <CountUp end={s.avgPriceOfRegion} decimals={0} separator="," />
                ) : (
                  "-"
                )}{" "}
                {s.avgPriceOfRegion != null && "원/kg"}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
