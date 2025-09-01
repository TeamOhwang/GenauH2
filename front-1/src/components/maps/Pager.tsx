type Props = {
  page: number;                
  totalPages: number;
  total?: number;
  onChange: (next: number) => void;
};

export default function Pager({ page, totalPages, total, onChange }: Props) {
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center gap-2 text-sm text-black dark:text-white">
      {/* 이전 버튼 */}
      <button
        className="px-2 py-1 border rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={page <= 1}
        onClick={() => onChange(prev)}
      >
        이전
      </button>

      {/* 페이지 정보 */}
      <span>
        {page} / {totalPages}
        {total != null && ` · ${total.toLocaleString()}건`}
      </span>

      {/* 다음 버튼 */}
      <button
        className="px-2 py-1 border rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={page >= totalPages}
        onClick={() => onChange(next)}
      >
        다음
      </button>
    </div>
  );
}
