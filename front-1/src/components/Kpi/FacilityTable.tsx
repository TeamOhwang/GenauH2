import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import type { FacilityKpi } from "@/api/facilityApi";
import { saveAs } from "file-saver";
import { FacilityApi } from "@/api/facilityApi";
import { exportFacilitiesToExcel } from "@/components/Kpi/exportUtils";

type Props = {
  data?: FacilityKpi[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  start?: string;
  end?: string;
  orgId?: number;
};

export default function FacilityTable({
  data = [],
  page,
  setPage,
  totalPages,
  start,
  end,
  orgId = 1,
}: Props) {
  const columns: ColumnDef<FacilityKpi>[] = [
    {
      header: "시간",
      accessorKey: "ts",
      cell: (info) => {
        const value = info.getValue<string>();
        return value
          ? new Date(value).toLocaleString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "-";
      },
    },
    { header: "설비명", accessorKey: "facilityName" },
    {
      header: "최대예상(kg)",
      accessorKey: "predictedMaxKg",
      cell: (info) => (info.getValue<number>() ?? 0).toFixed(2),
    },
    {
      header: "실제생산(kg)",
      accessorKey: "productionKg",
      cell: (info) => (info.getValue<number>() ?? 0).toFixed(2),
    },
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  const exportExcel = async () => {
    try {
      const res = await FacilityApi.listByOrg({
        orgId,
        start,
        end,
        page: 0,
        size: 5000,
      });
      const buf = exportFacilitiesToExcel(res.content);
      const fileName = start ? `facilities_${start.slice(0, 10)}.xlsx` : "facilities.xlsx";
      saveAs(new Blob([buf]), fileName);
    } catch (err) {
      console.error("엑셀 다운로드 실패:", err);
    }
  };

  return (
    <div className="text-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">선택된 날짜 데이터</h3>
        <button
          onClick={exportExcel}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
        >
          엑셀 다운로드
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg border border-slate-700">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-800 text-white sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 border border-slate-700 text-center text-xs font-semibold uppercase"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-700/50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 border border-slate-800 text-center font-mono tabular-nums"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
