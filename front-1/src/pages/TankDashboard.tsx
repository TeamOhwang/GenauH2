// src/pages/TankDashboard.tsx
import { useAuthStore } from "@/stores/useAuthStore";
import { useTankDashboard } from "@/hooks/useTankDashboard";
import { useCycleStore } from "@/stores/useCycleStore";
import HydrogenTank from "@/components/tank/HydrogenTank";
import TankStats, { Facility, FacilityStatus } from "@/components/tank/TankStats";
import MonthlyProductionChart from "@/components/tank/MonthlyProductionChart";
import { motion, Variants } from "framer-motion";

const getStatus = (kg: number): FacilityStatus => (kg > 0 ? "가동" : "비가동");

// 🔹 variants 정의
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2, // 자식이 순차적으로 등장
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function TankDashboard() {
  const orgId = useAuthStore((s) => s.orgId);
  const { decreaseCycle } = useCycleStore();
  const { data, monthlyData, cycles, level, loading, error } =
    useTankDashboard(orgId);

  if (loading) return <div>⏳ 로딩중...</div>;
  if (error) return <div>❌ {error}</div>;

  const facilities: Facility[] = data.map((f) => ({
    id: f.facId,
    name: f.facilityName,
    status: getStatus(f.productionKg),
    alarms: f.predictedMaxKg < f.productionKg ? 1 : 0,
    productionKg: f.productionKg,
  }));

  return (
    <motion.div
      className="p-10 min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 제목 */}
      <motion.h1
        className="text-5xl font-extrabold mb-10 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent"
        variants={itemVariants}
      >
        GenauH2
      </motion.h1>

      {/* 메인 그리드 */}
      <motion.div className="grid grid-cols-2 gap-10" variants={containerVariants}>
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
