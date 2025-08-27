////

import { useAdmin } from '@/hooks/useAdmin';
import { useState, useEffect } from 'react'

type UpdateFacilityProps = { 
    facility: any; // 기존 시설 정보
    onSuccess?: () => void;
    onClose?: () => void;
};

const UpdateFaForm = ({ facility, onSuccess, onClose }: UpdateFacilityProps) => {
    const [form, setForm] = useState({
        facilityId: "",
        name: "",
        location: "",
        modelNo: "",
        cellCount: "",
        ratedPowerKw: "",
        ratedOutputKgH: "",
        secNominalKwhPerKg: "",
        catalystInstallDate: "",
        catalystLifeHours: "",
    });

    const { updateFacilityAction, loading, error } = useAdmin();

    // 기존 시설 정보로 폼 초기화
    useEffect(() => {
        if (facility) {
            setForm({
                facilityId: facility.facilityId || "",
                name: facility.name || "",
                location: facility.location || "",
                modelNo: facility.modelNo || "",
                cellCount: facility.cellCount || "",
                ratedPowerKw: facility.ratedPowerKw || "",
                ratedOutputKgH: facility.ratedOutputKgH || "",
                secNominalKwhPerKg: facility.secNominalKwhPerKg || "",
                catalystInstallDate: facility.catalystInstallDate || "",
                catalystLifeHours: facility.catalystLifeHours || "",
            });
        }
    }, [facility]);

    // 날짜 형식을 백엔드가 기대하는 형식으로 변환
    const formatDateForBackend = (dateString: string): string => {
        if (!dateString) return '';
        
        // 'YYYYMMDD' 형식을 'YYYY-MM-DD' 형식으로 변환
        if (/^\d{8}$/.test(dateString)) {
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            return `${year}-${month}-${day}`;
        }
        
        return dateString;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('=== 시설 수정 시작 ===');
        console.log('수정할 데이터:', form);
        
        // 필수 필드 검증
        const requiredFields = ['name', 'location', 'modelNo', 'cellCount', 'ratedPowerKw', 'ratedOutputKgH'];
        const missingFields = requiredFields.filter(field => !form[field as keyof typeof form]);
        
        if (missingFields.length > 0) {
            alert(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
            return;
        }
        
        try {
            // 날짜 형식 변환
            const formattedForm = {
                ...form,
                catalystInstallDate: formatDateForBackend(form.catalystInstallDate)
            };
            
            console.log('변환된 form 데이터:', formattedForm);
            
            const result = await updateFacilityAction(formattedForm);
            
            if (result) {
                console.log('시설 수정 성공!');
                alert("시설 수정 성공");
                onSuccess?.();
                onClose?.();
            } else {
                console.error('시설 수정 실패');
                alert(error ?? "시설 수정 실패");
            }
        } catch (err) {
            console.error('시설 수정 중 예외 발생:', err);
            alert(`시설 수정 중 오류 발생: ${err instanceof Error ? err.message : err}`);
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">시설 정보 수정</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="시설명"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    name="location"
                    placeholder="시설 위치"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    name="modelNo"
                    placeholder="모델번호"
                    value={form.modelNo}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    name="cellCount"
                    placeholder="셀 개수"
                    value={form.cellCount}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    name="ratedPowerKw"
                    placeholder="정격 전력(kW)"
                    value={form.ratedPowerKw}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    name="ratedOutputKgH"
                    placeholder="정격 출력(kg/h)"
                    value={form.ratedOutputKgH}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    name="secNominalKwhPerKg"
                    placeholder="기준 SEC(kWh/kg)"
                    value={form.secNominalKwhPerKg}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <div>
                    <input
                        type="text"
                        name="catalystInstallDate"
                        placeholder="촉매 설치일 (예: 20151005 또는 2015-10-05)"
                        value={form.catalystInstallDate}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">YYYYMMDD 또는 YYYY-MM-DD 형식으로 입력하세요</p>
                </div>
                <input
                    type="text"
                    name="catalystLifeHours"
                    placeholder="촉매 수명"
                    value={form.catalystLifeHours}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <div className="flex gap-3 pt-4">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {loading ? "수정중..." : "수정"}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateFaForm;