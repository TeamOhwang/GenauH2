import { getUserListApi, registerApi } from "@/api/adminApi";

export async function createUser(params:{
    orgname: string;
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