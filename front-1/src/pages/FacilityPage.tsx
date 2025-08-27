import { useState, useMemo } from "react";
import { useFacilitiesByOrg } from "@/hooks/useFacilitiesByOrg";
import FacilityFilterBar from "@/components/FacilityFilterBar";
import FacilityTable from "@/components/FacilityTable";
import * as XLSX from "xlsx";

export default function FacilityPage() {
  const orgId = 1; // TODO: 로그인 후 orgId 연동 필요
  const { data, loading, error } = useFacilitiesByOrg(orgId);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 20;
  const maxPageButtons = 10;

  // 날짜 + 설비명 필터링
  const filteredItems = useMemo(() => {
    let result = data;

    if (startDate || endDate) {
      result = result.filter((f) => {
        const tsDate = new Date(f.ts);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && tsDate < start) return false;
        if (end && tsDate > end) return false;
        return true;
      });
    }

    if (selectedFacility) {
      result = result.filter((f) => f.facilityName === selectedFacility);
    }

    return result;
  }, [data, startDate, endDate, selectedFacility]);

  // 전체 페이지 수
  const totalPages = Math.ceil(filteredItems.length / pageSize);

  // 현재 페이지 데이터
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIdx, startIdx + pageSize);
  }, [filteredItems, currentPage]);

  // 체크박스 토글 핸들러
  const toggleSelect = (facId: number) => {
    setSelectedIds((prev) =>
      prev.includes(facId) ? prev.filter((id) => id !== facId) : [...prev, facId]
    );
  };

  // 엑셀 다운로드
  const handleExportExcel = () => {
    if (!filteredItems.length) {
      alert("엑셀로 내보낼 데이터가 없습니다.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredItems);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Facilities");
    XLSX.writeFile(workbook, "facilities.xlsx");
  };

  if (loading) return <p className="p-4">불러오는 중...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  const facilityNames = Array.from(new Set(data.map((f) => f.facilityName)));

  // 페이지네이션 버튼 그룹
  const currentGroup = Math.floor((currentPage - 1) / maxPageButtons);
  const startPage = currentGroup * maxPageButtons + 1;
  const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-lg sm:text-xl font-bold mb-4">설비 목록</h1>

      {/* 필터바 */}
      <FacilityFilterBar
        startDate={startDate}
        endDate={endDate}
        selectedFacility={selectedFacility}
        facilityNames={facilityNames}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onChangeFacility={setSelectedFacility}
        onExportExcel={handleExportExcel}
      />

      {/* 테이블 (반응형 스크롤) */}
      <div className="overflow-x-auto">
        <FacilityTable
          items={paginatedItems}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
      </div>

      {/* 페이지네이션 (반응형) */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-2 sm:px-3 py-1 border rounded disabled:opacity-50 text-sm sm:text-base"
        >
          이전
        </button>

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
          const page = startPage + i;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2 sm:px-3 py-1 border rounded text-sm sm:text-base ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-3 py-1 border rounded disabled:opacity-50 text-sm sm:text-base"
        >
          다음
        </button>
      </div>
    </div>
  );
}
