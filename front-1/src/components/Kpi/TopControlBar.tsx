import { useState } from "react";

type Props = {
  onDateSelect: (start: string, end: string, dayLabel: string) => void;
};

export default function TopControlBar({ onDateSelect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date()); // ✅ 현재 월 상태 관리

  // 이번 달의 실제 일 수 계산
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  // 1일부터 마지막 일까지 버튼 생성
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  // 날짜 선택 처리
  const handleDateSelect = (date: string, idx?: number) => {
    setCustomDate(date);

    if (idx !== undefined) {
      // 버튼 클릭 시
      setSelected(idx);
    } else {
      //  input 직접 선택 시 → currentMonth 갱신 & 해당 날짜 버튼 활성화
      const picked = new Date(date);
      setCurrentMonth(new Date(picked.getFullYear(), picked.getMonth(), 1));

      const idxInMonth = days.findIndex((d) => d === date);
      if (idxInMonth !== -1) setSelected(idxInMonth);
    }

    onDateSelect(`${date}T00:00:00`, `${date}T23:59:59`, date);
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-800 p-3 rounded-lg">
      {/* 날짜 버튼 (이번 달 1일부터 말일까지, 좌우 스크롤) */}
      <div className="flex overflow-x-auto gap-2">
        {days.map((day, idx) => (
          <button
            key={day}
            onClick={() => handleDateSelect(day, idx)}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              selected === idx ? "bg-blue-600 text-white" : "bg-slate-700"
            }`}
          >
            {day.slice(5)} {/* MM-DD */}
          </button>
        ))}
      </div>

      {/* 날짜 input 직접 선택 */}
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={customDate}
          onChange={(e) => handleDateSelect(e.target.value)}
          className="text-black px-2 py-1 rounded"
        />
        <span className="text-gray-400 text-sm">← 직접 날짜 선택</span>
      </div>
    </div>
  );
}
