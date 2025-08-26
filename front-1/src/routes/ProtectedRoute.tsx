import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { authToken } from "@/stores/authStorage";
import { AuthApi } from "@/api/authApi";
import { useEffect, useRef, useState } from "react";
import { PATHS, roleHome, Role } from "./paths";

export function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const role = useAuthStore((s) => s.role) as Role | null;
  const isInit = useAuthStore((s) => s.isInit);
  if (!isInit) return null;
  if (role) return <Navigate to={roleHome(role)} replace />;
  return children;
}

type GuardProps = { children: JSX.Element; require?: Role };
const SYNC_TTL_MS = 60_000;

export function ProtectedRoute({ children, require }: GuardProps) {
  const role = useAuthStore((s) => s.role);
  const { setRole } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const loc = useLocation();
  const lastSync = useRef(0);

  const token = authToken.get();
  if (!token) return <Navigate to={PATHS.login} replace state={{ from: loc }} />;

  useEffect(() => {
    let alive = true;
    if (Date.now() - lastSync.current < SYNC_TTL_MS && role) {
      setChecking(false);
      return;
    }
    setChecking(true);
    AuthApi.syncRole()
      .then((r) => {
        if (alive && r) setRole(r);
        else if (alive) authToken.clear();
      })
      .catch(() => authToken.clear())
      .finally(() => {
        if (alive) {
          setChecking(false);
          lastSync.current = Date.now();
        }
      });
    return () => {
      alive = false;
    };
  }, [loc.pathname]);

  if (checking) return <div>세션 확인중...</div>;
  if (require && role !== require) return <Navigate to={PATHS.forbidden} replace />;
  return children;
}
