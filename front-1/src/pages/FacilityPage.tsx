// src/pages/FacilityDashboard.tsx
import { useMemo, useState } from "react";
import { useFacilitiesByOrg } from "@/hooks/useFacilitiesByOrg";
import { useAuthStore } from "@/stores/useAuthStore";

import TopControlBar from "@/components/Kpi/TopControlBar";
import KpiCard from "@/components/Kpi/KpiCard";
import FacilityLineChart from "@/components/Kpi/FacilityLineChart";
import FacilityTable from "@/components/Kpi/FacilityTable";
import { motion } from "framer-motion";

export default function FacilityDashboard() {
  const orgId = useAuthStore((s) => s.orgId);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const { data, loading, error } = useFacilitiesByOrg(
    orgId ?? 0,
    start || undefined,
    end || undefined,
    0,
    500
  );

  // hover 상태
  const [hoverProd, setHoverProd] = useState<number | null>(null);
  const [hoverPred, setHoverPred] = useState<number | null>(null);

  // 선택된 날짜 기준으로 시간별 합산 데이터 생성
  const mappedData = useMemo(() => {
    if (!selectedDay) return [];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return hours.map((h) => {
      const hourData = data.filter((d) => {
        if (!d.ts) return false;

        const dDate = new Date(d.ts);
        if (isNaN(dDate.getTime())) return false;

        const localDate = `${dDate.getFullYear()}-${String(
          dDate.getMonth() + 1
        ).padStart(2, "0")}-${String(dDate.getDate()).padStart(2, "0")}`;

        return localDate === selectedDay && dDate.getHours() === h;
      });

      const productionSum = hourData.reduce(
        (sum, d) => sum + (d.productionKg ?? 0),
        0
      );
      const predictedSum =
        hourData.reduce((sum, d) => sum + (d.predictedMaxKg ?? 0), 0) / 3;

      return {
        ts: `${selectedDay}T${String(h).padStart(2, "0")}:00:00`,
        productionKg: productionSum,
        predictedMaxKg: predictedSum,
        orgId: orgId ?? 0,
        facId: 0,
        facilityName: "모든 설비 합산",
      };
    });
  }, [data, selectedDay, orgId]);

  if (!orgId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 dark:text-red-400 text-lg">
        ⚠ 조직 정보 없음 (로그인 다시 확인 필요)
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex bg-white dark:bg-slate-900 text-black dark:text-white min-h-screen"
    >
      {/* 왼쪽: KPI + 차트 */}
      <div className="flex flex-col w-2/3 p-6 space-y-6">
        <TopControlBar
          onDateSelect={(s, e, day) => {
            setStart(s);
            setEnd(e);
            setSelectedDay(day);
            setHoverProd(null);
            setHoverPred(null);
          }}
        />

        {loading && (
          <div className="text-gray-600 dark:text-gray-400 text-center mt-10 animate-pulse">
            📡 데이터 불러오는 중...
          </div>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-center mt-10">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && !selectedDay && (
          <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-400 text-lg">
            📅 날짜를 선택해주세요.
          </div>
        )}

        {!loading && !error && selectedDay && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <KpiCard
                title={`${selectedDay} 시간별 예측량`}
                value={hoverPred ?? 0} // hover 없으면 0
                unit="kg"
              />
              <KpiCard
                title={`${selectedDay} 시간별 생산량`}
                value={hoverProd ?? 0} // hover 없으면 0
                unit="kg"
              />
            </div>

            <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl flex-1 min-h-[500px]">
              <FacilityLineChart
                data={mappedData}
                onHover={(prod, pred) => {
                  // 마우스 차트 밖으로 나가면 0으로 리셋
                  if (prod === 0 && pred === 0) {
                    setHoverProd(0);
                    setHoverPred(0);
                  } else {
                    setHoverProd(prod);
                    setHoverPred(pred);
                  }
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* 오른쪽: 테이블 */}
      <div className="w-1/3 bg-gray-50 dark:bg-slate-900 p-4 flex flex-col">
        <div className="flex-1">
          <FacilityTable data={mappedData} start={start} end={end} />
        </div>
      </div>
    </motion.div>
  );
}
