import { memo } from "react";

type Props = {
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onApply: () => void;
};

const DAY = 86_400_000;
const toLocalDateStr = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export default memo(function DateRangeBar({ start, end, onStart, onEnd, onApply }: Props) {
  const quick = (days: number) => {
    const now = new Date();
    const s = new Date(now.getTime() - (days - 1) * DAY);
    onStart(toLocalDateStr(s));
    onEnd(toLocalDateStr(now));
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
      <div>
        <label className="text-sm text-gray-600 mb-1 block">시작일</label>
        <input type="date" value={start} onChange={e => onStart(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">종료일</label>
        <input type="date" value={end} onChange={e => onEnd(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => quick(1)} className="rounded-xl border px-3 py-2 hover:bg-gray-50">오늘</button>
        <button onClick={() => quick(7)} className="rounded-xl border px-3 py-2 hover:bg-gray-50">7일</button>
        <button onClick={() => quick(30)} className="rounded-xl border px-3 py-2 hover:bg-gray-50">30일</button>
        <button onClick={onApply} className="rounded-xl border px-4 py-2 hover:bg-gray-50">조회</button>
      </div>
    </section>
  );
});
