import { saveAs } from "file-saver";
import type { FacilityKpi } from "@/api/facilityApi";
import { exportFacilitiesToExcel } from "@/components/Kpi/exportUtils";

export default function ExportExcelButton({
  data,
  start,
  end,
}: {
  data: FacilityKpi[];
  start?: string;
  end?: string;
}) {
  const handleExport = () => {
    const buf = exportFacilitiesToExcel(data);
    const fileName =
      start && end
        ? `facilities_${start.slice(0, 10)}_${end.slice(0, 10)}.xlsx`
        : "facilities.xlsx";
    saveAs(new Blob([buf]), fileName);
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
