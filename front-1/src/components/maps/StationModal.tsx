import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Doughnut } from "react-chartjs-2";
import type { Station } from "@/domain/maps/MapPriceTypes";
import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function StationModal({
  station,
  nationAvg,
  onClose,
}: {
  station: Station;
  nationAvg?: number;
  onClose: () => void;
}) {
  const regionAvg = station.avgPriceOfRegion ?? 0;
  const natAvg = nationAvg ?? 0;

  const diffPercent = regionAvg
 ? Math.round(((station.price - regionAvg) / regionAvg) * 100)    : "0";

  const isHigher = Number(diffPercent) > 0;

  const data = {
    labels: ["충전소 가격", "지역 평균"],
    datasets: [
      {
        label: "가격 비교",
        data: [station.price, regionAvg],
        backgroundColor: ["#3b82f6", "#34d399"], // 블루 + 그린
        borderWidth: 6,
        borderColor: "#fff",
        cutout: "70%",
      },
    ],
  };

  const plugins = [
    {
      id: "centerText",
      beforeDraw: (chart: any) => {
        const { width } = chart;
        const ctx = chart.ctx;
        ctx.restore();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // diffPercent 퍼센트 색상 적용
        ctx.font = "bold 22px Inter, sans-serif";
        ctx.fillStyle = isHigher ? "#dc2626" : "#16a34a"; // red or green
        ctx.fillText(`${diffPercent}%`, width / 2, chart.height / 2.2);

        ctx.font = "14px Inter, sans-serif";
        ctx.fillStyle = "#6b7280"; // 보조 텍스트
        ctx.fillText("평균 대비", width / 2, chart.height / 1.8);

        ctx.save();
      },
    },
  ];

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <motion.div
        className="fixed inset-0 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4 }}
      >
        <DialogPanel className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl">
          {/* 타이틀 */}
          <DialogTitle className="text-xl font-semibold text-black dark:text-white mb-4">
            {station.name}
          </DialogTitle>

          {/* 도넛 차트 */}
          <div className="h-60 flex items-center justify-center">
            <Doughnut data={data} plugins={plugins} />
          </div>

          {/* 상세 정보 */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">지역</p>
              <p className="font-medium text-black dark:text-white">{station.regionName}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">전국 평균</p>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                <CountUp end={natAvg} decimals={0} separator="," /> 원/kg
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">지역 평균</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                <CountUp end={regionAvg} decimals={0} separator="," /> 원/kg
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">충전소 가격</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400">
                <CountUp end={station.price} decimals={0} separator="," /> 원/kg
              </p>
            </div>
          </div>

          {/* 평균 대비 뱃지 */}
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span
              className={`px-4 py-2 text-sm font-semibold rounded-full ${
                isHigher
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              평균 대비 {diffPercent}% {isHigher ? "더 높음" : "더 낮음"}
            </span>
          </motion.div>

          {/* 닫기 버튼 */}
          <div className="mt-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-medium shadow"
            >
              닫기
            </motion.button>
          </div>
        </DialogPanel>
      </motion.div>
    </Dialog>
  );
}
