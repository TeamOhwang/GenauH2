package com.project.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.entity.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // 최신순으로 모든 로그 조회
    List<AuditLog> findAllByOrderByCreatedAtDesc();

    // 페이지네이션과 함께 최신순으로 조회
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 특정 날짜 범위의 로그 조회
    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<AuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 특정 날짜 범위의 로그를 페이지네이션과 함께 조회
    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<AuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    // 특정 액션 타입의 로그 조회
    List<AuditLog> findByActionTypeOrderByCreatedAtDesc(AuditLog.ActionType actionType);

    // 특정 액션 타입의 로그를 페이지네이션과 함께 조회
    Page<AuditLog> findByActionTypeOrderByCreatedAtDesc(AuditLog.ActionType actionType, Pageable pageable);

    // 특정 사용자와 관련된 로그 조회 (actor 또는 target)
    @Query("SELECT a FROM AuditLog a WHERE a.actorId = :userId OR a.targetId = :userId ORDER BY a.createdAt DESC")
    List<AuditLog> findByUserId(@Param("userId") Long userId);

    // 특정 사용자와 관련된 로그를 페이지네이션과 함께 조회
    @Query("SELECT a FROM AuditLog a WHERE a.actorId = :userId OR a.targetId = :userId ORDER BY a.createdAt DESC")
    Page<AuditLog> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // 특정 심각도 레벨의 로그 조회
    List<AuditLog> findBySeverityOrderByCreatedAtDesc(AuditLog.Severity severity);

    // 특정 심각도 레벨의 로그를 페이지네이션과 함께 조회
    Page<AuditLog> findBySeverityOrderByCreatedAtDesc(AuditLog.Severity severity, Pageable pageable);

    // 복합 조건으로 로그 조회
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:actionType IS NULL OR a.actionType = :actionType) AND " +
           "(:severity IS NULL OR a.severity = :severity) AND " +
           "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR a.createdAt <= :endDate) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> findByConditions(
        @Param("actionType") AuditLog.ActionType actionType,
        @Param("severity") AuditLog.Severity severity,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    // 오늘의 로그 개수 조회
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE DATE(a.createdAt) = CURRENT_DATE")
    long countTodayLogs();

    // 특정 날짜의 로그 개수 조회
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE DATE(a.createdAt) = :date")
    long countLogsByDate(@Param("date") LocalDateTime date);

    // 최근 7일간의 일별 로그 개수 조회
    @Query("SELECT DATE(a.createdAt) as logDate, COUNT(a) as logCount " +
           "FROM AuditLog a " +
           "WHERE a.createdAt >= :startDate " +
           "GROUP BY DATE(a.createdAt) " +
           "ORDER BY logDate DESC")
    List<Object[]> countLogsByDateRange(@Param("startDate") LocalDateTime startDate);

    // 특정 액션 타입별 로그 개수 조회
    @Query("SELECT a.actionType, COUNT(a) FROM AuditLog a GROUP BY a.actionType ORDER BY COUNT(a) DESC")
    List<Object[]> countLogsByActionType();

    // 특정 심각도별 로그 개수 조회
    @Query("SELECT a.severity, COUNT(a) FROM AuditLog a GROUP BY a.severity ORDER BY COUNT(a) DESC")
    List<Object[]> countLogsBySeverity();
}
