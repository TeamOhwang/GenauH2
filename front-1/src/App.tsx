// App.tsx
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import AppRoutes from "@/routes/AppRoutes";
import { useWebSocket } from "@/hooks/useWebSocket";

const Splash = () => <div>로딩중...</div>;

export default function App() {
  const init = useAuthStore((s) => s.init);
  const isInit = useAuthStore((s) => s.isInit);
  const token = useAuthStore((s) => s.role);
  const orgId = useAuthStore((s) => s.orgId);

  //  WebSocket 훅은 무조건 호출
  const { connect, disconnect } = useWebSocket();

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
