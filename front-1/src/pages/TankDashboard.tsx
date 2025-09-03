// src/pages/TankDashboard.tsx
import { useAuthStore } from "@/stores/useAuthStore";
import { useTankDashboard } from "@/hooks/useTankDashboard";
import { useCycleStore } from "@/stores/useCycleStore";
import HydrogenTank from "@/components/tank/HydrogenTank";
import TankStats, { Facility, FacilityStatus } from "@/components/tank/TankStats";
import MonthlyProductionChart from "@/components/tank/MonthlyProductionChart";
import { motion } from "framer-motion";

const getStatus = (kg: number): FacilityStatus => (kg > 0 ? "가동" : "비가동");

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
    <div className="p-10 min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white">
      <motion.h1 className="text-5xl font-extrabold mb-10 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
        GenauH2
      </motion.h1>

      <div className="grid grid-cols-2 gap-10">
        <div className="flex flex-col gap-6">
          <HydrogenTank level={level} cycles={cycles} onDecrease={decreaseCycle} />
          <MonthlyProductionChart data={monthlyData} />
        </div>
        <TankStats facilities={facilities} />
      </div>
    </div>
  );
}
