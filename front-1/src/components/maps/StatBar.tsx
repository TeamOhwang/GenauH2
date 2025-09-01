export default function StatBar(props: {
  total: number;
  nationAvg?: number;
  selectedAvg?: number;
}) {
  const { total, nationAvg, selectedAvg } = props;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
      {/* 총 지점 */}
      <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="text-black dark:text-white">총 지점</div>
        <div className="text-lg font-semibold text-black dark:text-white">
          {total.toLocaleString()} 곳
        </div>
      </div>

      {/* 전국 평균 */}
      <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="text-black dark:text-white">전국 평균</div>
        <div className="text-lg font-semibold text-black dark:text-white">
          {nationAvg != null ? `${nationAvg.toLocaleString()} 원` : "-"}
        </div>
      </div>

      {/* 선택 지역 평균 */}
      <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="text-black dark:text-white">선택 지역 평균</div>
        <div className="text-lg font-semibold text-black dark:text-white">
          {selectedAvg != null ? `${selectedAvg.toLocaleString()} 원` : "-"}
        </div>
      </div>
    </div>
  );
}
