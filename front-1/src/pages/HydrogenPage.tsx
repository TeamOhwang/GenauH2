

import { memo, useMemo, useState } from "react";
import type { GroupBy } from "@/lib/hydrogen"; 
import type { HydrogenAggRequestDTO } from "@/domain/graph/hydrogenDTO";
import { useHydrogenAgg } from "@/hooks/useHydrogenAgg";
import HydrogenLine, { type LineRow } from "@/components/HydrogenLine";
import HydrogenDonut, { type DonutRow } from "@/components/HydrogenDonut";

/* ---------------------- utils ---------------------- */
const DAY = 86_400_000;
const today = new Date();

const dateOnly = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);

//  안전한 last 헬퍼
function last<T>(arr: readonly T[]): T | undefined {
  return arr.length ? arr[arr.length - 1] : undefined;
}

/* ---------------------- page ----------------------- */
export default function HydrogenPage() {
  // 기본 필터: 최근 7일, daily
  const [startDate, setStart] = useState(dateOnly(addDays(today, -6)));
  const [endDate, setEnd] = useState(dateOnly(today));
  const [groupBy, setGroupBy] = useState<GroupBy>("daily");
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | "ALL">("ALL");
  const [facilityIds, setFacilityIds] = useState<readonly number[] | undefined>(undefined);

  const params: HydrogenAggRequestDTO = { startDate, endDate, groupBy, facilityIds };
  const { data, isLoading, error, refetch } = useHydrogenAgg(params);

  const facilities = data?.facilities ?? [];

  const facilityOptions = useMemo(
    () => facilities.map((f) => ({ id: f.facilityId, name: f.facilityName })),
    [facilities]
  );

  const lineRows: LineRow[] = useMemo(() => {
    if (!facilities.length) return [];
    const series =
      selectedFacilityId === "ALL"
        ? facilities[0]?.series ?? []
        : facilities.find((f) => f.facilityId === selectedFacilityId)?.series ?? [];
    return series.map((p) => ({
      time: dateOnly(p.bucketStart),
      productionKg: p.productionKg,
      predictedKg: p.predictedKg,
    }));
  }, [facilities, selectedFacilityId]);

  const donutRows: DonutRow[] = useMemo(
    () =>
      facilities.map((f) => {
        const lastPoint = last(f.series);
        return {
          name: f.facilityName,
          value: lastPoint?.achievementRate ?? 0,
        };
      }),
    [facilities]
  );

  return (
    <div className="p-6 space-y-6">
      <FilterBar
        startDate={startDate}
        endDate={endDate}
        groupBy={groupBy}
        onStart={setStart}
        onEnd={setEnd}
        onGroupBy={setGroupBy}
        onQuery={refetch}
        facilityIds={facilityIds}
        onToggleAll={() =>
          setFacilityIds((prev) => (prev ? undefined : facilities.map((f) => f.facilityId)))
        }
      />

      <FacilityChips
        options={facilityOptions}
        selected={selectedFacilityId}
        onSelect={setSelectedFacilityId}
      />

      {isLoading && <InfoBar text="불러오는 중…" />}
      {Boolean(error) && <InfoBar text="오류가 발생했어요. 콘솔을 확인해주세요." tone="error" />}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="시계열(생산 vs 예측)">
          <div className="h-72">
            <HydrogenLine rows={lineRows} />
          </div>
        </Card>

        <Card title="설비별 달성률(%)">
          <div className="h-72">
            <HydrogenDonut rows={donutRows} />
          </div>
        </Card>
      </section>

      <DebugPanel data={data} />
    </div>
  );
}

/* -------------------- UI bits -------------------- */

type FacilityOption = { id: number; name: string };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function InfoBar({ text, tone = "info" }: { text: string; tone?: "info" | "error" }) {
  const cls =
    tone === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  return <div className={`text-sm rounded-xl border px-3 py-2 ${cls}`}>{text}</div>;
}

type FilterBarProps = {
  startDate: string;
  endDate: string;
  groupBy: GroupBy;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onGroupBy: (v: GroupBy) => void;
  onQuery: () => void;
  facilityIds?: readonly number[];
  onToggleAll: () => void;
};

const FilterBar = memo(function FilterBar({
  startDate,
  endDate,
  groupBy,
  onStart,
  onEnd,
  onGroupBy,
  onQuery,
  facilityIds,
  onToggleAll,
}: FilterBarProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <Labeled label="Start Date">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStart(e.target.value)}
          className="w-full rounded-xl border px-3 py-2"
        />
      </Labeled>

      <Labeled label="End Date">
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEnd(e.target.value)}
          className="w-full rounded-xl border px-3 py-2"
        />
      </Labeled>

      <Labeled label="Group By">
        <select
          value={groupBy}
          onChange={(e) => onGroupBy(e.target.value as GroupBy)}
          className="w-full rounded-xl border px-3 py-2"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </Labeled>

      <div className="flex gap-2">
        <button onClick={onQuery} className="grow rounded-xl border px-3 py-2 hover:bg-gray-50">
          조회
        </button>
        <button onClick={onToggleAll} className="rounded-xl border px-3 py-2 hover:bg-gray-50">
          {facilityIds ? "전체 해제" : "전체 선택"}
        </button>
      </div>
    </section>
  );
});

const FacilityChips = memo(function FacilityChips({
  options,
  selected,
  onSelect,
}: {
  options: FacilityOption[];
  selected: number | "ALL";
  onSelect: (v: number | "ALL") => void;
}) {
  return (
    <section className="flex flex-wrap items-center gap-2">
      <Chip active={selected === "ALL"} onClick={() => onSelect("ALL")}>
        ALL (미리보기)
      </Chip>
      {options.map((o) => (
        <Chip key={o.id} active={selected === o.id} onClick={() => onSelect(o.id)}>
          {o.name}
        </Chip>
      ))}
    </section>
  );
});

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1 border transition ${
        active ? "bg-gray-900 text-white" : "hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}

function DebugPanel({
  data,
}: {
  data?: ReturnType<typeof useHydrogenAgg>["data"];
}) {
  if (!data) return null;
  return (
    <section className="rounded-2xl border p-4">
      <h3 className="font-medium mb-2">디버그</h3>
      <pre className="text-xs overflow-auto max-h-72">
        {JSON.stringify(
          {
            groupBy: data.groupBy,
            range: data.range,
            facilities: data.facilities.map((f) => ({
              id: f.facilityId,
              name: f.facilityName,
              points: f.series.length,
              lastPct: last(f.series)?.achievementRate ?? 0, // ← at(-1) 대체
            })),
          },
          null,
          2
        )}
      </pre>
    </section>
  );
}
