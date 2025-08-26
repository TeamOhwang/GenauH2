import apiClient from "./apiClient";

export const ADMIN_ENDPOINTS = {
    register: "/user/register",
    getUserList: "/user/list",
    updateUserStatus: (userId: string) => `/user/${userId}/status`,
    getFacilityList: "/plant/list",
    addFacility: "/plant/insert",
    updateFacility: "/plant/update",
    deleteFacility: "/plant/delete",
}

// 회원 등록

export async function registerApi(params:{
    orgName: string;
    name: string;
    bizRegNo: string;
    email: string;
    password: string;
}) {
    const res = await apiClient.post(ADMIN_ENDPOINTS.register, params);
    return (res as any)?.data?.data ?? (res as any)?.data ?? null;
}

// 모든 회원 조회

export async function getUserListApi() {
    const res = await apiClient.get(ADMIN_ENDPOINTS.getUserList);
    return res.data ?? [];
}

// 회원 상태 업데이트

export async function updateUserStatusApi(userId:string, status:string) {
    const res = await apiClient.put(ADMIN_ENDPOINTS.updateUserStatus(userId), {status});
    return res.data ?? [];
}

// 시설 조회

export async function getFacilityListApi(orgId?: string) {
    // console.log('=== adminApi.getFacilityListApi 시작 ===');
    // console.log('받은 orgId:', orgId);
    // console.log('orgId 타입:', typeof orgId);
    // console.log('API 엔드포인트:', ADMIN_ENDPOINTS.getFacilityList);
    
    const params = orgId ? {orgId: String(orgId)} : {};
    // console.log('전송할 쿼리 파라미터:', params);
    // console.log('전체 URL:', `${apiClient.defaults.baseURL}${ADMIN_ENDPOINTS.getFacilityList}?${new URLSearchParams(params).toString()}`);
    
    try {
        // console.log('HTTP GET 요청 시작...');
        const res = await apiClient.get(ADMIN_ENDPOINTS.getFacilityList, {params});
        // console.log('HTTP 응답 전체:', res);
        // console.log('응답 상태:', res.status);
        // console.log('응답 데이터:', res.data);
        // console.log('응답 데이터 타입:', typeof res.data);
        
        if (res.data && Array.isArray(res.data)) {
            // console.log('응답 데이터 길이:', res.data.length);
            // console.log('응답 데이터 첫 번째 항목:', res.data[0]);
        }
        
        const result = res.data ?? [];
        // console.log('반환할 결과:', result);
        // console.log('=== adminApi.getFacilityListApi 종료 ===');
        return result;
    } catch (error) {
        // console.error('시설 목록 조회 중 예외 발생:', error);
        // console.error('에러 타입:', typeof error);
        // console.error('에러 메시지:', error instanceof Error ? error.message : error);
        
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            // console.error('HTTP 상태 코드:', axiosError.response?.status);
            // console.error('HTTP 상태 텍스트:', axiosError.response?.statusText);
            // console.error('응답 데이터:', axiosError.response?.data);
        }
        
        // console.log('=== adminApi.getFacilityListApi 종료 (에러) ===');
        throw error;
    }
}

// 시설 등록

