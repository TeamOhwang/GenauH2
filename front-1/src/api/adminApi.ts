import { postD, getD, putD, deleteD } from "./apiClient";

export interface UserInfo {
    affiliation: string;
    email: string;
    name: string;
    phone: string;
}

export interface UserList {
    users: UserInfo[];
}

export interface RegistReq {
    email: string;
    affiliation: string;
    name: string;
    phone: string;
}

export interface Facility {
    id: number;
    name: string;
    location: string;
    //필요한 필드 더 추가
}

type RegistRes = {
    success: boolean;
    user?: UserInfo;
    message?: string;
}

type InquiryRes = {
    success: boolean;
    userList?: UserList;
    message?: string;
}

type DelRes = {
    success: boolean;
    message?: string;
}

type FacilityRes = {
    success: boolean;
    facility?: Facility;
    message?: string
}

// 회원 등록

export async function userRegistration(body:RegistReq): Promise<UserInfo> {
    const res = await postD<RegistRes>("/admin/userRegi", body);
    if (!res?.success || !res.user) {
        throw new Error(res?.message || "회원 등록 실패");
    }
    return res.user
}

// 회원 조회

export async function userInquiry(): Promise<UserList> {
    const res = await getD<InquiryRes>("/admin/users");
    if (!res?.success || !res.userList) {
        throw new Error(res?.message || "회원 목록 조회 실패");
    }
    return res.userList
}

// 회원 삭제

export async function userDelete(userId: number): Promise<boolean> {
    const res = await deleteD<DelRes>(`/admin/users/${userId}`);
    // if (!res?.success) {
    //     throw new Error(res?.message || "회원 삭제 실패");
    // }
    return true;
}

// 시설 등록

// 시설 조회

// 시설 삭제

// 시설 수정
