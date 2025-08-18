import { Routes, Route } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import { PATHS } from "./paths";

import Home from "@/pages/Home";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path={PATHS.home} element={<Home />} />
        <Route path={PATHS.about} element={<About />} />
        <Route path={PATHS.login} element={<Login />} />   
        <Route path={PATHS.notFound} element={<NotFound />} />
      </Route>
    </Routes>
  );
}
