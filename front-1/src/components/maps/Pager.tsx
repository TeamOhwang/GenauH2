type Props = {
  page: number;                // 1-base
  totalPages: number;
  total?: number;
  onChange: (next: number) => void;
};

export default function Pager({ page, totalPages, total, onChange }: Props) {
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        className="px-2 py-1 border rounded"
        disabled={page <= 1}
        onClick={() => onChange(prev)}
      >
        이전
      </button>
      <span>
        {page} / {totalPages}
        {total != null && ` · ${total.toLocaleString()}건`}
      </span>
      <button
        className="px-2 py-1 border rounded"
        disabled={page >= totalPages}
        onClick={() => onChange(next)}
      >
        다음
      </button>
    </div>
  );
}
