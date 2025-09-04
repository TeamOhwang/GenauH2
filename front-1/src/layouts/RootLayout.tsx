import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Main from "@/components/layout/Main";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { useSidebarStore } from "@/stores/useSidebarStore";

export default function RootLayout() {
  const { setMobile } = useSidebarStore();

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      setMobile(isMobile);
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setMobile]);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex flex-col h-screen overflow-hidden transition-colors">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar/>
        <Main>
          <Outlet />
        </Main>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
