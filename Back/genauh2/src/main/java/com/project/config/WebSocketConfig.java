package com.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("*")
            .allowCredentials(true);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        log.info("WebSocket 메시지 브로커 설정 시작");
        
        // 메시지 브로커 활성화
        registry.enableSimpleBroker("/topic", "/queue");
        
        // 애플리케이션 접두사 설정
        registry.setApplicationDestinationPrefixes("/app");
        
        // 사용자별 메시지 접두사
        registry.setUserDestinationPrefix("/user");
        
        log.info("WebSocket 메시지 브로커 설정 완료: /topic, /queue, /app, /user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("WebSocket STOMP 엔드포인트 등록 시작");
        
        // SockJS와 네이티브 WebSocket 모두 지원
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*") // 개발 중에는 모든 origin 허용
            .withSockJS() // SockJS fallback 지원
            .setHeartbeatTime(25000) // 하트비트 간격 설정
            .setDisconnectDelay(5000); // 연결 해제 지연 시간
        
        // 추가 WebSocket 엔드포인트 (SockJS 없이)
        registry.addEndpoint("/ws-native")
            .setAllowedOriginPatterns("*"); // 네이티브 WebSocket 지원
        
        log.info("WebSocket STOMP 엔드포인트 등록 완료: /ws, /ws-native");
    }
    
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        log.info("WebSocket 전송 설정 시작");
        
        // 메시지 크기 제한 설정
        registration.setMessageSizeLimit(64 * 1024); // 64KB
        registration.setSendBufferSizeLimit(512 * 1024); // 512KB
        registration.setSendTimeLimit(20000); // 20초
        
        log.info("WebSocket 전송 설정 완료");
    }
}
