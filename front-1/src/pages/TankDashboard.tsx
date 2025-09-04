import { useAuthStore } from "@/stores/useAuthStore";
import { useTankDashboard } from "@/hooks/useTankDashboard";
import { useCycleStore } from "@/stores/useCycleStore";
import HydrogenTank from "@/components/tank/HydrogenTank";
import TankStats, { Facility, FacilityStatus } from "@/components/tank/TankStats";
import MonthlyProductionChart from "@/components/tank/MonthlyProductionChart";
import { motion, Variants } from "framer-motion";

// 가동/비가동 상태 계산
const getStatus = (kg: number): FacilityStatus => (kg > 0 ? "가동" : "비가동");

// 애니메이션 Variants
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

  if (loading) return <div className="text-black dark:text-white">⏳ 로딩중...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">❌ {error}</div>;

  // 🔹 설비 리스트 데이터 변환
  const facilities: Facility[] = data.map((f) => ({
    id: f.facId,
    name: f.facilityName,
    status: getStatus(f.productionKg),
    alarms: f.predictedMaxKg < f.productionKg ? 1 : 0,
    productionKg: f.productionKg,
  }));

  return (
    <motion.div
      // 라이트: 흰 배경 + 검정 글자 / 다크: 현재 그라데이션
      className="p-4 sm:p-6 lg:p-10 min-h-screen 
                 bg-white text-black 
                 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:text-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 타이틀 */}
      <motion.h1
        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-6 sm:mb-8 lg:mb-12 text-center
                   bg-gradient-to-r from-cyan-500 to-blue-600 
                   bg-clip-text text-transparent drop-shadow-lg"
        variants={itemVariants}
      >
        GenauH₂ Dashboard
      </motion.h1>

      {/* 메인 그리드 */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-10"
        variants={containerVariants}
      >
        {/* 왼쪽 영역 */}
        <motion.div className="flex flex-col gap-4 sm:gap-6" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <HydrogenTank
              level={level}
              cycles={cycles}
              onDecrease={decreaseCycle}
            />
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
