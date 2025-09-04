import { useState, useEffect } from 'react';
import { AuditLogApi, AuditLog, AuditLogSearchParams, AuditLogStatistics } from '@/api/auditLogApi';
import { getActionTypeLabel, getSeverityLabel, getSeverityColor, getSeverityBgColor } from '@/api/auditLogApi';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Search, TrendingUp, Users, AlertTriangle, Info } from 'lucide-react';

export default function NotificationLog() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<AuditLogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // 검색/필터 상태
  const [searchParams, setSearchParams] = useState<AuditLogSearchParams>({
    page: 0,
    size: 20,
  });
  
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [severityLevels, setSeverityLevels] = useState<string[]>([]);
  
  // 필터 표시 상태
  const [showFilters, setShowFilters] = useState(false);

  // 감사 로그 목록 조회
  const loadAuditLogs = async (params: AuditLogSearchParams = searchParams) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await AuditLogApi.searchAuditLogs(params);
      setAuditLogs(response.content);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
    } catch (error) {
      console.error('감사 로그 조회 실패:', error);
      setError('감사 로그를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 통계 정보 조회
  const loadStatistics = async () => {
    try {
      const stats = await AuditLogApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('통계 정보 조회 실패:', error);
    }
  };

  // 액션 타입 및 심각도 레벨 조회
  const loadFilterOptions = async () => {
    try {
      const [actionTypesData, severityLevelsData] = await Promise.all([
        AuditLogApi.getActionTypes(),
        AuditLogApi.getSeverityLevels(),
      ]);
      setActionTypes(actionTypesData);
      setSeverityLevels(severityLevelsData);
    } catch (error) {
      console.error('필터 옵션 조회 실패:', error);
    }
  };

  // 검색 실행
  const handleSearch = () => {
    const newParams = { ...searchParams, page: 0 };
    setSearchParams(newParams);
    loadAuditLogs(newParams);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    const resetParams = {
      page: 0,
      size: 20,
    };
    setSearchParams(resetParams);
    loadAuditLogs(resetParams);
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    const newParams = { ...searchParams, page: newPage };
    setSearchParams(newParams);
    loadAuditLogs(newParams);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 날짜만 포맷팅
  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  useEffect(() => {
    loadAuditLogs();
    loadStatistics();
    loadFilterOptions();
  }, []);

  if (loading && auditLogs.length === 0) {
    return (
      <div className="h-full p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">활동 로그</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">시스템 활동 내역을 확인할 수 있습니다</p>
        </div>
        {/* <Button
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Filter className="w-4 h-4" />
          필터
        </Button> */}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* 통계 카드 */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">오늘의 로그</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statistics.todayLogCount}
                  </p>
                </div>
                <Info className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">경고</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {statistics.severityCounts.find(s => s.severity === 'WARNING')?.count || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">오류</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {statistics.severityCounts.find(s => s.severity === 'ERROR')?.count || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">총 로그</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {totalElements}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 검색 및 필터 */}
      {showFilters && (
        <Card className="mb-6 dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  액션 타입
                </label>
                <Select
                  value={searchParams.actionType || 'ALL'}
                  onValueChange={(value) => setSearchParams({ ...searchParams, actionType: value === 'ALL' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    {actionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getActionTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  심각도
                </label>
                <Select
                  value={searchParams.severity || 'ALL'}
                  onValueChange={(value) => setSearchParams({ ...searchParams, severity: value === 'ALL' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    {severityLevels.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {getSeverityLabel(severity)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  시작 날짜
                </label>
                <Input
                  type="date"
                  value={searchParams.startDate || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  종료 날짜
                </label>
                <Input
                  type="date"
                  value={searchParams.endDate || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search className="w-4 h-4" />
                검색
              </Button>
              <Button onClick={handleResetFilters} style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                초기화
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 감사 로그 테이블 */}
      <Card className="dark:bg-gray-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    액션
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    심각도
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    대상
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    메시지
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    IP 주소
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {getActionTypeLabel(log.actionType)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBgColor(log.severity)} ${getSeverityColor(log.severity)}`}>
                        {getSeverityLabel(log.severity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {log.actorName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {log.targetName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {auditLogs.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>검색 조건에 맞는 로그가 없습니다.</p>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                총 {totalElements}개 중 {currentPage * 20 + 1}-{Math.min((currentPage + 1) * 20, totalElements)}개 표시
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevious}
                  style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 8px', fontSize: '14px' }}
                >
                  이전
                </Button>
                <span className="flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                  style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 8px', fontSize: '14px' }}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}