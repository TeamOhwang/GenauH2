import { HourlyData } from "@/hooks/threeDModel";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { saveAs } from "file-saver";
import { exportHourlyToExcel } from "@/components/Kpi/exportUtils";

type Props = {
  data: HourlyData[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  selectedDate?: string;
};

export default function HourlyTable({
  data,
  page,
  totalPages,
  onPageChange,
  selectedDate,
}: Props) {
  const handleExport = () => {
    const buf = exportHourlyToExcel(data);
    const fileName = selectedDate
      ? `hourly_${selectedDate}.xlsx`
      : "hourly.xlsx";
    saveAs(new Blob([buf]), fileName);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">시간별 생산량</h3>

          {/*  엑셀 다운로드 버튼 */}
          <button
            onClick={handleExport}
            className="px-3 py-1 rounded bg-green-600 text-white 
                       hover:bg-green-700 transition-transform transform hover:scale-110"
          >
            ⬇ Excel
          </button>

        <div className="flex items-center gap-3">
          {selectedDate && (
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {selectedDate}
            </span>
          )}

        </div>

        {/* 페이지 이동 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded bg-blue-500 text-white 
                       disabled:bg-gray-400 disabled:cursor-not-allowed
                       transition-transform transform hover:scale-110 
                       hover:bg-blue-600"
          >
            이전
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 rounded bg-blue-500 text-white 
                       disabled:bg-gray-400 disabled:cursor-not-allowed
                       transition-transform transform hover:scale-110 
                       hover:bg-blue-600"
          >
            다음
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <table className="w-full text-sm flex-1">
        <thead>
          <tr>
            <th className="text-left p-2">시간</th>
            <th className="text-right p-2">생산량 (kg)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.01 }}
            >
              <td className="p-2">{d.time}</td>
              <td className="p-2 text-right">
                <CountUp end={d.amount ?? 0} decimals={1} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
