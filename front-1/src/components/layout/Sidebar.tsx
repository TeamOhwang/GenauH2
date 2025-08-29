import { NavLink } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChartLine, DollarSign, LayoutDashboard, Lock, Settings, ShieldUser } from "lucide-react"


export default function Sidebar() {
    const role = useAuthStore((s) => s.role);


    const userMenu = [
        { label: "대시보드", to: PATHS.dashboard, icon: <LayoutDashboard /> },
        { label: "상세 데이터", to: PATHS.facilityPage, icon: <ChartLine /> },
        { label: "수소 가격 정보", to: PATHS.price, icon: <DollarSign /> },
        { label: "설비 대시보드", to: PATHS.equipmentList, icon: <DollarSign /> },
        { label: "설정", to: PATHS.setting, icon: <Settings /> },
        // { label: "비밀번호 변경", to: PATHS.changePassword, icon: <Lock /> },
    ];

    // ADMIN 전용 메뉴 (필요시 추가)
    const adminMenu = [
        { label: "관리자 페이지", to: PATHS.admin, icon: <ShieldUser /> },
        { label: "가입 요청", to: PATHS.requestJoin, icon: <ShieldUser /> },
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
