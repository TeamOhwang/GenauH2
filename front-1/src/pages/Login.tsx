import { useLogin } from "@/hooks/useLogin";
import LoginForm from "@/components/LoginForm";
import { useNavigate, useLocation, type Location } from "react-router-dom";
import { useAuthStore } from "@/Stores/useAuthStore";
import { PATHS } from "@/routes/paths";


type Role = "USER" | "ADMIN";
const roleHome = (r: Role) => (r === "ADMIN" ? PATHS.admin : PATHS.home);


export default function Login() {
const { submit, loading, error } = useLogin();
const navigate = useNavigate();
const location = useLocation();


const fromState = location.state as { from?: Location | string } | undefined;


const handleSubmit = async (v: { email: string; password: string }): Promise<boolean> => {
const ok = await submit(v);
if (!ok) return false;


const latestRole = useAuthStore.getState().role;


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


if (latestRole) {
navigate(roleHome(latestRole as Role), { replace: true });
} else {
navigate(PATHS.home, { replace: true });
}
return true;
};


return <LoginForm loading={loading} error={error} onSubmit={handleSubmit} />;
}