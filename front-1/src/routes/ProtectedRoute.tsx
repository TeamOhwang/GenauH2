import { useAuthStore } from "@/Stores/useAuthStore";
import { JSX } from "react";
import { Navigate } from "react-router-dom";

type Props = { children: JSX.Element; require?: "USER" | "ADMIN" };

export default function ProtectedRoute({ children, require }: Props) {
  const { role, isInit } = useAuthStore();

  if (!isInit) return <div />;             // 또는 로딩 UI
  if (!role) return <Navigate to="/login" replace />;
  if (require && role !== require) return <Navigate to="/403" replace />;

  return children;
}