// routes/ProtectedRoute.tsx
import { JSX, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authToken } from "@/stores/authStorage";
import { useAuthStore } from "@/stores/useAuthStore";
import * as authService from "@/api/authService";
import { PATHS } from "./paths";

type Role = "USER" | "ADMIN";
type Props = { children: JSX.Element; require?: Role };

// 이동 때마다 서버 재검증 주기(ms). 항상 확인하려면 0으로.
const SYNC_TTL_MS = 60_000;

export default function ProtectedRoute({ children, require }: Props) {
  const { setRole } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [role, setLocalRole] = useState<Role | null>(null);
  const loc = useLocation();
  const lastSync = useRef(0);

  //  토큰 없으면 즉시 로그인으로
  const token = authToken.get();
  if (!token) {
    const from = loc.pathname + loc.search + loc.hash;
    return <Navigate to={PATHS.login} replace state={{ from }} />;
  }

  //  경로가 바뀔 때마다 서버에서 role 재확인(캐시 TTL 적용)
  useEffect(() => {
    let alive = true;
    const now = Date.now();

    if (now - lastSync.current < SYNC_TTL_MS && role) {
      setChecking(false);
      return () => {};
    }

    setChecking(true);
    authService
      .syncRole() // 내부에서 /user/profile 호출 → "ADMIN" | "USER" | null
      .then((r) => {
        if (!alive) return;
        lastSync.current = Date.now();
        setLocalRole(r);
        if (r) setRole(r);     
        else authToken.clear(); 
      })
      .catch(() => {
        if (!alive) return;
        authToken.clear();    
      })
      .finally(() => {
        if (!alive) return;
        setChecking(false);
      });

    return () => { alive = false; };
  }, [loc.pathname]); 

  // 서버 확인 중 스켈레톤/로딩
  if (checking) return <div style={{ padding: 24 }}>Checking session...</div>;

  if (require && role && role !== require) {
    return <Navigate to={PATHS.forbidden} replace />;
  }

  return children;
}
