import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = { data: { month: string; production: number }[] };

export default function MonthlyProductionChart({ data }: Props) {
  const maxProduction = Math.max(...data.map((d) => d.production), 0);
  const maxTick = Math.ceil(maxProduction / 5000) * 5000;

  const ticks = [];
  for (let i = 5000; i <= maxTick; i += 5000) ticks.push(i);

  return (
    <div
      className="
        w-full h-56 p-4 rounded-lg shadow
        bg-white text-black
        dark:bg-slate-800 dark:text-white
      "
    >
      <h3 className="font-bold mb-2">월별 누적 생산량</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} barCategoryGap="15%" barSize={25}>
          <XAxis dataKey="month" stroke="currentColor" />
          <YAxis
            stroke="currentColor"
            domain={[0, maxTick]}
            ticks={ticks}
            tickFormatter={(value) => `${value / 1000}t`}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload, label }) =>
              active && payload && payload.length ? (
                <div
                  className="
                    p-2 rounded shadow text-sm
                    bg-white text-black
                    dark:bg-slate-900 dark:text-white
                  "
                >
                  <p>{label} 📅</p>
                  <p>총 생산량: {(payload[0].value / 1000).toFixed(1)} t</p>
                  <p>({payload[0].value.toLocaleString()} kg)</p>
                </div>
              ) : null
            }
          />
          <Bar
            dataKey="production"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
            activeBar={{
              style: {
                transform: "scale(1.1)",
                transformOrigin: "center bottom",
                fill: "#f87171",
              },
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
