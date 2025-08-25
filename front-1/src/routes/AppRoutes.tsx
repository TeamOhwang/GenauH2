import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import { PublicOnlyRoute, ProtectedRoute } from "./ProtectedRoute";
import { PATHS, roleHome, type Role } from "./paths";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Price from "@/pages/Price";
import HydrogenPage from "@/pages/HydrogenPage";
import Setting from "@/pages/Setting";
import Admin from "@/pages/Admin";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";

import { useAuthStore } from "@/stores/useAuthStore";
import { authToken } from "@/stores/authStorage";

function RoleHomeRedirect() {
  const role = useAuthStore((s) => s.role) as Role | null;
  if (!authToken.get() || !role) return <Navigate to={PATHS.login} replace />;
  return <Navigate to={roleHome(role)} replace />;
}


export default function AppRouter() {
  return (
    <Routes>
      {/* 공용 메인 = 로그인, 로그인 상태면 홈으로 */}
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

        {/* 로그인만 필요(역할 무관) → /home 에서 역할별 리다이렉트 */}
        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route path={PATHS.home} element={<RoleHomeRedirect />} />
        </Route>

        {/* USER 전용 */}
        <Route element={<ProtectedRoute require="USER"><Outlet /></ProtectedRoute>}>
          <Route path={PATHS.dashboard} element={<Dashboard />} />
          <Route path={PATHS.price} element={<Price />} />
          <Route path={PATHS.hydrogenPage} element={<HydrogenPage />} />
          <Route path={PATHS.setting} element={<Setting />} />
        </Route>

        {/* ADMIN 전용 */}
        <Route element={<ProtectedRoute require="ADMIN"><Outlet /></ProtectedRoute>}>
          <Route path={PATHS.admin} element={<Admin />} />
        </Route>

        {/* 404  */}
        <Route path={PATHS.notFound} element={<NotFound />} />
      </Route>
    </Routes>
  );
}