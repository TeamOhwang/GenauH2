package com.project.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.entity.AuditLog;
import com.project.entity.Organization;
import com.project.repository.OrganizationRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserCleanupService {

    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Autowired
    private AuditLogService auditLogService;

    /**
     * 6개월 이상 탈퇴 요청한 사용자들을 자동 삭제하는 스케줄러
     * 매일 오전 2시에 실행
     */
    @Scheduled(cron = "0 0 2 * * ?") // 매일 오전 2시
    @Transactional
    public void cleanupExpiredWithdrawalUsers() {
        log.info("=== 6개월 이상 탈퇴 요청한 사용자 자동 삭제 작업 시작 ===");
        
        try {
            // 6개월 전 날짜 계산
            LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
            
            // 6개월 이상 전에 탈퇴 요청한 SUSPENDED 상태 사용자들 조회
            List<Organization> expiredUsers = organizationRepository
                .findByStatusAndWithdrawalRequestedAtBefore(Organization.Status.SUSPENDED, sixMonthsAgo);
            
            log.info("6개월 이상 탈퇴 요청한 사용자 수: {}", expiredUsers.size());
            
            if (expiredUsers.isEmpty()) {
                log.info("자동 삭제할 사용자가 없습니다.");
                return;
            }
            
            // 각 사용자에 대해 삭제 처리
            for (Organization user : expiredUsers) {
                try {
                    log.info("사용자 자동 삭제 처리: {} ({})", user.getOrgName(), user.getEmail());
                    
                                         // 실제 삭제 전에 감사 로그 기록
                     AuditLog deletionLog = AuditLog.builder()
                         .actionType(AuditLog.ActionType.USER_DELETE)
                         .severity(AuditLog.Severity.WARNING)
                         .targetId(user.getOrgId())
                         .targetName(user.getName())
                         .targetEmail(user.getEmail())
                         .message(String.format("6개월 경과로 인한 자동 삭제: %s (%s)", user.getName(), user.getEmail()))
                         .details(String.format("{\"withdrawalRequestedAt\":\"%s\",\"deletedAt\":\"%s\"}", 
                             user.getWithdrawalRequestedAt(), LocalDateTime.now()))
                         .build();
                    
                    auditLogService.saveAuditLog(deletionLog);
                    
                    // 실제 삭제 (물리적 삭제)
                    organizationRepository.delete(user);
                    
                    log.info("사용자 자동 삭제 완료: {} ({})", user.getOrgName(), user.getEmail());
                    
                } catch (Exception e) {
                    log.error("사용자 자동 삭제 실패: {} ({}), 오류: {}", 
                        user.getOrgName(), user.getEmail(), e.getMessage(), e);
                }
            }
            
            log.info("=== 6개월 이상 탈퇴 요청한 사용자 자동 삭제 작업 완료 ===");
            
        } catch (Exception e) {
            log.error("사용자 자동 삭제 스케줄러 실행 중 오류 발생", e);
        }
    }
    
    /**
     * 수동으로 6개월 이상 탈퇴 요청한 사용자들을 조회하는 메서드 (관리자용)
     */
    @Transactional(readOnly = true)
    public List<Organization> getExpiredWithdrawalUsers() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        return organizationRepository
            .findByStatusAndWithdrawalRequestedAtBefore(Organization.Status.SUSPENDED, sixMonthsAgo);
    }
    
    /**
     * 특정 사용자를 수동으로 삭제하는 메서드 (관리자용)
     */
    @Transactional
    public boolean manualDeleteUser(Long orgId, String adminName) {
        try {
            Organization user = organizationRepository.findById(orgId).orElse(null);
            if (user == null) {
                log.warn("삭제할 사용자를 찾을 수 없습니다: {}", orgId);
                return false;
            }
            
            if (user.getStatus() != Organization.Status.SUSPENDED) {
                log.warn("SUSPENDED 상태가 아닌 사용자는 삭제할 수 없습니다: {}", orgId);
                return false;
            }
            
                         // 감사 로그 기록
             AuditLog deletionLog = AuditLog.builder()
                 .actionType(AuditLog.ActionType.USER_DELETE)
                 .severity(AuditLog.Severity.WARNING)
                 .actorName(adminName)
                 .targetId(user.getOrgId())
                 .targetName(user.getName())
                 .targetEmail(user.getEmail())
                 .message(String.format("관리자 %s가 사용자 %s (%s)를 수동 삭제했습니다", 
                     adminName, user.getName(), user.getEmail()))
                 .details(String.format("{\"withdrawalRequestedAt\":\"%s\",\"deletedAt\":\"%s\"}", 
                     user.getWithdrawalRequestedAt(), LocalDateTime.now()))
                 .build();
            
            auditLogService.saveAuditLog(deletionLog);
            
            // 실제 삭제
            organizationRepository.delete(user);
            
            log.info("관리자 {}가 사용자 {} ({})를 수동 삭제했습니다", 
                adminName, user.getOrgName(), user.getEmail());
            
            return true;
            
        } catch (Exception e) {
            log.error("사용자 수동 삭제 실패: {}, 오류: {}", orgId, e.getMessage(), e);
            return false;
        }
    }
}
