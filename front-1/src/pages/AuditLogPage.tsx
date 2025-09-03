import React, { useState, useEffect, useMemo } from 'react';
import { AuditLogApi, AuditLog, AuditLogSearchParams, getActionTypeLabel, getSeverityLabel, getSeverityColor, getSeverityBgColor } from '@/api/auditLogApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Filter, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface FilterState {
  actionType: string;
  severity: string;
  startDate: string;
  endDate: string;
  targetName: string;
}

export default function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // 필터 상태
  const [filters, setFilters] = useState<FilterState>({
    actionType: '',
    severity: '',
    startDate: '',
    endDate: '',
    targetName: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [severityLevels, setSeverityLevels] = useState<string[]>([]);

  // 액션 타입과 심각도 레벨 로드
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [actionTypesData, severityLevelsData] = await Promise.all([
          AuditLogApi.getActionTypes(),
          AuditLogApi.getSeverityLevels()
        ]);
        setActionTypes(actionTypesData);
        setSeverityLevels(severityLevelsData);
      } catch (error) {
        console.error('필터 옵션 로드 실패:', error);
      }
    };
    
    loadFilterOptions();
  }, []);

  // 감사 로그 데이터 로드
  const loadAuditLogs = async (page: number = 0, searchParams?: AuditLogSearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (searchParams && (searchParams.actionType || searchParams.severity || searchParams.startDate || searchParams.endDate)) {
        // 필터링된 검색
        response = await AuditLogApi.searchAuditLogs({
          ...searchParams,
          page,
          size: pageSize
        });
      } else {
        // 전체 조회
        response = await AuditLogApi.getAuditLogs(page, pageSize);
      }
      
      setAuditLogs(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.currentPage);
    } catch (error: any) {
      setError(error.message || '감사 로그를 불러오는 중 오류가 발생했습니다.');
      console.error('감사 로그 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadAuditLogs();
  }, [pageSize]);

  // 필터 적용
  const applyFilters = () => {
    const searchParams: AuditLogSearchParams = {
      actionType: filters.actionType || undefined,
      severity: filters.severity || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      page: 0,
      size: pageSize
    };
    
    setCurrentPage(0);
    loadAuditLogs(0, searchParams);
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      actionType: '',
      severity: '',
      startDate: '',
      endDate: '',
      targetName: ''
    });
    setCurrentPage(0);
    loadAuditLogs();
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      
      const searchParams: AuditLogSearchParams = {
        actionType: filters.actionType || undefined,
        severity: filters.severity || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: newPage,
        size: pageSize
      };
      
      loadAuditLogs(newPage, searchParams);
    }
  };

  // 필터된 로그 (클라이언트 사이드 필터링 - 대상명)
  const filteredLogs = useMemo(() => {
    if (!filters.targetName.trim()) {
      return auditLogs;
    }
    
    return auditLogs.filter(log => 
      log.targetName?.toLowerCase().includes(filters.targetName.toLowerCase()) ||
      log.actorName?.toLowerCase().includes(filters.targetName.toLowerCase()) ||
      log.message.toLowerCase().includes(filters.targetName.toLowerCase())
    );
  }, [auditLogs, filters.targetName]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            감사 로그
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            시스템 활동 내역을 확인하고 필터링할 수 있습니다.
          </p>
        </div>

        {/* 필터 섹션 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  필터
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? '필터 숨기기' : '필터 보기'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  초기화
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* 액션 타입 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    액션 타입
                  </label>
                  <Select
                    value={filters.actionType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">전체</SelectItem>
                      {actionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {getActionTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 심각도 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    심각도
                  </label>
                  <Select
                    value={filters.severity}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">전체</SelectItem>
                      {severityLevels.map((severity) => (
                        <SelectItem key={severity} value={severity}>
                          {getSeverityLabel(severity)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 시작 날짜 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    시작 날짜
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                {/* 종료 날짜 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    종료 날짜
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* 검색 및 필터 적용 */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  대상/메시지 검색
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="대상명, 사용자명, 메시지로 검색..."
                    value={filters.targetName}
                    onChange={(e) => setFilters(prev => ({ ...prev, targetName: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={applyFilters} disabled={loading}>
                {loading ? '검색 중...' : '필터 적용'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 결과 요약 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            총 {totalElements.toLocaleString()}개의 로그 중 {filteredLogs.length}개 표시
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">페이지 크기:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(0);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 로그 목록 */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button 
                  onClick={() => loadAuditLogs(currentPage)} 
                  className="mt-4"
                >
                  다시 시도
                </Button>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        액션 타입
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        심각도
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        사용자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        대상
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        메시지
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        IP 주소
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {getActionTypeLabel(log.actionType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBgColor(log.severity)} ${getSeverityColor(log.severity)}`}>
                            {getSeverityLabel(log.severity)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {log.actorName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {log.targetName || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                          {log.message}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.ipAddress || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {currentPage + 1} / {totalPages} 페이지
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
              
              {/* 페이지 번호들 */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1 || loading}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

