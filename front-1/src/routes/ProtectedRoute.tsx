import { useAuthStore } from "@/Stores/useAuthStore";
import { JSX } from "react";
import { Navigate } from "react-router-dom";

type Props = { children: JSX.Element; require?: "USER" | "ADMIN" };

export default function ProtectedRoute({ children, require }: Props) {
  const role = useAuthStore((s) => s.role);
  if (!role) return <Navigate to="/login" replace />;
  if (require && role !== require) return <Navigate to="/login" replace />;
  return children;
}
