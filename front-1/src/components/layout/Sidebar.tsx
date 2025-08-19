import { PATHS } from '@/routes/paths';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/Stores/useAuthStore';

export default function Sidebar() {
    const role = useAuthStore((s) => s.role);
    return (
        <aside className="w-64 bg-white shadow-md p-4 h-full">
            <nav className="space-y-3">
                {/* 공통 메뉴 */}
                <NavLink className="block text-gray-700 hover:text-blue-500" to="#">대시보드</NavLink>
                {/* 유저 전용 메뉴 */}
                {role === "USER" && <>
                    <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.daily}>데일리 모니터링</NavLink>
                    <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.weekly}>위클리 모니터링</NavLink>
                    <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.monthly}>먼슬리 모니터링</NavLink>
                    <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.detailed}>상세 데이터</NavLink>
                    <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.price}>수소 가격 정보</NavLink>
                    <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.setting}>알림 설정</NavLink>
                </>}
                {/* 관리자 전용 메뉴 */}
                {role === "ADMIN" && <>
                    <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.admin}>관리자 대시보드</NavLink>
                    {/* 필요시 관리자만의 추가 메뉴 */}
                </>}
            </nav>
        </aside>
    )
}