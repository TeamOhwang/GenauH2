import { useAdmin } from '@/hooks/useAdmin';
import { useState, useEffect } from 'react'

type FacilitiesProps = { 
    orgId: string | number;
    onSuccess?: () => void 
};

const FacilitiesFrom = ( {orgId, onSuccess}: FacilitiesProps) => {

    const [form, setFrom] = useState({
        orgId: String(orgId), // 조직 ID를 문자열로 변환
        name: "", // 시설 이름
        location: "", // 시설 위치
        // status: "", // 시설 상태
        modelNo: "",
        cellCount: "", // 셀 개수
        ratedPowerKw: "", // 정격 전력(kW)
        ratedOutputKgH: "", // 정격 출력(kg/h)
        secNominalKwhPerKg: "", // 기준 SEC(kWh/kg)
        catalystInstallDate: "", // 촉매 설치일
        catalystLifeHours: "", // 촉매 수명
    })

    const { createFacility, loading, error} = useAdmin();

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

    // 컴포넌트 마운트 및 props 변경 시 로그
    useEffect(() => {
        console.log('=== FacilitiesFrom 컴포넌트 마운트/업데이트 ===');
        console.log('받은 orgId:', orgId);
        console.log('orgId 타입:', typeof orgId);
        console.log('현재 form 상태:', form);
        console.log('loading 상태:', loading);
        console.log('error 상태:', error);
    }, [orgId, form, loading, error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        console.log(`필드 변경: ${name} = "${value}"`);
        console.log('변경 전 form:', form);
        
        const newForm = { ...form, [name]: value };
        console.log('변경 후 form:', newForm);
        
        setFrom(newForm);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('=== 시설 등록 시작 ===');
        console.log('전송할 데이터:', form);
        console.log('orgId 타입:', typeof form.orgId, '값:', form.orgId);
        console.log('form 객체 전체:', JSON.stringify(form, null, 2));
        
        // 필수 필드 검증
        const requiredFields = ['name', 'location', 'modelNo', 'cellCount', 'ratedPowerKw', 'ratedOutputKgH'];
        const missingFields = requiredFields.filter(field => !form[field as keyof typeof form]);
        
        if (missingFields.length > 0) {
            console.error('필수 필드 누락:', missingFields);
            alert(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
            return;
        }
        
        try {
            // 날짜 형식 변환
            const formattedForm = {
                ...form,
                catalystInstallDate: formatDateForBackend(form.catalystInstallDate)
            };
            
            console.log('원본 form 데이터:', form);
            console.log('변환된 form 데이터:', formattedForm);
            
            console.log('createFacility 함수 호출 시작...');
            const facility = await createFacility(formattedForm);
            console.log('createFacility 응답:', facility);
            console.log('응답 타입:', typeof facility);
            console.log('응답이 truthy인가?', !!facility);
            
            if (facility) {
                console.log('시설 등록 성공!');
                console.log('성공 응답 데이터:', facility);
                alert("시설 등록 성공");
                // 시설 목록 새로고침을 위해 부모 컴포넌트에 알림
                onSuccess?.();
            } else {
                console.error('시설 등록 실패 - 응답이 null/undefined');
                console.error('에러 상태:', error);
                console.error('loading 상태:', loading);
                alert(error ?? "시설 등록 실패");
            }
        } catch (err) {
            console.error('시설 등록 중 예외 발생:', err);
            console.error('에러 타입:', typeof err);
            console.error('에러 메시지:', err instanceof Error ? err.message : err);
            console.error('전체 에러 객체:', err);
            alert(`시설 등록 중 오류 발생: ${err instanceof Error ? err.message : err}`);
        }
    }

    return (
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
            <input
                type="text"
                name="catalystInstallDate"
                placeholder="촉매 설치일"
                value={form.catalystInstallDate}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />
            <input
                type="text"
                name="catalystLifeHours"
                placeholder="촉매 수명"
                value={form.catalystLifeHours}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />
            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded">
                {loading ? "등록중..." : "등록"}
            </button>
        </form>
    )
}

export default FacilitiesFrom