package com.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        log.info("WebSocket 메시지 브로커 설정 시작");
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
        log.info("WebSocket 메시지 브로커 설정 완료: /topic, /queue, /app, /user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("WebSocket STOMP 엔드포인트 등록 시작");
        
        // SockJS를 사용한 WebSocket 엔드포인트 (주요 엔드포인트)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setHeartbeatTime(25000)
                .setDisconnectDelay(5000)
                .setHttpMessageCacheSize(1000) // HTTP 메시지 캐시 크기
                .setWebSocketEnabled(true) // WebSocket 활성화
                .setSessionCookieNeeded(false) // 세션 쿠키 불필요
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"); // 클라이언트 라이브러리 URL

        // 네이티브 WebSocket 엔드포인트 (SockJS 없이)
        registry.addEndpoint("/ws-native")
            .setAllowedOriginPatterns("*");
        
        log.info("WebSocket STOMP 엔드포인트 등록 완료: /ws, /ws-native");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        log.info("WebSocket 전송 설정 시작");
        registration.setMessageSizeLimit(64 * 1024); // 64KB
        registration.setSendBufferSizeLimit(512 * 1024); // 512KB
        registration.setSendTimeLimit(20000); // 20초
        registration.setTimeToFirstMessage(30000); // 첫 메시지까지 대기 시간
        log.info("WebSocket 전송 설정 완료");
    }
}
