// src/pages/Login.tsx
import { useLogin } from "@/hooks/useLogin";
import LoginForm from "@/components/LoginForm";
import { useNavigate, useLocation, type Location } from "react-router-dom";
import { useAuthStore } from "@/Stores/useAuthStore";
import { PATHS } from "@/routes/paths";

type Role = "USER" | "ADMIN";
const roleHome = (r: Role) => (r === "ADMIN" ? PATHS.admin : PATHS.home);

export default function Login() {
  const { submit, loading, error } = useLogin();
  const navigate  = useNavigate();
  const location  = useLocation();

  // ProtectedRoute에서 state={{ from: location }} 또는 pathname 문자열로 올 수 있음
  const fromState = location.state as { from?: Location | string } | undefined;

  const handleSubmit = async (v: { email: string; password: string }): Promise<boolean> => {
    const ok = await submit(v);
    if (!ok) return false;

    // 토큰은 저장됐지만 JWT에 role이 없으므로 서버에서 역할 동기화
    const { syncRoleFromServer } = useAuthStore.getState();
    await syncRoleFromServer();

    const latestRole = useAuthStore.getState().role;

    // 원래 가려던 경로 복구 (Location 객체 or string 모두 지원)
    if (fromState?.from) {
      if (typeof fromState.from === "string") {
        navigate(fromState.from || "/", { replace: true });
      } else {
        const loc = fromState.from as Location;
        const path = `${loc.pathname ?? ""}${loc.search ?? ""}${loc.hash ?? ""}`;
        navigate(path || "/", { replace: true });
      }
      return true;
    }

    // 역할 기준으로 홈 이동
    if (latestRole) {
      navigate(roleHome(latestRole as Role), { replace: true });
    } else {
      // 혹시 역할 못 받아온 엣지 케이스 → 기본 홈
      navigate(PATHS.home, { replace: true });
    }
    return true;
  };

  return <LoginForm loading={loading} error={error} onSubmit={handleSubmit} />;
}
