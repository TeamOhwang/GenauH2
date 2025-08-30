package com.project.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    // 테스트용 메시지 핸들러
    @MessageMapping("/test")
    @SendTo("/topic/test")
    public Map<String, Object> handleTestMessage(Map<String, Object> message) {
        log.info("테스트 메시지 수신: {}", message);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "테스트 메시지 응답");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("received", message);
        
        return response;
    }

    // 관리자 알림 전송
    @MessageMapping("/admin/notification")
    public void sendAdminNotification(Map<String, Object> notification) {
        log.info("관리자 알림 전송: {}", notification);
        
        // 모든 관리자에게 알림 전송
        messagingTemplate.convertAndSend("/topic/admin/notifications", notification);
    }

    // 관리자 통계 전송
    @MessageMapping("/admin/stats")
    public void sendAdminStats(Map<String, Object> stats) {
        log.info("관리자 통계 전송: {}", stats);
        
        // 모든 관리자에게 통계 전송
        messagingTemplate.convertAndSend("/topic/admin/stats", stats);
    }

    // 특정 사용자에게 메시지 전송
    public void sendToUser(String userId, String destination, Object message) {
        messagingTemplate.convertAndSendToUser(userId, destination, message);
    }

    // 모든 사용자에게 브로드캐스트
    public void broadcastToAll(String destination, Object message) {
        messagingTemplate.convertAndSend(destination, message);
    }

    // WebSocket 연결 테스트용 엔드포인트
    @GetMapping("/api/websocket/test")
    @ResponseBody
    public Map<String, Object> testWebSocket() {
        log.info("WebSocket 테스트 API 호출됨");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "WebSocket 서버가 정상적으로 작동 중입니다.");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("endpoints", new String[]{"/ws", "/topic/admin/notifications", "/topic/admin/stats"});
        
        try {
            // 테스트 알림 전송
            Map<String, Object> testNotification = new HashMap<>();
            testNotification.put("type", "TEST");
            testNotification.put("message", "테스트 알림입니다.");
            testNotification.put("timestamp", System.currentTimeMillis());
            testNotification.put("source", "WebSocket 테스트 API");
            
            messagingTemplate.convertAndSend("/topic/admin/notifications", testNotification);
            log.info("테스트 알림 전송 완료");
            
            response.put("notification_sent", true);
        } catch (Exception e) {
            log.error("테스트 알림 전송 실패", e);
            response.put("notification_sent", false);
            response.put("error", e.getMessage());
        }
        
        return response;
    }

    // WebSocket 상태 확인 엔드포인트
    @GetMapping("/api/websocket/status")
    @ResponseBody
    public Map<String, Object> getWebSocketStatus() {
        log.info("WebSocket 상태 확인 API 호출됨");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("websocket_enabled", true);
        response.put("stomp_enabled", true);
        response.put("endpoint", "/ws");
        response.put("message_broker", "/topic");
        response.put("application_prefix", "/app");
        response.put("timestamp", LocalDateTime.now().toString());
        
        return response;
    }
}
