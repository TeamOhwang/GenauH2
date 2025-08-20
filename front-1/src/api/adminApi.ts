import apiClient from "./apiClient";

export const ADMIN_ENDPOINTS = {
    register: "/user/register",
    getUserList: "/userOrgan/all",
    updateUserStatus: (userId: string) => `/user/${userId}`,
}

// 회원 등록

export async function registerApi(params:{
    orgname: string;
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

export async function updateUserStatusApi(userId:string) {
    // const res = await apiClient.put()
}

// 시설 등록

// 시설 조회

// 시설 삭제

// 시설 수정
