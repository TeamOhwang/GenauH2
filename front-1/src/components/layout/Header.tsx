
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { PATHS, roleHome, type Role } from "@/routes/paths";
import { useAuthStore } from "@/stores/useAuthStore";
import { authToken } from "@/stores/authStorage";

export default function Header() {
  const role = useAuthStore((s) => s.role) as Role | null;
  const logout = useAuthStore((s) => s.logout);
  const email = useAuthStore((s) => s.email); 

  // 토큰과 역할로 로고 목적지 계산
  const token = authToken.get();
  const to = token && role ? roleHome(role) : PATHS.login;

  const [pending, setPending] = useState(false);

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
    <header className="flex flex-row justify-between items-center bg-white p-3">
      {/*  역할별 홈 또는 로그인으로 이동 */}
      <NavLink
        to={to}
        className="ml-6 text-2xl font-bold text-blue-600 hover:opacity-80"
        aria-label="메인으로 이동"
      >
        GenauH2
      </NavLink>

      {/* 우측: 이메일(임시) + 로그아웃 */}
      <div className="ml-auto mr-4 flex items-center gap-3">
        <span className="font-semibold text-gray-600">{email ?? "로그인 필요"}</span>
        <button
          onClick={handleLogout}
          disabled={pending}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          aria-label="로그아웃"
        >
          {pending ? "로그아웃 중…" : "로그아웃"}
        </button>
      </div>
    </header>
  );
}
