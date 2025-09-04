// App.tsx
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import AppRoutes from "@/routes/AppRoutes";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";

const Splash = () => <div>로딩중...</div>;

export default function App() {
  const init = useAuthStore((s) => s.init);
  const isInit = useAuthStore((s) => s.isInit);
  const token = useAuthStore((s) => s.role);
  const orgId = useAuthStore((s) => s.orgId);

  //  WebSocket 훅은 무조건 호출
  const { connect, disconnect } = useWebSocket();

  // 전역 에러 처리
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('처리되지 않은 Promise 거부:', event.reason);
      
      // 403 에러로 인한 리다이렉트 처리
      if (event.reason?._redirect === "/403") {
        event.preventDefault();
        window.location.href = PATHS.forbidden;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (!isInit) {
      (async () => {
        console.log("초기화 시작");
        await init();
        console.log("초기화 완료");
      })();
    }
  }, [isInit, init]);

  //  init 완료 + 토큰 + orgId 있을 때만 연결
  useEffect(() => {
    if (isInit && token && orgId) {
      console.log("WebSocket 연결 시작");
      connect();
    } else {
      console.log("WebSocket 연결 끊김");
      disconnect();
    }
  }, [isInit, token, orgId, connect, disconnect]);

  if (!isInit) return <Splash />;
  return <AppRoutes />;
}
