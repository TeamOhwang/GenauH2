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
const Setting = lazy(() => import("@/pages/Setting"));
const Admin = lazy(() => import("@/pages/Admin"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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

        <Route element={<RootLayout />}>
          <Route path={PATHS.about} element={<About />} />

          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path={PATHS.home} element={<RoleHomeRedirect />} />
          </Route>

          <Route element={<ProtectedRoute require="USER"><Outlet /></ProtectedRoute>}>
            <Route path={PATHS.dashboard} element={<Dashboard />} />
            <Route path={PATHS.price} element={<Price />} />
            <Route path={PATHS.facilityPage} element={<FacilityPage />} /> 
            <Route path={PATHS.setting} element={<Setting />} />
            {/* <Route path={PATHS.changePassword} element={<ChangePassword />} /> */}
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
