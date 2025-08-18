import { useEffect } from "react";
import { useAuthStore } from "@/Stores/useAuthStore";
import AppRoutes from "@/routes/AppRoutes";

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, [init]);
  return <AppRoutes />;
}