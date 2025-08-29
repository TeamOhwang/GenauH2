import { Moon, Sun } from 'lucide-react';
import { useDarkModeStore } from '@/stores/useDarkModeStore';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkModeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}
