package com.project.controller;

import com.project.dto.ActivityLogDTO;
import com.project.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
@Slf4j
public class ActivityLogController {
    
    private final ActivityLogService activityLogService;
    
    /**
     * 모든 로그 조회 (관리자만)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ActivityLogDTO>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ActivityLogDTO> logs = activityLogService.getAllLogs(pageable);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 특정 사용자의 활동 로그 조회
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Page<ActivityLogDTO>> getUserActivityLogs(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActivityLogDTO> logs = activityLogService.getUserActivityLogs(userId, pageable);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 현재 로그인한 사용자의 활동 로그 조회
     */
    @GetMapping("/my-activity")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ActivityLogDTO>> getMyActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(authentication.getName());
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActivityLogDTO> logs = activityLogService.getUserActivityLogs(userId, pageable);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 특정 조직의 설비 이벤트 로그 조회
     */
    @GetMapping("/equipment-events/organization/{orgId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ActivityLogDTO>> getEquipmentEventLogsByOrganization(
            @PathVariable Long orgId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActivityLogDTO> logs = activityLogService.getEquipmentEventLogsByOrganization(orgId, pageable);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 특정 사용자가 소유한 설비의 이벤트 로그 조회
     */
    @GetMapping("/equipment-events/user-facilities/{orgId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ActivityLogDTO>> getEquipmentEventLogsByUserFacilities(
            @PathVariable Long orgId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActivityLogDTO> logs = activityLogService.getEquipmentEventLogsByUserFacilities(orgId, pageable);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 특정 기간의 로그 조회
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ActivityLogDTO>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActivityLogDTO> logs = activityLogService.getLogsByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 특정 활동 타입의 로그 조회
     */
    @GetMapping("/activity-type/{activityType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ActivityLogDTO>> getLogsByActivityType(
            @PathVariable String activityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            com.project.entity.ActivityLog.ActivityType type = 
                com.project.entity.ActivityLog.ActivityType.valueOf(activityType.toUpperCase());
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<ActivityLogDTO> logs = activityLogService.getLogsByActivityType(type, pageable);
            return ResponseEntity.ok(logs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 특정 로그 타입의 로그 조회
     */
    @GetMapping("/log-type/{logType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ActivityLogDTO>> getLogsByLogType(
            @PathVariable String logType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            com.project.entity.ActivityLog.LogType type = 
                com.project.entity.ActivityLog.LogType.valueOf(logType.toUpperCase());
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<ActivityLogDTO> logs = activityLogService.getLogsByLogType(type, pageable);
            return ResponseEntity.ok(logs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 사용자 이름으로 로그 검색
     */
    @GetMapping("/search/username")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ActivityLogDTO>> searchLogsByUsername(
            @RequestParam String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActivityLogDTO> logs = activityLogService.searchLogsByUsername(username, pageable);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 최근 로그 조회
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLogDTO>> getRecentLogs() {
        List<ActivityLogDTO> logs = activityLogService.getRecentLogs();
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 특정 사용자의 최근 활동 조회
     */
    @GetMapping("/recent/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<ActivityLogDTO>> getRecentUserActivity(@PathVariable Long userId) {
        List<ActivityLogDTO> logs = activityLogService.getRecentUserActivity(userId);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 현재 로그인한 사용자의 최근 활동 조회
     */
    @GetMapping("/recent/my-activity")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ActivityLogDTO>> getMyRecentActivity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(authentication.getName());
        
        List<ActivityLogDTO> logs = activityLogService.getRecentUserActivity(userId);
        return ResponseEntity.ok(logs);
    }
}
