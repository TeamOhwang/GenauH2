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
  const fromLoc = (location.state as { from?: Location })?.from;

  const handleSubmit = async (v: { email: string; password: string }): Promise<boolean> => {
    const ok = await submit(v);
    if (!ok) return false;

    const latestRole = useAuthStore.getState().role;

    if (fromLoc) {
      const path = `${fromLoc.pathname ?? ""}${fromLoc.search ?? ""}${fromLoc.hash ?? ""}`;
      navigate(path || "/", { replace: true });
      return true;
    }

    if (latestRole) {
      navigate(roleHome(latestRole as Role), { replace: true });
      return true;
    }

    navigate(PATHS.home, { replace: true });
    return true;
  };

  return <LoginForm loading={loading} error={error} onSubmit={handleSubmit} />;
}
