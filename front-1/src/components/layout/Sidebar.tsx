// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useAuthStore } from "@/stores/useAuthStore"; 

type Role = "USER" | "ADMIN" | null;
const roleHome = (r: Role) => (r === "ADMIN" ? PATHS.admin : PATHS.dashboard);

export default function Sidebar() {
  const role = useAuthStore((s) => s.role);

  // 공통(최상단)
  const commonTop = [{ label: "대시보드", to: roleHome(role) }];

  // USER 전용 메뉴
  const userMenu = [
    { label: "수소 생산 분석", to: PATHS.facilityKpiPage },    
    { label: "수소 가격 정보", to: PATHS.price },
    { label: "설정", to: PATHS.setting },
  ];

  // ADMIN 전용 (필요 시 확장)
  const adminMenu = [{ label: "관리자 홈", to: PATHS.admin }];

  const menu = role === "ADMIN" ? [...commonTop, ...adminMenu] : [...commonTop, ...userMenu];

  return (
    <aside className="w-64 bg-white shadow-md p-4 h-full">
      <nav className="space-y-3">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block ${isActive ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-500"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
