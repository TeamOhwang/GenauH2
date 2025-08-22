package com.project.alarm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class HourlyAlarmScheduler {

    private final PowerOutputRepository repo;
    private final EmailSender email;
    private final RecipientService recipientService;
    private final DedupGuard dedup;
    private final AlarmsRepository alarmsRepository; // 추가

    @Value("${alert.threshold:120}") private double threshold;
    @Value("${alert.dedup-seconds:3900}") private int dedupSeconds;
    @Value("${alert.plant-id:1}") private Long plantId; // 플랜트 ID 설정 (기본값 1)

    // 매시간 0분 0초(Asia/Seoul)
    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    public void checkAndNotify() {
        var now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        int hour = now.getHour();

        // 06~18시(포함)만 체크
        if (hour < 6 || hour > 18) {
            log.debug("[ALARM] skip: hour={} (allowed 06~18)", hour);
            return;
        }

        String to = recipientService.getEmail();
        if (to == null || to.isBlank()) {
            log.warn("[ALARM] recipient not set -> skip. call POST /gh/alert/recipient");
            return;
        }

        // 날짜 무시 + 현재 시(hour) + threshold 이하 → 최신 1건
        List<PowerOutputRecord> hits = repo.findLatestCriticalByHour(threshold, hour);
        if (hits.isEmpty()) {
            log.info("[ALARM] no-hit: hour={} threshold<={}", hour, threshold);
            return;
        }

        // 시간 버킷 디듀프 (해당 시각에 1회만 발송)
        String hourBucket = now.format(DateTimeFormatter.ofPattern("yyyyMMddHH"));
        String key = "alert:hourly:" + hourBucket;
        boolean first = dedup.tryOnce(key, Duration.ofSeconds(dedupSeconds));
        if (!first) {
            log.info("[ALARM] dedup skip: hourBucket={} ttl={}s", hourBucket, dedupSeconds);
            return;
        }

        var r = hits.get(0);
        String when = r.getDate() + String.format(" %02d:00", r.getHour());
        
        try {
            // 1. 이메일 발송
            String subject = "저전력 알림 - " + when;
            String body = String.format("발전량이 기준값 이하입니다.\n\n" +
                    "시간: %s\n" +
                    "발전량: %.2f kW\n" +
                    "기준값: %.2f kW", 
                    when, r.getGenerationKw(), threshold);
            
            email.send(to, subject, body);
            
            // 2. 알람 테이블에 로그 저장 (plantId를 facilityId로 사용)
            Alarms alarm = new Alarms();
            alarm.setFacilityId(plantId); // plantId를 facilityId로 사용
            alarm.setAlarmType(Alarms.AlarmType.LOW_PRODUCTION);
            alarm.setSeverity(determineSeverity(r.getGenerationKw(), threshold));
            alarm.setReason(String.format("발전량 %.2f kW (기준: %.2f kW 이하) - %s", 
                    r.getGenerationKw(), threshold, when));
            
            alarmsRepository.save(alarm);
            
            log.info("[ALARM] mail sent ✅ and logged to DB. to={} value={} (<= {}) at {}",
                    to, r.getGenerationKw(), threshold, when);
                    
        } catch (Exception e) {
            log.error("[ALARM] process failed ❌ to={}", to, e);
            
            // 이메일 실패해도 알람 로그는 남기기 시도
            try {
                Alarms alarm = new Alarms();
                alarm.setFacilityId(plantId); // plantId를 facilityId로 사용
                alarm.setAlarmType(Alarms.AlarmType.LOW_PRODUCTION);
                alarm.setSeverity(Alarms.Severity.CRITICAL);
                alarm.setReason(String.format("발전량 %.2f kW (기준: %.2f kW 이하) - %s [이메일 발송 실패: %s]", 
                        r.getGenerationKw(), threshold, when, e.getMessage()));
                
                alarmsRepository.save(alarm);
                log.info("[ALARM] DB log saved despite email failure");
            } catch (Exception dbEx) {
                log.error("[ALARM] DB log also failed ❌", dbEx);
            }
        }
    }

    /**
     * 발전량에 따른 심각도 결정
     */
    private Alarms.Severity determineSeverity(double generationKw, double threshold) {
        double ratio = generationKw / threshold;
        
        if (ratio <= 0.5) {
            return Alarms.Severity.CRITICAL; // 기준의 50% 이하
        } else if (ratio <= 0.8) {
            return Alarms.Severity.WARN;     // 기준의 80% 이하
        } else {
            return Alarms.Severity.INFO;     // 기준 이하지만 80% 초과
        }
    }
}