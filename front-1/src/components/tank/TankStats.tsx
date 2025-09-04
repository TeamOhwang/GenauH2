import { Factory, AlertCircle } from "lucide-react";
export type FacilityStatus = "가동" | "비가동";

export type Facility = {
  id: number;
  name: string;
  status: FacilityStatus;
  alarms: number;
  productionKg: number;
};

type Props = { facilities: Facility[] };

export default function TankStats({ facilities }: Props) {
  const active = facilities.filter((f) => f.status === "가동").length;
  const inactive = facilities.filter((f) => f.status === "비가동").length;

  return (
    <div className="w-full space-y-8">
      {/* 설비 요약 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-center">
          <h3 className="text-lg font-semibold mb-2 flex justify-center items-center gap-2">
            <Factory className="w-5 h-5 text-green-400" />
            가동중 설비
          </h3>
          <p className="text-4xl font-extrabold text-green-400">{active}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-center">
          <h3 className="text-lg font-semibold mb-2 flex justify-center items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            비가동 설비
          </h3>
          <p className="text-4xl font-extrabold text-red-400">{inactive}</p>
        </div>
      </div>

      {/* 설비별 누적 생산량 */}
      <div>
        <h2 className="text-xl font-bold mb-4">설비별 누적 생산량</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md flex flex-col gap-2 hover:scale-105 transition-transform"
            >
              <span className="text-lg font-semibold">{f.name}</span>
              <span
                className={`font-bold ${
                  f.status === "가동" ? "text-green-400" : "text-red-400"
                }`}
              >
                {f.status}
              </span>
              <span className="text-sm text-cyan-300">
                누적 생산량: {Number(f.productionKg.toFixed(1)).toLocaleString()} kg
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
