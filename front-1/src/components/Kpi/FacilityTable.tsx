import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import type { FacilityKpi } from "@/api/facilityApi";
import ExportExcelButton from "@/components/Kpi/ExportExcelButton";

type Props = {
  data?: FacilityKpi[];
  start?: string;
  end?: string;
};

export default function FacilityTable({ data = [], start, end }: Props) {
  const columns: ColumnDef<FacilityKpi>[] = [
    {
      header: "시간",
      accessorKey: "ts",
      cell: (info) => {
        const value = info.getValue<string>();
        return value ? new Date(value).getHours() + "시" : "-";
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

  return (
    <div className="text-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">선택된 날짜 데이터</h3>
        <ExportExcelButton data={data} start={start} end={end} />
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
