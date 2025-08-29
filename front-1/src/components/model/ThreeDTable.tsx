import { HourlyData } from "@/hooks/threeDModel";

type Props = { data: HourlyData[] };

export default function HourlyTable({ data }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow h-full overflow-y-auto">
      <h3 className="font-semibold mb-2">시간별 생산량</h3>
      <table className="w-full border-collapse text-sm">
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
    </div>
  );
}
