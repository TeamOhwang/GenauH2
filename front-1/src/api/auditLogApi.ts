import apiClient from "./apiClient";

/** 감사 로그 타입 정의 */
export type AuditLog = {
  id: number;
  actionType: 'USER_REGISTRATION' | 'USER_APPROVAL' | 'USER_REJECTION' | 'USER_STATUS_CHANGE' | 
             'USER_WITHDRAWAL' | 'USER_DELETE' | 'FACILITY_CREATE' | 'FACILITY_UPDATE' | 
             'FACILITY_DELETE' | 'PASSWORD_CHANGE' | 'LOGIN' | 'LOGOUT' | 'ADMIN_ACTION';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  actorId?: number;
  actorName?: string;
  actorEmail?: string;
  targetId?: number;
  targetName?: string;
  targetEmail?: string;
  message: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

/** 페이지네이션 응답 타입 */
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

/** 통계 정보 타입 */
export type AuditLogStatistics = {
  todayLogCount: number;
  dailyLogCounts: Array<{
    date: string;
    count: number;
  }>;
  actionTypeCounts: Array<{
    actionType: string;
    count: number;
  }>;
  severityCounts: Array<{
    severity: string;
    count: number;
  }>;
};

/** 검색 조건 타입 */
export type AuditLogSearchParams = {
  actionType?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
};

export const AuditLogApi = {
  /** 모든 감사 로그 조회 (페이지네이션) */
  async getAuditLogs(page: number = 0, size: number = 20): Promise<PageResponse<AuditLog>> {
    const res = await apiClient.get<{
      success: boolean;
      data: AuditLog[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
      size: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }>('/admin/audit-logs', {
      params: { page, size }
    });

    return {
      content: res.data.data || [],
      totalElements: res.data.totalElements || 0,
      totalPages: res.data.totalPages || 0,
      currentPage: res.data.currentPage || 0,
      size: res.data.size || size,
      hasNext: res.data.hasNext || false,
      hasPrevious: res.data.hasPrevious || false,
    };
  },

  /** 조건부 감사 로그 검색 */
  async searchAuditLogs(params: AuditLogSearchParams): Promise<PageResponse<AuditLog>> {
    const res = await apiClient.get<{
      success: boolean;
      data: AuditLog[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
      size: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }>('/admin/audit-logs', {
      params: {
        actionType: params.actionType,
        severity: params.severity,
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page || 0,
        size: params.size || 20,
      }
    });

    return {
      content: res.data.data || [],
      totalElements: res.data.totalElements || 0,
      totalPages: res.data.totalPages || 0,
      currentPage: res.data.currentPage || 0,
      size: res.data.size || params.size || 20,
      hasNext: res.data.hasNext || false,
      hasPrevious: res.data.hasPrevious || false,
    };
  },

  /** 특정 사용자와 관련된 감사 로그 조회 */
  async getAuditLogsByUser(userId: number, page: number = 0, size: number = 20): Promise<PageResponse<AuditLog>> {
    const res = await apiClient.get<{
      success: boolean;
      data: AuditLog[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
      size: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }>(`/admin/audit-logs/user/${userId}`, {
      params: { page, size }
    });

    return {
      content: res.data.data || [],
      totalElements: res.data.totalElements || 0,
      totalPages: res.data.totalPages || 0,
      currentPage: res.data.currentPage || 0,
      size: res.data.size || size,
      hasNext: res.data.hasNext || false,
      hasPrevious: res.data.hasPrevious || false,
    };
  },

  /** 통계 정보 조회 */
  async getStatistics(): Promise<AuditLogStatistics> {
    const res = await apiClient.get<{
      success: boolean;
      data: AuditLogStatistics;
    }>('/admin/audit-logs/statistics');

    return res.data.data;
  },

  /** 액션 타입 목록 조회 */
  async getActionTypes(): Promise<string[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: string[];
    }>('/admin/audit-logs/action-types');

    return res.data.data || [];
  },

  /** 심각도 레벨 목록 조회 */
  async getSeverityLevels(): Promise<string[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: string[];
    }>('/admin/audit-logs/severity-levels');

    return res.data.data || [];
  },
};

/** 액션 타입 한글 변환 */
export const getActionTypeLabel = (actionType: string): string => {
  const labels: Record<string, string> = {
    'USER_REGISTRATION': '회원가입 요청',
    'USER_APPROVAL': '회원가입 승인',
    'USER_REJECTION': '회원가입 거부',
    'USER_STATUS_CHANGE': '사용자 상태 변경',
    'USER_WITHDRAWAL': '회원탈퇴 요청',
    'USER_DELETE': '사용자 삭제',
    'FACILITY_CREATE': '시설 추가',
    'FACILITY_UPDATE': '시설 수정',
    'FACILITY_DELETE': '시설 삭제',
    'PASSWORD_CHANGE': '비밀번호 변경',
    'LOGIN': '로그인',
    'LOGOUT': '로그아웃',
    'ADMIN_ACTION': '관리자 작업',
  };
  return labels[actionType] || actionType;
};

/** 심각도 레벨 한글 변환 */
export const getSeverityLabel = (severity: string): string => {
  const labels: Record<string, string> = {
    'INFO': '정보',
    'WARNING': '경고',
    'ERROR': '오류',
    'CRITICAL': '중요',
  };
  return labels[severity] || severity;
};

/** 심각도 레벨 색상 */
export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    'INFO': 'text-blue-600',
    'WARNING': 'text-yellow-600',
    'ERROR': 'text-red-600',
    'CRITICAL': 'text-red-800',
  };
  return colors[severity] || 'text-gray-600';
};

/** 심각도 레벨 배경 색상 */
export const getSeverityBgColor = (severity: string): string => {
  const colors: Record<string, string> = {
    'INFO': 'bg-blue-100',
    'WARNING': 'bg-yellow-100',
    'ERROR': 'bg-red-100',
    'CRITICAL': 'bg-red-200',
  };
  return colors[severity] || 'bg-gray-100';
};
