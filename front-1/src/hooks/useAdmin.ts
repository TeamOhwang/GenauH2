import { createUser, fetchAllUsers } from "@/api/adminService";
import { useCallback, useState } from "react";

type user = {
    orgname: string;
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

    return { loading, error, addUser, getUsers}
}