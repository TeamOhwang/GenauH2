import apiClient from './apiClient';

export interface Alarm {
    alarmId: number;
    facilityId: number;
    alarmType: 'LOW_PRODUCTION' | 'STOP' | 'OTHER';
    severity: 'INFO' | 'WARN' | 'CRITICAL';
    reason: string;
    createdAt: string;
    ackBy?: number;
}

export interface RecipientRequest {
    email: string;
}

export const alarmApi = {
    // 시설별 알람 목록 조회
    getAlarms: (facilityId: number): Promise<Alarm[]> => {
        return apiClient.get(`/api/alarms?facilityId=${facilityId}`);
    },

    // 새 알람 규칙 생성
    createAlarm: (alarm: Omit<Alarm, 'alarmId' | 'createdAt'>): Promise<Alarm> => {
        return apiClient.post('/api/alarms', alarm);
    },

    // 이메일 수신자 설정
    setRecipient: (email: string): Promise<void> => {
        return apiClient.post('/alert/recipient', { email });
    }
};