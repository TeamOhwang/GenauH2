
import { useLogin } from "@/hooks/useLogin";
import LoginForm from "@/components/LoginForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/Stores/useAuthStore";
import { PATHS } from "@/routes/paths";

type LocationState = { from?: string };
const roleHome = (r: "USER" | "ADMIN") => (r === "ADMIN" ? PATHS.admin : PATHS.home);

export default function Login() {
  const { submit, loading, error } = useLogin();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = (location.state as LocationState)?.from;

  const handleSubmit = async (v: { email: string; password: string }) => {
    const ok = await submit(v);
    if (!ok) return;

    // 최신 역할 재조회 (동일 tick에서 role 변수를 쓰면 stale 가능)
    const latestRole = useAuthStore.getState().role;

    if (from) return navigate(from, { replace: true });
    if (latestRole) return navigate(roleHome(latestRole), { replace: true });
  };

  return <LoginForm loading={loading} error={error} onSubmit={handleSubmit} />;
}
