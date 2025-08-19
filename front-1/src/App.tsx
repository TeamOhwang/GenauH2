
import { useEffect } from "react";
import { useAuthStore } from "@/Stores/useAuthStore";
import AppRoutes from "@/routes/AppRoutes";

function Splash() {
  return <div>로딩중...</div>; 
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  const isInit = useAuthStore((s) => s.isInit);

  useEffect(() => {
    (async () => { await init(); })();
  }, [init]);

  if (!isInit) return <Splash />;
  return <AppRoutes />;
}
