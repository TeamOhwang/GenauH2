import { NavLink } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useAuthStore } from "@/stores/useAuthStore";
import { Bell, ChartLine, DollarSign, LayoutDashboard, Lock, Settings, ShieldUser, TestTube, Gauge, Factory, Fuel } from "lucide-react"
import TankDashboard from "@/pages/TankDashboard";


export default function Sidebar() {
    const role = useAuthStore((s) => s.role);


    const userMenu = [
        { label: "대시보드", to: PATHS.dashboard, icon: <LayoutDashboard /> },
        { label: "생산 집계 데이터", to: PATHS.facilityPage, icon: <ChartLine /> },
        { label: "수소 생산 설비", to: PATHS.equipmentList, icon: <Factory /> },
        { label: "수소탱크", to: PATHS.TankDashboard, icon: <Fuel /> },
        { label: "수소 전해조 모니터링", to: PATHS.test, icon: <Gauge /> },
        { label: "수소 가격 정보", to: PATHS.price, icon: <DollarSign /> },
        { label: "알림 기록", to: PATHS.userAlam, icon: <Bell /> },
        { label: "설정", to: PATHS.setting, icon: <Settings /> },
        // { label: "비밀번호 변경", to: PATHS.changePassword, icon: <Lock /> },
    ];

    // ADMIN 전용 메뉴 (필요시 추가)
    const adminMenu = [
        { label: "관리자 페이지", to: PATHS.admin, icon: <ShieldUser /> },
        { label: "가입 요청", to: PATHS.requestJoin, icon: <ShieldUser /> },
        { label: "활동 로그", to: PATHS.notificationLog, icon: <ShieldUser /> },
    ];

    const menu = role === "SUPERVISOR" ? [ ...adminMenu] : [ ...userMenu];

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 h-full transition-colors">
            <nav className="space-y-3">
                {menu.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                isActive 
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                                    : "text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        style={({ isActive }) => ({
                            fontWeight: isActive ? 900 : 500
                        })}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
