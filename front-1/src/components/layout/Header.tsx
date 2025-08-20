// src/components/Header.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Header() {
  const logout = useAuthStore((s) => s.logout);
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    if (pending) return;

    // 확인/취소 다이얼로그
    const ok = window.confirm("로그아웃하시겠습니까?");
    if (!ok) return;

    setPending(true);
    try {
      await Promise.resolve(logout());
      // logout 내부에서 /login으로 이동 처리됨
    } finally {
      setPending(false);
    }
  };

  return (
    <header className="flex flex-row justify-between items-center bg-white p-3">
      <NavLink
        to={PATHS.home}
        className="ml-6 text-2xl font-bold text-blue-600 hover:opacity-80"
        aria-label="메인으로 이동"
      >
        GenauH2
      </NavLink>

      <div className="ml-auto mr-4 flex items-center gap-3">
        <span className="font-semibold text-gray-600">UserEmail@test.com</span>
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
