import { saveAs } from "file-saver";
import type { FacilityKpi } from "@/api/facilityApi";
import { exportFacilitiesToExcel } from "@/components/Kpi/exportUtils";

export default function ExportExcelButton({ data }: { data: FacilityKpi[] }) {
  const handleExport = () => {
    const buf = exportFacilitiesToExcel(data);
    saveAs(new Blob([buf]), "facilities.xlsx");
  };

  return (
    <button
      onClick={handleExport}
      className="px-3 py-1 rounded bg-green-600 text-white"
    >
      엑셀 다운로드
    </button>
  );
}
