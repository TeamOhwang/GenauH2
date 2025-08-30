import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export interface NotificationPayload {
    type: string;
    message: string;
    user: any;
    timestamp: number;
}

export interface StatsPayload {
    pendingCount: number;
    totalUsers: number;
    timestamp: number;
}

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
    const [stats, setStats] = useState<StatsPayload | null>(null);
    const clientRef = useRef<Client | null>(null);

    const connect = useCallback(() => {
        if (clientRef.current?.connected) return;

        // WebSocket 연결 상태 확인 - 포트를 8088로 수정
        const wsUrl = `ws://${window.location.hostname}:8088/ws`;
        console.log('WebSocket 연결 시도:', wsUrl);

        const client = new Client({
            webSocketFactory: () => {
                const ws = new WebSocket(wsUrl);
                
                ws.onopen = () => {
                    console.log('WebSocket 연결 성공');
                };
                
                ws.onerror = (error) => {
                    console.error('WebSocket 연결 오류:', error);
                };
                
                ws.onclose = (event) => {
                    console.log('WebSocket 연결 종료:', event.code, event.reason);
                };
                
                return ws;
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('웹소켓 연결 성공');
            setIsConnected(true);

            // 관리자 알림 구독
            client.subscribe('/topic/admin/notifications', (message) => {
                try {
                    const notification: NotificationPayload = JSON.parse(message.body);
                    setNotifications(prev => [notification, ...prev].slice(0, 50)); // 최근 50개만 유지
                    console.log('새로운 알림 수신:', notification);
                } catch (error) {
                    console.error('알림 파싱 오류:', error);
                }
            });

            // 관리자 통계 구독
            client.subscribe('/topic/admin/stats', (message) => {
                try {
                    const statsData: StatsPayload = JSON.parse(message.body);
                    setStats(statsData);
                    console.log('통계 업데이트 수신:', statsData);
                } catch (error) {
                    console.error('통계 파싱 오류:', error);
                }
            });
        };

        client.onDisconnect = () => {
            console.log('웹소켓 연결 해제');
            setIsConnected(false);
        };

        client.onStompError = (frame) => {
            console.error('STOMP 오류:', frame);
            setIsConnected(false);
        };

        client.onWebSocketError = (error) => {
            console.error('WebSocket 연결 오류:', error);
            setIsConnected(false);
            
            // 연결 실패 시 10초 후 재시도
            setTimeout(() => {
                if (!clientRef.current?.connected) {
                    console.log('WebSocket 재연결 시도...');
                    connect();
                }
            }, 10000);
        };

        client.activate();
        clientRef.current = client;
    }, []);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            setIsConnected(false);
        }
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const removeNotification = useCallback((timestamp: number) => {
        setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
    }, []);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        notifications,
        stats,
        clearNotifications,
        removeNotification,
        connect,
        disconnect,
    };
}
