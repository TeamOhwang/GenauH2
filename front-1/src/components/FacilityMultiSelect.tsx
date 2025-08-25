import type { Facility } from "@/domain/graph/facility";

type Props = {
  facilities: Facility[];
  selectedIds: string[];          // 빈 배열이면 '전체' 의미
  onChange: (ids: string[]) => void;
};

export default function FacilityMultiSelect({ facilities, selectedIds, onChange }: Props) {
  const allIds = facilities.map(f => String(f.facilityId));
  const isAll = selectedIds.length === 0; // 빈 배열이면 전체

  const toggleAll = () => {
    if (isAll) {
      onChange(allIds); // 전체 선택에서 해제 → 개별 선택 모드로 전환(전체 체크된 상태)
    } else {
      onChange([]);     // 다시 '전체' 의미로 빈 배열
    }
  };

  const toggleOne = (id: string) => {
    const on = selectedIds.includes(id);
    onChange(on ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };

  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isAll} onChange={toggleAll} />
          <span className="text-sm">전체 선택</span>
        </label>

        {!isAll && (
          <div className="flex items-center gap-3 flex-wrap">
            {facilities.map((f) => {
              const id = String(f.facilityId);
              return (
                <label key={id} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(id)}
                    onChange={() => toggleOne(id)}
                  />
                  <span className="text-sm">{f.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        체크가 없으면 <b>전체 설비</b> 기준으로 집계됩니다.
      </p>
    </section>
  );
}
