package com.project.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.project.dto.OrganizationDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * 새로운 회원가입 요청 알림을 모든 관리자에게 전송
     */
    public void notifyNewRegistration(OrganizationDTO newUser) {
        try {
            String message = String.format("새로운 회원가입 요청: %s (%s)", 
                newUser.getOrgName(), newUser.getEmail());
            
            // 모든 관리자에게 알림 전송
            messagingTemplate.convertAndSend("/topic/admin/notifications", 
                createNotificationPayload("NEW_REGISTRATION", message, newUser));
            
            log.info("새로운 회원가입 알림 전송 완료: {}", newUser.getEmail());
        } catch (Exception e) {
            log.error("웹소켓 알림 전송 실패", e);
        }
    }
    
    /**
     * 회원가입 승인/거부 알림을 해당 사용자에게 전송
     */
    public void notifyRegistrationResult(String userEmail, boolean approved, String message) {
        try {
            String notificationMessage = approved ? 
                "회원가입이 승인되었습니다." : 
                "회원가입이 거부되었습니다. 사유: " + message;
            
            messagingTemplate.convertAndSendToUser(
                userEmail, 
                "/topic/registration/result", 
                createNotificationPayload("REGISTRATION_RESULT", notificationMessage, null)
            );
            
            log.info("회원가입 결과 알림 전송 완료: {} - {}", userEmail, approved ? "승인" : "거부");
        } catch (Exception e) {
            log.error("웹소켓 알림 전송 실패", e);
        }
    }
    
    /**
     * 관리자에게 실시간 통계 업데이트 전송
     */
    public void notifyAdminStats(int pendingCount, int totalUsers) {
        try {
            messagingTemplate.convertAndSend("/topic/admin/stats", 
                createStatsPayload(pendingCount, totalUsers));
            
            log.info("관리자 통계 업데이트 전송 완료: 대기 {}명, 전체 {}명", pendingCount, totalUsers);
        } catch (Exception e) {
            log.error("웹소켓 통계 전송 실패", e);
        }
    }
    
    private Object createNotificationPayload(String type, String message, OrganizationDTO user) {
        return new NotificationPayload(type, message, user);
    }
    
    private Object createStatsPayload(int pendingCount, int totalUsers) {
        return new StatsPayload(pendingCount, totalUsers);
    }
    
    // 알림 페이로드 클래스
    public static class NotificationPayload {
        private String type;
        private String message;
        private OrganizationDTO user;
        private long timestamp;
        
        public NotificationPayload(String type, String message, OrganizationDTO user) {
            this.type = type;
            this.message = message;
            this.user = user;
            this.timestamp = System.currentTimeMillis();
        }
        
        // Getters
        public String getType() { return type; }
        public String getMessage() { return message; }
        public OrganizationDTO getUser() { return user; }
        public long getTimestamp() { return timestamp; }
    }
    
    // 통계 페이로드 클래스
    public static class StatsPayload {
        private int pendingCount;
        private int totalUsers;
        private long timestamp;
        
        public StatsPayload(int pendingCount, int totalUsers) {
            this.pendingCount = pendingCount;
            this.totalUsers = totalUsers;
            this.timestamp = System.currentTimeMillis();
        }
        
        // Getters
        public int getPendingCount() { return pendingCount; }
        public int getTotalUsers() { return totalUsers; }
        public long getTimestamp() { return timestamp; }
    }
}
