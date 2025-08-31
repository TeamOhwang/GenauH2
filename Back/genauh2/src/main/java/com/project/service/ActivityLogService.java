package com.project.service;

import com.project.dto.ActivityLogDTO;
import com.project.entity.ActivityLog;
import com.project.repository.ActivityLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ActivityLogService {
    
    private final ActivityLogRepository activityLogRepository;
    
    /**
     * 활동 로그 생성
     */
    public ActivityLog createLog(ActivityLog.ActivityType activityType, 
                                ActivityLog.LogType logType,
                                Long userId, 
                                String username, 
                                String userRole,
                                Long targetId, 
                                String targetType, 
                                String description,
                                HttpServletRequest request,
                                String additionalData) {
        
        ActivityLog activityLog = ActivityLog.builder()
                .activityType(activityType)
                .logType(logType)
                .userId(userId)
                .username(username)
                .userRole(userRole)
                .targetId(targetId)
                .targetType(targetType)
                .description(description)
                .ipAddress(getClientIpAddress(request))
                .userAgent(getUserAgent(request))
                .additionalData(additionalData)
                .build();
        
        ActivityLog savedLog = activityLogRepository.save(activityLog);
        log.info("활동 로그 생성: {} - {} - {}", username, activityType, description);
        
        return savedLog;
    }
    
    /**
     * 사용자 활동 로그 생성 (간편 메서드)
     */
    public ActivityLog createUserActivityLog(ActivityLog.ActivityType activityType,
                                           Long userId,
                                           String username,
                                           String userRole,
                                           String description,
                                           HttpServletRequest request) {
        return createLog(activityType, ActivityLog.LogType.USER_ACTIVITY, userId, username, userRole, 
                        null, null, description, request, null);
    }
    
    /**
     * 관리자 활동 로그 생성 (간편 메서드)
     */
    public ActivityLog createAdminActivityLog(ActivityLog.ActivityType activityType,
                                            Long userId,
                                            String username,
                                            String userRole,
                                            Long targetId,
                                            String targetType,
                                            String description,
                                            HttpServletRequest request) {
        return createLog(activityType, ActivityLog.LogType.ADMIN_ACTIVITY, userId, username, userRole,
                        targetId, targetType, description, request, null);
    }
    
    /**
     * 설비 이벤트 로그 생성 (간편 메서드)
     */
    public ActivityLog createEquipmentEventLog(ActivityLog.ActivityType activityType,
                                             Long facilityId,
                                             String description,
                                             HttpServletRequest request) {
        return createLog(activityType, ActivityLog.LogType.EQUIPMENT_EVENT, null, "SYSTEM", "SYSTEM",
                        facilityId, "FACILITY", description, request, null);
    }
    
    /**
     * 모든 로그 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> getAllLogs(Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        return logs.map(ActivityLogDTO::fromEntity);
    }
    
    /**
     * 특정 사용자의 활동 로그 조회
     */
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> getUserActivityLogs(Long userId, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return logs.map(ActivityLogDTO::fromEntity);
    }
    
    /**
     * 특정 조직의 설비 이벤트 로그 조회
     */
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> getEquipmentEventLogsByOrganization(Long orgId, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findEquipmentEventLogsByOrganization(orgId, pageable);
        return logs.map(ActivityLogDTO::fromEntity);
    }
    
    /**
     * 특정 사용자가 소유한 설비의 이벤트 로그 조회
     */
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> getEquipmentEventLogsByUserFacilities(Long orgId, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findEquipmentEventLogsByUserFacilities(orgId, pageable);
        return logs.map(ActivityLogDTO::fromEntity);
    }
    
    /**
     * 특정 기간의 로그 조회
     */
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate, pageable);
        return logs.map(ActivityLogDTO::fromEntity);
    }
    
    /**
     * 특정 활동 타입의 로그 조회
     */
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> getLogsByActivityType(ActivityLog.ActivityType activityType, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findByActivityTypeOrderByCreatedAtDesc(activityType, pageable);
        return logs.map(ActivityLogDTO::fromEntity);
    }
    
    /**
     * 특정 로그 타입의 로그 조회
     */
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> getLogsByLogType(ActivityLog.LogType logType, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findByLogTypeOrderByCreatedAtDesc(logType, pageable);
        return logs.map(ActivityLogDTO::fromEntity);
    }
    
    /**
     * 사용자 이름으로 로그 검색
     */
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> searchLogsByUsername(String username, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findByUsernameContainingIgnoreCaseOrderByCreatedAtDesc(username, pageable);
        return logs.map(ActivityLogDTO::fromEntity);
    }
    
    /**
     * 최근 로그 조회
     */
    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getRecentLogs() {
        List<ActivityLog> logs = activityLogRepository.findTop10ByOrderByCreatedAtDesc();
        return logs.stream().map(ActivityLogDTO::fromEntity).collect(Collectors.toList());
    }
    
    /**
     * 특정 사용자의 최근 활동 조회
     */
    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getRecentUserActivity(Long userId) {
        List<ActivityLog> logs = activityLogRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
        return logs.stream().map(ActivityLogDTO::fromEntity).collect(Collectors.toList());
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * User-Agent 추출
     */
    private String getUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent : "Unknown";
    }
}
