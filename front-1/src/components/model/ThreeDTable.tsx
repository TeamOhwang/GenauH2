import { HourlyData } from "@/hooks/threeDModel";
import CountUp from "react-countup";
import { motion } from "framer-motion";

type Props = {
  data: HourlyData[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  start?: string;
  end?: string;
  selectedDate?: string;
};

export default function HourlyTable({
  data,
  page,
  totalPages,
  onPageChange,
  selectedDate,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          시간별 생산량
        </h3>
        {selectedDate && (
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {selectedDate}
          </span>
        )}
        {/* 페이지네이션 */}
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded border text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 disabled:opacity-50"
          >
            이전
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 rounded border text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <table className="w-full border-collapse text-sm flex-1">
        <thead>
          <tr className="border-b bg-slate-100 dark:bg-slate-900">
            <th className="text-left p-2 text-gray-900 dark:text-white">시간</th>
            <th className="text-right p-2 text-gray-900 dark:text-white">
              생산량 (kg)
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="border-b dark:border-b-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <td className="p-2 text-gray-800 dark:text-gray-200">{d.time}</td>
              <td className="p-2 text-right text-gray-800 dark:text-gray-200">
                <CountUp end={d.amount ?? 0} duration={0.8} separator="," decimals={1} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
