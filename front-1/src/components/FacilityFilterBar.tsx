type Props = {
  startDate: string;
  endDate: string;
  selectedFacility: string;
  facilityNames: string[];
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
  onChangeFacility: (value: string) => void;
  onExportExcel: () => void;
};

export default function FacilityFilterBar({
  startDate,
  endDate,
  selectedFacility,
  facilityNames,
  onChangeStartDate,
  onChangeEndDate,
  onChangeFacility,
  onExportExcel,
}: Props) {
  return (
    <div className="flex gap-2 mb-4">
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChangeStartDate(e.target.value)}
        className="border px-3 py-2 rounded"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChangeEndDate(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      <select
        value={selectedFacility}
        onChange={(e) => onChangeFacility(e.target.value)}
        className="border px-3 py-2 rounded"
      >
        <option value="">전체 설비</option>
        {facilityNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <button
        onClick={onExportExcel}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        엑셀다운로드
      </button>
    </div>
  );
}
