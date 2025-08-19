import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/authApi";
import { useAuthStore } from "@/Stores/useAuthStore";

export type LoginValues = { email: string; password: string };

export function useLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (v: LoginValues) => {
    setLoading(true);
    setError(null);
    
    try {
      await login(v);
      
      const role = useAuthStore.getState().role;
      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
      
      return true; // 성공 시 true 반환
    } catch (e: any) {
      setError(e?.message ?? "로그인 실패");
      alert("이메일 또는 비밀번호가 올바르지 않습니다.");
      return false; // 실패 시 false 반환
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return { submit, loading, error };
}