// src/routes/ProtectedRoute.tsx
// (동작 동일, UI→Store 의존만)
// =============================
import { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/Stores/useAuthStore";
import { PATHS } from "./paths";


type Role = "USER" | "ADMIN";
type Props = { children: JSX.Element; require?: Role };


const roleHome = (role: Role) => (role === "ADMIN" ? PATHS.admin : PATHS.home);


export default function ProtectedRoute({ children, require }: Props) {
const role = useAuthStore((s) => s.role);
const isInit = useAuthStore((s) => s.isInit);
const location = useLocation();


if (!isInit) return null;
if (!role) {
return <Navigate to={PATHS.login} replace state={{ from: location }} />;
}
if (require && role !== require) {
return <Navigate to={roleHome(role)} replace />;
}
return children;
}