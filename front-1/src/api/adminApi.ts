import { postD, getD } from "./apiClient";

export interface UserInfo {
    affiliation: string;
    email: string;
    name: string;
    phone: string;
}

export interface UserList {
    users: UserInfo[];
}

// 회원 등록

// 회원 조회

// 회원 수정

// 회원 삭제

// 시설 등록??
