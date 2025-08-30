// src/components/model/HourlyTable.tsx
import { HourlyData } from "@/hooks/threeDModel";

type Props = {
  data: HourlyData[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  start?: string;   
  end?: string;     
};

export default function HourlyTable({ data, page, totalPages, onPageChange,start,end }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">시간별 생산량</h3>
        {start && end && (
          <span className="text-sm text-gray-500">
            {start} ~ {end}
          </span>
        )}
      </div>
      
      {/* 데이터 테이블 */}
      <table className="w-full border-collapse text-sm flex-1">
        <thead>
          <tr className="border-b bg-slate-100">
            <th className="text-left p-2">시간</th>
            <th className="text-right p-2">생산량 (kg)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} className="border-b hover:bg-blue-50 transition-colors">
              <td className="p-2">{d.time}</td>
              <td className="p-2 text-right">{d.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}

     <div className="flex justify-center gap-2 mt-2">
        <button onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0}>이전</button>
        <button onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}>다음</button>
        </div>
    </div>
  );
}
