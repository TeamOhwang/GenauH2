////

import { useAdmin } from '@/hooks/useAdmin';
import { useAuthStore } from '@/stores/useAuthStore';
import { useState, useEffect } from 'react'

type UpdateFacilityProps = { 
    facility: any; // 기존 시설 정보
    onSuccess?: () => void;
    onClose?: () => void;
};

const UpdateFaForm = ({ facility, onSuccess, onClose }: UpdateFacilityProps) => {
    const [form, setForm] = useState({
        facId: "", // 조직 ID를 문자열로 변환
        name: "", // 시설 이름
        location: "", // 시설 위치
        model: "", 
        maker: "", 
        type: "",
        powerKw: 0,
        h2Rate: 0, 
        specKwh: 0, 
        purity: 0, 
        pressure: 0, 
        install: "", 
    });

    const { updateFacilityAction, loading, error } = useAdmin();
    const { orgId } = useAuthStore();

    // 기존 시설 정보로 폼 초기화
    useEffect(() => {
        if (facility) {
            setForm({
                facId: facility.facId || "",
                name: facility.name || "",
                location: facility.location || "",
                model: facility.model || "",
                maker: facility.maker || "",
                type: facility.type || "",
                powerKw: facility.powerKw || 0,
                h2Rate: facility.h2Rate || 0,
                specKwh: facility.specKwh || 0,
                purity: facility.purity || 0,
                pressure: facility.pressure || 0,
                install: facility.install || "",
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
        const { name, value, type } = e.target;
        setForm({ 
            ...form, 
            [name]: type === 'number' ? Number(value) || 0 : value 
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('=== 시설 수정 시작 ===');
        console.log('수정할 데이터:', form);
        
        // 필수 필드 검증
        const requiredFields = ['name', 'location', 'model', 'powerKw', 'h2Rate'];
        const missingFields = requiredFields.filter(field => !form[field as keyof typeof form]);
        
        if (missingFields.length > 0) {
            alert(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
            return;
        }
        
        try {
            // 날짜 형식 변환
            const formattedForm = {
                ...form,
                install: formatDateForBackend(form.install),
                orgId: orgId?.toString() || ""
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
                    name="model"
                    placeholder="모델"
                    value={form.model}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    name="maker"
                    placeholder="제조사"
                    value={form.maker}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    name="type"
                    placeholder="타입"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="number"
                    name="powerKw"
                    placeholder="정격 전력(kW)"
                    value={form.powerKw}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="number"
                    name="h2Rate"
                    placeholder="수소 생산률(kg/h)"
                    value={form.h2Rate}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="number"
                    name="specKwh"
                    placeholder="기준 SEC(kWh/kg)"
                    value={form.specKwh}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="number"
                    name="purity"
                    placeholder="순도(%)"
                    value={form.purity}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="number"
                    name="pressure"
                    placeholder="압력(bar)"
                    value={form.pressure}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                <div>
                    <input
                        type="text"
                        name="install"
                        placeholder="설치일 (예: 20151005 또는 2015-10-05)"
                        value={form.install}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">YYYYMMDD 또는 YYYY-MM-DD 형식으로 입력하세요</p>
                </div>
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