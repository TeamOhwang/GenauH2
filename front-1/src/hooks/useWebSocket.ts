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

// 전역 WebSocket 클라이언트 관리
let globalClient: Client | null = null;
let isConnecting = false;

// 전역 상태 업데이트 함수
const updateGlobalState = () => {
    listeners.forEach(listener => listener());
};

// 전역 WebSocket 연결 관리
class WebSocketManager {
    private static instance: WebSocketManager;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 5000;

    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    async connect(): Promise<void> {
        if (globalClient?.connected || isConnecting) {
            console.log('WebSocket 이미 연결됨 또는 연결 중');
            return;
        }

        isConnecting = true;
        try {
            await loadSockJS();
            
            const sockUrl = `/gh/ws`;
            console.log('전역 WebSocket 연결 시도:', sockUrl);

            const client = new Client({
                webSocketFactory: () => {
                    const sock = new SockJS(sockUrl);
                    
                    sock.onopen = () => {
                        console.log('SockJS 연결 성공');
                    };
                    
                    sock.onerror = (error: Event) => {
                        console.error('SockJS 연결 오류:', error);
                    };
                    
                    sock.onclose = (event: CloseEvent) => {
                        console.log('SockJS 연결 종료:', event.code, event.reason);
                        this.handleDisconnect();
                    };
                    
                    return sock;
                },
                debug: (str) => {
                    console.log('STOMP Debug:', str);
                },
                reconnectDelay: 0, // 자동 재연결 비활성화 (수동으로 관리)
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                connectionTimeout: 10000,
            });

            client.onConnect = () => {
                console.log('전역 STOMP 연결 성공');
                globalIsConnected = true;
                globalClient = client;
                this.reconnectAttempts = 0;
                isConnecting = false;
                updateGlobalState();

                // 관리자 알림 구독
                client.subscribe('/topic/admin/notifications', (message) => {
                    try {
                        const notification: NotificationPayload = JSON.parse(message.body);
                        globalNotifications = [notification, ...globalNotifications].slice(0, 50);
                        console.log('새로운 알림 수신:', notification);
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
                        console.log('통계 업데이트 수신:', statsData);
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
                            body: JSON.stringify({ message: '전역 클라이언트 연결 테스트' })
                        });
                        console.log('테스트 메시지 전송 완료');
                    } catch (error) {
                        console.error('테스트 메시지 전송 실패:', error);
                    }
                }, 1000);
            };

            client.onDisconnect = () => {
                console.log('전역 STOMP 연결 해제');
                globalIsConnected = false;
                globalClient = null;
                updateGlobalState();
            };

            client.onStompError = (frame) => {
                console.error('전역 STOMP 오류:', frame);
                globalIsConnected = false;
                globalClient = null;
                isConnecting = false;
                updateGlobalState();
                this.scheduleReconnect();
            };

            client.onWebSocketError = (error) => {
                console.error('전역 WebSocket 연결 오류:', error);
                globalIsConnected = false;
                globalClient = null;
                isConnecting = false;
                updateGlobalState();
                this.scheduleReconnect();
            };

            try {
                client.activate();
            } catch (error) {
                console.error('전역 WebSocket 클라이언트 활성화 실패:', error);
                isConnecting = false;
                this.scheduleReconnect();
            }
        } catch (error) {
            console.error('전역 SockJS 모듈 로드 실패:', error);
            isConnecting = false;
            this.scheduleReconnect();
        }
    }

    private handleDisconnect() {
        globalIsConnected = false;
        globalClient = null;
        updateGlobalState();
        
        // 자동 재연결 시도
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
        } else {
            console.log('최대 재연결 시도 횟수 초과');
        }
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('재연결 시도 중단');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 지수 백오프
        
        console.log(`${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (!globalIsConnected && !isConnecting) {
                this.connect();
            }
        }, delay);
    }

    disconnect() {
        if (globalClient) {
            globalClient.deactivate();
            globalClient = null;
        }
        globalIsConnected = false;
        isConnecting = false;
        this.reconnectAttempts = 0;
        updateGlobalState();
    }

    getClient(): Client | null {
        return globalClient;
    }

    isConnected(): boolean {
        return globalIsConnected;
    }
}

// 전역 WebSocket 매니저 인스턴스
const wsManager = WebSocketManager.getInstance();

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(globalIsConnected);
    const [notifications, setNotifications] = useState<NotificationPayload[]>(globalNotifications);
    const [stats, setStats] = useState<StatsPayload | null>(globalStats);
    const isInitialized = useRef(false);

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

    // 컴포넌트 마운트 시 한 번만 연결 시도
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            if (!globalIsConnected && !isConnecting) {
                wsManager.connect();
            }
        }
    }, []);

    const connect = useCallback(async () => {
        if (!globalIsConnected && !isConnecting) {
            await wsManager.connect();
        }
    }, []);

    const disconnect = useCallback(() => {
        wsManager.disconnect();
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

// 앱 종료 시 정리
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        wsManager.disconnect();
    });
}
