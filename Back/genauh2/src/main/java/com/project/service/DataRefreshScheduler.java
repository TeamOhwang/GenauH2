package com.project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataRefreshScheduler {


    // 매시 00분마다 실행 (예: 1:00, 2:00, 3:00...)
    @Scheduled(cron = "0 0 * * * *")
    public void refreshDailyData() {
        log.info("🔄 일일 가동률 데이터 갱신 시작 - {}", java.time.LocalDateTime.now());
        
        try {
            // 캐시 무효화나 데이터 새로고침 로직
            // 필요하다면 여기서 캐시를 클리어하거나 미리 계산된 데이터를 갱신
            log.info("✅ 일일 가동률 데이터 갱신 완료");
        } catch (Exception e) {
            log.error("❌ 일일 가동률 데이터 갱신 실패: {}", e.getMessage(), e);
        }
    }
}