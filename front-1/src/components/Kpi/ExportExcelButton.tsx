import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { FacilityKpi } from "@/api/facilityApi";

export default function ExportExcelButton({ data }: { data: FacilityKpi[] }) {
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facilities");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "facilities.xlsx");
  };

  return (
    <button onClick={handleExport} className="px-3 py-1 rounded bg-green-600 text-white">
      엑셀 다운로드
    </button>
  );
}
