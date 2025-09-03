import { useState } from "react";

type Props = {
  onDateSelect: (start: string, end: string, dayLabel: string) => void;
};

export default function TopControlBar({ onDateSelect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  // 이번 달의 일 수
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  // 이번 달의 날짜 배열
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
    return d.toISOString().slice(0, 10);
  });

  // 날짜 선택
  const handleDateSelect = (date: string, idx?: number) => {
    setCustomDate(date);

    if (idx !== undefined) {
      setSelected(idx);
    } else {
      const picked = new Date(date);
      setCurrentMonth(new Date(picked.getFullYear(), picked.getMonth(), 1));

      const idxInMonth = days.findIndex((d) => d === date);
      if (idxInMonth !== -1) setSelected(idxInMonth);
    }

    onDateSelect(`${date}T00:00:00`, `${date}T23:59:59`, date);
  };

  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow">
      {/* 날짜 버튼 */}
      <div className="flex overflow-x-auto gap-2">
        {days.map((day, idx) => {
          const disabled = day > today; // 오늘 이후 날짜면 비활성화
          return (
            <button
              key={day}
              onClick={() => !disabled && handleDateSelect(day, idx)}
              disabled={disabled}
              className={`px-3 py-1 rounded whitespace-nowrap transition-colors
                ${
                  selected === idx
                    ? "bg-blue-600 text-white"
                    : disabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white dark:bg-slate-700"
                }`}
            >
              {day.slice(5)} {/* MM-DD */}
            </button>
          );
        })}
      </div>

      {/* 날짜 input */}
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={customDate}
          max={today} // 오늘까지만 선택 가능
          onChange={(e) => handleDateSelect(e.target.value)}
          className="text-black px-2 py-1 rounded"
        />
        <span className="text-black dark:text-gray-400 text-sm">← 직접 날짜 선택</span>
      </div>
    </div>
  );
}
