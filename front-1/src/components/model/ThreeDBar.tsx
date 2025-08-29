type Facility = { id: number; name: string };

type Props = {
  facilities: Facility[];
  onSelect: (id: number) => void;
};

export default function Sidebar({ facilities, onSelect }: Props) {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen p-4">
      <h2 className="font-bold text-lg mb-4">설비 목록</h2>
      <ul className="space-y-2">
        {facilities.map((f) => (
          <li
            key={f.id}
            className="cursor-pointer hover:bg-slate-700 p-2 rounded transition-colors"
            onClick={() => onSelect(f.id)}
          >
            {f.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
