import type { Facility } from "@/domain/graph/facility";

interface Props {
  facilities: Facility[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export default function FacilityDropdown({ facilities, selected, onChange }: Props) {
  return (
    <select
      multiple
      value={selected.map(String)}
      onChange={(e) =>
        onChange(Array.from(e.target.selectedOptions).map((opt) => Number(opt.value)))
      }
    >
      {facilities.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  );
}
