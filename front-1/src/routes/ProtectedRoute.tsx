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

  // 초기 동기화 대기 (App에서 Splash 띄우므로 여기선 렌더하지 않음)
  if (!isInit) return null;

  // 미로그인 → 로그인으로. 전체 location 보존(search/hash 포함)
  if (!role) {
    return <Navigate to={PATHS.login} replace state={{ from: location }} />;
  }

  // 권한 불일치 → 역할 홈으로
  if (require && role !== require) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return children;
}
