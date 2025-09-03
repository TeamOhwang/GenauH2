package com.project.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    public enum ActionType {
        USER_REGISTRATION,      // 회원가입 요청
        USER_APPROVAL,          // 회원가입 승인
        USER_REJECTION,         // 회원가입 거부
        USER_STATUS_CHANGE,     // 사용자 상태 변경
        USER_WITHDRAWAL,        // 회원탈퇴 요청
        USER_DELETE,            // 사용자 삭제
        FACILITY_CREATE,        // 시설 추가
        FACILITY_UPDATE,        // 시설 수정
        FACILITY_DELETE,        // 시설 삭제
        PASSWORD_CHANGE,        // 비밀번호 변경
        LOGIN,                  // 로그인
        LOGOUT,                 // 로그아웃
        ADMIN_ACTION            // 기타 관리자 작업
    }

    public enum Severity {
        INFO,       // 일반 정보
        WARNING,    // 경고
        ERROR,      // 오류
        CRITICAL    // 중요
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private ActionType actionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "actor_id")
    private Long actorId; // 작업을 수행한 사용자 ID

    @Column(name = "actor_name", length = 100)
    private String actorName; // 작업을 수행한 사용자명

    @Column(name = "actor_email", length = 100)
    private String actorEmail; // 작업을 수행한 사용자 이메일

    @Column(name = "target_id")
    private Long targetId; // 작업 대상 ID (예: 승인된 사용자 ID)

    @Column(name = "target_name", length = 100)
    private String targetName; // 작업 대상명 (예: 승인된 사용자명)

    @Column(name = "target_email", length = 100)
    private String targetEmail; // 작업 대상 이메일

    @Column(name = "message", length = 500, nullable = false)
    private String message; // 상세 메시지

    @Column(name = "details", columnDefinition = "TEXT")
    private String details; // 추가 상세 정보 (JSON 형태)

    @Column(name = "ip_address", length = 45)
    private String ipAddress; // IP 주소

    @Column(name = "user_agent", length = 500)
    private String userAgent; // 사용자 에이전트

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt; // 생성 시간 (DB에서 자동 설정)

    // 생성자 헬퍼 메서드들
    public static AuditLog createUserRegistrationLog(Long targetId, String targetName, String targetEmail, String ipAddress) {
        return AuditLog.builder()
                .actionType(ActionType.USER_REGISTRATION)
                .severity(Severity.INFO)
                .targetId(targetId)
                .targetName(targetName)
                .targetEmail(targetEmail)
                .message(String.format("새로운 회원가입 요청: %s (%s)", targetName, targetEmail))
                .ipAddress(ipAddress)
                .build();
    }

    public static AuditLog createUserApprovalLog(Long actorId, String actorName, Long targetId, String targetName, String targetEmail) {
        return AuditLog.builder()
                .actionType(ActionType.USER_APPROVAL)
                .severity(Severity.INFO)
                .actorId(actorId)
                .actorName(actorName)
                .targetId(targetId)
                .targetName(targetName)
                .targetEmail(targetEmail)
                .message(String.format("관리자 %s가 %s (%s)의 회원가입을 승인했습니다", actorName, targetName, targetEmail))
                .build();
    }

    public static AuditLog createUserRejectionLog(Long actorId, String actorName, Long targetId, String targetName, String targetEmail) {
        return AuditLog.builder()
                .actionType(ActionType.USER_REJECTION)
                .severity(Severity.WARNING)
                .actorId(actorId)
                .actorName(actorName)
                .targetId(targetId)
                .targetName(targetName)
                .targetEmail(targetEmail)
                .message(String.format("관리자 %s가 %s (%s)의 회원가입을 거부했습니다", actorName, targetName, targetEmail))
                .build();
    }

    public static AuditLog createUserStatusChangeLog(Long actorId, String actorName, Long targetId, String targetName, String targetEmail, String oldStatus, String newStatus) {
        return AuditLog.builder()
                .actionType(ActionType.USER_STATUS_CHANGE)
                .severity(Severity.INFO)
                .actorId(actorId)
                .actorName(actorName)
                .targetId(targetId)
                .targetName(targetName)
                .targetEmail(targetEmail)
                .message(String.format("관리자 %s가 %s (%s)의 상태를 %s에서 %s로 변경했습니다", actorName, targetName, targetEmail, oldStatus, newStatus))
                .details(String.format("{\"oldStatus\":\"%s\",\"newStatus\":\"%s\"}", oldStatus, newStatus))
                .build();
    }

    public static AuditLog createUserWithdrawalLog(Long targetId, String targetName, String targetEmail, String ipAddress) {
        return AuditLog.builder()
                .actionType(ActionType.USER_WITHDRAWAL)
                .severity(Severity.WARNING)
                .targetId(targetId)
                .targetName(targetName)
                .targetEmail(targetEmail)
                .message(String.format("사용자 %s (%s)가 회원탈퇴를 요청했습니다", targetName, targetEmail))
                .ipAddress(ipAddress)
                .build();
    }

    public static AuditLog createFacilityCreateLog(Long actorId, String actorName, Long targetId, String facilityName) {
        return AuditLog.builder()
                .actionType(ActionType.FACILITY_CREATE)
                .severity(Severity.INFO)
                .actorId(actorId)
                .actorName(actorName)
                .targetId(targetId)
                .targetName(facilityName)
                .message(String.format("사용자 %s가 시설 '%s'을 추가했습니다", actorName, facilityName))
                .build();
    }

    public static AuditLog createFacilityUpdateLog(Long actorId, String actorName, Long targetId, String facilityName) {
        return AuditLog.builder()
                .actionType(ActionType.FACILITY_UPDATE)
                .severity(Severity.INFO)
                .actorId(actorId)
                .actorName(actorName)
                .targetId(targetId)
                .targetName(facilityName)
                .message(String.format("사용자 %s가 시설 '%s'을 수정했습니다", actorName, facilityName))
                .build();
    }

    public static AuditLog createFacilityDeleteLog(Long actorId, String actorName, Long targetId, String facilityName) {
        return AuditLog.builder()
                .actionType(ActionType.FACILITY_DELETE)
                .severity(Severity.WARNING)
                .actorId(actorId)
                .actorName(actorName)
                .targetId(targetId)
                .targetName(facilityName)
                .message(String.format("사용자 %s가 시설 '%s'을 삭제했습니다", actorName, facilityName))
                .build();
    }

    public static AuditLog createLoginLog(Long targetId, String targetName, String targetEmail, String ipAddress) {
        return AuditLog.builder()
                .actionType(ActionType.LOGIN)
                .severity(Severity.INFO)
                .targetId(targetId)
                .targetName(targetName)
                .targetEmail(targetEmail)
                .message(String.format("사용자 %s (%s)가 로그인했습니다", targetName, targetEmail))
                .ipAddress(ipAddress)
                .build();
    }
}