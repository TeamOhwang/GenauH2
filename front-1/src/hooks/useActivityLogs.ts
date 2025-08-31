import { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';

export interface ActivityLog {
    id: number;
    logType: string;
    activityType: string;
    userId: number | null;
    username: string;
    userRole: string;
    targetId: number | null;
    targetType: string | null;
    description: string;
    ipAddress: string | null;
    createdAt: string;
    additionalData: string | null;
}

export interface ActivityLogResponse {
    content: ActivityLog[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export const useActivityLogs = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // 모든 로그 조회 (관리자용)
    const fetchAllLogs = async (page: number = 0, size: number = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ActivityLogResponse>(`/api/activity-logs?page=${page}&size=${size}`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            setError('로그 조회에 실패했습니다.');
            console.error('활동 로그 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 특정 사용자의 활동 로그 조회
    const fetchUserLogs = async (userId: number, page: number = 0, size: number = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ActivityLogResponse>(`/api/activity-logs/user/${userId}?page=${page}&size=${size}`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            setError('사용자 활동 로그 조회에 실패했습니다.');
            console.error('사용자 활동 로그 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 현재 로그인한 사용자의 활동 로그 조회
    const fetchMyLogs = async (page: number = 0, size: number = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ActivityLogResponse>(`/api/activity-logs/my-activity?page=${page}&size=${size}`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            setError('내 활동 로그 조회에 실패했습니다.');
            console.error('내 활동 로그 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 특정 조직의 설비 이벤트 로그 조회
    const fetchEquipmentEventLogs = async (orgId: number, page: number = 0, size: number = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ActivityLogResponse>(`/api/activity-logs/equipment-events/organization/${orgId}?page=${page}&size=${size}`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            setError('설비 이벤트 로그 조회에 실패했습니다.');
            console.error('설비 이벤트 로그 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 특정 기간의 로그 조회
    const fetchLogsByDateRange = async (startDate: string, endDate: string, page: number = 0, size: number = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ActivityLogResponse>(`/api/activity-logs/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            setError('기간별 로그 조회에 실패했습니다.');
            console.error('기간별 로그 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 특정 활동 타입의 로그 조회
    const fetchLogsByActivityType = async (activityType: string, page: number = 0, size: number = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ActivityLogResponse>(`/api/activity-logs/activity-type/${activityType}?page=${page}&size=${size}`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            setError('활동 타입별 로그 조회에 실패했습니다.');
            console.error('활동 타입별 로그 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 사용자 이름으로 로그 검색
    const searchLogsByUsername = async (username: string, page: number = 0, size: number = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ActivityLogResponse>(`/api/activity-logs/search/username?username=${encodeURIComponent(username)}&page=${page}&size=${size}`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            setError('사용자명 검색에 실패했습니다.');
            console.error('사용자명 검색 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 최근 로그 조회
    const fetchRecentLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ActivityLog[]>('/api/activity-logs/recent');
            setLogs(response.data);
            setTotalPages(0);
            setCurrentPage(0);
            setTotalElements(response.data.length);
        } catch (err) {
            setError('최근 로그 조회에 실패했습니다.');
            console.error('최근 로그 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 페이지 변경
    const changePage = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // 로그 타입별 색상 및 아이콘
    const getLogTypeInfo = (logType: string) => {
        switch (logType) {
            case 'USER_ACTIVITY':
                return { color: 'bg-blue-100 text-blue-800', icon: '👤', label: '사용자 활동' };
            case 'ADMIN_ACTIVITY':
                return { color: 'bg-red-100 text-red-800', icon: '🔧', label: '관리자 활동' };
            case 'EQUIPMENT_EVENT':
                return { color: 'bg-green-100 text-green-800', icon: '⚡', label: '설비 이벤트' };
            default:
                return { color: 'bg-gray-100 text-gray-800', icon: '📝', label: '기타' };
        }
    };

    // 활동 타입별 색상 및 아이콘
    const getActivityTypeInfo = (activityType: string) => {
        switch (activityType) {
            // 사용자 활동
            case 'USER_SIGNUP':
                return { color: 'bg-green-100 text-green-800', icon: '📝', label: '회원가입' };
            case 'USER_LOGIN':
                return { color: 'bg-blue-100 text-blue-800', icon: '🔑', label: '로그인' };
            case 'USER_LOGOUT':
                return { color: 'bg-gray-100 text-gray-800', icon: '🚪', label: '로그아웃' };
            case 'USER_PASSWORD_CHANGE':
                return { color: 'bg-yellow-100 text-yellow-800', icon: '🔒', label: '비밀번호 변경' };
            
            // 설비 관련
            case 'FACILITY_ADD':
                return { color: 'bg-green-100 text-green-800', icon: '➕', label: '설비 추가' };
            case 'FACILITY_UPDATE':
                return { color: 'bg-blue-100 text-blue-800', icon: '✏️', label: '설비 수정' };
            case 'FACILITY_DELETE':
                return { color: 'bg-red-100 text-red-800', icon: '🗑️', label: '설비 삭제' };
            
            // 관리자 활동
            case 'ADMIN_USER_ADD':
                return { color: 'bg-purple-100 text-purple-800', icon: '👥', label: '회원 추가' };
            case 'ADMIN_USER_APPROVE':
                return { color: 'bg-green-100 text-green-800', icon: '✅', label: '회원 승인' };
            case 'ADMIN_USER_REJECT':
                return { color: 'bg-red-100 text-red-800', icon: '❌', label: '회원 거절' };
            case 'ADMIN_USER_ACTIVATE':
                return { color: 'bg-green-100 text-green-800', icon: '🟢', label: '회원 활성화' };
            case 'ADMIN_USER_DEACTIVATE':
                return { color: 'bg-red-100 text-red-800', icon: '🔴', label: '회원 비활성화' };
            
            // 설비 이벤트
            case 'EQUIPMENT_FAULT':
                return { color: 'bg-red-100 text-red-800', icon: '⚠️', label: '설비 고장' };
            case 'EQUIPMENT_MAINTENANCE':
                return { color: 'bg-yellow-100 text-yellow-800', icon: '🔧', label: '설비 정비' };
            case 'EQUIPMENT_STATUS_CHANGE':
                return { color: 'bg-blue-100 text-blue-800', icon: '🔄', label: '상태 변경' };
            
            default:
                return { color: 'bg-gray-100 text-gray-800', icon: '📝', label: activityType };
        }
    };

    return {
        logs,
        loading,
        error,
        totalPages,
        currentPage,
        totalElements,
        fetchAllLogs,
        fetchUserLogs,
        fetchMyLogs,
        fetchEquipmentEventLogs,
        fetchLogsByDateRange,
        fetchLogsByActivityType,
        searchLogsByUsername,
        fetchRecentLogs,
        changePage,
        getLogTypeInfo,
        getActivityTypeInfo,
        clearError: () => setError(null)
    };
};
