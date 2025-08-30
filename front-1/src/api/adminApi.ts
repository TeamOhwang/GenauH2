import apiClient from "./apiClient";

export const ADMIN_ENDPOINTS = {
    register: "/user/register",
    getUserList: "/user/list",
    updateUserStatus: (userId: string) => `/user/${userId}/status`,
    getFacilityList: "/plant/list",
    addFacility: "/plant/insert",
    updateFacility: "/plant/update",
    deleteFacility: "/plant/delete",
    pending: "/user/pending",
}

// // 회원 등록
// export async function registerApi(params:{
//     orgName: string;
//     ownerName: string;
//     bizRegNo: string;
//     email: string;
//     phoneNum: string;
//     password: string;
// }) {
//     const res = await apiClient.post(ADMIN_ENDPOINTS.register, params);
//     return (res as any)?.data?.data ?? (res as any)?.data ?? null;
// }

// 승인 대기 중인 회원 목록 조회
export async function getPendingsApi() {
    const res = await apiClient.get(ADMIN_ENDPOINTS.pending);
    return (res as any)?.data?.data ?? (res as any)?.data ?? [];
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
    const params = orgId ? {orgId: String(orgId)} : {};
    try {
        const res = await apiClient.get(ADMIN_ENDPOINTS.getFacilityList, {params});
        if (res.data && Array.isArray(res.data)) {

        }
        
        const result = res.data ?? [];
        return result;
    } catch (error) {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
        }
    throw error;
    }
}

// 시설 등록
export async function addFacilityApi(params: {
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
}) {

    try {
        const res = await apiClient.post(ADMIN_ENDPOINTS.addFacility, params);
        const responseData = res.data;
        const extractedData = (res as any)?.data?.data ?? (res as any)?.data ?? null;
        
        if (extractedData) {
            return extractedData;
        } else {
            return null;
        }
    } catch (error) {

        // Axios 에러인 경우 상세 정보 출력
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
        }
        throw error; 
    } finally {
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