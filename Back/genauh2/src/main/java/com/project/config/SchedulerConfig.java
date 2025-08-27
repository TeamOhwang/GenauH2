package com.project.config;

import com.project.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableScheduling
public class SchedulerConfig {

    @Autowired
    private PasswordResetService passwordResetService;

    // 매일 새벽 2시에 만료된 토큰 정리
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredTokens() {
        try {
            log.info("만료된 비밀번호 리셋 토큰 정리 작업 시작");
            passwordResetService.cleanupExpiredTokens();
            log.info("만료된 비밀번호 리셋 토큰 정리 작업 완료");
        } catch (Exception e) {
            log.error("만료된 토큰 정리 중 오류 발생: {}", e.getMessage(), e);
        }
    }
    
    // 매주 일요일 새벽 3시에 사용된 토큰들도 정리 (선택적)
    @Scheduled(cron = "0 0 3 * * SUN")
    public void cleanupUsedTokens() {
        try {
            log.info("사용된 비밀번호 리셋 토큰 정리 작업 시작");
            // 추가적인 정리 로직이 필요하다면 여기에 구현
            log.info("사용된 비밀번호 리셋 토큰 정리 작업 완료");
        } catch (Exception e) {
            log.error("사용된 토큰 정리 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}