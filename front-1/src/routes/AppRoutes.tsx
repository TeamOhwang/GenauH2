
import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import { PATHS } from "./paths";

import Login from "@/pages/Login";
import Home from "@/pages/Home";           
import Hourly from "@/pages/Houly";       
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
      {/* 메인은 로그인 페이지 (로그인된 사용자는 자기 홈으로 이동) */}
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


        {/* 유저 전용 */}
        <Route
          path={PATHS.home}
          element={
            <ProtectedRoute require="USER">
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.hourly}
          element={
            <ProtectedRoute require="USER">
              <Hourly />
            </ProtectedRoute>
          }
        />
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

        {/*  관리자 전용 */}
        <Route
          path={PATHS.admin}
          element={
            <ProtectedRoute require="ADMIN">
              <Admin />
            </ProtectedRoute>
          }
        />



        {/* 공개 라우트 */}
        <Route path={PATHS.about}    element={<About />} />
        <Route path={PATHS.notFound} element={<NotFound />} />

        {/* 안전망 */}
        <Route path="*" element={<Navigate to={PATHS.notFound} replace />} />
      </Route>
    </Routes>
  );
}
