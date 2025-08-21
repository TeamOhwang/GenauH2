import { createUser, fetchAllFacilities, fetchAllUsers, updateUserStatus } from "@/api/adminService";
import { useCallback, useState } from "react";

type user = {
    orgName: string;
    name: string;
    bizRegNo: string;
    email: string;
    password: string;
}

export function useAdmin() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addUser = useCallback(async (params: user) => {
        setLoading(true);
        setError(null);
        try {
            const user = await createUser(params)
            return user
        } catch (e:any) {
            setError(e?.message ?? "회원 등록 실패");
            return null;
        } finally {
            setLoading(false)
        }
    }, [])

    const getUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const users = await fetchAllUsers();
            return users
        } catch (e: any) {
            setError(e?.message ?? "회원 목록 조회 실패");
            return []
        } finally {
            setLoading(false);
        }
    }, [])

    const updateUserStatusAction = useCallback(async (userId: string, status: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await updateUserStatus(userId, status);
            return result;
        } catch (e: any) {
            setError(e?.message ?? "사용자 상태 변경 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    const getFacilities = useCallback(async (ordId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const facilities = await fetchAllFacilities(ordId);
            return facilities;
        } catch (e: any) {
            setError(e?.message ?? "시설 목록 조회 실패");
            return [];
        } finally {
            setLoading(false);
        }
    }, [])

    return { loading, error, addUser, getUsers, updateUserStatus: updateUserStatusAction, getFacilities}
}