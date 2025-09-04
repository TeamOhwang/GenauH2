// src/pages/TankDashboard.tsx
import { useAuthStore } from "@/stores/useAuthStore";
import { useTankDashboard } from "@/hooks/useTankDashboard";
import { useCycleStore } from "@/stores/useCycleStore";
import HydrogenTank from "@/components/tank/HydrogenTank";
import TankStats, { Facility, FacilityStatus } from "@/components/tank/TankStats";
import MonthlyProductionChart from "@/components/tank/MonthlyProductionChart";
import { motion, Variants } from "framer-motion";
import { Factory, AlertCircle } from "lucide-react";

const getStatus = (kg: number): FacilityStatus => (kg > 0 ? "가동" : "비가동");

// 🔹 애니메이션 Variants
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 },
  },
};

export default function TankDashboard() {
  const orgId = useAuthStore((s) => s.orgId);
  const { decreaseCycle } = useCycleStore();
  const { data, monthlyData, cycles, level, loading, error } =
    useTankDashboard(orgId);

  if (loading) return <div className="text-white">⏳ 로딩중...</div>;
  if (error) return <div className="text-red-400">❌ {error}</div>;

  const facilities: Facility[] = data.map((f) => ({
    id: f.facId,
    name: f.facilityName,
    status: getStatus(f.productionKg),
    alarms: f.predictedMaxKg < f.productionKg ? 1 : 0,
    productionKg: f.productionKg,
  }));

  return (
    <motion.div
      className="p-10 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 타이틀 */}
      <motion.h1
        className="text-6xl font-extrabold mb-12 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg"
        variants={itemVariants}
      >
        GenauH₂ Dashboard
      </motion.h1>

      {/* 메인 그리드 */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
        variants={containerVariants}
      >
        {/* 왼쪽 영역 */}
        <motion.div className="flex flex-col gap-6" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <HydrogenTank level={level} cycles={cycles} onDecrease={decreaseCycle} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <MonthlyProductionChart data={monthlyData} />
          </motion.div>
        </motion.div>

        {/* 오른쪽 영역 */}
        <motion.div variants={itemVariants}>
          <TankStats facilities={facilities} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
