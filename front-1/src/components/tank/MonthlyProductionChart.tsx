import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = { data: { month: string; production: number }[] };

export default function MonthlyProductionChart({ data }: Props) {
  // 최대 생산량 찾기
  const maxProduction = Math.max(...data.map((d) => d.production), 0);

  // 1000 단위 tick 배열 생성
  const maxTick = Math.ceil(maxProduction / 1000) * 1000;
  const ticks = [];
  for (let i = 1000; i <= maxTick; i += 1000) {
    ticks.push(i);
  }

  return (
    <div className="w-full h-56 bg-slate-800 p-4 rounded-lg shadow">
      <h3 className="text-white font-bold mb-2">월별 누적 생산량</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart 
          data={data} 
          barCategoryGap="15%" 
          barSize={25}
        >
          <XAxis dataKey="month" stroke="#ccc" />
          <YAxis
            stroke="#ccc"
            domain={[0, maxTick]} 
            ticks={ticks}         
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 text-white p-2 rounded shadow text-sm">
                    <p>{label} 📅</p>
                    <p>총 생산량: {payload[0].value.toLocaleString()} kg</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="production" 
            fill="#38bdf8" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
