
import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/Stores/useAuthStore";
import { PATHS } from "./paths";

type Props = { children: JSX.Element };

const roleHome = (role: "USER" | "ADMIN") =>
  role === "ADMIN" ? PATHS.admin : PATHS.home;

export default function PublicOnlyRoute({ children }: Props) {
  const role   = useAuthStore((s) => s.role);
  const isInit = useAuthStore((s) => s.isInit);

  if (!isInit) return <div />;

  if (role) return <Navigate to={roleHome(role)} replace />;

  return children;
}
//로그인되어 있으면 로그인 페이지를 못 보게 하고 역할 홈으로 돌려보내기.