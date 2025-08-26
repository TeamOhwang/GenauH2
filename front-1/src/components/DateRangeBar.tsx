interface Props {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}

export default function DateRangeBar({ start, end, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <input type="date" value={start} onChange={(e) => onChange(e.target.value, end)} />
      <span>~</span>
      <input type="date" value={end} onChange={(e) => onChange(start, e.target.value)} />
    </div>
  );
}
