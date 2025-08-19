import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import { PATHS } from "./paths";

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

export default function AppRoutes() {
  return (
    <Routes>
      {/* 메인 → 로그인 (로그인된 사용자는 자기 홈으로 이동) */}
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

      {/* 공용 레이아웃 하위 */}
      <Route element={<RootLayout />}>
        {/* /home 접근 시 /daily로 리다이렉트 */}
        <Route path={PATHS.home} element={<Navigate to={PATHS.daily} replace />} />

        {/* USER 전용 */}
        <Route
          path={PATHS.daily}
          element={
            <ProtectedRoute require="USER">
              <Daily />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.weekly}
          element={
            <ProtectedRoute require="USER">
              <Weekly />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.monthly}
          element={
            <ProtectedRoute require="USER">
              <Monthly />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.price}
          element={
            <ProtectedRoute require="USER">
              <Price />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.detailed}
          element={
            <ProtectedRoute require="USER">
              <Detailed />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.setting}
          element={
            <ProtectedRoute require="USER">
              <Setting />
            </ProtectedRoute>
          }
        />

        {/* ADMIN 전용 */}
        <Route
          path={PATHS.admin}
          element={
            <ProtectedRoute require="ADMIN">
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* 공개 라우트 */}
        <Route path={PATHS.about} element={<About />} />

        {/* 404 */}
        <Route path={PATHS.notFound} element={<NotFound />} />
      </Route>
    </Routes>
  );
}
