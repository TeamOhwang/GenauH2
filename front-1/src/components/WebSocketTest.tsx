import * as React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const WebSocketTest: React.FC = () => {
    const { isConnected, notifications, stats, clearNotifications, removeNotification } = useWebSocket();

    const testWebSocket = async () => {
        try {
            const response = await fetch('/gh/api/websocket/test'); // /gh 경로 추가
            const data = await response.json();
            console.log('WebSocket 테스트 응답:', data);
            alert(`WebSocket 테스트 결과: ${data.message}`);
        } catch (error) {
            console.error('WebSocket 테스트 실패:', error);
            alert('WebSocket 테스트 실패: 백엔드 서버에 연결할 수 없습니다.');
        }
    };

    const checkWebSocketStatus = async () => {
        try {
            const response = await fetch('/gh/api/websocket/status'); // /gh 경로 추가
            const data = await response.json();
            console.log('WebSocket 상태 확인:', data);
            alert(`WebSocket 상태: ${data.websocket_enabled ? '활성화' : '비활성화'}`);
        } catch (error) {
            console.error('WebSocket 상태 확인 실패:', error);
            alert('WebSocket 상태 확인 실패');
        }
    };

    const testDirectSockJS = () => {
        try {
            // useWebSocket 훅의 연결 상태를 테스트
            if (isConnected) {
                console.log('useWebSocket 훅을 통한 연결 상태: 성공');
                alert('useWebSocket 훅을 통한 연결이 성공적으로 이루어졌습니다!');
            } else {
                console.log('useWebSocket 훅을 통한 연결 상태: 실패');
                alert('useWebSocket 훅을 통한 연결이 아직 이루어지지 않았습니다.');
            }
        } catch (error) {
            console.error('연결 상태 확인 실패:', error);
            alert('연결 상태를 확인할 수 없습니다.');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">WebSocket 연결 테스트</h2>

                {/* 연결 상태 */}
                <div className="mb-6">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isConnected
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                        {isConnected ? '연결됨' : '연결 해제됨'}
                    </div>
                </div>

                {/* 테스트 버튼들 */}
                <div className="mb-6 space-y-2">
                    <button
                        onClick={testWebSocket}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
                    >
                        백엔드 WebSocket 테스트
                    </button>

                    <button
                        onClick={checkWebSocketStatus}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                    >
                        WebSocket 상태 확인
                    </button>

                    <button
                        onClick={testDirectSockJS}
                        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                    >
                        연결 상태 확인
                    </button>

                    <p className="text-sm text-gray-600 mt-2">
                        이 버튼들을 클릭하여 WebSocket 연결 문제를 진단할 수 있습니다.
                    </p>
                </div>

                {/* 통계 정보 */}
                {stats && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">실시간 통계</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-medium">대기 중인 요청:</span>
                                <span className="ml-2 text-blue-600">{stats.pendingCount}</span>
                            </div>
                            <div>
                                <span className="font-medium">전체 사용자:</span>
                                <span className="ml-2 text-blue-600">{stats.totalUsers}</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            업데이트: {new Date(stats.timestamp).toLocaleString('ko-KR')}
                        </p>
                    </div>
                )}

                {/* 알림 목록 */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">실시간 알림</h3>
                        <button
                            onClick={clearNotifications}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                        >
                            모두 지우기
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                아직 알림이 없습니다
                            </div>
                        ) : (
                            notifications.map((notification, index) => (
                                <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${notification.type === 'TEST' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {notification.type}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(notification.timestamp).toLocaleString('ko-KR')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-900">{notification.message}</p>
                                            {notification.user && (
                                                <div className="mt-2 text-xs text-gray-600">
                                                    사용자: {JSON.stringify(notification.user)}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeNotification(notification.timestamp)}
                                            className="ml-4 text-gray-400 hover:text-red-600"
                                            title="삭제"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 연결 정보 */}
                <div className="p-4 bg-gray-50 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">연결 정보</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>SockJS URL: /gh/ws (컨텍스트 경로 포함)</p>
                        <p>구독 토픽: /topic/admin/notifications, /topic/admin/stats</p>
                        <p>메시지 브로커: /topic</p>
                        <p>애플리케이션 접두사: /app</p>
                        <p className="text-red-600 font-medium">연결 실패 시 백엔드 서버가 실행 중인지 확인하세요.</p>
                        <p className="text-blue-600 font-medium">SockJS를 사용하여 /gh 컨텍스트 경로를 통해 연결합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebSocketTest;
