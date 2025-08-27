import { useState, useCallback } from "react";
import { AuthApi, RegisterReq } from "@/api/authApi";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 회원가입 */
  const submit = useCallback(async (v: RegisterReq): Promise<boolean> => {
    if (loading) return false;
    setLoading(true);
    setError(null);
    try {
      await AuthApi.register(v);
      return true;
    } catch (e: any) {
      setError(e?.message ?? "회원가입에 실패했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  /** 사업자번호 검증 */
  const validateBiz = useCallback(async (bizRegNo: string): Promise<boolean> => {
    try {
      const res = await AuthApi.validateBiz(bizRegNo);
      return res.valid; // true / false
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  return { submit, validateBiz, loading, error };
}
