import { getFacilityListApi, getUserListApi, registerApi, updateUserStatusApi } from "@/api/adminApi";

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

export async function fetchAllFacilities(ordId?: number) {
    const facilities = await getFacilityListApi(ordId);
    return facilities;
}

export async function updateUserStatus(userId: string, status: string) {
    return await updateUserStatusApi(userId, status);
}