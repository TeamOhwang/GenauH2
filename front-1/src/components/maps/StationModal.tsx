import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Doughnut } from "react-chartjs-2";
import type { Station } from "@/domain/maps/MapPriceTypes";

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
    ? (((station.price - regionAvg) / regionAvg) * 100).toFixed(1)
    : "0";

  const data = {
    labels: ["충전소 가격", "지역 평균"],
    datasets: [
      {
        data: [station.price, regionAvg],
        backgroundColor: ["#60a5fa", "#34d399"],
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
        ctx.font = "bold 22px Inter, sans-serif";
        ctx.fillStyle = "#111827"; // 기본 검정
        if (document.documentElement.classList.contains("dark")) {
          ctx.fillStyle = "#fff"; // 다크 모드 흰색
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${diffPercent}%`, width / 2, chart.height / 2.2);

        ctx.font = "14px Inter, sans-serif";
        ctx.fillStyle = "#6b7280"; // 보조 텍스트 회색
        ctx.fillText("평균 대비", width / 2, chart.height / 1.8);
        ctx.save();
      },
    },
  ];

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
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
              <p className="text-gray-600 dark:text-gray-400">충전소 가격</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400">
                {station.price.toLocaleString()} 원/kg
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">지역 평균</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {regionAvg.toLocaleString()} 원/kg
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">전국 평균</p>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                {natAvg.toLocaleString()} 원/kg
              </p>
            </div>
          </div>

          {/* 평균 대비 뱃지 */}
          <div className="mt-4 text-center">
            <span
              className={`px-4 py-2 text-sm font-semibold rounded-full ${
                Number(diffPercent) < 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              평균 대비 {diffPercent}% {station.price > regionAvg ? "더 높음" : "더 낮음"}
            </span>
          </div>

          {/* 닫기 버튼 */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-medium shadow hover:scale-105 hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              닫기
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
