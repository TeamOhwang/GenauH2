import * as XLSX from "xlsx";

export function exportFacilitiesToExcel(data: any[], fileName = "facilities.xlsx") {
  // 공통 엑셀 데이터 포맷
  const exportData = data.map((item) => ({
    시간: new Date(item.ts).toLocaleString("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
}),
    설비명: item.facilityName,
    "최대예상(kg)": Number(item.predictedMaxKg ?? 0).toFixed(2),
    "실제생산(kg)": Number(item.productionKg ?? 0).toFixed(2),
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Facilities");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return buf;
}
