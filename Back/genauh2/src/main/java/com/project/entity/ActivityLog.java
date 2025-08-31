package com.project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "log_type", nullable = false)
    private LogType logType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "username")
    private String username;
    
    @Column(name = "user_role")
    private String userRole;
    
    @Column(name = "target_id")
    private Long targetId;
    
    @Column(name = "target_type")
    private String targetType;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "additional_data", columnDefinition = "TEXT")
    private String additionalData;
    
    public enum LogType {
        USER_ACTIVITY,    // 일반 사용자 활동
        ADMIN_ACTIVITY,   // 관리자 활동
        EQUIPMENT_EVENT   // 설비 이벤트
    }
    
    public enum ActivityType {
        // 사용자 활동
        USER_SIGNUP,           // 회원가입
        USER_LOGIN,            // 로그인
        USER_LOGOUT,           // 로그아웃
        USER_PASSWORD_CHANGE,  // 비밀번호 변경
        USER_PROFILE_UPDATE,   // 프로필 수정
        
        // 설비 관련 활동
        FACILITY_ADD,          // 설비 추가
        FACILITY_UPDATE,       // 설비 수정
        FACILITY_DELETE,       // 설비 삭제
        FACILITY_VIEW,         // 설비 조회
        
        // 관리자 활동
        ADMIN_USER_ADD,        // 회원 추가
        ADMIN_USER_APPROVE,    // 회원 가입 승인
        ADMIN_USER_REJECT,     // 회원 가입 거절
        ADMIN_USER_ACTIVATE,   // 회원 활성화
        ADMIN_USER_DEACTIVATE, // 회원 비활성화
        ADMIN_USER_DELETE,     // 회원 삭제
        ADMIN_ROLE_CHANGE,     // 역할 변경
        
        // 설비 이벤트
        EQUIPMENT_FAULT,       // 설비 고장
        EQUIPMENT_MAINTENANCE, // 설비 정비
        EQUIPMENT_STATUS_CHANGE, // 설비 상태 변경
        EQUIPMENT_POWER_OUTAGE,  // 전력 중단
        EQUIPMENT_RESTORED      // 설비 복구
    }
}
