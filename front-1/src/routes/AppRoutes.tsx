
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import { PATHS, roleHome, type Role } from "./paths";

import Login from "@/pages/Login";
import Daily from "@/pages/Daily";
import Weekly from "@/pages/Weekly";
import Monthly from "@/pages/Monthly";
import Price from "@/pages/Price";
import Detailed from "@/pages/Detailed";
import Setting from "@/pages/Setting";
import Admin from "@/pages/Admin";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";


//home에 접근하면 현재 역할에 맞는 홈으로 보내는 컴포넌트
import { useAuthStore } from "@/stores/useAuthStore";
import { authToken } from "@/stores/authStorage";
function RoleHomeRedirect() {
  const role = useAuthStore((s) => s.role) as Role | null;
  // 토큰 없거나 역할을 아직 못 정했으면 로그인으로
  if (!authToken.get() || !role) return <Navigate to={PATHS.login} replace />;
  return <Navigate to={roleHome(role)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 로그인(메인) - 로그인되어 있으면 홈으로 */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path={PATHS.login}
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route element={<RootLayout />}>
        {/* 공개 */}
        <Route path={PATHS.about} element={<About />} />

        {/*  로그인만 필요(역할 무관) 그룹: /home 역할별 리다이렉트 */}
        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route path={PATHS.home} element={<RoleHomeRedirect />} />
        </Route>

        {/* USER 전용 */}
        <Route element={<ProtectedRoute require="USER"><Outlet /></ProtectedRoute>}>
          <Route path={PATHS.daily} element={<Daily />} />
          <Route path={PATHS.weekly} element={<Weekly />} />
          <Route path={PATHS.monthly} element={<Monthly />} />
          <Route path={PATHS.price} element={<Price />} />
          <Route path={PATHS.detailed} element={<Detailed />} />
          <Route path={PATHS.setting} element={<Setting />} />
        </Route>

        {/* ADMIN 전용 */}
        <Route element={<ProtectedRoute require="ADMIN"><Outlet /></ProtectedRoute>}>
          <Route path={PATHS.admin} element={<Admin />} />
        </Route>

        {/* 403  */}
        <Route path={PATHS.notFound} element={<NotFound />} />
      </Route>
    </Routes>
  );
}
