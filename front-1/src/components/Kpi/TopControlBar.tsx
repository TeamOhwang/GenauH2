import { useState } from "react";

type Props = {
  interval: string;
  onIntervalChange: (v: "15min" | "1h" | "1d") => void;
  onRangeChange: (start: string, end: string) => void;
};

export default function TopControlBar({ interval, onIntervalChange, onRangeChange }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div className="flex flex-wrap gap-2 items-center bg-slate-800 p-3 rounded-xl">
      {/* 기간 단위 버튼 */}
      {["15min", "1h", "1d"].map((v) => (
        <button
          key={v}
          onClick={() => onIntervalChange(v as any)}
          className={`px-3 py-1 rounded ${interval === v ? "bg-blue-600" : "bg-slate-700"}`}
        >
          {v}
        </button>
      ))}

      {/* 날짜 입력 */}
      <input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="text-black px-2 rounded"
      />
      <input
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="text-black px-2 rounded"
      />

      <button
        onClick={() => onRangeChange(start, end)}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        조회
      </button>
    </div>
  );
}
