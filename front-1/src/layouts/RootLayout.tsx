import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import Main from "@/components/layout/Main";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout() {
  return (
    <div className="bg-gray-100 flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden scrollbar-hide">
        <Sidebar/>
        <Main>
          <Outlet />
        </Main>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
