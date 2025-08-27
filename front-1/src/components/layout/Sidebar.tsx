// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useAuthStore } from "@/stores/useAuthStore";

type Role = "USER" | "SUPERVISOR" | null;
const roleHome = (r: Role) => (r === "SUPERVISOR" ? PATHS.admin : PATHS.dashboard);

export default function Sidebar() {
    const role = useAuthStore((s) => s.role);

    // 공통(최상단) – 대시보드는 역할에 따라 목적지 다르게
    const commonTop = [{ 
        label: "대시보드", 
        to: role === "SUPERVISOR" ? PATHS.admin : PATHS.dashboard 
    }];

    // USER 전용 메뉴
    const userMenu = [
        { label: "상세 데이터", to: PATHS.detailed },
        { label: "수소 가격 정보", to: PATHS.price },
        { label: "설정", to: PATHS.setting },
    ];

    // ADMIN 전용 메뉴 (필요시 추가)
    const adminMenu = [
        { label: "관리자 홈", to: PATHS.admin },
    ];

    const menu = role === "SUPERVISOR" ? [...commonTop, ...adminMenu] : [...commonTop, ...userMenu];

    return (
        <aside className="w-64 bg-white shadow-md p-4 h-full">
            <nav className="space-y-3 mt-10">
                {menu.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg transition-colors ${
                                isActive 
                                    ? "text-blue-600 bg-blue-50" 
                                    : "text-gray-700 hover:text-blue-500 hover:bg-gray-50"
                            }`}
                        style={({ isActive }) => ({
                            fontWeight: isActive ? 900 : 500
                        })}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
