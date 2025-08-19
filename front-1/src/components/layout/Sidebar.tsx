import { PATHS } from '@/routes/paths';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white shadow-md p-4 h-full">
            <nav className="space-y-3">
                <NavLink className="block text-gray-700 hover:text-blue-500" to="#">대시보드</NavLink>
                <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.daily}>데일리 모니터링</NavLink>
                <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.weekly}>위클리 모니터링</NavLink>
                <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.monthly}>먼슬리 모니터링</NavLink>
                <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.detailed}>상세 데이터</NavLink>
                <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.price}>수소 가격 정보</NavLink>
                <NavLink className="block text-gray-700 hover:text-blue-500" to={PATHS.setting}>알림 설정</NavLink>
            </nav>
        </aside>
    )
}