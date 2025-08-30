import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

// SockJS를 동적으로 로드
let SockJS: any = null;

// SockJS 모듈을 동적으로 가져오는 함수
const loadSockJS = async () => {
    if (SockJS) return SockJS;
    
    try {
        // 동적 import로 SockJS 로드
        const module = await import('sockjs-client');
        // 타입 문제를 우회하여 SockJS 생성자 가져오기
        SockJS = (module as any).default || (module as any);
        return SockJS;
    } catch (error) {
        console.error('SockJS 모듈 로드 실패:', error);
        throw error;
    }
};

export interface NotificationPayload {
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

export interface StatsPayload {
    pendingCount: number;
    totalUsers: number;
    timestamp: number;
}

// 전역 알림 상태 관리
let globalNotifications: NotificationPayload[] = [];
let globalStats: StatsPayload | null = null;
let globalIsConnected = false;
const listeners: Set<() => void> = new Set();

// 전역 상태 업데이트 함수
const updateGlobalState = () => {
    listeners.forEach(listener => listener());
};

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(globalIsConnected);
    const [notifications, setNotifications] = useState<NotificationPayload[]>(globalNotifications);
    const [stats, setStats] = useState<StatsPayload | null>(globalStats);
    const clientRef = useRef<Client | null>(null);

    // 전역 상태 동기화
    useEffect(() => {
        const syncWithGlobal = () => {
            setIsConnected(globalIsConnected);
            setNotifications([...globalNotifications]);
            setStats(globalStats);
        };

        listeners.add(syncWithGlobal);
        syncWithGlobal(); // 초기 동기화

        return () => {
            listeners.delete(syncWithGlobal);
        };
    }, []);

    const connect = useCallback(async () => {
        if (clientRef.current?.connected) return;

        try {
            // SockJS 모듈 로드
            await loadSockJS();
            
            // SockJS를 사용한 WebSocket 연결 - /gh 컨텍스트 경로 포함
            const sockUrl = `/gh/ws`; // /gh 경로 포함
            console.log('SockJS WebSocket 연결 시도 (/gh 포함):', sockUrl);

            const client = new Client({
                webSocketFactory: () => {
                    const sock = new SockJS(sockUrl);
                    
                    sock.onopen = () => {
                        console.log('SockJS 연결 성공 (/gh 포함)');
                    };
                    
                    sock.onerror = (error: Event) => {
                        console.error('SockJS 연결 오류 (/gh 포함):', error);
                    };
                    
                    sock.onclose = (event: CloseEvent) => {
                        console.log('SockJS 연결 종료 (/gh 포함):', event.code, event.reason);
                    };
                    
                    return sock;
                },
                debug: (str) => {
                    console.log('STOMP Debug:', str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                connectionTimeout: 10000, // 연결 타임아웃 10초
            });

            client.onConnect = () => {
                console.log('STOMP 연결 성공');
                globalIsConnected = true;
                setIsConnected(true);

                // 관리자 알림 구독
                client.subscribe('/topic/admin/notifications', (message) => {
                    try {
                        const notification: NotificationPayload = JSON.parse(message.body);
                        globalNotifications = [notification, ...globalNotifications].slice(0, 50); // 최근 50개만 유지
                        setNotifications(globalNotifications);
                        console.log('새로운 알림 수신:', notification);
                        
                        // 전역 상태 업데이트 알림
                        updateGlobalState();
                    } catch (error) {
                        console.error('알림 파싱 오류:', error);
                    }
                });

                // 관리자 통계 구독
                client.subscribe('/topic/admin/stats', (message) => {
                    try {
                        const statsData: StatsPayload = JSON.parse(message.body);
                        globalStats = statsData;
                        setStats(statsData);
                        console.log('통계 업데이트 수신:', statsData);
                        
                        // 전역 상태 업데이트 알림
                        updateGlobalState();
                    } catch (error) {
                        console.error('통계 파싱 오류:', error);
                    }
                });

                // 연결 성공 후 테스트 메시지 전송
                setTimeout(() => {
                    try {
                        client.publish({
                            destination: '/app/test',
                            body: JSON.stringify({ message: '클라이언트 연결 테스트' })
                        });
                        console.log('테스트 메시지 전송 완료');
                    } catch (error) {
                        console.error('테스트 메시지 전송 실패:', error);
                    }
                }, 1000);
            };

            client.onDisconnect = () => {
                console.log('STOMP 연결 해제');
                globalIsConnected = false;
                setIsConnected(false);
                updateGlobalState();
            };

            client.onStompError = (frame) => {
                console.error('STOMP 오류:', frame);
                globalIsConnected = false;
                setIsConnected(false);
                updateGlobalState();
            };

            client.onWebSocketError = (error) => {
                console.error('WebSocket 연결 오류:', error);
                globalIsConnected = false;
                setIsConnected(false);
                updateGlobalState();
                
                // 연결 실패 시 10초 후 재시도
                setTimeout(() => {
                    if (!clientRef.current?.connected) {
                        console.log('WebSocket 재연결 시도...');
                        connect();
                    }
                }, 10000);
            };

            try {
                client.activate();
                clientRef.current = client;
            } catch (error) {
                console.error('WebSocket 클라이언트 활성화 실패:', error);
            }
        } catch (error) {
            console.error('SockJS 모듈 로드 실패:', error);
            // 연결 실패 시 10초 후 재시도
            setTimeout(() => {
                if (!clientRef.current?.connected) {
                    console.log('SockJS 로드 실패 후 재시도...');
                    connect();
                }
            }, 10000);
        }
    }, []);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            globalIsConnected = false;
            setIsConnected(false);
            updateGlobalState();
        }
    }, []);

    const clearNotifications = useCallback(() => {
        globalNotifications = [];
        setNotifications([]);
        updateGlobalState();
    }, []);

    const removeNotification = useCallback((timestamp: number) => {
        globalNotifications = globalNotifications.filter(n => n.timestamp !== timestamp);
        setNotifications(globalNotifications);
        updateGlobalState();
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
