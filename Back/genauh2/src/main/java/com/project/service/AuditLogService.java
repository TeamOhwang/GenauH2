package com.project.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.entity.AuditLog;
import com.project.repository.AuditLogRepository;

@Service
@Transactional
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    // 감사 로그 저장
    public AuditLog saveAuditLog(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }

    // 모든 감사 로그 조회 (최신순)
    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    // 페이지네이션과 함께 감사 로그 조회
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    // 특정 날짜 범위의 감사 로그 조회
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByDateRange(startDate, endDate);
    }

    // 특정 날짜 범위의 감사 로그를 페이지네이션과 함께 조회
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return auditLogRepository.findByDateRange(startDate, endDate, pageable);
    }

    // 특정 액션 타입의 감사 로그 조회
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByActionType(AuditLog.ActionType actionType) {
        return auditLogRepository.findByActionTypeOrderByCreatedAtDesc(actionType);
    }

    // 특정 액션 타입의 감사 로그를 페이지네이션과 함께 조회
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByActionType(AuditLog.ActionType actionType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return auditLogRepository.findByActionTypeOrderByCreatedAtDesc(actionType, pageable);
    }

    // 특정 사용자와 관련된 감사 로그 조회
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByUserId(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }

    // 특정 사용자와 관련된 감사 로그를 페이지네이션과 함께 조회
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return auditLogRepository.findByUserId(userId, pageable);
    }

    // 특정 심각도 레벨의 감사 로그 조회
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsBySeverity(AuditLog.Severity severity) {
        return auditLogRepository.findBySeverityOrderByCreatedAtDesc(severity);
    }

    // 특정 심각도 레벨의 감사 로그를 페이지네이션과 함께 조회
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsBySeverity(AuditLog.Severity severity, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return auditLogRepository.findBySeverityOrderByCreatedAtDesc(severity, pageable);
    }

    // 복합 조건으로 감사 로그 조회
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByConditions(
            AuditLog.ActionType actionType,
            AuditLog.Severity severity,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return auditLogRepository.findByConditions(actionType, severity, startDate, endDate, pageable);
    }

    // 오늘의 로그 개수 조회
    @Transactional(readOnly = true)
    public long getTodayLogCount() {
        return auditLogRepository.countTodayLogs();
    }

    // 특정 날짜의 로그 개수 조회
    @Transactional(readOnly = true)
    public long getLogCountByDate(LocalDateTime date) {
        return auditLogRepository.countLogsByDate(date);
    }

    // 최근 7일간의 일별 로그 개수 조회
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDailyLogCounts() {
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        List<Object[]> results = auditLogRepository.countLogsByDateRange(startDate);
        
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("date", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .collect(Collectors.toList());
    }

    // 액션 타입별 로그 개수 조회
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLogCountsByActionType() {
        List<Object[]> results = auditLogRepository.countLogsByActionType();
        
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("actionType", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .collect(Collectors.toList());
    }

    // 심각도별 로그 개수 조회
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLogCountsBySeverity() {
        List<Object[]> results = auditLogRepository.countLogsBySeverity();
        
        return results.stream()
                .map(result -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("severity", result[0]);
                    map.put("count", result[1]);
                    return map;
                })
                .collect(Collectors.toList());
    }

    // 날짜 문자열을 LocalDateTime으로 변환하는 헬퍼 메서드
    public LocalDateTime parseDateString(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        try {
            // "yyyy-MM-dd" 형식으로 파싱하고 시간은 00:00:00으로 설정
            LocalDate date = LocalDate.parse(dateString, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            return date.atStartOfDay();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Expected: yyyy-MM-dd", e);
        }
    }

    // 날짜 문자열을 LocalDateTime으로 변환하는 헬퍼 메서드 (종료일은 23:59:59로 설정)
    public LocalDateTime parseEndDateString(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        try {
            // "yyyy-MM-dd" 형식으로 파싱하고 시간은 23:59:59로 설정
            LocalDate date = LocalDate.parse(dateString, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            return date.atTime(23, 59, 59);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Expected: yyyy-MM-dd", e);
        }
    }

    // 액션 타입 문자열을 enum으로 변환하는 헬퍼 메서드
    public AuditLog.ActionType parseActionType(String actionTypeString) {
        if (actionTypeString == null || actionTypeString.trim().isEmpty() || "ALL".equalsIgnoreCase(actionTypeString)) {
            return null;
        }
        
        try {
            return AuditLog.ActionType.valueOf(actionTypeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid action type: " + actionTypeString, e);
        }
    }

    // 심각도 문자열을 enum으로 변환하는 헬퍼 메서드
    public AuditLog.Severity parseSeverity(String severityString) {
        if (severityString == null || severityString.trim().isEmpty() || "ALL".equalsIgnoreCase(severityString)) {
            return null;
        }
        
        try {
            return AuditLog.Severity.valueOf(severityString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid severity: " + severityString, e);
        }
    }
}
