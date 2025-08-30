
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { PATHS, roleHome, type Role } from "@/routes/paths";
import { useAuthStore } from "@/stores/useAuthStore";
import { authToken } from "@/stores/authStorage";
import { useDarkModeStore } from "@/stores/useDarkModeStore";
import { LogOut, LoaderCircle, Bell } from "lucide-react";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Header() {
  const role = useAuthStore((s) => s.role) as Role | null;
  const logout = useAuthStore((s) => s.logout);
  const email = useAuthStore((s) => s.email);
  const { isDarkMode } = useDarkModeStore();
  const navigate = useNavigate();
  const { notifications, clearNotifications, isConnected } = useWebSocket();
  const [showNotifications, setShowNotifications] = useState(false);

  // 토큰과 역할로 로고 목적지 계산
  const token = authToken.get();
  const to = token && role ? roleHome(role) : PATHS.login;

  const [pending, setPending] = useState(false);

  // 다크모드 상태에 따라 body 클래스 적용
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 외부 클릭 시 알림 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (pending) return;
    const ok = window.confirm("로그아웃하시겠습니까?");
    if (!ok) return;

    setPending(true);
    try {
      await Promise.resolve(logout());
    } finally {
      setPending(false);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleViewAllRequests = () => {
    setShowNotifications(false);
    navigate(PATHS.requestJoin);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="flex flex-row justify-between items-center bg-white dark:bg-gray-800 p-3 transition-colors">
      {/*  역할별 홈 또는 로그인으로 이동 */}
      <NavLink
        to={to}
        className="ml-6 text-2xl font-bold text-blue-600 dark:text-blue-400 hover:opacity-80"
        aria-label="메인으로 이동"
      >
        GenauH2
      </NavLink>

      {/* 우측: 이메일 + 알림 + 다크모드 토글 + 로그아웃 */}
      <div className="ml-auto mr-4 flex items-center gap-3">
        <span className="font-light text-gray-600 dark:text-gray-300">{email ?? "로그인 필요"}</span>
        
        {/* 알림 아이콘 */}
        <div className="relative notification-container">
          <button
            onClick={handleNotificationClick}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            aria-label="알림"
            title={`WebSocket: ${isConnected ? '연결됨' : '연결 안됨'} | 알림: ${notifications.length}개`}
          >
            <Bell className={`w-5 h-5 ${isConnected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
            {/* WebSocket 연결 상태 표시 */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} 
                 title={isConnected ? 'WebSocket 연결됨' : 'WebSocket 연결 안됨'} />
            {/* 새로운 알림이 있을 때 빨간 점 표시 */}
            {notifications.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" 
                   style={{ top: '-2px', right: '-2px' }} />
            )}
          </button>

          {/* 알림 드롭다운 */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">알림</h3>
                  <button
                    onClick={clearNotifications}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    모두 지우기
                  </button>
                </div>
                
                {notifications.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">새로운 알림이 없습니다.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {notifications.length > 0 && (
                  <button
                    onClick={handleViewAllRequests}
                    className="w-full mt-3 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    모든 요청 보기
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <DarkModeToggle />
        <button
          onClick={handleLogout}
          disabled={pending}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 disabled:opacity-50 transition-colors"
          aria-label="로그아웃"
        >
          {pending ? <LoaderCircle className="animate-spin" /> : <LogOut className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
