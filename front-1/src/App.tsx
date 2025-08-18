import AppRoutes from "@/routes/AppRoutes";
import { useEffect } from "react";
import { useAuthStore } from "./Stores/useAuthStore";

export default function App() {

    useEffect(() => {
    useAuthStore.getState().init();   // 새로고침 시 role 복원
  }, []);

  return <AppRoutes />;
}