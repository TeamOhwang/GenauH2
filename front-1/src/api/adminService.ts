import { addFacilityApi, deleteFacilityApi, getFacilityListApi, getUserListApi, registerApi, updateFacilityApi, updateUserStatusApi } from "@/api/adminApi";

export async function createUser(params:{
    orgName: string;
    name: string;
    bizRegNo: string;
    email: string;
    password: string;
}) {
    return await registerApi(params);
}

export async function fetchAllUsers() {
    const users = await getUserListApi();

    return users.map((u: any) => ({
        ...u,
        role: u.role === "SUPERVISOR" ? "ADMIN" : "USER",
    }))
}

export async function updateUserStatus(userId: string, status: string) {
    return await updateUserStatusApi(userId, status);
}

export async function fetchAllFacilities(orgId?: string) {
    return await getFacilityListApi(orgId);
}

export async function addFacility(params: {
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
    console.log('=== adminService.addFacility 시작 ===');
    console.log('받은 파라미터:', params);
    console.log('orgId 타입:', typeof params.orgId, '값:', params.orgId);
    
    try {
        console.log('addFacilityApi 호출 시작...');
        const result = await addFacilityApi(params);
        console.log('addFacilityApi 응답:', result);
        console.log('응답 타입:', typeof result);
        
        if (result) {
            console.log('API 호출 성공 - 결과 반환');
            return result;
        } else {
            console.error('API 호출 실패 - 응답이 null/undefined');
            return null;
        }
    } catch (error) {
        console.error('adminService.addFacility에서 예외 발생:', error);
        console.error('에러 타입:', typeof error);
        console.error('에러 메시지:', error instanceof Error ? error.message : error);
        throw error; // 상위로 에러 전파
    } finally {
        console.log('=== adminService.addFacility 종료 ===');
    }
}

export async function updateFacility(params: {
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
    return await updateFacilityApi(params);
}

export async function deleteFacility(facilityId: string) {
    return await deleteFacilityApi(facilityId);
}