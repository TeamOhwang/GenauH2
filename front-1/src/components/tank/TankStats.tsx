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
  const alarms = facilities.filter((f) => f.alarms > 0).length;

  return (
    <div className="w-full space-y-6">
      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-200 dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
          <h3 className="text-lg font-bold text-black dark:text-white mb-2">
            가동중 설비
          </h3>
          <p className="text-3xl font-extrabold text-green-500">{active}</p>
        </div>
        <div className="bg-slate-200 dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
          <h3 className="text-lg font-bold text-black dark:text-white mb-2">
            알람 발생 설비
          </h3>
          <p className="text-3xl font-extrabold text-red-500">{alarms}</p>
        </div>
      </div>

      {/* 설비별 누적 생산량 */}
      <div>
        <h2 className="text-lg font-bold mb-3 text-black dark:text-white">
          설비별 누적 생산량
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map((f) => (
            <div
              key={f.id}
              className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 shadow-md flex flex-col gap-2"
            >
              <span className="text-black dark:text-white font-semibold">
                {f.name}
              </span>
              <span
                className={
                  f.status === "가동"
                    ? "text-green-500"
                    : "text-gray-500 dark:text-gray-400"
                }
              >
                {f.status}
              </span>
              <span className="text-sm text-cyan-600 dark:text-cyan-300">
                누적 생산량: {Number(f.productionKg.toFixed(1)).toLocaleString()} kg
              </span>
              {f.alarms > 0 && (
                <span className="text-red-500 dark:text-red-400 font-semibold">
                  ⚠ 알람 {f.alarms}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
