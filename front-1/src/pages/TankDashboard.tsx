import { useAuthStore } from "@/stores/useAuthStore";
import { useTankDashboard } from "@/hooks/useTankDashboard";
import HydrogenTank from "@/components/tank/HydrogenTank";
import TankStats, { Facility, FacilityStatus } from "@/components/tank/TankStats";
import MonthlyProductionChart from "@/components/tank/MonthlyProductionChart";
import { motion } from "framer-motion";

const getStatus = (kg: number): FacilityStatus => {
  return kg > 0 ? "가동" : "비가동";
};

export default function TankDashboard() {
  const orgId = useAuthStore((s) => s.orgId);
  const { data, totalProduction, monthlyData, loading, error } = useTankDashboard(orgId);

  if (loading) return <div className="text-black dark:text-white">⏳ 로딩중...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">❌ {error}</div>;

  const facilities: Facility[] = data.map((f) => ({
    id: f.facId,
    name: f.facilityName,
    status: getStatus(f.productionKg),
    alarms: f.predictedMaxKg < f.productionKg ? 1 : 0,
    productionKg: f.productionKg,
  }));

  return (
    <div className="p-10 bg-white dark:bg-slate-900 min-h-screen text-black dark:text-white transition-colors duration-300">
      {/* 상단 타이틀 */}
      <motion.h1
        className="text-5xl font-extrabold mb-10 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent tracking-wide"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        GenauH2
      </motion.h1>

      {/* 메인 레이아웃 */}
      <div className="grid grid-cols-2 gap-10">
        {/* 왼쪽: 수소탱크 + 월별 그래프 */}
        <div className="flex flex-col gap-6">
          {/* 수소탱크 카드 */}
          <motion.div
            className="bg-gray-100 dark:bg-slate-800/40 rounded-2xl p-6 shadow-lg backdrop-blur-md flex justify-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HydrogenTank totalProduction={totalProduction} />
          </motion.div>

          {/* 월별 그래프 카드 */}
          <motion.div
            className="bg-gray-100 dark:bg-slate-800/40 rounded-2xl p-6 shadow-lg backdrop-blur-md"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <MonthlyProductionChart data={monthlyData} />
          </motion.div>
        </div>

        {/* 오른쪽: 설비별 누적량 카드 */}
        <motion.div
          className="bg-gray-100 dark:bg-slate-800/40 rounded-2xl p-6 shadow-lg backdrop-blur-md"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <TankStats facilities={facilities} />
        </motion.div>
      </div>
    </div>
  );
}
