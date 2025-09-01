import { useState, useCallback } from "react";
import { AuthApi } from "@/api/authApi";

export type LoginValues = { email: string; password: string };

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const submit = useCallback(async (v: LoginValues): Promise<boolean> => {
    if (loading) return false; // 중복 제출 방지
    setLoading(true);
    setError(null);

    try {
      //  토큰 저장 + 프로필 조회 + Zustand 상태 동기화까지 한 번에 처리
      await AuthApi.loginAndSyncRole(v);
      return true;
    } catch (e: any) {
      const st = e?.response?.status;
      const code = e?.response?.data?.errorCode as string | undefined;
      let msg = "로그인에 실패했습니다.";

      console.log("=== 로그인 에러 응답 ===");
      console.log("Status:", st);
      console.log("Response Data:", e?.response?.data);
      console.log("Error Code:", code);
      console.log("Full Error:", e);

      if (code === "ACCOUNT_SUSPENDED" || st === 423) {
        msg = "계정이 정지되었습니다. 관리자에게 문의하세요.";
      } else if (code === "PENDING_APPROVAL") {
        msg = "관리자 승인 대기중입니다.";
      } else if (code === "ACCOUNT_INACTIVE") {
        msg = "계정이 활성화 상태가 아닙니다.";
      } else if (code === "INVALID_CREDENTIALS" || st === 401) {
        msg = "이메일 또는 비밀번호가 올바르지 않습니다.";
      } else if (typeof e?.message === "string") {
        msg = e.message;
      }

      console.log("최종 에러 메시지:", msg);
      setError({ message: msg, code });
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { submit, loading, error };
}
