import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/Stores/useAuthStore";
import { PATHS } from "./paths";

type Props = { children: JSX.Element };

const roleHome = (role: "USER" | "ADMIN") =>
  role === "ADMIN" ? PATHS.admin : PATHS.home;

export default function PublicOnlyRoute({ children }: Props) {
  const role = useAuthStore((s) => s.role);
  const isInit = useAuthStore((s) => s.isInit);

  // 초기 동기화 대기
  if (!isInit) return null;

  // 로그인 상태면 자기 홈으로
  if (role) return <Navigate to={roleHome(role)} replace />;

  return children;
}
