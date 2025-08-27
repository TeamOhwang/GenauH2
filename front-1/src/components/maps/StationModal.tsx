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

  const data = {
    labels: ["충전소", "지역 평균", "전국 평균"],
    datasets: [
      {
        data: [station.price, regionAvg, natAvg],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  // 퍼센트 표시 플러그인
  const plugins = [
    {
      id: "centerText",
      beforeDraw: (chart: any) => {
        const { width, height } = chart;
        const ctx = chart.ctx;
        ctx.restore();

        const dataset = chart.data.datasets[0].data;
        const total = dataset.reduce((a: number, b: number) => a + b, 0);
        const value = dataset[0]; // 충전소 가격
        const percent = total ? ((value / total) * 100).toFixed(1) : "0";

        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = "#111";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${percent}%`, width / 2, height / 2);

        ctx.save();
      },
    },
  ];

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
          <DialogTitle className="text-lg font-bold mb-4">
            {station.name}
          </DialogTitle>

          <div className="h-64">
            <Doughnut data={data} plugins={plugins} />
          </div>

          <div className="mt-6 space-y-1 text-sm">
            <p>지역: <b>{station.regionName}</b></p>
            <p>충전소 가격: <b>{station.price.toLocaleString()} 원/kg</b></p>
            <p>지역 평균: <b>{regionAvg.toLocaleString()} 원/kg</b></p>
            <p>전국 평균: <b>{natAvg.toLocaleString()} 원/kg</b></p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              닫기
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
