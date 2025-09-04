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
const SYNC_TTL_MS = 300_000; // 5분으로 증가하여 불필요한 재동기화 방지

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
    
    console.log('ProtectedRoute 권한 검사 시작:', { 
      pathname: loc.pathname, 
      currentRole: role, 
      requiredRole: require,
      hasToken: !!token
    });
    
    // 토큰이 없으면 즉시 종료 (이미 위에서 로그인 페이지로 리다이렉트됨)
    if (!token) {
      setChecking(false);
      return;
    }
    
    // 역할이 이미 있다면 동기화 스킵 (JWT에서 이미 파싱됨)
    if (role) {
      console.log('권한 동기화 스킵 - JWT에서 역할 정보 확인됨:', role);
      setChecking(false);
      lastSync.current = Date.now();
      return;
    }
    
    // 역할이 없는 경우에만 API 호출로 동기화
    console.log('역할 정보 없음 - API 호출로 동기화 시작...');
    setChecking(true);
    
    AuthApi.syncRole()
      .then((r) => {
        if (alive) {
          console.log('권한 동기화 성공:', r);
          if (r) {
            setRole(r);
            lastSync.current = Date.now();
          } else {
            console.warn("권한 동기화 실패: 역할 정보 없음");
            // 역할 정보가 없으면 토큰 클리어
            authToken.clear();
          }
        }
      })
      .catch((error) => {
        if (alive) {
          console.error("권한 동기화 중 오류:", error);
          // 인증 관련 오류면 토큰 클리어
          if (error?.response?.status === 403 || error?.response?.status === 401) {
            console.log('인증 오류로 인한 동기화 실패 - 토큰 클리어');
            authToken.clear();
          } else {
            console.log('네트워크 오류로 인한 동기화 실패 - 기존 상태 유지');
          }
        }
      })
      .finally(() => {
        if (alive) {
          setChecking(false);
        }
      });
      
    return () => {
      alive = false;
    };
  }, [loc.pathname, role, setRole, token]);

  if (checking) return <div>세션 확인중...</div>;
  
  // 권한이 필요한 경우에만 검사
  if (require && role && role !== require) {
    console.warn(`권한 부족: 필요 권한 ${require}, 현재 권한 ${role}`);
    return <Navigate to={PATHS.forbidden} replace />;
  }
  
  // 권한이 필요하지만 역할이 아직 로드되지 않은 경우 대기
  if (require && !role) {
    return <div>권한 확인중...</div>;
  }
  
  return children;
}
