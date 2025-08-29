import { useState } from "react";

type Props = {
  onChange: (start: string, end: string) => void;
};

export default function DateRangeBar({ onChange }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleSearch = () => {
    const startDate = start ? `${start}T00:00:00` : "";
    const endDate = end ? `${end}T23:59:59` : "";
    onChange(startDate, endDate);
  };

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
        onClick={handleSearch}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        조회
      </button>
    </div>
  );
}
