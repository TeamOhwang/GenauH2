export default function StatBar(props: {
  total: number;
  nationAvg?: number;
  selectedAvg?: number;
}) {
  const { total, nationAvg, selectedAvg } = props;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
      <div className="p-2 rounded bg-gray-50 border">
        <div className="text-gray-500">총 지점</div>
        <div className="text-lg font-semibold">{total.toLocaleString()} 곳</div>
      </div>
      <div className="p-2 rounded bg-gray-50 border">
        <div className="text-gray-500">전국 평균</div>
        <div className="text-lg font-semibold">
          {nationAvg != null ? `${nationAvg.toLocaleString()} 원` : "-"}
        </div>
      </div>
      <div className="p-2 rounded bg-gray-50 border">
        <div className="text-gray-500">선택 지역 평균</div>
        <div className="text-lg font-semibold">
          {selectedAvg != null ? `${selectedAvg.toLocaleString()} 원` : "-"}
        </div>
      </div>
    </div>
  );
}