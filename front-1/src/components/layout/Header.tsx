
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { PATHS, roleHome, type Role } from "@/routes/paths";
import { useAuthStore } from "@/stores/useAuthStore";
import { authToken } from "@/stores/authStorage";
import { useDarkModeStore } from "@/stores/useDarkModeStore";
import { LogOut, LoaderCircle } from "lucide-react";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

export default function Header() {
  const role = useAuthStore((s) => s.role) as Role | null;
  const logout = useAuthStore((s) => s.logout);
  const email = useAuthStore((s) => s.email);
  const { isDarkMode } = useDarkModeStore();

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

      {/* 우측: 이메일(임시) + 다크모드 토글 + 로그아웃 */}
      <div className="ml-auto mr-4 flex items-center gap-3">
        <span className="font-light text-gray-600 dark:text-gray-300">{email ?? "로그인 필요"}</span>
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
