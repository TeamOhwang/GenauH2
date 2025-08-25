import ChartComponent, { type ChartData as UiChartData } from "@/components/ui/ChartComponent";
import type { FacilityKpi } from "@/domain/graph/facility";

export default function HydrogenDonut({ kpi }: { kpi: FacilityKpi }) {
  const data: UiChartData = {
    labels: ["생산량", "예측 잔여량"],
    datasets: [
      {
        data: [kpi.productionKg, Math.max(0, kpi.maxPredictedKg - kpi.productionKg)],
      },
    ],
  };

  const options = { responsive: true, cutout: "60%" };

  return (
    <div style={{ width: 250, height: 250 }}>
      <h3>{kpi.facilityName}</h3>
      <ChartComponent data={data} options={options} chartType="doughnut" />
    </div>
  );
}
