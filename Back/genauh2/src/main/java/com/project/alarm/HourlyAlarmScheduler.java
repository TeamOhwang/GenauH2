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

    private final PowerOutputRepository repo;   // 변경됨
    private final EmailSender email;
    private final RecipientService recipientService;
    private final DedupGuard dedup;

    @Value("${alert.threshold:120}") private double threshold;       // generation_kw ≤ 120
    @Value("${alert.dedup-seconds:3900}") private int dedupSeconds;  // ~65분

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

        try {
            email.send(to, "Alert", LocalDateTime.now().toString()); // 제목/본문 고정
            var r = hits.get(0);
            String when = r.getDate() + String.format(" %02d:00", r.getHour());
            log.info("[ALARM] mail sent ✅ to={} value={} (<= {}) at {}",
                    to, r.getGenerationKw(), threshold, when);
        } catch (Exception e) {
            log.error("[ALARM] mail send failed ❌ to={}", to, e);
        }
    }
}
