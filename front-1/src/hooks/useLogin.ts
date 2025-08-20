import { useState, useCallback } from "react";
import { loginAndSyncRole } from "@/api/authService";
import { useAuthStore } from "@/stores/useAuthStore";


export type LoginValues = { email: string; password: string };


export function useLogin() {
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const setRole = useAuthStore((s) => s.setRole);


const submit = useCallback(async (v: LoginValues): Promise<boolean> => {
setLoading(true);
setError(null);
try {
const role = await loginAndSyncRole(v); // 토큰 저장 + 서버 역할 동기화
setRole(role);
return true;
} catch (e: any) {
setError(e?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.");
alert(e?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.");
return false;
} finally {
setLoading(false);
}
}, [setRole]);


return { submit, loading, error };
}