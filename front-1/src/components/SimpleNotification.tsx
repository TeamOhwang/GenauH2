import { useWebSocket } from '@/hooks/useWebSocket';

export default function SimpleNotification() {
  const { isConnected, notifications } = useWebSocket();

  // 새로운 알림이 있는지 확인
  const hasNewNotifications = notifications.length > 0;

  return (
    <div className="relative">
      
      {/* 새로운 알림이 있을 때 빨간 점 표시 */}
      {hasNewNotifications && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" 
             title={`새로운 알림 ${notifications.length}개`} />
      )}
    </div>
  );
}
