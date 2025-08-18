import { Routes, Route } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import { PATHS } from "./paths";

import Home from "@/pages/Home";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Hourly from "@/pages/Houly";
import Daily from "@/pages/Daily";
import Weekly from "@/pages/Weekly";
import Monthly from "@/pages/Monthly";
import Price from "@/pages/Price";
import Detailed from "@/pages/Detailed";
import Setting from "@/pages/Setting";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path={PATHS.home} element={<Home />} />
        <Route path={PATHS.about} element={<About />} />
        <Route path={PATHS.login} element={<Login />} />   
        <Route path={PATHS.hourly} element={<Hourly/>} />
        <Route path={PATHS.daily} element={<Daily/>} />
        <Route path={PATHS.weekly} element={<Weekly/>} />
        <Route path={PATHS.monthly} element={<Monthly/>} />
        <Route path={PATHS.detailed} element={<Detailed/>} />
        <Route path={PATHS.price} element={<Price/>} />
        <Route path={PATHS.setting} element={<Setting/>} />
        <Route path={PATHS.notFound} element={<NotFound />} />
      </Route>
    </Routes>
  );
}
