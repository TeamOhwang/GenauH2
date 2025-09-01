import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import type { FacilityKpi } from "@/api/facilityApi";
import ExportExcelButton from "@/components/Kpi/ExportExcelButton";
import { motion } from "framer-motion";
import CountUp from "react-countup";

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
    {
      header: "최대예상(kg)",
      accessorKey: "predictedMaxKg",
      cell: (info) => <CountUp end={info.getValue<number>() ?? 0} decimals={1} duration={0.6} />,
    },
    {
      header: "실제생산(kg)",
      accessorKey: "productionKg",
      cell: (info) => <CountUp end={info.getValue<number>() ?? 0} decimals={1} duration={0.6} />,
    },
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="text-sm h-full flex flex-col bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
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
            {table.getRowModel().rows.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className="hover:bg-slate-700/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 border border-slate-800 text-center font-mono tabular-nums"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
