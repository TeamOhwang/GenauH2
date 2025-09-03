package com.project.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.dto.OrganizationDTO;
import com.project.entity.AuditLog;
import com.project.entity.Organization;
import com.project.security.TokenProvider;
import com.project.service.AuditLogService;
import com.project.service.OrganizationService;

@RestController
@RequestMapping("/admin/audit-logs")
@CrossOrigin(origins = { "http://localhost:5174" })
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private TokenProvider tokenProvider;

    // 모든 감사 로그 조회 (페이지네이션)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 관리자 권한 확인
            if (!validateAdminToken(token, response)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            Page<AuditLog> auditLogs = auditLogService.getAuditLogs(page, size);

            response.put("success", true);
            response.put("data", auditLogs.getContent());
            response.put("totalElements", auditLogs.getTotalElements());
            response.put("totalPages", auditLogs.getTotalPages());
            response.put("currentPage", auditLogs.getNumber());
            response.put("size", auditLogs.getSize());
            response.put("hasNext", auditLogs.hasNext());
            response.put("hasPrevious", auditLogs.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "감사 로그 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 조건부 감사 로그 조회
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchAuditLogs(
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 관리자 권한 확인
            if (!validateAdminToken(token, response)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // 파라미터 변환
            AuditLog.ActionType actionTypeEnum = auditLogService.parseActionType(actionType);
            AuditLog.Severity severityEnum = auditLogService.parseSeverity(severity);
            LocalDateTime startDateTime = auditLogService.parseDateString(startDate);
            LocalDateTime endDateTime = auditLogService.parseEndDateString(endDate);

            Page<AuditLog> auditLogs = auditLogService.getAuditLogsByConditions(
                    actionTypeEnum, severityEnum, startDateTime, endDateTime, page, size);

            response.put("success", true);
            response.put("data", auditLogs.getContent());
            response.put("totalElements", auditLogs.getTotalElements());
            response.put("totalPages", auditLogs.getTotalPages());
            response.put("currentPage", auditLogs.getNumber());
            response.put("size", auditLogs.getSize());
            response.put("hasNext", auditLogs.hasNext());
            response.put("hasPrevious", auditLogs.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "잘못된 파라미터입니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "감사 로그 검색 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 특정 사용자와 관련된 감사 로그 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getAuditLogsByUser(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 관리자 권한 확인
            if (!validateAdminToken(token, response)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            Page<AuditLog> auditLogs = auditLogService.getAuditLogsByUserId(userId, page, size);

            response.put("success", true);
            response.put("data", auditLogs.getContent());
            response.put("totalElements", auditLogs.getTotalElements());
            response.put("totalPages", auditLogs.getTotalPages());
            response.put("currentPage", auditLogs.getNumber());
            response.put("size", auditLogs.getSize());
            response.put("hasNext", auditLogs.hasNext());
            response.put("hasPrevious", auditLogs.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 감사 로그 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 통계 정보 조회
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getAuditLogStatistics(
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 관리자 권한 확인
            if (!validateAdminToken(token, response)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // 통계 데이터 수집
            long todayLogCount = auditLogService.getTodayLogCount();
            List<Map<String, Object>> dailyLogCounts = auditLogService.getDailyLogCounts();
            List<Map<String, Object>> actionTypeCounts = auditLogService.getLogCountsByActionType();
            List<Map<String, Object>> severityCounts = auditLogService.getLogCountsBySeverity();

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("todayLogCount", todayLogCount);
            statistics.put("dailyLogCounts", dailyLogCounts);
            statistics.put("actionTypeCounts", actionTypeCounts);
            statistics.put("severityCounts", severityCounts);

            response.put("success", true);
            response.put("data", statistics);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "통계 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 액션 타입 목록 조회
    @GetMapping("/action-types")
    public ResponseEntity<Map<String, Object>> getActionTypes(
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 관리자 권한 확인
            if (!validateAdminToken(token, response)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            AuditLog.ActionType[] actionTypes = AuditLog.ActionType.values();
            response.put("success", true);
            response.put("data", actionTypes);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "액션 타입 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 심각도 레벨 목록 조회
    @GetMapping("/severity-levels")
    public ResponseEntity<Map<String, Object>> getSeverityLevels(
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 관리자 권한 확인
            if (!validateAdminToken(token, response)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            AuditLog.Severity[] severityLevels = AuditLog.Severity.values();
            response.put("success", true);
            response.put("data", severityLevels);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "심각도 레벨 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 관리자 토큰 검증 헬퍼 메서드
    private boolean validateAdminToken(String token, Map<String, Object> response) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "인증 토큰이 필요합니다.");
                return false;
            }

            String actualToken = token.substring(7);
            String userId = tokenProvider.validateAndGetUserId(actualToken);

            if (userId == null) {
                response.put("success", false);
                response.put("message", "유효하지 않은 토큰입니다.");
                return false;
            }

            OrganizationDTO organization = organizationService.getUserById(Long.parseLong(userId));
            if (organization == null || !isAdmin(organization)) {
                response.put("success", false);
                response.put("message", "관리자 권한이 필요합니다.");
                return false;
            }

            return true;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "토큰 검증 중 오류가 발생했습니다.");
            return false;
        }
    }

    // 관리자 권한 확인 헬퍼 메서드
    private boolean isAdmin(OrganizationDTO user) {
        return user.getRole() != null && (user.getRole().equals(Organization.Role.SUPERVISOR)
                || "SUPERVISOR".equals(user.getRole().toString()));
    }
}
