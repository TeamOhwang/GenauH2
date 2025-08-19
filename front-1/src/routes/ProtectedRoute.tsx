
import { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/Stores/useAuthStore";
import { PATHS } from "./paths"; 

type Props = { children: JSX.Element; require?: "USER" | "ADMIN" };

const roleHome = (role: "USER" | "ADMIN") =>
  role === "ADMIN" ? PATHS.admin : PATHS.home;

export default function ProtectedRoute({ children, require }: Props) {
  const role   = useAuthStore((s) => s.role);
  const isInit = useAuthStore((s) => s.isInit);
  const location = useLocation();

  if (!isInit) return <div />; // 초기 동기화 대기

  if (!role) {
    // 미로그인 → 로그인으로. 원래 가려던 경로 기억
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />;
  }

  if (require && role !== require) {
    // 권한 불일치 → 자기 역할 홈으로
    return <Navigate to={roleHome(role)} replace />;
  }

  return children;
}