export async function addFacilityApi(params: {
    orgId: string;
    name: string;
    location: string;
    // status: string;
    modelNo: string;
    cellCount: string;
    ratedPowerKw: string; // 정격 전력(kW)
    ratedOutputKgH: string; // 정격 출력(kg/h)
    secNominalKwhPerKg: string; // 기준 SEC(kWh/kg) 
    catalystInstallDate: string; // 촉매 설치일
    catalystLifeHours: string; // 촉매 수명
}) {
    // console.log('=== adminApi.addFacilityApi 시작 ===');
    // console.log('API 엔드포인트:', ADMIN_ENDPOINTS.addFacility);
    // console.log('전송할 데이터:', params);
    // console.log('orgId 타입:', typeof params.orgId, '값:', params.orgId);
    
    try {
        // console.log('HTTP POST 요청 시작...');
        const res = await apiClient.post(ADMIN_ENDPOINTS.addFacility, params);
        // console.log('HTTP 응답 전체:', res);
        // console.log('응답 상태:', res.status);
        // console.log('응답 헤더:', res.headers);
        // console.log('응답 데이터:', res.data);
        
        // 응답 데이터 구조 분석
        const responseData = res.data;
        // console.log('응답 데이터 타입:', typeof responseData);
        // console.log('응답 데이터 키들:', responseData ? Object.keys(responseData) : 'undefined');
        
        // 데이터 추출 시도
        const extractedData = (res as any)?.data?.data ?? (res as any)?.data ?? null;
        // console.log('추출된 데이터:', extractedData);
        // console.log('추출된 데이터 타입:', typeof extractedData);
        
        if (extractedData) {
            // console.log('데이터 추출 성공 - 결과 반환');
            return extractedData;
        } else {
            // console.error('데이터 추출 실패 - null 반환');
            return null;
        }
    } catch (error) {
        // console.error('HTTP 요청 중 예외 발생:', error);
        // console.error('에러 타입:', typeof error);
        // console.error('에러 메시지:', error instanceof Error ? error.message : error);
        
        // Axios 에러인 경우 상세 정보 출력
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            // console.error('HTTP 상태 코드:', axiosError.response?.status);
            // console.error('HTTP 상태 텍스트:', axiosError.response?.statusText);
            // console.error('응답 데이터:', axiosError.response?.data);
            // console.error('요청 헤더:', axiosError.config?.headers);
        }
        
        throw error; // 상위로 에러 전파
    } finally {
        // console.log('=== adminApi.addFacilityApi 종료 ===');
    }
}

// 시설 수정

export async function updateFacilityApi(params: {
    facId: string;
    orgId: string;
    name: string;
    type: string;
    maker: string;
    model: string;
    powerKw: number;
    h2Rate: number;
    specKwh: number;
    purity: number;
    pressure: number;
    location: string;
    install: string;
    createdAt: string;
}) {
    console.log('=== adminApi.updateFacilityApi 시작 ===');
    console.log('API 엔드포인트:', ADMIN_ENDPOINTS.updateFacility);
    console.log('전송할 데이터:', params);
    console.log('facilityId 값:', params.facId);
    
    try {
        console.log('HTTP POST 요청 시작...');
        const res = await apiClient.post(ADMIN_ENDPOINTS.updateFacility, params);
        console.log('HTTP 응답 전체:', res);
        console.log('응답 상태:', res.status);
        console.log('응답 데이터:', res.data);
        
        const result = (res as any)?.data?.data ?? (res as any)?.data ?? null;
        console.log('추출된 결과:', result);
        console.log('=== adminApi.updateFacilityApi 종료 ===');
        return result;
    } catch (error) {
        console.error('시설 수정 중 예외 발생:', error);
        console.error('에러 타입:', typeof error);
        console.error('에러 메시지:', error instanceof Error ? error.message : error);
        
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('HTTP 상태 코드:', axiosError.response?.status);
            console.error('HTTP 상태 텍스트:', axiosError.response?.statusText);
            console.error('응답 데이터:', axiosError.response?.data);
            console.error('요청 헤더:', axiosError.config?.headers);
        }
        
        console.log('=== adminApi.updateFacilityApi 종료 (에러) ===');
        throw error;
    }
}

// 시설 삭제

export async function deleteFacilityApi(facilityId: string) {
    console.log('=== adminApi.deleteFacilityApi 시작 ===');
    console.log('API 엔드포인트:', ADMIN_ENDPOINTS.deleteFacility);
    console.log('삭제할 facilityId:', facilityId);
    
    try {
        console.log('HTTP POST 요청 시작...');
        const res = await apiClient.post(ADMIN_ENDPOINTS.deleteFacility, { facilityId });
        console.log('HTTP 응답 전체:', res);
        console.log('응답 상태:', res.status);
        console.log('응답 데이터:', res.data);
        
        const result = (res as any)?.data?.data ?? (res as any)?.data ?? null;
        console.log('추출된 결과:', result);
        console.log('=== adminApi.deleteFacilityApi 종료 ===');
        return result;
    } catch (error) {
        console.error('시설 삭제 중 예외 발생:', error);
        console.error('에러 타입:', typeof error);
        console.error('에러 메시지:', error instanceof Error ? error.message : error);
        
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('HTTP 상태 코드:', axiosError.response?.status);
            console.error('HTTP 상태 텍스트:', axiosError.response?.statusText);
            console.error('응답 데이터:', axiosError.response?.data);
        }
        
        console.log('=== adminApi.deleteFacilityApi 종료 (에러) ===');
        throw error;
    }
}