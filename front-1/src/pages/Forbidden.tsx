import { Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">403</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            접근 권한이 없습니다
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.
          </p>
        </div>
        <div className="space-y-4">
          <Link
            to={PATHS.dashboard}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            대시보드로 돌아가기
          </Link>
          <Link
            to={PATHS.login}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}