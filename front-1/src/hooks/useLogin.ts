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
      let msg = "이메일 또는 비밀번호가 올바르지 않습니다.";
      
      // 백엔드에서 보낸 에러 메시지 우선 사용
      const backendMessage = e?.response?.data?.message || e?.message || "";
      
      if (backendMessage) {
        // 백엔드에서 명시적으로 보낸 메시지가 있으면 그대로 사용
        if (backendMessage.includes("현재 계정은 비활성화 상태입니다")) {
          msg = "현재 계정은 비활성화 상태입니다";
        } else if (backendMessage.includes("비밀번호가 일치하지 않습니다")) {
          msg = "비밀번호가 일치하지 않습니다";
        } else if (backendMessage.includes("계정이 활성화되지 않았습니다")) {
          msg = "계정이 활성화되지 않았습니다";
        } else if (backendMessage.includes("이메일 또는 비밀번호가 올바르지 않습니다")) {
          msg = "이메일 또는 비밀번호가 올바르지 않습니다";
        } else {
          msg = backendMessage;
        }
      }
      
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { submit, loading, error };
}
