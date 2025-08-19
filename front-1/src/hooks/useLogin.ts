import { useState, useCallback } from "react";
import { login } from "@/api/authApi";

export type LoginValues = { email: string; password: string };

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const submit = useCallback(async (v: LoginValues): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await login(v); // 서버에서 토큰 발급 & 저장
      return true;
    } catch (e: any) {
      setError(e?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.");
      alert(e?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
}
