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
    } catch (e: any) {
      setError(e?.message ?? "로그인 실패");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return { submit, loading, error };
}