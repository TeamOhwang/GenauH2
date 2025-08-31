package com.project.dto;

import com.project.entity.ActivityLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDTO {
    
    private Long id;
    private String logType;
    private String activityType;
    private Long userId;
    private String username;
    private String userRole;
    private Long targetId;
    private String targetType;
    private String description;
    private String ipAddress;
    private LocalDateTime createdAt;
    private String additionalData;
    
    // 엔티티를 DTO로 변환하는 정적 메서드
    public static ActivityLogDTO fromEntity(ActivityLog activityLog) {
        return ActivityLogDTO.builder()
                .id(activityLog.getId())
                .logType(activityLog.getLogType().name())
                .activityType(activityLog.getActivityType().name())
                .userId(activityLog.getUserId())
                .username(activityLog.getUsername())
                .userRole(activityLog.getUserRole())
                .targetId(activityLog.getTargetId())
                .targetType(activityLog.getTargetType())
                .description(activityLog.getDescription())
                .ipAddress(activityLog.getIpAddress())
                .createdAt(activityLog.getCreatedAt())
                .additionalData(activityLog.getAdditionalData())
                .build();
    }
}
