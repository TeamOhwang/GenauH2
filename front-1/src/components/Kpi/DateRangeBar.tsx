import { useState } from "react";

type Props = {
  onChange: (start: string, end: string) => void;
};

export default function DateRangeBar({ onChange }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div className="flex gap-2 items-center">
      <input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="border rounded px-2 text-black"
      />
      <input
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="border rounded px-2 text-black"
      />
      <button
        onClick={() => onChange(start, end)}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        조회
      </button>
    </div>
  );
}
