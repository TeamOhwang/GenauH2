
// App.tsx (앱에서 인증 상태 확인)
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import AppRoutes from "@/routes/AppRoutes";

const Splash = () => <div>로딩중...</div>;

export default function App() {
  const init = useAuthStore((s) => s.init);
  const isInit = useAuthStore((s) => s.isInit);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("초기화 시작");
      await init();
      console.log("초기화 완료");
    };

    if (!isInit) {
      initializeAuth();
    }
  }, [isInit, init]);

  if (!isInit) return <Splash />;
  return <AppRoutes />; // 초기화 완료 후 라우팅
}