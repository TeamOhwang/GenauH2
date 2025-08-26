// src/router/AppRouter.tsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import RootLayout from "@/layouts/RootLayout";
import { PublicOnlyRoute, ProtectedRoute } from "./ProtectedRoute";
import { PATHS, roleHome, type Role } from "./paths";
import { useAuthStore } from "@/stores/useAuthStore";
import { authToken } from "@/Stores/authStorage";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Price = lazy(() => import("@/pages/Price"));
const FacilityKpiPage = lazy(() => import("@/pages/FacilityKpiPage"));
const Setting = lazy(() => import("@/pages/Setting"));
const Admin = lazy(() => import("@/pages/Admin"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function RoleHomeRedirect() {
  const role = useAuthStore((s) => s.role) as Role | null;
  const token = authToken.get();
  
  // console.log("=== RoleHomeRedirect 디버깅 ===");
  // console.log("토큰:", token);
  // console.log("현재 role:", role);
  // console.log("roleHome 결과:", role ? roleHome(role) : "role 없음");
  // console.log("=============================");
  
  if (!token || !role) {
    // console.log("❌ 리다이렉트 실패: 토큰 또는 role 없음");
    return <Navigate to={PATHS.login} replace />;
  }
  
  // const targetPath = roleHome(role);
  // console.log("✅ 리다이렉트 성공:", targetPath);
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

        <Route element={<RootLayout />}>
          <Route path={PATHS.about} element={<About />} />

          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path={PATHS.home} element={<RoleHomeRedirect />} />
          </Route>

          <Route element={<ProtectedRoute require="USER"><Outlet /></ProtectedRoute>}>
            <Route path={PATHS.dashboard} element={<Dashboard />} />
            <Route path={PATHS.price} element={<Price />} />
            <Route path={PATHS.facilityKpiPage} element={<FacilityKpiPage />} /> 
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
