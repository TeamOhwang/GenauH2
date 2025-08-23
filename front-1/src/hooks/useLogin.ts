
import { useState, useCallback } from "react";
import { AuthApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";

export type LoginValues = { email: string; password: string };

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const setRole = useAuthStore((s) => s.setRole);

  const submit = useCallback(async (v: LoginValues): Promise<boolean> => {
    if (loading) return false; // 중복 제출 방지(옵션)
    setLoading(true);
    setError(null);
    try {
      // 토큰 저장 + 프로필 조회 + Role 동기화까지 한 번에
      const role = await AuthApi.loginAndSyncRole(v);
      setRole(role);
      return true;
    } catch (e: any) {
      const msg = e?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.";
      setError(msg);
      alert(msg); 
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading, setRole]);

  return { submit, loading, error };
}
