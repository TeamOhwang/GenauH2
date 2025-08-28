import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import RootLayout from "@/layouts/RootLayout";
import { PublicOnlyRoute, ProtectedRoute } from "./ProtectedRoute";
import { PATHS, roleHome, type Role } from "./paths";
import { useAuthStore } from "@/stores/useAuthStore";
import { authToken } from "@/stores/authStorage";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Price = lazy(() => import("@/pages/Price"));
const FacilityPage = lazy(() => import("@/pages/FacilityPage"));
const EquipmentList = lazy(() => import("@/pages/EquipmentList"));
const Setting = lazy(() => import("@/pages/Setting"));
const Admin = lazy(() => import("@/pages/Admin"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// 통합된 ChangePassword 컴포넌트 (일반 모드 + 이메일 리셋 모드 지원)
const ChangePassword = lazy(() => import("@/pages/ChangePassword"));

function RoleHomeRedirect() {
  const role = useAuthStore((s) => s.role) as Role | null;
  const token = authToken.get();
  
  if (!token || !role) {
    return <Navigate to={PATHS.login} replace />;
  }
  return <Navigate to={roleHome(role)} replace />;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="p-6">로딩중…</div>}>
      <Routes>
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

        {/* 비밀번호 변경 페이지 - URL 파라미터에 따라 모드 자동 판단 */}
        <Route
          path={PATHS.changePassword}
          element={<ChangePassword />}
        />

        <Route element={<RootLayout />}>
          <Route path={PATHS.about} element={<About />} />

          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path={PATHS.home} element={<RoleHomeRedirect />} />
          </Route>

          <Route element={<ProtectedRoute require="USER"><Outlet /></ProtectedRoute>}>
            <Route path={PATHS.dashboard} element={<Dashboard />} />
            <Route path={PATHS.price} element={<Price />} />
            <Route path={PATHS.facilityPage} element={<FacilityPage />} /> 
            <Route path={PATHS.equipmentList} element={<EquipmentList />} /> 
            <Route path={PATHS.setting} element={<Setting />} />
          </Route>

          <Route element={<ProtectedRoute require="SUPERVISOR"><Outlet /></ProtectedRoute>}>
            <Route path={PATHS.admin} element={<Admin />} />
          </Route>

          <Route path={PATHS.notFound} element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}