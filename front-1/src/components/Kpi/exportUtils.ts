import * as XLSX from "xlsx";

// 기존 함수
export function exportFacilitiesToExcel(data: any[], fileName = "facilities.xlsx") {
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

  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}

//  시간별 데이터용 함수
export function exportHourlyToExcel(data: any[], fileName = "hourly.xlsx") {
  const exportData = data.map((item) => ({
    시간: item.time,
    "생산량(kg)": Number(item.amount ?? 0).toFixed(2),
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hourly");

  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}
