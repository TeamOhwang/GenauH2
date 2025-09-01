export default function StatBar(props: {
  total: number;
  nationAvg?: number;
  selectedAvg?: number;
}) {
  const { total, nationAvg, selectedAvg } = props;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
      <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="text-gray-500 dark:text-gray-400">총 지점</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{total.toLocaleString()} 곳</div>
      </div>
      <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="text-gray-500 dark:text-gray-400">전국 평균</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {nationAvg != null ? `${nationAvg.toLocaleString()} 원` : "-"}
        </div>
      </div>
      <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="text-gray-500 dark:text-gray-400">선택 지역 평균</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {selectedAvg != null ? `${selectedAvg.toLocaleString()} 원` : "-"}
        </div>
      </div>
    </div>
  );
}