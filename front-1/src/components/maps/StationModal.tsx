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
        ctx.fillStyle = "#111827";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${diffPercent}%`, width / 2, chart.height / 2.2);
        ctx.font = "14px Inter, sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.fillText("평균 대비", width / 2, chart.height / 1.8);
        ctx.save();
      },
    },
  ];

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
          <DialogTitle className="text-xl font-semibold text-gray-900 mb-4">
            {station.name}
          </DialogTitle>

          <div className="h-60 flex items-center justify-center">
            <Doughnut data={data} plugins={plugins} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">지역</p>
              <p className="font-medium">{station.regionName}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">충전소 가격</p>
              <p className="font-semibold text-blue-600">
                {station.price.toLocaleString()} 원/kg
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">지역 평균</p>
              <p className="font-semibold text-green-600">
                {regionAvg.toLocaleString()} 원/kg
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">전국 평균</p>
              <p className="font-semibold text-indigo-600">
                {natAvg.toLocaleString()} 원/kg
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                Number(diffPercent) < 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              평균 대비 {diffPercent}%{" "}
              {station.price > regionAvg ? "더 높음" : "더 낮음"}
            </span>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-blue-600 text-white font-medium shadow hover:scale-105 hover:bg-blue-700 transition"
            >
              닫기
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
