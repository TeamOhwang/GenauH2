import { DailyData } from "@/hooks/threeDModel";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = { data: DailyData[] };

export default function DailyChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow h-80">
      <h3 className="font-semibold mb-2">일별 생산량</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="production" stroke="#3b82f6" strokeWidth={2} dot />
          <CartesianGrid stroke="#e2e8f0" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
