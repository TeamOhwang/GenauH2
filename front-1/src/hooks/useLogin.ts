import { useState, useCallback } from "react";
import { AuthApi } from "@/api/authApi";

export type LoginValues = { email: string; password: string };

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (v: LoginValues): Promise<boolean> => {
    if (loading) return false; // 중복 제출 방지
    setLoading(true);
    setError(null);

    try {
      //  토큰 저장 + 프로필 조회 + Zustand 상태 동기화까지 한 번에 처리
      await AuthApi.loginAndSyncRole(v);
      return true;
    } catch (e: any) {
      const msg = e?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { submit, loading, error };
}
