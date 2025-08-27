// src/components/FacilityCard.tsx
import { Doughnut } from "react-chartjs-2";
import type { FacilityReq } from "@/api/facilityApi";

type Props = {
  facility: FacilityReq;
  index: number;
};

export default function FacilityCard({ facility, index }: Props) {
  const max = Number(facility.totalMaxKg ) || 1;     
  const current = Number(facility.totalCurrentKg ) || 0;
  const percent = Math.round((current / max) * 100);

  const chartData = {
    datasets: [
      {
        data: [percent, 100 - percent],
        backgroundColor: ["#facc15", "#374151"], // 노랑 + 다크그레이
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    cutout: "70%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center">
      {/* 라인 번호 */}
      <h2 className="text-sm font-bold text-gray-300 mb-2">
        {facility.facilityName} (LINE {index})
      </h2>

      {/* 게이지 차트 */}
      <div className="relative w-28 h-28">
        <Doughnut data={chartData} options={chartOptions} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{percent}%</span>
        </div>
      </div>

      {/* 상세 수치 */}
      <div className="mt-4 text-sm space-y-1 text-gray-300">
        <p>
          목표 수량:{" "}
          <span className="font-semibold text-yellow-400">{max} EA</span>
        </p>
        <p>
          달성 수량:{" "}
          <span className="font-semibold text-green-400">{current} EA</span>
        </p>
        <p>
          잔여 수량:{" "}
          <span className="font-semibold text-blue-400">{max - current} EA</span>
        </p>
      </div>
    </div>
  );
}
