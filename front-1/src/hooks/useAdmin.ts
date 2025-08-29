import { createUser, fetchAllFacilities, fetchAllUsers, updateUserStatus, addFacility, updateFacility, deleteFacility } from "@/api/adminService";
import { useCallback, useState } from "react";

type user = {
    orgName: string;
    name: string; // ownerName에서 name으로 변경
    bizRegNo: string;
    email: string;
    phoneNum: string;
    password: string;
}

type createfacility = {
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
}

type updateFacility = {

    facId: string;
    name: string;
    location: string;
    model: string;
    maker: string;
    type: string;
    powerKw: number;
    h2Rate: number;
    specKwh: number;
    purity: number;
    pressure: number;
    install: string;
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
        } catch (e: any) {
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

    const getFacilities = useCallback(async (orgId?: string) => {
        setLoading(true);
        setError(null);
        try {
            const facilities = await fetchAllFacilities(orgId);
            return facilities;
        } catch (e: any) {
            setError(e?.message ?? "시설 목록 조회 실패");
            return [];
        } finally {
            setLoading(false);
        }
    }, [])

    const createFacility = useCallback(async (params: createfacility) => {
        setLoading(true);
        setError(null);
        try {
            // console.log('addFacility API 호출 시작...');
            const result = await addFacility(params);
            // console.log('addFacility API 응답:', result);
            // console.log('응답 타입:', typeof result);

            if (result) {
                // console.log('시설 등록 성공 - 결과 반환');
                return result;
            } else {
                // console.error('시설 등록 실패 - API 응답이 null/undefined');
                setError("API 응답이 없습니다");
                return null;
            }
        } catch (e: any) {
            // console.error('시설 등록 중 예외 발생:', e);
            // console.error('에러 타입:', typeof e);
            // console.error('에러 메시지:', e?.message);
            // console.error('전체 에러 객체:', e);

            const errorMessage = e?.message ?? "시설 등록 실패";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    const updateFacilityAction = useCallback(async (params: updateFacility) => {
        setLoading(true);
        setError(null);
        try {
            const result = await updateFacility(params);
            return result;
        } catch (e: any) {
            setError(e?.message ?? "시설 수정 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    const deleteFacilityAction = useCallback(async (facilityId: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await deleteFacility(facilityId);
            return result;
        } catch (e: any) {
            setError(e?.message ?? "시설 삭제 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    return { loading, error, addUser, getUsers, updateUserStatusAction, getFacilities, createFacility, updateFacilityAction, deleteFacilityAction }
}