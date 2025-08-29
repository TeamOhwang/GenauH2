import { useState } from "react";

type Props = {
  interval: string;
  onIntervalChange: (v: "15min" | "1h" | "1d") => void;
  onRangeChange: (start: string, end: string) => void;
};

export default function TopControlBar({ interval, onIntervalChange, onRangeChange }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleSearch = () => {
    const startDate = start ? `${start}T00:00:00` : "";
    const endDate = end ? `${end}T23:59:59` : "";
    onRangeChange(startDate, endDate);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center bg-slate-800 p-3 rounded-xl">
      {["15min", "1h", "1d"].map((v) => (
        <button
          key={v}
          onClick={() => onIntervalChange(v as any)}
          className={`px-3 py-1 rounded ${interval === v ? "bg-blue-600" : "bg-slate-700"}`}
        >
          {v}
        </button>
      ))}

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
        onClick={handleSearch}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        조회
      </button>
    </div>
  );
}
