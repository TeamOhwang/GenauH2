package com.project.repository;

import com.project.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    // 모든 로그를 최신순으로 조회 (관리자용)
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // 특정 사용자의 활동 로그 조회
    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // 특정 조직의 설비 이벤트 로그 조회
    @Query("SELECT al FROM ActivityLog al WHERE al.logType = 'EQUIPMENT_EVENT' AND al.targetType = 'FACILITY' AND al.targetId IN (SELECT f.id FROM Facility f WHERE f.organization.id = :orgId) ORDER BY al.createdAt DESC")
    Page<ActivityLog> findEquipmentEventLogsByOrganization(@Param("orgId") Long orgId, Pageable pageable);
    
    // 특정 사용자가 소유한 설비의 이벤트 로그 조회
    @Query("SELECT al FROM ActivityLog al WHERE al.logType = 'EQUIPMENT_EVENT' AND al.targetType = 'FACILITY' AND al.targetId IN (SELECT f.id FROM Facility f WHERE f.organization.id = :orgId) ORDER BY al.createdAt DESC")
    Page<ActivityLog> findEquipmentEventLogsByUserFacilities(@Param("orgId") Long orgId, Pageable pageable);
    
    // 특정 기간의 로그 조회
    Page<ActivityLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
        LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // 특정 활동 타입의 로그 조회
    Page<ActivityLog> findByActivityTypeOrderByCreatedAtDesc(
        ActivityLog.ActivityType activityType, Pageable pageable);
    
    // 특정 로그 타입의 로그 조회
    Page<ActivityLog> findByLogTypeOrderByCreatedAtDesc(
        ActivityLog.LogType logType, Pageable pageable);
    
    // 사용자 이름으로 로그 조회
    Page<ActivityLog> findByUsernameContainingIgnoreCaseOrderByCreatedAtDesc(
        String username, Pageable pageable);
    
    // 특정 설비의 이벤트 로그 조회
    Page<ActivityLog> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(
        String targetType, Long targetId, Pageable pageable);
    
    // 최근 N개의 로그 조회
    List<ActivityLog> findTop10ByOrderByCreatedAtDesc();
    
    // 특정 사용자의 최근 활동 조회
    List<ActivityLog> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
}
