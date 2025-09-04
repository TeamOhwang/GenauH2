import { NavLink } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Bell, ChartLine, DollarSign, LayoutDashboard, Lock, Settings, ShieldUser, TestTube, Gauge, Factory, Fuel, Clipboard, Cctv, X } from "lucide-react"
import TankDashboard from "@/pages/TankDashboard";


export default function Sidebar() {
    const role = useAuthStore((s) => s.role);
    const { isOpen, isMobile, setSidebarOpen } = useSidebarStore();

    const userMenu = [
        { label: "대시보드", to: PATHS.dashboard, icon: <LayoutDashboard /> },
        { label: "통합 생산 현황", to: PATHS.facilityPage, icon: <ChartLine /> },
        { label: "설비별 생산현황", to: PATHS.equipmentList, icon: <Factory /> },
        { label: "수소탱크 모니터링", to: PATHS.TankDashboard, icon: <Fuel /> },
        { label: "수소 전해조 모니터링", to: PATHS.test, icon: <Gauge /> },
        { label: "수소 판매가 현황판", to: PATHS.price, icon: <DollarSign /> },
        // { label: "알림 기록", to: PATHS.userAlam, icon: <Bell /> },
        { label: "설정", to: PATHS.setting, icon: <Settings /> },
        // { label: "비밀번호 변경", to: PATHS.changePassword, icon: <Lock /> },
    ];

    // ADMIN 전용 메뉴 (필요시 추가)
    const adminMenu = [
        { label: "관리자 페이지", to: PATHS.admin, icon: <ShieldUser /> },
        { label: "가입 요청", to: PATHS.requestJoin, icon: <Clipboard /> },
        { label: "활동 로그", to: PATHS.notificationLog, icon: <Cctv /> },
    ];

    const menu = role === "SUPERVISOR" ? [ ...adminMenu] : [ ...userMenu];

    // 모바일에서 사이드바가 열려있지 않으면 렌더링하지 않음
    if (isMobile && !isOpen) {
        return null;
    }

    return (
        <>
            {/* 모바일 오버레이 */}
            {isMobile && isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* 사이드바 */}
            <aside className={`
                fixed lg:static top-0 left-0 z-50 lg:z-auto
                w-64 h-full bg-white dark:bg-gray-800 shadow-md transition-transform duration-300 ease-in-out
                ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
                ${!isMobile ? 'translate-x-0' : ''}
            `}>
                {/* 모바일 닫기 버튼 */}
                {isMobile && (
                    <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <nav className="space-y-3 p-4">
                    {menu.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => isMobile && setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    isActive 
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                                        : "text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                            style={({ isActive }) => ({
                                fontWeight: isActive ? 600 : 500
                            })}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}
