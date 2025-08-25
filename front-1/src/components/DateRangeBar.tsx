interface Props {
  start: string;                          // 시작 날짜
  end: string;                            // 종료 날짜
  onChange: (start: string, end: string) => void;  // 날짜 변경 핸들러
}

export default function DateRangeBar({ start, end, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <input
        type="date"
        value={start}
        onChange={(e) => onChange(e.target.value, end)}
      />
      <span>~</span>
      <input
        type="date"
        value={end}
        onChange={(e) => onChange(start, e.target.value)}
      />
    </div>
  );
}
