import React, { useState, useMemo } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent } from '@/components/ui/card';

interface NotificationPayload {
    type: string;
    message: string;
    user?: any;
    timestamp: number;
    orgId?: number;
    orgName?: string;
    email?: string;
    name?: string;
    bizRegNo?: string;
    phoneNum?: string;
}

const NotificationLog: React.FC = () => {
    const { notifications, clearNotifications, isConnected } = useWebSocket();
    const [filterType, setFilterType] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // 알림 타입별 분류
    const notificationTypes = [
        { value: 'ALL', label: '전체', color: 'bg-gray-100 text-gray-800' },
        { value: 'NEW_REGISTRATION_REQUEST', label: '새 가입 요청', color: 'bg-green-100 text-green-800' },
        { value: 'REGISTRATION_APPROVED', label: '승인 완료', color: 'bg-blue-100 text-blue-800' },
        { value: 'REGISTRATION_REJECTED', label: '거부됨', color: 'bg-red-100 text-red-800' },
        { value: 'USER_SUSPENDED', label: '사용자 정지', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'TEST', label: '테스트', color: 'bg-purple-100 text-purple-800' },
        { value: 'STATUS_CHANGED', label: '상태 변경', color: 'bg-indigo-100 text-indigo-800' },
    ];

    // 필터링된 알림
    const filteredNotifications = useMemo(() => {
        let filtered = [...notifications];

        // 타입별 필터링
        if (filterType !== 'ALL') {
            filtered = filtered.filter(n => n.type === filterType);
        }

        // 검색어 필터링
        if (searchTerm) {
            filtered = filtered.filter(n => 
                n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (n.orgName && n.orgName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (n.email && n.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // 시간순 정렬 (최신순)
        return filtered.sort((a, b) => b.timestamp - a.timestamp);
    }, [notifications, filterType, searchTerm]);

    // 알림 타입별 개수
    const notificationCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        notificationTypes.forEach(type => {
            if (type.value === 'ALL') {
                counts[type.value] = notifications.length;
            } else {
                counts[type.value] = notifications.filter(n => n.type === type.value).length;
            }
        });
        return counts;
    }, [notifications]);

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'NEW_REGISTRATION_REQUEST':
                return '🆕';
            case 'REGISTRATION_APPROVED':
                return '✅';
            case 'REGISTRATION_REJECTED':
                return '❌';
            case 'USER_SUSPENDED':
                return '⏸️';
            case 'TEST':
                return '🧪';
            case 'STATUS_CHANGED':
                return '🔄';
            default:
                return '📢';
        }
    };

    const getNotificationTitle = (type: string) => {
        switch (type) {
            case 'NEW_REGISTRATION_REQUEST':
                return '새 가입 요청';
            case 'REGISTRATION_APPROVED':
                return '승인 완료';
            case 'REGISTRATION_REJECTED':
                return '거부됨';
            case 'USER_SUSPENDED':
                return '사용자 정지';
            case 'TEST':
                return '테스트';
            case 'STATUS_CHANGED':
                return '상태 변경';
            default:
                return type;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-6">
            <div className="max-w-7xl mx-auto">
                {/* 페이지 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">알림 로그</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                모든 시스템 알림을 시간순으로 확인하고 관리할 수 있습니다.
                            </p>
                        </div>
                        
                        {/* WebSocket 연결 상태 */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                            isConnected
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            <div className={`w-3 h-3 rounded-full ${
                                isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            {isConnected ? '실시간 연결됨' : '연결 해제됨'}
                        </div>
                    </div>

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                        {notificationTypes.map(type => (
                            <Card key={type.value} className="text-center">
                                <CardContent className="p-4">
                                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mb-2 ${type.color}`}>
                                        {type.label}
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {notificationCounts[type.value] || 0}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* 필터 및 검색 */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* 타입별 필터 */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    알림 타입
                                </label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {notificationTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label} ({notificationCounts[type.value] || 0})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 검색 */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    검색
                                </label>
                                <input
                                    type="text"
                                    placeholder="조직명, 이메일, 메시지로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            {/* 전체 지우기 */}
                            <div className="flex items-end">
                                <button
                                    onClick={clearNotifications}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                >
                                    전체 지우기
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 알림 목록 */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                알림 목록 ({filteredNotifications.length}개)
                            </h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                총 {notifications.length}개의 알림
                            </div>
                        </div>

                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    {filterType === 'ALL' ? '알림이 없습니다.' : '해당 타입의 알림이 없습니다.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {filteredNotifications.map((notification, index) => (
                                    <div
                                        key={`${notification.timestamp}-${index}`}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* 알림 아이콘 */}
                                            <div className="text-2xl">
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* 알림 내용 */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        notificationTypes.find(t => t.value === notification.type)?.color || 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {getNotificationTitle(notification.type)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                                                    {notification.message}
                                                </p>

                                                {/* 상세 정보 */}
                                                {(notification.orgName || notification.email || notification.bizRegNo) && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                        {notification.orgName && (
                                                            <div>조직: {notification.orgName}</div>
                                                        )}
                                                        {notification.email && (
                                                            <div>이메일: {notification.email}</div>
                                                        )}
                                                        {notification.bizRegNo && (
                                                            <div>사업자번호: {notification.bizRegNo}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NotificationLog;
