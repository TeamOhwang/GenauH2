export default function KpiCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: number | undefined;
  unit: string;
}) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow text-center">
      <div className="text-sm opacity-70">{title}</div>
      <div className="mt-1 text-3xl font-extrabold text-cyan-400">
        {Number(value ?? 0).toFixed(2)}
        <span className="ml-1 text-base font-medium opacity-60">{unit}</span>
      </div>
    </div>
  );
}
